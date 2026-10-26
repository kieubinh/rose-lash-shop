const assert=require('node:assert/strict');
const handler=require('../api/booking.js');
const request=async(method,body)=>{
  let code=200, data, headers={};
  const res={status(c){code=c;return this;},setHeader(k,v){headers[k]=v;return this;},json(v){data=v;return this;}};
  await handler({method,body,headers:{origin:'https://rose-lash-shop.vercel.app'}},res);
  return {code,data,headers};
};
(async()=>{
  delete process.env.ROSE_BOOKING_FROM_EMAIL;
  delete process.env.ROSE_BOOKING_TO_EMAIL;
  assert.equal((await request('GET',null)).code,405);
  assert.equal((await request('POST',{name:'A',email:'bad'})).code,400);
  assert.equal((await request('POST',{name:'Test Client',email:'test@example.com',service:'lash-classic'})).code,503);
  assert.equal((await request('POST',{name:'Test Client',email:'test@example.com',website:'bot',service:'lash-classic'})).data.sent,false);
  console.log('PASS: API rejects GET/invalid data, honeypot sends nothing, missing email configuration fails closed');
})();
