# Rose Lash · Brow · Wax — faithful Rose Glass V2 implementation

Source of design: user-supplied `rose-glass-v2.html`. The reference's salon photo, fonts, glass navigation, hero geometry, studio section, and booking panel are retained; the photo is extracted into `assets/rose-salon.jpg`.

## Implemented
- Responsive single-page studio site preserving reference visual structure
- 26 services, accurate prices, durations, two-week infill where applicable, and aftercare policies
- Concept-only product edit (no confirmed products, prices, checkout or sales)
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
