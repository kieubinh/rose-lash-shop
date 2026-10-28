from pathlib import Path
from bs4 import BeautifulSoup
import json
root=Path(__file__).resolve().parents[1]
soup=BeautifulSoup((root/'index.html').read_text(), 'html.parser')
assert soup.select_one('#rose-v2 .hero h1 em').get_text(strip=True)=='Glow out.'
assert len(soup.select('#treatments .treatment-card'))==3
assert all(soup.select_one('#'+id) for id in ['top','treatments','work','studio','booking'])
assert soup.select_one('#booking-form') and soup.select_one('#booking-copy')
assert not soup.select_one('#booking-send').has_attr('disabled')
assert not soup.select_one('#booking-form').has_attr('novalidate')
assert (root/'assets/rose-salon.jpg').read_bytes()[:3]==b'\xff\xd8\xff'

services=json.loads((root/'data/services.json').read_text()); assert len(services)==26
assert len({x['id'] for x in services})==26
assert all(x['price']>0 for x in services)
assert next(x for x in services if x['id']=='lash-design-light')['name']=='Natural Design Lashes'
assert next(x for x in services if x['id']=='lash-design-max')['name']=='Luxury Design Lashes'
app_source=(root/'app.js').read_text()
assert '"name":"Natural Design Lashes"' in app_source
assert '"name":"Luxury Design Lashes"' in app_source

# The full price list lives in a PDF, not on the page.
pdf=root/'assets/rose-price-list.pdf'
assert pdf.read_bytes()[:5]==b'%PDF-'
links=soup.select('a[href="/assets/rose-price-list.pdf"]')
assert len(links)>=3 and all(a.get('target')=='_blank' and 'noopener' in a.get('rel',[]) for a in links)
assert not soup.select('#price-list, #treatment-list, .featured-card, .service-row, #shop')
assert soup.select_one('nav.navlinks a[href="/assets/rose-price-list.pdf"]')
assert soup.select_one('footer#contact .footer-book[href="#booking"]')

# Our work: the real before/after photo and video, both with accessible text.
work=soup.select_one('#work')
assert work.select_one('.work-photo img[src="/assets/rose-before-after.webp"]').get('alt')
video=work.select_one('.work-video video')
assert video.get('aria-label') and video.get('poster') and video.select_one('source[src$=".mp4"]')
for name in ('rose-before-after.webp','rose-lash-brow-transformation.mp4','rose-lash-brow-transformation-poster.webp'):
    assert (root/'assets'/name).is_file()

# The submitted Rose wordmark must appear in header and footer.
logos=soup.select('a.logo-official img[src="/assets/rose-official-logo.avif"]')
assert len(logos)==2
assert all(img.get('alt')=='Rose Lash Brow Wax' for img in logos)
logo=(root/'assets/rose-official-logo.avif').read_bytes()
assert logo[4:12]==b'ftypavif'
assert len(logo)<20_000

print('Simplified Rose homepage, price list PDF, Our work, booking and 26 services: PASS')
