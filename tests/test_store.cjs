'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const catalog=require('../data/products.json');
const handler=require('../api/order.js');
const src=(file)=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');
function makeResponse() {
 return {statusCode:200,headers:{},body:null,status(n){this.statusCode=n;return this;},setHeader(k,v){this.headers[k]=v;return this;},json(v){this.body=v;return this;}};
}
async function invoke(body,origin='https://rose-lash-shop.vercel.app') {
 const res=makeResponse();
 await handler({method:'POST',headers:{origin,'content-length':'1024'},body},res);
 return res;
}
function sample(overrides={}) {
 return {name:'Rose Customer',email:'rose-customer@example.com',phone:'0400000000',website:'',fulfilment:'pickup',address:'',notes:'Please contact me',items:[{id:'lash-cleanser',quantity:2}],...overrides};
}
test('proposed catalogue has 8 unique, non-live SKUs with positive AUD prices',()=>{
 assert.equal(catalog.length,8);
 assert.equal(new Set(catalog.map(x=>x.id)).size,8);
 for(const p of catalog) {assert.equal(p.availability,'concept');assert.ok(Number.isInteger(p.price)&&p.price>0);}
});
test('bag uses server-validated product IDs and quantities',()=>{
 assert.equal(handler.validateItems([{id:'lash-cleanser',quantity:2}])[0].price,22);
 assert.equal(handler.validateItems([{id:'lash-cleanser',quantity:10},{id:'satin-mask',quantity:10}]).length,2);
 for(const bad of [[{id:'unknown',quantity:1}],[{id:'lash-cleanser',quantity:0}],[{id:'lash-cleanser',quantity:100}],[{id:'lash-cleanser',quantity:1},{id:'lash-cleanser',quantity:1}]]) assert.equal(handler.validateItems(bad),null);
});
test('rejects unauthorised origins and malformed requests without invoking provider',async()=>{
 assert.equal((await invoke(sample(),'https://attacker.example')).statusCode,403);
 assert.equal((await invoke(sample({items:[{id:'fake',quantity:1}]}))).statusCode,400);
 assert.equal((await invoke(sample({fulfilment:'delivery-quote',address:'none'}))).statusCode,400);
});
test('fails closed without configured sender and recipient',async()=>{
 const prev={RESEND_API_KEY:process.env.RESEND_API_KEY,ROSE_BOOKING_FROM_EMAIL:process.env.ROSE_BOOKING_FROM_EMAIL,ROSE_BOOKING_TO_EMAIL:process.env.ROSE_BOOKING_TO_EMAIL};
 delete process.env.RESEND_API_KEY;delete process.env.ROSE_BOOKING_FROM_EMAIL;delete process.env.ROSE_BOOKING_TO_EMAIL;
 try {const res=await invoke(sample());assert.equal(res.statusCode,503);assert.equal(res.body.sent,undefined);}
 finally {for(const k in prev) if(prev[k]===undefined)delete process.env[k];else process.env[k]=prev[k];}
});
test('provider email uses catalogue-derived pricing, never browser price',async()=>{
 const prevFetch=global.fetch;
 const original={RESEND_API_KEY:process.env.RESEND_API_KEY,ROSE_BOOKING_FROM_EMAIL:process.env.ROSE_BOOKING_FROM_EMAIL,ROSE_BOOKING_TO_EMAIL:process.env.ROSE_BOOKING_TO_EMAIL};
 let sent;
 process.env.RESEND_API_KEY='test-key';
 process.env.ROSE_BOOKING_FROM_EMAIL='studio@example.com';
 process.env.ROSE_BOOKING_TO_EMAIL='owner@example.com';
 global.fetch=async(url,options)=>{assert.match(url,/api\.resend\.com/);sent=JSON.parse(options.body);return {ok:true};};
 try {
  const response=await invoke(sample({items:[{id:'lash-cleanser',quantity:2,price:1}]}));
  assert.equal(response.statusCode,200);assert.equal(response.body.sent,true);
  assert.match(sent.text,/A\$44/);assert.doesNotMatch(sent.text,/A\$2 \(/);
  assert.match(sent.text,/NOT a purchase/);assert.match(sent.text,/NO payment has been taken/);
 } finally {
  global.fetch=prevFetch;
  for(const k in original)if(original[k]===undefined)delete process.env[k];else process.env[k]=original[k];
 }
});
test('homepage layers store UI without changing four legacy product cards or booking',()=>{
 const html=src('index.html');
 assert.match(html,/rose-store\.css/);assert.match(html,/rose-store\.js/);
 assert.match(html,/api\/booking/);assert.match(html,/rose-product-dialog/);
 assert.equal((html.match(/data-shop-product=/g)||[]).length,4);
 const client=src('rose-store.js');
 assert.match(client,/\/api\/order/);
 assert.match(client,/Request availability/);
 assert.match(client,/No payment is collected here/);
});
