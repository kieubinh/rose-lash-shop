import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const source = await readFile(resolve(root, 'src/site.html'), 'utf8');
const client = await readFile(resolve(root, 'src/client.js'), 'utf8');
const output = resolve(root, 'public');
const siteUrl = (process.env.SITE_URL || '').replace(/\/$/, '');
const description = 'Rose Lash · Brow · Wax — lashes, brows and face waxing in a calm private studio. Request an appointment online.';
const schema = {
  '@context': 'https://schema.org',
  '@type': 'BeautySalon',
  name: 'Rose Lash · Brow · Wax',
  description,
  ...(siteUrl && { url: siteUrl, image: `${siteUrl}/og.jpg` }),
  makesOffer: ['Classic lash set', 'Hybrid lash set', 'Volume lash set', 'Brow shape', 'Brow tint', 'Brow lamination', 'Face waxing']
    .map((name) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name } }))
};
const socialTags = siteUrl
  ? `<link rel="canonical" href="${siteUrl}/"><meta property="og:type" content="website"><meta property="og:title" content="Rose Lash · Brow · Wax"><meta property="og:description" content="${escapeAttributeEarly(description)}"><meta property="og:url" content="${siteUrl}/"><meta property="og:image" content="${siteUrl}/og.jpg"><meta name="twitter:card" content="summary_large_image">`
  : '';
function escapeAttributeEarly(value) { return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;'); }

if (!source.startsWith('<main') || !source.trimEnd().endsWith('</main>')) {
  throw new Error('src/site.html must contain the Rose page fragment.');
}

const scriptHash = `sha256-${createHash('sha256').update(client).digest('base64')}`;
const childCsp = `default-src 'none'; base-uri 'none'; form-action 'none'; object-src 'none'; connect-src 'none'; img-src data:; style-src 'unsafe-inline'; script-src '${scriptHash}'`;
const parentCsp = `default-src 'none'; base-uri 'none'; form-action 'none'; object-src 'none'; connect-src 'self'; img-src data:; style-src 'unsafe-inline'; script-src 'self' '${scriptHash}'; frame-src 'self' about:`;
const escapeAttribute = (value) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

const framedPage = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="Content-Security-Policy" content="${escapeAttribute(childCsp)}"><title>Rose Lash · Brow · Wax</title><style>html,body{margin:0;min-width:320px;background:#f9eee9}</style></head><body>${source}<script>${client}</script></body></html>`;
const hostPage = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="${escapeAttribute(description)}"><meta name="theme-color" content="#f9eee9">${socialTags}<script type="application/ld+json">${JSON.stringify(schema).replaceAll("<", "\\u003c")}</script><meta http-equiv="Content-Security-Policy" content="${escapeAttribute(parentCsp)}"><title>Rose Lash · Brow · Wax</title><style>html,body{margin:0;width:100%;background:#f9eee9}#rose-studio-frame{display:block;width:100%;height:100vh;min-height:600px;border:0}</style></head><body><iframe id="rose-studio-frame" title="Rose Lash Brow Wax website" sandbox="allow-scripts" referrerpolicy="no-referrer" srcdoc="${escapeAttribute(framedPage)}"></iframe><script src="/host.js" defer></script></body></html>`;

await mkdir(output, { recursive: true });
await writeFile(resolve(output, 'index.html'), hostPage);
await copyFile(resolve(root, 'src/host.js'), resolve(output, 'host.js'));
await copyFile(resolve(root, 'src/og.jpg'), resolve(output, 'og.jpg'));
await writeFile(resolve(root, 'vercel.json'), `${JSON.stringify({
  buildCommand: 'npm run build',
  outputDirectory: 'public',
  installCommand: 'npm ci',
  headers: [{
    source: '/(.*)',
    headers: [
      { key: 'Content-Security-Policy', value: `${parentCsp}; frame-ancestors 'none'` },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'no-referrer' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
    ]
  }]
}, null, 2)}\n`);
