'use strict';
/* Rose product-availability enquiry endpoint. NOT a purchase or payment. */
const products = require('../data/products.json');
const byId = new Map(products.map(p => [p.id, p]));
const originAllow = new Set(['https://rose-lash-shop.vercel.app','https://rose-lash-shop-anthonykieu.vercel.app']);
const clean = (v, n) => typeof v === 'string' ? v.trim().slice(0, n) : '';
const escapeHtml = v => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const respond = (res,code,obj) => res.status(code).setHeader('Cache-Control','no-store').json(obj);
function validateItems(input) {
  if (!Array.isArray(input) || input.length < 1 || input.length > 8) return null;
  const seen = new Set(); let units = 0; const items = [];
  for (const entry of input) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return null;
    const p = byId.get(entry.id);
    const qty = entry.quantity;
    if (!p || seen.has(p.id) || !Number.isInteger(qty) || qty < 1 || qty > 10) return null;
    seen.add(p.id); units += qty;
    if (units > 20) return null;
    items.push({ id:p.id, name:p.name, quantity:qty, price:p.price });
  }
  return items;
}
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow','POST'); return respond(res,405,{error:'Method not allowed'}); }
  const origin = req.headers.origin || '';
  if (origin && !originAllow.has(origin) && !/^https:\/\/rose-lash-shop-[a-z0-9-]+\.vercel\.app$/i.test(origin)) return respond(res,403,{error:'Origin not allowed'});
  if (Number(req.headers['content-length']||0) > 8000) return respond(res,413,{error:'Request too long'});
  let data = req.body;
  try { if (typeof data === 'string') data = JSON.parse(data); } catch { return respond(res,400,{error:'Invalid request'}); }
  if (!data || typeof data !== 'object' || Array.isArray(data)) return respond(res,400,{error:'Invalid request'});
  if (clean(data.website,200)) return respond(res,200,{sent:false});
  const name = clean(data.name,100), email = clean(data.email,200), phone = clean(data.phone,35);
  const fulfilment = data.fulfilment, address = clean(data.address,400), notes = clean(data.notes,800);
  const items = validateItems(data.items);
  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !items || !['pickup','delivery-quote'].includes(fulfilment) || (fulfilment === 'delivery-quote' && address.length < 8)) return respond(res,400,{error:'Please check your contact, bag and collection/delivery details.'});
  const key = process.env.RESEND_API_KEY;
  const from = process.env.ROSE_BOOKING_FROM_EMAIL;
  const to = process.env.ROSE_BOOKING_TO_EMAIL;
  if (!key || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(from||'') || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to||'')) return respond(res,503,{error:'Product enquiries are temporarily unavailable. Please copy the request and contact the studio.'});
  const subtotal = items.reduce((s,i)=>s+i.quantity*i.price,0);
  const rows = items.map(i=>i.name+' × '+i.quantity+' (concept A$'+i.price+' each)').join('\n');
  const message = ['New Rose product availability request','NOT a purchase, reservation or confirmed order. NO payment has been taken.','', 'Customer: '+name,'Email: '+email,'Phone: '+(phone||'Not provided'),'Fulfilment preference: '+fulfilment,'Delivery suburb/postcode/address: '+(address||'Not provided'),'','Items:',rows,'','Indicative product subtotal: A$'+subtotal+' (not a final price; shipping/charges not included)','Notes: '+(notes||'None'),'','Contact the customer to confirm real stock, specifications, final product/fulfilment price and payment arrangements before proceeding.'].join('\n');
  const html = '<h2>Rose product availability enquiry</h2><p><strong>NOT a paid or confirmed order</strong></p><pre style="white-space:pre-wrap;font:14px/1.6 sans-serif">'+escapeHtml(message)+'</pre>';
  try {
    const response = await fetch('https://api.resend.com/emails',{method:'POST',headers:{'Authorization':'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({from,to:[to],reply_to:email,subject:'Rose product availability request — '+name,html,text:message})});
    if (!response.ok) return respond(res,502,{error:'Email service did not accept the request. Please copy the details instead.'});
    return respond(res,200,{sent:true});
  } catch { return respond(res,502,{error:'Could not deliver the request. Please copy the details instead.'}); }
};
module.exports.validateItems = validateItems;
