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
assert next(x for x in services if x['id']=='lash-design-light')['name']=='Natural Design Lashes'
assert next(x for x in services if x['id']=='lash-design-max')['name']=='Luxury Design Lashes'
app_source=(root/'app.js').read_text()
assert '"name":"Natural Design Lashes"' in app_source
assert '"name":"Luxury Design Lashes"' in app_source
assert 'Natural Design and Luxury Design are new-set only.' in app_source
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

# The Rose Edit product showcase is illustrative: check the 4 products, image assets,
# price labels, working detail controls and explicit no-checkout messaging.
products=[
 ('lash-cleanser','Lash cleanser','22','rose-lash-cleanser.svg'),
 ('lash-brush','Soft lash brush','12','rose-lash-brush.svg'),
 ('lash-care-kit','Lash care kit','38','rose-lash-care-kit.svg'),
 ('brow-styling','Brow styling edit','20','rose-brow-gel.svg')
]
cards=soup.select('#shop .shop-card')
assert len(cards)==4
assert len(soup.select('#shop .shop-perks>div'))==4
for identifier,name,price,art in products:
    card=soup.select_one(f'[data-shop-product="{identifier}"]')
    assert card is not None
    assert card.select_one('h3').get_text(strip=True)==name
    assert card.select_one('.shop-pricing strong').get_text(strip=True)==f'A${price}'
    assert card.select_one('button[data-product-id]')['data-product-id']==identifier
    image=card.select_one('img')
    assert image.get('src')=='/assets/'+art
    assert image.get('alt')
    raw=(root/'assets'/art).read_text()
    assert raw.startswith('<svg') and '<title>' in raw and '</svg>' in raw
assert soup.select_one('dialog#rose-product-dialog[aria-labelledby="rose-product-title"]')
assert soup.select_one('#rose-product-close')
assert soup.select_one('#rose-product-highlights')
shop_notice=soup.select_one('#shop .shop-info').get_text(' ',strip=True)
assert 'not confirmed' in shop_notice and 'No purchases or payments' in shop_notice
assert 'productDialog.showModal()' in app_source
assert 'roseEditProducts' in app_source

print('Rose V2 design, featured prices, four product concepts, booking and 26 services: PASS')
