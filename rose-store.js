/* Rose V7: an honest shopping bag for PRODUCT AVAILABILITY ENQUIRIES (no payments). */
(() => {
'use strict';
const products = [
{id:'lash-cleanser',name:'Rose Lash Cleanser',price:22,group:'lashes'},
{id:'lash-brush',name:'Rose Soft Lash Brush & Spoolie',price:12,group:'tools'},
{id:'lash-care-kit',name:'Rose Lash Aftercare Kit',price:38,group:'lashes'},
{id:'brow-styling',name:'Rose Clear Brow Styling Gel',price:20,group:'brows'},
{id:'cleansing-brush',name:'Rose Lash Cleansing Brush',price:8,group:'tools',category:'Beauty tools',description:'A standalone gentle lash cleansing brush concept.'},
{id:'satin-mask',name:'Rose Satin Sleep Mask',price:19,group:'tools',category:'Beauty accessories',description:'A satin sleep mask concept in Rose-inspired tones.'},
{id:'mini-kit',name:'Rose Mini Lash Care Kit',price:25,group:'lashes',category:'Aftercare sets',description:'A travel-friendly mini lash aftercare bundle concept.'},
{id:'luxury-gift-box',name:'Rose Luxury Gift Box',price:55,group:'lashes',category:'Gift ideas',description:'A special gift bundle concept; contents to be confirmed.'}
];
const index = new Map(products.map(p=>[p.id,p]));
const root = document.getElementById('rose-v2');
const shop = document.getElementById('shop');
const grid = document.getElementById('rose-edit-grid');
if (!root || !shop || !grid || typeof HTMLDialogElement === 'undefined') return;
let bag = {};
try {
 const saved = JSON.parse(localStorage.getItem('roseEditBagV1')||'{}');
 if(saved && typeof saved==='object' && !Array.isArray(saved)) {
  for(const p of products) {
   const q = saved[p.id];
   if (Number.isInteger(q) && q >= 1 && q <= 10) bag[p.id] = q;
  }
 }
} catch { /* Storage may be disabled. Bag still works for this visit. */ }
function persist() {try {localStorage.setItem('roseEditBagV1',JSON.stringify(bag));} catch {}}
function create(tag,cls,text) {
 const el=document.createElement(tag); if(cls) el.className=cls;
 if(text!==undefined) el.textContent=String(text);
 return el;
}
function makeButton(product) {
 const button=create('button','rose-bag-add','Add to enquiry bag +');
 button.type='button';button.setAttribute('aria-label','Add '+product.name+' to availability enquiry bag');
 button.addEventListener('click',()=>add(product.id));
 return button;
}
for(const product of products.slice(0,4)) {
 const card=grid.querySelector('[data-shop-product="'+product.id+'"]');
 if(card) card.querySelector('.shop-copy').append(makeButton(product));
}
let i=5;
for(const product of products.slice(4)) {
 const card=create('article','shop-card rose-new-concept');
 card.dataset.shopProduct=product.id; card.dataset.editGroup=product.group;
 const picture=create('div','shop-picture');
 const art=create('div','rose-shop-art');
 art.append(create('span',null,'Rose'),create('small',null,product.category));
 picture.append(art,create('span','shop-concept-badge','Idea preview'));
 const copy=create('div','shop-copy');
 copy.append(create('span','shop-category',String(i).padStart(2,'0')+' / '+product.category),create('h3',null,product.name),create('p',null,product.description));
 const price=create('div','shop-pricing');
 price.append(create('strong',null,'A$'+product.price),create('span',null,'Concept price'));
 copy.append(price,makeButton(product));
 card.append(picture,copy);grid.append(card);i++;
}
const hero=shop.querySelector('.shop-hero');
const bagButton=create('button','rose-store-open');bagButton.type='button';
bagButton.innerHTML='Enquiry bag <span class="rose-bag-badge" id="rose-bag-count">0</span>';
hero.append(bagButton);
const helper=create('p','rose-store-helper','Save ideas to your bag and ask Rose about real availability and final prices. This is not a purchase or confirmed order.');
hero.append(helper);
const panel=create('dialog','rose-store-dialog');
panel.id='rose-store-dialog';panel.setAttribute('aria-labelledby','rose-cart-title');
panel.innerHTML=[
'<div class="rose-cart-inside"><div class="rose-cart-head"><h2 id="rose-cart-title">Your Rose bag</h2><button type="button" class="rose-cart-close" aria-label="Close bag">×</button></div>',
'<p class="rose-cart-help">Concept products only. Request availability from the studio: prices, stock, kit contents, postage and payment are not yet confirmed. No payment is collected here.</p>',
'<div id="rose-cart-items" aria-live="polite"></div><div class="rose-cart-total"><span>Indicative subtotal</span><strong id="rose-cart-subtotal">A$0</strong></div>',
'<form id="rose-cart-form" class="rose-cart-form">',
'<label>Your name <input name="name" autocomplete="name" maxlength="100" required minlength="2"></label>',
'<label>Email <input name="email" type="email" autocomplete="email" maxlength="200" required></label>',
'<label>Phone (optional) <input name="phone" type="tel" autocomplete="tel" maxlength="35"></label>',
'<label>How would you like to receive items? <select name="fulfilment" id="rose-fulfilment"><option value="pickup">Studio collection enquiry</option><option value="delivery-quote">Delivery quote within Australia</option></select></label>',
'<div class="rose-ship-fields" id="rose-ship-fields" hidden><label>Delivery suburb, NSW/State and postcode <textarea name="address" maxlength="400" id="rose-delivery-address" placeholder="Suburb, state and postcode. Confirm full address with the studio later."></textarea></label></div>',
'<label>Questions / notes (optional) <textarea name="notes" maxlength="800"></textarea></label>',
'<label class="rose-store-honeypot" aria-hidden="true">Website <input tabindex="-1" name="website" autocomplete="off"></label>',
'<label class="rose-cart-consent"><input type="checkbox" name="acknowledge" required style="width:auto;min-height:auto"> I understand this is an enquiry, not a purchase or confirmed order.</label>',
'<button type="submit" class="rose-cart-action" id="rose-cart-submit">Request availability</button>',
'<button type="button" class="rose-cart-copy" id="rose-cart-copy">Copy enquiry details instead</button>',
'<p class="rose-cart-status" id="rose-cart-status" role="status" aria-live="polite"></p></form></div>'
].join('');
root.append(panel);
const itemsElement=panel.querySelector('#rose-cart-items');
const subtotalElement=panel.querySelector('#rose-cart-subtotal');
const counter=panel.querySelector('#rose-bag-count');
const form=panel.querySelector('#rose-cart-form');
const submit=panel.querySelector('#rose-cart-submit');
const status=panel.querySelector('#rose-cart-status');
const address=panel.querySelector('#rose-delivery-address');
const fulfilment=panel.querySelector('#rose-fulfilment');
let focusReturn=bagButton;
function selection() {return products.filter(p=>bag[p.id]>0).map(p=>({id:p.id,name:p.name,price:p.price,quantity:bag[p.id]}));}
function totalUnits() {return Object.values(bag).reduce((s,q)=>s+q,0);}
function update() {
 itemsElement.replaceChildren();
 let subtotal=0;
 for(const item of selection()) {
  subtotal+=item.price*item.quantity;
  const row=create('div','rose-cart-line');
  const info=create('div');info.append(create('strong',null,item.name),create('small',null,'A$'+item.price+' each · concept only'));
  const qty=create('div','rose-qty-controls');
  const dec=create('button',null,'−');dec.type='button';dec.setAttribute('aria-label','Remove one '+item.name);
  dec.addEventListener('click',()=>setQuantity(item.id,item.quantity-1));
  const number=create('span',null,item.quantity);number.setAttribute('aria-label','Quantity '+item.quantity);
  const inc=create('button',null,'+');inc.type='button';inc.disabled=item.quantity>=10||totalUnits()>=20;inc.setAttribute('aria-label','Add one '+item.name);
  inc.addEventListener('click',()=>setQuantity(item.id,item.quantity+1));
  qty.append(dec,number,inc);row.append(info,qty);itemsElement.append(row);
 }
 if(!selection().length) itemsElement.append(create('p','rose-cart-empty','Your bag is empty. Explore the Rose Edit ideas to start an availability enquiry.'));
 subtotalElement.textContent='A$'+subtotal;
 counter.textContent=String(totalUnits());
 submit.disabled=totalUnits()===0;
 persist();
}
function setQuantity(id,quantity) {
 if(!index.has(id)||!Number.isInteger(quantity))return;
 if(quantity<=0) delete bag[id];
 else if(quantity<=10 && totalUnits()-(bag[id]||0)+quantity<=20) bag[id]=quantity;
 update();
}
function add(id) {
 if(!index.has(id) || totalUnits()>=20 || (bag[id]||0)>=10) return;
 bag[id]=(bag[id]||0)+1; update();
 focusReturn=document.activeElement;
 if(!panel.open) panel.showModal();
 panel.querySelector('.rose-cart-close').focus();
}
function setStatus(message,type) {status.textContent=message;status.className='rose-cart-status'+(type?' '+type:'');}
function payload() {
 const values=new FormData(form);
 return {name:String(values.get('name')||'').trim(),email:String(values.get('email')||'').trim(),phone:String(values.get('phone')||'').trim(),fulfilment:String(values.get('fulfilment')||''),address:String(values.get('address')||'').trim(),notes:String(values.get('notes')||'').trim(),website:String(values.get('website')||'').trim(),items:selection().map(i=>({id:i.id,quantity:i.quantity}))};
}
function formatCopy(p) {
 const items=selection().map(i=>i.name+' x '+i.quantity+' (concept A$'+i.price+')');
 return ['Rose product AVAILABILITY ENQUIRY — not a purchase','Name: '+p.name,'Email: '+p.email,'Phone: '+(p.phone||'Not supplied'),'Preference: '+p.fulfilment,'Delivery location: '+(p.address||'Not supplied'),'','Items:',...items,'','Indicative subtotal: '+subtotalElement.textContent,'Notes: '+(p.notes||'None'),'No payment has been taken. Please confirm availability, final prices and delivery costs.'].join('\n');
}
async function copyBag() {
 if(!form.reportValidity())return;
 const content=formatCopy(payload());
 try {await navigator.clipboard.writeText(content);setStatus('Copied. Please send these details through Rose’s verified contact channel. Nothing was submitted.','success');}
 catch {window.prompt('Copy this enquiry:',content);setStatus('Copy the enquiry and send it to the studio. Nothing was submitted.');}
}
panel.querySelector('.rose-cart-close').addEventListener('click',()=>panel.close());
panel.addEventListener('close',()=>{if(focusReturn && typeof focusReturn.focus==='function')focusReturn.focus();});
bagButton.addEventListener('click',()=>{focusReturn=bagButton;update();panel.showModal();panel.querySelector('.rose-cart-close').focus();});
panel.querySelector('#rose-cart-copy').addEventListener('click',copyBag);
fulfilment.addEventListener('change',()=>{
 const delivery=fulfilment.value==='delivery-quote';
 panel.querySelector('#rose-ship-fields').hidden=!delivery;address.required=delivery;
});
form.addEventListener('submit',async event=>{
 event.preventDefault();if(!selection().length||!form.reportValidity())return;
 submit.disabled=true;setStatus('Sending your product availability request…');
 try {
  const response=await fetch('/api/order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload())});
  const result=await response.json();
  if(response.ok && result.sent) {
   bag={};update();form.reset();address.required=false;panel.querySelector('#rose-ship-fields').hidden=true;
   setStatus('Your enquiry was sent. Rose will contact you to confirm availability and pricing. No purchase or payment has occurred.','success');return;
  }
  setStatus(result.error||'Your enquiry was not sent. Please copy your details instead.','error');
 } catch {setStatus('Network error: your enquiry was not sent. Please copy the details instead.','error');}
 finally {submit.disabled=totalUnits()===0;}
});
update();
})();
