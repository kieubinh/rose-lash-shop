"""The homepage must stay portrait-free and keep a short, simple structure."""
from pathlib import Path
from bs4 import BeautifulSoup

root = Path(__file__).resolve().parents[1]
html = (root / "index.html").read_text(encoding="utf-8")
css = (root / "styles.css").read_text(encoding="utf-8")
app = (root / "app.js").read_text(encoding="utf-8")
soup = BeautifulSoup(html, "html.parser")

# The artist/owner must not be shown or requested by the browser.
for needle in ("rose-artist.jpg", "artist-frame", "trust-artist", "rose-studio.jpg", "owner-portrait"):
    assert needle not in html, needle
assert "rose-studio.jpg" not in css.replace("url('/assets/rose-salon.jpg')", "")

assert "Come in." in soup.select_one("#top h1").get_text(" ", strip=True)
sections = [s.get("id") for s in soup.select("#rose-v2 > section[id], #rose-v2 > div section[id]")]
assert sections == ["top", "treatments", "work", "studio", "booking"], sections
assert soup.select_one("#booking-send").get("type") == "submit"
assert "fetch('/api/booking'" in app
assert (root / "assets/rose-salon.jpg").is_file()
print("Portrait-free, simplified Rose homepage: PASS")
