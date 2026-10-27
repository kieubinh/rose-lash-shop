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
