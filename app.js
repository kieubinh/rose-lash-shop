
'use strict';
const services = [{"id":"lash-classic","category":"Lashes","name":"Classic Lashes","price":70,"duration":"1 hr 15 min","infill":50,"note":"Natural everyday definition"},{"id":"lash-volume","category":"Lashes","name":"Volume Lashes","price":80,"duration":"1 hr 30 min","infill":60,"note":"A softly fuller finish"},{"id":"lash-hybrid","category":"Lashes","name":"Hybrid Lashes","price":80,"duration":"1 hr 30 min","infill":60,"note":"The best of both"},{"id":"lash-wet","category":"Lashes","name":"Wet Look Lashes","price":80,"duration":"1 hr 30 min","infill":60,"note":"Sleek and defined"},{"id":"lash-wispy","category":"Lashes","name":"Wispy Lashes","price":90,"duration":"1 hr 45 min","infill":70,"note":"Airy and textured"},{"id":"lash-mega","category":"Lashes","name":"Mega Volume Lashes","price":110,"duration":"2 hr","infill":80,"note":"Beautifully bold"},{"id":"lash-design-light","category":"Lashes","name":"Natural Design Lashes","price":100,"duration":"1 hr 45 min","infill":null,"note":"New set only"},{"id":"lash-design-max","category":"Lashes","name":"Luxury Design Lashes","price":120,"duration":"2 hr","infill":null,"note":"New set only"},{"id":"lash-under","category":"Lashes","name":"Under Lashes","price":15,"duration":"15 min","infill":null,"note":"Finishing touch"},{"id":"lash-remove","category":"Lashes","name":"Lash Removal","price":15,"duration":"15 min","infill":null,"note":"Removal service"},{"id":"lash-lift","category":"Lashes","name":"Lash Lift + Tint + Keratin","price":50,"duration":"30–45 min","infill":null,"note":"Lift lasts around 4–6 weeks"},{"id":"lash-tint","category":"Lashes","name":"Lash Tint","price":10,"duration":"10 min","infill":null,"note":"Colour lasts around 1 week"},{"id":"brow-normal","category":"Brows","name":"Brow Wax + Normal Tint","price":25,"duration":"20 min","infill":null,"note":"Colour lasts around 1 week"},{"id":"brow-henna","category":"Brows","name":"Brow Wax + Henna Tint","price":40,"duration":"30 min","infill":null,"note":"Colour lasts around 2 weeks"},{"id":"brow-lamination","category":"Brows","name":"Brow Lamination Package","price":50,"duration":"45 min","infill":null,"note":"Wax, shape, lamination and tint"},{"id":"wax-brow","category":"Waxing","name":"Brow Wax","price":15,"duration":"10 min","infill":null,"note":"Brow shaping"},{"id":"wax-lip","category":"Waxing","name":"Upper Lip Wax","price":10,"duration":"5 min","infill":null,"note":"Upper lip"},{"id":"wax-face","category":"Waxing","name":"Full Face Wax","price":40,"duration":"20 min","infill":null,"note":"Brow, lip, chin and sides"},{"id":"wax-hand","category":"Waxing","name":"Hand Wax","price":30,"duration":"15 min","infill":null,"note":"Full hand"},{"id":"wax-half-hand","category":"Waxing","name":"Half Hand Wax","price":20,"duration":"10 min","infill":null,"note":"Half hand"},{"id":"wax-leg","category":"Waxing","name":"Leg Wax","price":45,"duration":"15 min","infill":null,"note":"Full leg"},{"id":"wax-half-leg","category":"Waxing","name":"Half Leg Wax","price":35,"duration":"10 min","infill":null,"note":"Half leg"},{"id":"wax-arm","category":"Waxing","name":"Arm Wax + Mask","price":20,"duration":"10 min","infill":null,"note":"With mask"},{"id":"wax-bikini-up","category":"Waxing","name":"Bikini Up Wax + Mask","price":40,"duration":"10 min","infill":null,"note":"With mask"},{"id":"wax-bikini-full","category":"Waxing","name":"Full Bikini Wax + Mask","price":60,"duration":"15 min","infill":null,"note":"With mask"},{"id":"wax-body","category":"Waxing","name":"Full Body Wax","price":130,"duration":"45–60 min","infill":null,"note":"Package: save $25"}];
const policies = {"Lashes":[["Lash infills & fixes","2-week infills apply to eligible sets at the prices shown. After 3–4 weeks, the studio asks for a new full set. Natural Design and Luxury Design are new-set only.","Fixes are complimentary within 3 days if there is an issue with the lashes. After 3 days, an additional fee applies depending on condition."],["Lifting and tinting","Lash Lift + Tint + Keratin keeps its form around 4–6 weeks. The studio recommends at least 3 weeks between treatments to support natural lash health.","Lash tint colour typically lasts around 1 week. Individual results vary."]],"Brows":[["Tint longevity","Brow Wax + Normal Tint colour lasts around 1 week. Brow Wax + Henna Tint colour lasts around 2 weeks."],["Lamination package","Includes wax, shape, lamination and tint. Results typically last 3–4 weeks. The studio recommends repeating after 3–4 weeks for healthy brow hairs."]],"Waxing":[["Full body package","Full Body Wax costs $130, with a stated saving of $25. Estimated duration is 45–60 minutes. Confirm included areas with Rose before booking."]]};
const list=document.getElementById('treatment-list');
const policyRoot=document.getElementById('treatment-policy');
const serviceSelect=document.getElementById('booking-service');
const form=document.getElementById('booking-form');
const status=document.getElementById('booking-status');
const submitButton=document.getElementById('booking-send');
function elt(tag,cls,value){const node=document.createElement(tag);if(cls)node.className=cls;if(value!=null)node.textContent=String(value);return node;}
function selectCategory(category){
 if(!policies[category])return;
 for(const button of document.querySelectorAll('[data-category]')){const active=button.dataset.category===category;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));}
 list.replaceChildren();
 for(const svc of services.filter(item=>item.category===category)){
  const article=elt('article','service-row');
  const left=elt('div');left.append(elt('small',null,svc.note||(svc.id.includes('design')?'New set only':svc.category.toUpperCase())));
  left.append(elt('h3',null,svc.name));left.append(elt('small',null,svc.duration));
  const right=elt('div','service-price');right.append(elt('strong',null,'$'+svc.price));
  if(svc.infill!==null)right.append(elt('span','infill','2-week infill: $'+svc.infill));
  const a=elt('a',null,'Enquire ↗');a.href='#booking';a.addEventListener('click',()=>{serviceSelect.value=svc.id;});right.append(a);
  article.append(left,right);list.append(article);
 }
 policyRoot.replaceChildren();for(const [title,...parts] of policies[category]){const item=elt('article','policy-item');item.append(elt('h3',null,title));for(const part of parts)item.append(elt('p',null,part));policyRoot.append(item);}
}
for(const button of document.querySelectorAll('[data-category]'))button.addEventListener('click',()=>selectCategory(button.dataset.category));
for(const a of document.querySelectorAll('[data-jump-category]'))a.addEventListener('click',()=>selectCategory(a.dataset.jumpCategory));
for(const svc of services){const option=document.createElement('option');option.value=svc.id;option.textContent=svc.name+' — $'+svc.price;serviceSelect.append(option);}
selectCategory('Lashes');

/* Featured treatments share the canonical service menu and prefill the booking enquiry. */
for(const card of document.querySelectorAll('[data-featured-id]')){
 const svc=services.find(item=>item.id===card.dataset.featuredId);
 if(!svc)continue;
 const price=card.querySelector('[data-featured-price]');
 const duration=card.querySelector('[data-featured-duration]');
 if(price)price.textContent='$'+svc.price;
 if(duration)duration.textContent=svc.duration;
}
for(const link of document.querySelectorAll('[data-book-service]')){
 link.addEventListener('click',()=>{
  const svc=services.find(item=>item.id===link.dataset.bookService);
  if(svc)serviceSelect.value=svc.id;
 });
}
for(const image of document.querySelectorAll('.featured-image img')){
 image.addEventListener('error',()=>image.classList.add('is-unavailable'));
 if(image.complete&&!image.naturalWidth)image.classList.add('is-unavailable');
}

const date=document.getElementById('booking-date');const now=new Date();date.min=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');
function payload(){const f=new FormData(form);return Object.fromEntries(['name','phone','email','service','date','time','notes','website'].map(key=>[key,String(f.get(key)||'').trim()]));}
function textEnquiry(d){const found=services.find(x=>x.id===d.service);return ['Rose Lash · Brow · Wax — appointment enquiry','','Name: '+d.name,'Email: '+d.email,'Phone: '+(d.phone||'Not provided'),'Treatment: '+(found?found.name:'Not sure yet'),'Preferred date: '+(d.date||'Flexible'),'Preferred time: '+(d.time||'Flexible'),'Notes: '+(d.notes||'None'),'','Please confirm the time, location, total cost and booking details. This is not a confirmed appointment.'].join('\n');}
function showStatus(message,kind){status.className='booking-status'+(kind?' '+kind:'');status.textContent=message;}
async function copyEnquiry(){if(!form.reportValidity())return;const body=textEnquiry(payload());try{await navigator.clipboard.writeText(body);showStatus('Enquiry copied. Please send it through Rose’s verified contact channel; no booking has been submitted.','success');}catch{window.prompt('Copy this enquiry:',body);showStatus('Copy your enquiry and send it through Rose’s verified contact channel.');}}
document.getElementById('booking-copy').addEventListener('click',copyEnquiry);
form.addEventListener('submit',async (e)=>{e.preventDefault();if(!form.reportValidity())return;submitButton.disabled=true;showStatus('Checking the email service…');
 try{const response=await fetch('/api/booking',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload())});const result=await response.json();
  if(response.ok&&result.sent){showStatus('Your enquiry has been sent to Rose. Please wait for the studio to confirm the appointment.','success');form.reset();return;}
  if(response.status===503){showStatus('Email booking is not activated yet. Use “Copy details” and send your request through Rose’s verified contact channel.','error');return;}
  showStatus(result.error||'The enquiry could not be sent. Please copy your details instead.','error');
 }catch{showStatus('Your enquiry has not been sent due to a network issue. Use “Copy details” instead.','error');}
 finally{submitButton.disabled=false;}
});

/* Rose Edit concept details. These are mockups, not inventory or a checkout. */
const roseEditProducts=[
 {id:'lash-cleanser',name:'Lash cleanser',price:22,image:'/assets/rose-lash-cleanser.svg',alt:'Rose concept lash cleanser bottle',description:'A gentle foaming cleanser concept to complement a daily lash-care routine.',highlights:['Concept: lash-friendly daily cleansing ritual','Illustrated Rose-branded foaming pump packaging','Formula, ingredients and directions are not finalised']},
 {id:'lash-brush',name:'Soft lash brush',price:12,image:'/assets/rose-lash-brush.svg',alt:'Rose concept lash brush tools',description:'A soft cleansing brush and spoolie concept for carefully grooming lashes.',highlights:['Concept: soft cleansing brush and spoolie','Rose-gold inspired reusable beauty-tool design','Materials and final product configuration are unconfirmed']},
 {id:'lash-care-kit',name:'Lash care kit',price:38,image:'/assets/rose-lash-care-kit.svg',alt:'Rose concept lash care gift kit',description:'An elegant Rose-inspired gift set for the little moments of lash aftercare.',highlights:['Concept: cleansing and grooming essentials in a gift box','Designed in the Rose blush-pink palette','Kit contents, packaging and availability are subject to confirmation']},
 {id:'brow-styling',name:'Brow styling edit',price:20,image:'/assets/rose-brow-gel.svg',alt:'Rose concept brow gel',description:'A clear brow styling gel concept for a neat, naturally defined finish.',highlights:['Concept: clear brow gel with spoolie applicator','Rose-inspired glass and rose-gold presentation','Ingredients, suitability and final use instructions are unconfirmed']}
];
const productDialog=document.getElementById('rose-product-dialog');
let lastProductTrigger=null;
if(productDialog&&typeof productDialog.showModal==='function'){
 const title=productDialog.querySelector('#rose-product-title');
 const description=productDialog.querySelector('#rose-product-description');
 const price=productDialog.querySelector('#rose-product-price');
 const image=productDialog.querySelector('#rose-product-image');
 const highlights=productDialog.querySelector('#rose-product-highlights');
 const closeProduct=()=>productDialog.close();
 for(const trigger of document.querySelectorAll('[data-product-id]')){
  trigger.addEventListener('click',()=>{
   const product=roseEditProducts.find(item=>item.id===trigger.dataset.productId);
   if(!product)return;
   title.textContent=product.name;
   description.textContent=product.description;
   price.replaceChildren(document.createTextNode('A$'+product.price));
   const priceNote=elt('small',null,'Illustrative price · not for purchase');
   price.append(priceNote);
   image.src=product.image;
   image.alt=product.alt;
   const bullets=document.createElement('ul');
   for(const point of product.highlights)bullets.append(elt('li',null,point));
   highlights.replaceChildren(bullets);
   lastProductTrigger=trigger;
   productDialog.showModal();
   productDialog.querySelector('#rose-product-close').focus();
  });
 }
 productDialog.querySelector('#rose-product-close').addEventListener('click',closeProduct);
 productDialog.querySelector('#rose-product-done').addEventListener('click',closeProduct);
 productDialog.addEventListener('click',event=>{
  if(event.target!==productDialog)return;
  const bounds=productDialog.getBoundingClientRect();
  if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)closeProduct();
 });
 productDialog.addEventListener('close',()=>{if(lastProductTrigger)lastProductTrigger.focus();});
}
