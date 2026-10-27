from pathlib import Path
from bs4 import BeautifulSoup
import json
root=Path(__file__).resolve().parents[1]
soup=BeautifulSoup((root/'index.html').read_text(), 'html.parser')
assert soup.select_one('#rose-v2 .hero h1').get_text(' ',strip=True)=='Come in. Glow out.'
assert len(soup.select('#treatments .treatment-card'))==3
assert all(soup.select_one('#'+id) for id in ['top','treatments','studio','shop','booking','price-list'])
assert soup.select_one('#booking-form') and soup.select_one('#booking-copy')
assert not soup.select_one('#booking-send').has_attr('disabled')
assert not soup.select_one('#booking-form').has_attr('novalidate')
assert (root/'assets/rose-salon.jpg').read_bytes()[:3]==b'\xff\xd8\xff'
services=json.loads((root/'data/services.json').read_text()); assert len(services)==26
assert len({x['id'] for x in services})==26
assert all(x['price']>0 for x in services)
service_by_id={x['id']:x for x in services}
featured=soup.select('#featured .featured-card')
assert len(featured)==3
for card in featured:
    service=service_by_id[card['data-featured-id']]
    assert card.select_one('[data-featured-price]').get_text(strip=True)==f"${service['price']}"
    assert card.select_one('[data-featured-duration]').get_text(strip=True)==service['duration']
    assert card.select_one('[data-book-service]')['data-book-service']==service['id']
    assert card.select_one('img').get('alt')
assert len(soup.select('.hero-values li'))==3
assert soup.select_one('.mobile-nav a[href="#price-list"]')
assert soup.select_one('footer#contact .footer-book[href="#booking"]')
assert soup.select_one('nav.navlinks a[href="#price-list"]')
assert "data-book-service" in (root/'app.js').read_text()
print('Rose V2 design, featured prices, booking and 26 services: PASS')
