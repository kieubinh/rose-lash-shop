"""SEO regression checks for Rose's four public, indexable static pages."""
from pathlib import Path
import json
import xml.etree.ElementTree as ET
from bs4 import BeautifulSoup

root = Path(__file__).resolve().parents[1]
base = "https://rose-lash-shop.vercel.app"
paths = {"/": root/"index.html", "/lashes/": root/"lashes/index.html", "/brows/": root/"brows/index.html", "/waxing/": root/"waxing/index.html"}
services = json.loads((root/"data/services.json").read_text(encoding="utf-8"))
expected = {"lashes": 12, "brows": 3, "waxing": 11}
assert len(services) == 26

for url_path, path in paths.items():
    soup = BeautifulSoup(path.read_text(encoding="utf-8"), "html.parser")
    assert soup.html.get("lang") == "en-AU", path
    assert soup.title and soup.title.get_text(strip=True), path
    assert soup.find("meta", attrs={"name": "description"}).get("content"), path
    assert soup.find("link", rel="canonical")["href"] == base + url_path, path
    robots = soup.find("meta", attrs={"name": "robots"})["content"].lower()
    assert "noindex" not in robots and "nofollow" not in robots, path
    assert soup.select_one("h1"), path
    assert soup.find("meta", attrs={"property":"og:image"}), path
    ld_nodes = soup.find_all("script", attrs={"type": "application/ld+json"})
    assert len(ld_nodes) >= 1, path
    graphs = [json.loads(x.get_text()) for x in ld_nodes]
    assert all(x["@context"] == "https://schema.org" for x in graphs), path

    assert "Sydney" in soup.title.get_text(), path
    assert "Sydney" in soup.find("meta", attrs={"name": "description"}).get("content"), path
    assert "Sydney" in soup.get_text(" ", strip=True), path
    if url_path == "/":
        org = next(node for graph in graphs for node in graph["@graph"] if node.get("@type") == "BeautySalon")
        assert org["address"] == {
            "@type": "PostalAddress",
            "addressLocality": "Sydney",
            "addressRegion": "NSW",
            "addressCountry": "AU",
        }
        assert org["areaServed"]["name"] == "Sydney"
        assert "streetAddress" not in org["address"] and "postalCode" not in org["address"]
        assert "telephone" not in org and "openingHours" not in org and "aggregateRating" not in org

    assert not any(field in str(graphs) for field in ('fake address', 'fake reviews')), path
    if url_path != "/":
        category = url_path.strip("/")
        cards = soup.select(".seo-service")
        assert len(cards) == expected[category], (category,len(cards))
        for item in (x for x in services if x["category"].lower() == category):
            assert any(item["name"] in card.get_text() and f"A${item['price']}" in card.get_text() for card in cards), item

sitemap = ET.parse(root/"sitemap.xml")
urls = {x.text for x in sitemap.findall(".//{http://www.sitemaps.org/schemas/sitemap/0.9}loc")}
assert urls == {base + x for x in paths}, urls
robots = (root/"robots.txt").read_text(encoding="utf-8")
assert "Disallow: /" not in robots
assert f"Sitemap: {base}/sitemap.xml" in robots
home = (root/"index.html").read_text(encoding="utf-8")
for path in ("/lashes/", "/brows/", "/waxing/"):
    assert f'href="{path}"' in home, path
print("SEO static pages, schemas, indexing and sitemap: PASS")
