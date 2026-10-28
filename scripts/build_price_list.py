#!/usr/bin/env python3
"""Build assets/rose-price-list.pdf from data/services.json.

Run after any price change:  python3 scripts/build_price_list.py
Needs Google Chrome (headless) for HTML -> PDF; no Python dependencies.
"""
import base64
import html
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

root = Path(__file__).resolve().parents[1]
out = root / "assets" / "rose-price-list.pdf"
services = json.loads((root / "data" / "services.json").read_text(encoding="utf-8"))

CHROME = next(
    (p for p in (
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        shutil.which("google-chrome") or "",
        shutil.which("chromium") or "",
    ) if p and Path(p).exists()),
    None,
)
if not CHROME:
    sys.exit("Google Chrome or Chromium is required to render the PDF.")

NOTES = {
    "Lashes": [
        "2-week infills apply to eligible sets at the prices shown. After 3–4 weeks a new full set is needed. Natural Design and Luxury Design are new-set only.",
        "Complimentary fixes within 3 days if there is an issue with your lashes. After 3 days a fee applies depending on condition.",
        "Lash Lift + Tint + Keratin lasts around 4–6 weeks; allow at least 3 weeks between treatments.",
    ],
    "Brows": [
        "Brow Wax + Normal Tint colour lasts around 1 week; Henna Tint around 2 weeks.",
        "Brow Lamination (wax, shape, lamination and tint) lasts around 3–4 weeks.",
    ],
    "Waxing": [
        "Full Body Wax is a package saving $25. Please confirm included areas when you enquire.",
    ],
}
TAGLINE = {"Lashes": "Lift · Length · Confidence", "Brows": "Shape · Define · Enhance", "Waxing": "Smooth · Fresh · Radiant"}


def row(s):
    infill = f'<span class="infill">2-week infill ${s["infill"]}</span>' if s["infill"] is not None else ""
    return (
        f'<tr><td class="name"><strong>{html.escape(s["name"])}</strong>'
        f'<small>{html.escape(s["note"])}</small></td>'
        f'<td class="time">{html.escape(s["duration"])}</td>'
        f'<td class="price">${s["price"]}{infill}</td></tr>'
    )


def section(cat):
    rows = "".join(row(s) for s in services if s["category"] == cat)
    notes = "".join(f"<li>{html.escape(n)}</li>" for n in NOTES[cat])
    return (
        f'<section><h2>{cat}<small>{TAGLINE[cat]}</small></h2>'
        f'<table>{rows}</table><ul class="notes">{notes}</ul></section>'
    )


logo = base64.b64encode((root / "assets" / "rose-official-logo.avif").read_bytes()).decode()

page = f"""<!doctype html><html lang="en-AU"><head><meta charset="utf-8"><title>Rose Lash · Brow · Wax — Price list</title>
<style>
@page {{ size: A4; margin: 14mm 15mm; }}
* {{ box-sizing: border-box; }}
body {{ margin: 0; color: #4d3438; font: 10pt/1.4 Arial, Helvetica, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }}
header {{ display: flex; justify-content: space-between; align-items: flex-end; padding-bottom: 10px; border-bottom: 1.5px solid #b36f78; }}
header img {{ height: 56px; display: block; }}
header h1 {{ margin: 0; font: normal 30pt Georgia, serif; letter-spacing: -.03em; color: #4b2c34; line-height: 1; }}
header h1 em {{ color: #ae7079; }}
.sub {{ margin: 8px 0 4px; color: #80696b; font-size: 9pt; }}
section {{ break-inside: avoid; margin-top: 15px; }}
section:first-of-type {{ break-after: page; }}
section:nth-of-type(2) {{ margin-top: 0; }}
h2 {{ margin: 0 0 4px; font: normal 17pt Georgia, serif; color: #4b2c34; display: flex; align-items: baseline; gap: 12px; }}
h2 small {{ font: 600 7pt Arial, sans-serif; letter-spacing: .2em; text-transform: uppercase; color: #a5737a; }}
table {{ width: 100%; border-collapse: collapse; }}
td {{ padding: 5px 0; border-bottom: 1px solid #efdcd7; vertical-align: top; }}
td.name strong {{ display: block; font-size: 10.5pt; }}
td.name small {{ color: #80696b; font-size: 8.5pt; }}
td.time {{ width: 24%; color: #80696b; font-size: 9pt; padding-top: 6px; white-space: nowrap; }}
td.price {{ font-variant-numeric: lining-nums; width: 22%; text-align: right; font: normal 13pt Georgia, serif; color: #74404a; white-space: nowrap; }}
.infill {{ display: block; font: 8pt Arial, sans-serif; color: #a5737a; }}
.notes {{ margin: 7px 0 0; padding: 0 0 0 16px; color: #765f64; font-size: 8.5pt; }}
.notes li {{ margin-bottom: 2px; }}
footer {{ margin-top: 16px; padding-top: 9px; border-top: 1.5px solid #b36f78; display: flex; justify-content: space-between; font-size: 8.5pt; color: #765f64; }}
footer b {{ color: #4b2c34; }}
</style></head><body>
<header><img alt="Rose Lash Brow Wax" src="data:image/avif;base64,{logo}"><h1>Price <em>list</em></h1></header>
<p class="sub">Prices in AUD. Durations are approximate and may vary with individual needs.</p>
{section("Lashes")}{section("Brows")}{section("Waxing")}
<footer><span><b>Book an appointment</b> at rose-lash-shop.vercel.app — this is an enquiry; the studio confirms your time.</span><span>Prices subject to change</span></footer>
</body></html>"""

with tempfile.TemporaryDirectory() as tmp:
    src = Path(tmp) / "price-list.html"
    src.write_text(page, encoding="utf-8")
    subprocess.run(
        [CHROME, "--headless=new", "--disable-gpu", "--no-pdf-header-footer",
         f"--print-to-pdf={out}", src.as_uri()],
        check=True, capture_output=True, timeout=90,
    )
print(f"Wrote {out.relative_to(root)} ({out.stat().st_size // 1024} KB)")
