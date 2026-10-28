const assert=require('node:assert/strict');
const handler=require('../api/booking.js');
const request=async(body)=>{
  let code=200;
  const res={status(c){code=c;return this;},setHeader(){return this;},json(){return this;}};
  await handler({method:'POST',body,headers:{origin:'https://rose-lash-shop.vercel.app'}},res);
  return code;
};
(async()=>{
  process.env.RESEND_API_KEY='k';process.env.ROSE_BOOKING_FROM_EMAIL='from@example.com';process.env.ROSE_BOOKING_TO_EMAIL='studio@example.com';
  const calls=[];
  global.fetch=async(u,o)=>{calls.push(JSON.parse(o.body));return {ok:true,json:async()=>({})};};
  assert.equal(await request({name:'Ann Lee',email:'ann@example.com',service:'lash-classic'}),200);
  assert.equal(calls.length,2);
  assert.deepEqual(calls[0].to,['studio@example.com']);
  assert.deepEqual(calls[1].to,['ann@example.com']);
  assert.equal(calls[1].reply_to,'studio@example.com');
  let n=0;global.fetch=async()=>{if(n++)throw new Error('receipt down');return {ok:true};};
  assert.equal(await request({name:'Ann Lee',email:'ann@example.com'}),200);
  console.log('PASS: receipt sent to customer after studio email; receipt failure does not fail the request');
})();
