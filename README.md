# Rose Lash · Brow · Wax — faithful Rose Glass V2 implementation

Source of design: user-supplied `rose-glass-v2.html`. The reference's salon photo, fonts, glass navigation, hero geometry, studio section, and booking panel are retained; the photo is extracted into `assets/rose-salon.jpg`.

## Implemented
- Screenshot-inspired enhancements: hero value strip, clear Prices navigation, three featured service photo cards, aftercare callout, and an expanded contact/footer area. The original Rose V2 palette, typography, salon photograph, service menu, and enquiry flow remain in place.
- Featured prices and durations are populated from the same 26-service menu used for booking. Reference mockup prices, contact information, and testimonials are not adopted because they were not verified for this salon.
- Responsive single-page studio site preserving reference visual structure
- 26 services, accurate prices, durations, two-week infill where applicable, and aftercare policies
- Four Rose Edit concept products shown with locally hosted Rose-branded SVG illustrations, design-reference A$22/A$12/A$38/A$20 indicative prices, responsive cards, and accessible View Details dialog. These are **not verified sale prices**, and no inventory or checkout is active.
- Booking enquiry form with accessible validation, honeypot, copy fallback, and secure `/api/booking` Vercel endpoint
- No actual booking confirmation until the studio replies

## Setup
- Deploy files as a Vercel Other/static project. Keep output directory `.` and `api/booking.js` serverless function enabled.
- The project contains no Node dependencies or lockfile; do not run `npm ci`.
- `RESEND_API_KEY` is a server-only encrypted environment secret and must never appear in HTML/JS shipped to visitors.
- Required for email activation: `ROSE_BOOKING_FROM_EMAIL` (a verified sender from the authorised Resend team) and `ROSE_BOOKING_TO_EMAIL` (owner's confirmed inbox).
- Until all three environment variables are configured, `/api/booking` returns HTTP 503 and the UI offers **Copy details**.
- Production sends from the verified `kieu.app` domain using a sending-only Resend API key scoped to that domain. The sender and booking recipient are configured in Vercel; keep their values and the API key out of the repository.
- Domain DNS is managed in Namecheap. Keep the Resend-provided DKIM and CNAME records in place, and check domain verification in Resend after DNS changes.
- Changes to Vercel environment variables require a new deployment. Verify the live booking form and the delivery status in Resend after changing email settings.

## GitHub
Repository: `kieubinh/rose-lash-shop`.

## Local checks
`node --check app.js` and `node --check api/booking.js`; HTML structure can be checked using any HTML parser. Use Vercel Preview deployment for an end-to-end `/api/booking` test; it must not send when sender and recipient variables are missing.

## Featured imagery
The three featured treatment illustrations load from Pexels (photo IDs [7446923](https://www.pexels.com/photo/7446923), [6135621](https://www.pexels.com/photo/6135621), and [6763621](https://www.pexels.com/photo/6763621)), published as free-to-use stock images. They are **illustrative, not Rose client photos**, and a branded gradient fallback displays if they fail to load. Images are hosted by Pexels and subject to third-party availability.

## Rose Edit product concept showcase
The design-reference catalogue currently includes Lash cleanser (A$22), Soft lash brush (A$12), Lash care kit (A$38), and Brow styling edit (A$20). The illustrations in `assets/rose-lash-*.svg` and `assets/rose-brow-gel.svg` are original concept artwork constructed for the site, **not photos of physical stock**. All cards and the detail dialog explicitly disclose illustrative pricing, unconfirmed product specifications and lack of purchasing capability. Before selling, verify the physical products, ingredients/materials, local product and consumer-law obligations, inventory, final descriptions and prices, and add a supported checkout. Do not assume the reference's implied product claims have been validated.

## 2026 salon-first homepage redesign
- Redesign inspired by the supplied luxury Rose homepage mockup, while keeping the original brand palette and production enquiry workflow.
- Owner/artist portrait and profile card are explicitly excluded from the page, per the latest design decision.
- A brighter studio-led hero, image-backed service category banners, four trust/value labels, three highlighted treatments, and a booking enquiry panel share the upper page.
- Studio atmosphere panel replaces the owner biography; the existing `assets/rose-salon.jpg` image remains in use until a separately reviewed authentic studio image is available in the repository.
- 26 exact service prices and durations, four conceptual Rose Edit products, and the server-side email booking route remain unchanged.
- Do not copy the example's invented business address, testimonials, owners' names or prices into production.
- Validate using `python tests/test_portrait_free_homepage.py`, `python tests/test_visual_source.py`, `python tests/check_data.py`, `node --check app.js`, and `node --test tests/test_booking.cjs`.

## Search visibility and SEO (October 2026)
- Public indexing enabled in `index.html`: removed the former `noindex,nofollow` instruction. Homepage and category landing pages have unique titles/descriptions, self-referencing canonical URLs, Open Graph previews, and JSON-LD without invented business details.
- The `/lashes/`, `/brows/`, and `/waxing/` landing pages render the 26 verified treatment-menu entries in static HTML. Keep their price/duration content in sync with `data/services.json` when changes occur.
- `robots.txt` points to `sitemap.xml`; submit `https://rose-lash-shop.vercel.app/sitemap.xml` to Google Search Console once website ownership is verified.
- All pages use `en-AU` and Australian dollars (AUD) based on the supplied price menu. **No unverified address, telephone, operating hours, reviews or Google Business Profile URL are included.** Add verified studio address/service area and contact information before pursuing location-specific local SEO or Google local business rich-result eligibility.
- The four Rose Edit catalogue items remain expressly **concept-only** and are not included in product/merchant structured data or the sitemap.
- Add a genuine canonical custom domain later if available; update metadata, schema URLs, internal sitemap URLs and Search Console together, and permanently redirect the old host.
- Run `python tests/test_seo.py` to check the SEO data, schema syntax, indexability, and service menu. Google indexing/placement and Core Web Vitals require checks from Google Search Console and PageSpeed Insights; SEO markup alone does not guarantee either.

### Sydney local SEO
- Confirmed geographic targeting is **Sydney, NSW, Australia**. The homepage and three service landing pages now have Sydney-focused titles, descriptions, headings/visible copy and updated structured data.
- The homepage entity is a `BeautySalon` with only confirmed city, region and country in its `PostalAddress` plus Sydney `areaServed`; **no street address, suburb, postcode, phone, opening hours or reviews** have been invented.
- To complete local search setup, verify the actual street address/suburb or service-area setup, contact details, business hours, and Google Business Profile ownership before publishing more granular location data.

## Rose V4 + V5 — responsive booking and concept-store UX (27 October 2026)
- **Featured treatment corrections:** price and Enquire buttons align consistently across cards; arrow spacing is fixed; aftercare link explicitly selects the Lashes policy rather than leaving an unrelated category selected.
- **V4 mobile booking shortcut:** a fixed, accessible enquiry-only CTA appears on phones, respects device safe areas, and hides when the booking section is visible, the Rose Edit modal is open, or an on-screen keyboard is raised. It does not confirm appointments or introduce a new submission endpoint.
- **V5 Rose Edit:** the four existing illustrated concept products are labelled as previews and filterable by All concepts, Lash care, Beauty tools and Brows. Filter state is represented by `aria-pressed`; the count announces changes. Existing illustrative A$ prices, product detail dialog and no-checkout warning remain in place.
- **Architecture:** `rose-v4-v5.css` layers after the base stylesheet and responsive V3 without overwriting it. `rose-v4-v5.js` layers after `app.js`. Neither `app.js`, `data/services.json` nor `api/booking.js` was changed.
- **Regression checks:** `node --check rose-v4-v5.js` and `node --test tests/test_v4_v5.cjs`. Follow up with actual device QA at 320/360/375/390/412/430px (Android Chrome + iOS Safari), and with product-detail keyboard/VoiceOver/TalkBack checks. Do not send a real booking enquiry during smoke tests.

## SEO V6 — Sydney service discovery (27 October 2026)

Implemented without changing the logo, salon imagery, 26 service prices, booking enquiry, or Rose Edit concept-only products.

- Homepage `h1` now includes visible "Lash extensions, brows & waxing in Sydney" supporting the Rose brand tagline.
- Three homepage treatment categories contain descriptive links to their indexable `/lashes/`, `/brows/`, and `/waxing/` pages, while existing enquiry links remain.
- All category landing pages now offer keyboard-accessible skip navigation and a dedicated mobile navigation bar with current-page indication.
- The shared studio hero image uses `fetchpriority="high"` preload; the homepage preconnects to Pexels for its existing illustrative treatment imagery.
- The canonical four-page sitemap carries accurate `lastmod` dates for this release. No extra synthetic URLs were created.
- `tests/test_seo_v6.cjs` validates unique Sydney-oriented metadata, canonical URLs, indexability, schema, price integrity, service navigation, and sitemap consistency. The GitHub Actions workflow `rose-seo-regression.yml` checks this on pull requests and main pushes.
- Continue to avoid FAQ rich-result promises, review markup, fake contact details, and product offer markup for illustrative Rose Edit concepts.

### Actions requiring verified business ownership

1. Verify the `https://rose-lash-shop.vercel.app/` URL-prefix property in Google Search Console using a supported method (typically a verified HTML file or meta tag). Do not claim indexing until Search Console reports it.
2. Submit `https://rose-lash-shop.vercel.app/sitemap.xml`, and inspect all four canonical URLs individually for coverage/indexing.
3. Claim or verify the legitimate Google Business Profile and align business name, street or service-area setup, contact details and hours with the actual business. Add missing LocalBusiness schema fields only after verification.
4. Monitor Search Console clicks, impressions, CTR, query coverage and mobile Core Web Vitals before expanding content or creating suburb pages. Do not publish doorway pages for unverified suburbs.
5. Run PageSpeed Insights and Rich Results Test on the live production domain. Validation and Search Console submission require access beyond deploying source code.

Note: Vercel production readiness confirms deployment, not Google indexation, a Lighthouse score or measured organic traffic.

## Rose Store V7 — product enquiries, not paid orders (27 October 2026)

- Eight suggested Rose-branded products in `data/products.json`, all explicitly concept-only until physical product, ingredient/material labelling, retail price, stock and fulfilment have been verified. The four existing illustration SVGs are still artwork, not verified goods. Four additional cards are honestly illustrated as idea placeholders.
- `rose-store.js` appends the additional previews and implements an accessible native-dialog bag with quantities, local-only persistence, indicative totals, studio collection or Australian delivery-quote preference, and an email availability-enquiry form.
- `/api/order` validates all IDs, quantities and prices against the authoritative server catalogue, never trusts client-submitted prices, and sends only with existing verified Resend configuration. No customer credit-card or payment data is accepted. No inventory or order is confirmed and there is no payment integration.
- The existing 26 services, enquiry booking flow, official logo, palette, studio imagery and four pre-existing concept cards remain untouched.
- Verify `RESEND_API_KEY`, `ROSE_BOOKING_FROM_EMAIL`, `ROSE_BOOKING_TO_EMAIL` are set (already used by bookings). The new endpoint intentionally fails closed otherwise.
- **Before activating real sales:** confirm suppliers, actual goods/packaging and labels, product safety and Australian requirements, final prices incl GST as applicable, stock/SKUs, ABN/contact details, delivery and returns policies; then add a secure Stripe Checkout or Shopify checkout with stock/order persistence, signed payment webhooks and fulfilment notifications. Do not call these enquiries paid or confirmed sales.
- Run `node --check rose-store.js`, `node --check api/order.js`, `node --test tests/test_store.cjs` and prior regressions.

## Simplified homepage and price list (Oct 2026)
- The homepage is now: hero, three service cards, **Our work** (real before/after photo + video), studio, booking enquiry and footer. The tabbed 26-service menu, "Popular treatments" stock-photo cards and the Rose Edit concept shop were removed from the page to keep it simple.
- The full price list is a PDF at `assets/rose-price-list.pdf`, linked from the nav, hero, services section, footer and the three category pages. It is generated from `data/services.json`: after any price change run `python3 scripts/build_price_list.py` (needs Google Chrome) and commit the new PDF. Lash policy notes in the PDF live in that script.
- `app.js` keeps its own copy of the 26 services for the booking form's treatment dropdown; keep it in sync with `data/services.json`.
- `rose-store.js`, `rose-store.css`, `api/order.js` and `data/products.json` remain in the repo but are no longer loaded by the homepage. Restore the old section from git history if the shop returns.
- Layout overrides for the simplified page are in `home-simple.css`, loaded last.
