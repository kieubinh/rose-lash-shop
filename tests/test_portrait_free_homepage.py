"""Regression checks for the screenshot-inspired, portrait-free Rose homepage."""
from pathlib import Path
from bs4 import BeautifulSoup

root = Path(__file__).resolve().parents[1]
html = (root / "index.html").read_text(encoding="utf-8")
css = (root / "styles.css").read_text(encoding="utf-8")
app = (root / "app.js").read_text(encoding="utf-8")
soup = BeautifulSoup(html, "html.parser")

# The artist/owner must not be shown or requested by the browser.
assert "rose-artist.jpg" not in html
assert "artist-frame" not in html
assert "trust-artist" not in html
assert "rose-studio.jpg" not in html
assert "rose-studio.jpg" not in css.replace("url('/assets/rose-salon.jpg')", "")
assert soup.select_one("#top .hero h1").get_text(" ", strip=True) == "Come in. Glow out."
assert soup.select_one("#top .hero-ribbon")
assert len(soup.select("#top .hero-ribbon a")) == 3
assert len(soup.select(".hero-values li")) == 4
assert len(soup.select(".home-showcase-grid .featured-card")) == 3
assert len(soup.select(".home-showcase-grid #booking-form")) == 1
assert len(soup.select(".home-trust .trust-studio")) == 1
assert soup.select_one(".trust-studio img")["src"] == "/assets/rose-salon.jpg"
assert soup.select_one("#studio .studio-image")
assert len(soup.select("#shop .shop-card")) == 4
assert soup.select_one("#price-list #treatment-list")
assert all(soup.select_one(f"#{i}") for i in ("lashes", "brows", "waxing"))
assert soup.select_one("#booking-send").get("type") == "submit"
assert "fetch('/api/booking'" in app
assert (root / "assets/rose-salon.jpg").is_file()
assert "https://images.pexels.com" in css
print("Portrait-free Rose redesign: PASS")
