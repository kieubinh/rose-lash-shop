const SENDER = 'Rose <anthony@kieu.app>';
const RECIPIENT = 'phamdiemkieu02@gmail.com';
const TREATMENTS = new Set([
  'Classic lash set',
  'Hybrid lash set',
  'Volume lash set',
  'Brow shape',
  'Brow tint',
  'Brow lamination',
  'Upper lip wax',
  'Chin wax',
  'Full face wax'
]);
const TIMES = new Set(['', 'Morning', 'Afternoon']);
const RATE_WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;
const recentRequests = new Map();

function sendJson(res, status, body) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  return res.status(status).json(body);
}

function text(value, max) {
  if (typeof value !== 'string') return null;
  const clean = value.trim();
  if (clean.length > max || /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(clean)) return null;
  return clean;
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function rateLimited(req) {
  const address = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').split(',')[0].trim();
  const now = Date.now();
  if (recentRequests.size > 2000) {
    for (const [key, entry] of recentRequests) if (entry.expires <= now) recentRequests.delete(key);
  }
  const entry = recentRequests.get(address);
  if (!entry || entry.expires <= now) {
    recentRequests.set(address, { count: 1, expires: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_REQUESTS_PER_WINDOW;
}

function validate(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const kind = body.kind;
  const name = text(body.name, 90);
  const email = text(body.email, 254);
  const phone = text(body.phone, 30);
  const treatment = text(body.treatment, 50);
  const date = text(body.date, 10);
  const time = text(body.time, 20);
  const notes = text(body.notes, 1500);
  const message = text(body.message, 1500);
  const website = text(body.website, 200);
  const requestId = text(body.requestId, 80);

  if ((kind !== 'booking' && kind !== 'inquiry') || !name || name.length < 2 || /[\r\n]/.test(name)) return null;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || /[\r\n]/.test(email)) return null;
  if (phone === null || !/^[+\d\s().-]*$/.test(phone)) return null;
  if (notes === null || message === null || website === null || !requestId || !/^[a-zA-Z0-9_-]{8,80}$/.test(requestId)) return null;
  if (kind === 'booking' && (!TREATMENTS.has(treatment) || !validDate(date) || !TIMES.has(time))) return null;
  if (kind === 'inquiry' && message.length < 3) return null;
  return { kind, name, email, phone, treatment, date, time, notes, message, website, requestId };
}

function emailContent(request) {
  const booking = request.kind === 'booking';
  const fields = booking
    ? [
        ['Name', request.name], ['Email', request.email], ['Phone', request.phone || 'Not provided'],
        ['Treatment', request.treatment], ['Preferred date', request.date],
        ['Preferred time', request.time || 'Not specified'], ['Notes', request.notes || 'None']
      ]
    : [
        ['Name', request.name], ['Email', request.email], ['Phone', request.phone || 'Not provided'],
        ['Message', request.message]
      ];
  const heading = booking ? 'New booking request' : 'New inquiry';
  const rows = fields.map(([label, value]) => `<tr><th align="left" style="padding:9px 12px;border-bottom:1px solid #eadbd7;color:#74404a;vertical-align:top">${escapeHtml(label)}</th><td style="padding:9px 12px;border-bottom:1px solid #eadbd7;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`).join('');
  return {
    subject: booking ? `Rose booking request: ${request.treatment}` : 'Rose: new inquiry',
    text: `${heading}\n\n${fields.map(([label, value]) => `${label}: ${value}`).join('\n\n')}\n\nReply to this email to contact the visitor.`,
    html: `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${heading}</title></head><body style="margin:0;background:#fcf5f0;color:#4d3438;font:15px/1.6 Arial,sans-serif"><main style="max-width:620px;margin:24px auto;padding:26px;background:#fffaf7;border:1px solid #eadbd7;border-radius:16px"><p style="color:#a66b74;font-size:12px;letter-spacing:.14em;text-transform:uppercase">Rose · Lash · Brow · Wax</p><h1 style="font:normal 30px Georgia,serif">${heading}</h1><p>${booking ? 'A visitor has requested an appointment. Please reply to confirm availability.' : 'A visitor has sent a message through the website.'}</p><table style="width:100%;border-collapse:collapse">${rows}</table><p style="font-size:13px;color:#765f64">Reply to this email to contact the visitor.</p></main></body></html>`
  };
}

function confirmationContent(request) {
  const booking = request.kind === 'booking';
  const first = escapeHtml(request.name.split(/\s+/)[0]);
  const summary = booking
    ? `${request.treatment} · ${request.date}${request.time ? ` · ${request.time}` : ''}`
    : 'your inquiry';
  const lead = booking
    ? 'We received your appointment request. This is not a confirmed booking yet. Rose will reply by email to confirm availability.'
    : 'We received your message. Rose will reply by email soon.';
  return {
    subject: booking ? 'We received your request · Rose' : 'We received your message · Rose',
    text: `Hi ${request.name.split(/\s+/)[0]},\n\n${lead}\n\nYour request: ${summary}\n\nYou can reply to this email if anything changes.\n\nRose · Lash · Brow · Wax`,
    html: `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Rose</title></head><body style="margin:0;background:#fcf5f0;color:#4d3438;font:15px/1.6 Arial,sans-serif"><main style="max-width:560px;margin:24px auto;padding:26px;background:#fffaf7;border:1px solid #eadbd7;border-radius:16px"><p style="color:#a66b74;font-size:12px;letter-spacing:.14em;text-transform:uppercase">Rose · Lash · Brow · Wax</p><h1 style="font:normal 26px Georgia,serif">Hi ${first},</h1><p>${lead}</p><p style="padding:12px 14px;background:#f9eee9;border-radius:10px"><strong>Your request:</strong> ${escapeHtml(summary)}</p><p style="font-size:13px;color:#765f64">You can reply to this email if anything changes.</p></main></body></html>`
  };
}

async function sendToResend(request, apiKey, { to, replyTo, content, key }) {
  const body = JSON.stringify({
    from: SENDER,
    to: [to],
    reply_to: [replyTo],
    subject: content.subject,
    text: content.text,
    html: content.html
  });
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `rose-${key}-${request.kind}/${request.requestId}`
      },
      body,
      signal: AbortSignal.timeout(9000)
    });
    if (response.ok) {
      const result = await response.json().catch(() => ({}));
      return typeof result.id === 'string' && result.id.length > 0;
    }
    if (attempt === 0 && (response.status === 429 || response.status >= 500)) {
      await new Promise((resolve) => setTimeout(resolve, 750));
      continue;
    }
    console.error('Resend rejected Rose request', response.status);
    return false;
  }
  return false;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { ok: false, message: 'Method not allowed.' });
  }
  const origin = req.headers.origin;
  if (origin) {
    try {
      if (new URL(origin).host !== req.headers.host) return sendJson(res, 403, { ok: false, message: 'Request not allowed.' });
    } catch {
      return sendJson(res, 403, { ok: false, message: 'Request not allowed.' });
    }
  }
  if (!String(req.headers['content-type'] || '').startsWith('application/json')) return sendJson(res, 415, { ok: false, message: 'Expected JSON.' });

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { return sendJson(res, 400, { ok: false, message: 'Please check the form and try again.' }); }
  }
  if (!body || Buffer.byteLength(JSON.stringify(body)) > 8000) return sendJson(res, 413, { ok: false, message: 'Your message is too long.' });
  const request = validate(body);
  if (!request) return sendJson(res, 400, { ok: false, message: 'Please check the form and try again.' });
  if (request.website) return sendJson(res, 200, { ok: true, message: 'Request received.' });
  if (rateLimited(req)) return sendJson(res, 429, { ok: false, message: 'Too many requests. Please try again later.' });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return sendJson(res, 503, { ok: false, message: 'The request form is temporarily unavailable. Please try again later.' });
  try {
    const sent = await sendToResend(request, apiKey, { to: RECIPIENT, replyTo: request.email, content: emailContent(request), key: 'owner' });
    if (sent) {
      // Best effort: a failed receipt must not turn a delivered request into an error.
      await sendToResend(request, apiKey, { to: request.email, replyTo: RECIPIENT, content: confirmationContent(request), key: 'receipt' }).catch(() => false);
      return sendJson(res, 200, { ok: true, message: 'Request sent.' });
    }
  } catch (error) {
    console.error('Rose email request failed', error?.name || 'unknown_error');
  }
  return sendJson(res, 503, { ok: false, message: 'We could not send your request. Please try again later.' });
}
