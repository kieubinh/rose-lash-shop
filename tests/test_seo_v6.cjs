'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repo = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(repo, file), 'utf8');
const base = 'https://rose-lash-shop.vercel.app';
const pages = [
  ['/', 'index.html', null],
  ['/lashes/', 'lashes/index.html', 'Lashes'],
  ['/brows/', 'brows/index.html', 'Brows'],
  ['/waxing/', 'waxing/index.html', 'Waxing']
];
const services = JSON.parse(read('data/services.json'));
const matchMeta = (html, field, name) => {
  const pattern = new RegExp('<meta\\s+' + field + '="' + name + '"\\s+content="([^"]+)"');
  return html.match(pattern)?.[1] ?? '';
};
const structuredNodes = html => {
  const results = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  return results.flatMap(([, value]) => {
    const parsed = JSON.parse(value);
    assert.equal(parsed['@context'], 'https://schema.org');
    return parsed['@graph'] || [parsed];
  });
};
const textContent = input => input.replace(/<[^>]*>/g, ' ').replaceAll('&amp;', '&').replace(/\s+/g, ' ').trim();

test('all canonical pages are discoverable, indexable and uniquely described', () => {
  const titles = new Set(), descriptions = new Set();
  for (const [url, file] of pages) {
    const html = read(file);
    const title = textContent(html.match(/<title>(.*?)<\/title>/s)?.[1] || '');
    const desc = matchMeta(html, 'name', 'description');
    const canon = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
    assert.equal(canon, base + url, file);
    assert.match(title, /Sydney/, file);
    assert.match(desc, /Sydney/, file);
    assert.match(matchMeta(html, 'name', 'robots'), /index,follow/, file);
    assert.equal((html.match(/<h1\b/g) || []).length, 1, file);
    assert.ok(!titles.has(title), file + ': duplicate title');
    assert.ok(!descriptions.has(desc), file + ': duplicate meta description');
    titles.add(title); descriptions.add(desc);
    assert.equal(matchMeta(html, 'property', 'og:url'), canon, file);
    assert.ok(matchMeta(html, 'property', 'og:image'), file);
    assert.ok(structuredNodes(html).length, file);
  }
});

test('homepage offers search-relevant visible heading and direct category links', () => {
  const html = read('index.html');
  assert.match(html, /<h1[^>]*>[\s\S]*?Lash extensions, brows &amp; waxing in Sydney[\s\S]*?<\/h1>/);
  for (const [url] of pages.slice(1)) {
    assert.ok(html.includes('class="seo-category-link" href="' + url + '"'), url);
    assert.ok(html.includes('href="' + url + '"'), url);
  }
  assert.ok(html.includes('href="/seo-v6.css"'));
  assert.ok(html.includes('fetchpriority="high"'));
  assert.ok(html.includes('rel="preconnect" href="https://images.pexels.com"'));
  assert.equal((html.match(/rose-official-logo\.avif/g) || []).length, 4);
  assert.match(html, /id="booking-form"/);
  assert.match(html, /rose-v4-v5\.js/);
});

test('service pages have working mobile navigation and consistent service prices', () => {
  for (const [url, file, category] of pages.slice(1)) {
    const html = read(file);
    assert.match(html, /class="seo-mobile-nav inner"/, file);
    assert.match(html, /class="seo-skip-link" href="#treatment-content"/, file);
    assert.match(html, /id="treatment-content"/, file);
    for (const [u] of pages) assert.ok(html.includes('href="' + u + '"'), file + ': link to ' + u);
    assert.match(html, new RegExp('href="' + url + '" aria-current="page"'), file);
    assert.match(html, /href="\/seo-v6.css"/, file);
    assert.match(html, /fetchpriority="high"/, file);
    const cards = [...html.matchAll(/<article class="seo-service">([\s\S]*?)<\/article>/g)].map(x=>textContent(x[1]));
    const expected = services.filter(s => s.category === category);
    assert.equal(cards.length, expected.length, file);
    for (const service of expected) {
      assert.ok(cards.some(card => card.includes(service.name) && card.includes('A$' + service.price)),
        file + ': service changed ' + service.id);
    }
    const collection = structuredNodes(html).find(x=>x['@type'] === 'CollectionPage');
    assert.ok(collection, file);
    const schemaItems = collection.mainEntity.itemListElement;
    assert.equal(schemaItems.length, expected.length, file);
    for (const service of expected) {
      assert.ok(schemaItems.some(item=>item.item.name===service.name && item.item.offers.price===service.price &&
        item.item.offers.priceCurrency==='AUD'), file + ': structured data for '+service.id);
    }
  }
});

test('sitemap and robots expose the four correct public URLs', () => {
  const sitemap = read('sitemap.xml');
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>x[1]);
  assert.deepEqual(locations, pages.map(p=>base+p[0]));
  assert.equal((sitemap.match(/<lastmod>2026-10-27<\/lastmod>/g)||[]).length,4);
  const robots=read('robots.txt');
  assert.match(robots, /User-agent: \*/);
  assert.match(robots, /Sitemap: https:\/\/rose-lash-shop\.vercel\.app\/sitemap\.xml/);
  assert.doesNotMatch(robots, /Disallow: \//);
});

test('business schema uses only verified Sydney-level information and concept goods have no product offers', () => {
  const org = structuredNodes(read('index.html')).find(x=>x['@type']==='BeautySalon');
  assert.ok(org);
  assert.equal(org.address.addressLocality, 'Sydney');
  assert.equal(org.address.addressRegion, 'NSW');
  assert.equal(org.address.addressCountry, 'AU');
  for (const prop of ['telephone', 'openingHours', 'aggregateRating', 'review', 'priceRange']) {
    assert.ok(!(prop in org), 'Unverified organization property ' + prop);
  }
  assert.ok(!('streetAddress' in org.address));
  assert.ok(!('postalCode' in org.address));
  assert.ok(structuredNodes(read('index.html')).every(x=>x['@type']!=='Product'));
});
