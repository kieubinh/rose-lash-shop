'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = name => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');

test('V4/V5 retain all 26 services and the existing enquiry backend', () => {
  const services = JSON.parse(source('data/services.json'));
  const html = source('index.html');
  const booking = source('api/booking.js');
  assert.equal(services.length, 26);
  assert.equal(new Set(services.map(x => x.id)).size, 26);
  assert.match(html, /id="booking-form"/);
  assert.match(html, /id="booking-copy"/);
  assert.match(html, /\/app\.js/);
  assert.match(booking, /RESEND_API_KEY/);
  assert.match(html, /rose-official-logo\.avif/);
  assert.match(html, /rose-salon\.jpg/);
  assert.doesNotMatch(html, /owner-portrait/);
});

test('featured pricing, lash policy and the V4 mobile shortcut retain enquiry wording', () => {
  const html = source('index.html');
  const css = source('rose-v4-v5.css');
  assert.equal((html.match(/data-featured-id=/g) || []).length, 3);
  assert.match(html, /data-jump-category="Lashes" aria-label="View lash aftercare policy/);
  assert.match(html, /class="rose-mobile-booking"/);
  assert.match(html, /Enquiry only · Studio confirms/);
  assert.match(css, /\.featured-action\s*\{/);
  assert.match(css, /margin-top:\s*auto/);
  assert.match(css, /env\(safe-area-inset-bottom\)/);
  assert.match(css, /rose-booking-in-view/);
});

test('four preview products have labelled filters and native dialog controls', () => {
  const html = source('index.html');
  const css = source('rose-v4-v5.css');
  assert.equal((html.match(/data-shop-product=/g) || []).length, 4);
  assert.equal((html.match(/class="shop-concept-badge"/g) || []).length, 4);
  assert.equal((html.match(/data-edit-filter=/g) || []).length, 4);
  assert.equal((html.match(/aria-controls="rose-product-dialog"/g) || []).length, 4);
  assert.match(html, /Concept previews only/);
  assert.match(html, /No checkout/);
  assert.match(css, /\.shop-card\[hidden\]\s*\{\s*display:\s*none\s*!important/);
});

test('filtering and sticky CTA runtime respond to viewport, keyboard and dialog changes', () => {
  const states = new Set();
  const listeners = {};
  const filters = ['all', 'lashes', 'tools', 'brows'].map(group => ({
    dataset: { editFilter: group }, attrs: {},
    addEventListener(kind, fn) { if (kind === 'click') this.click = fn; },
    setAttribute(key, value) { this.attrs[key] = value; }
  }));
  const cards = ['lashes', 'tools', 'lashes', 'brows'].map(group => ({
    dataset: { editGroup: group }, hidden: false
  }));
  const booking = {};
  const count = { textContent: '' };
  const dialog = { open: false };
  const root = {
    querySelectorAll(selector) {
      return selector === '[data-edit-filter]' ? filters : cards;
    },
    classList: {
      toggle(name, value) {
        if (value) states.add(name);
        else states.delete(name);
      }
    }
  };
  const document = {
    activeElement: { tagName: 'BODY' },
    getElementById(id) {
      return {
        'rose-v2': root, 'rose-edit-count': count,
        booking, 'rose-product-dialog': dialog
      }[id] || null;
    },
    addEventListener(kind, fn) { listeners[kind] = fn; }
  };
  let intersect, changedDialog;
  class IntersectionObserver {
    constructor(callback) { intersect = callback; }
    observe() {}
  }
  class MutationObserver {
    constructor(callback) { changedDialog = callback; }
    observe() {}
  }
  const visualViewport = {
    height: 800,
    addEventListener(kind, fn) { listeners[kind] = fn; }
  };
  const window = {
    IntersectionObserver, MutationObserver, visualViewport, innerHeight: 800
  };
  vm.runInNewContext(source('rose-v4-v5.js'), {
    document, window, IntersectionObserver, MutationObserver
  });

  assert.ok(cards.every(card => !card.hidden));
  filters[1].click();
  assert.deepEqual(cards.map(card => card.hidden), [false, true, false, true]);
  assert.equal(count.textContent, 'Showing 2 of 4 concept products');
  assert.equal(filters[1].attrs['aria-pressed'], 'true');
  filters[2].click();
  assert.deepEqual(cards.map(card => card.hidden), [true, false, true, true]);
  filters[3].click();
  assert.deepEqual(cards.map(card => card.hidden), [true, true, true, false]);
  filters[0].click();
  assert.ok(cards.every(card => !card.hidden));
  intersect([{ target: booking, isIntersecting: true }]);
  assert.ok(states.has('rose-booking-in-view'));
  intersect([{ target: booking, isIntersecting: false }]);
  assert.ok(!states.has('rose-booking-in-view'));
  dialog.open = true; changedDialog();
  assert.ok(states.has('rose-product-dialog-open'));
  dialog.open = false; changedDialog();
  assert.ok(!states.has('rose-product-dialog-open'));
  document.activeElement.tagName = 'INPUT';
  visualViewport.height = 490; listeners.resize();
  assert.ok(states.has('rose-keyboard-open'));
  visualViewport.height = 800; listeners.resize();
  assert.ok(!states.has('rose-keyboard-open'));
});
