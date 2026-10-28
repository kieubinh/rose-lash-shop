# Rose Lash · Brow · Wax

Rose's glass styled salon website with booking requests and general inquiries.

## Run locally

Use Node.js 20 or later. Run `npm ci` and `npm run build`. The generated static site is in `public/`. Vercel serves `public/` and the Node function at `/api/contact`.

Set `RESEND_API_KEY` in the Vercel project environment. The key is used only in the server function. The sender is `Rose <anthony@kieu.app>` and requests go to `phamdiemkieu02@gmail.com`. Resend must verify `kieu.app` before this sender can deliver mail.

The form submits a request, not a confirmed appointment. The recipient replies to the visitor's email address to confirm details.

## Isolation

`src/site.html` is embedded in a sandboxed iframe without same origin access. The iframe has its own strict Content Security Policy. A small host script accepts messages only from that iframe and sends validated requests to the same origin API. `npm run build` generates the static page and the matching CSP headers in `vercel.json`.
