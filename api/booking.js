'use strict';
// This function is fail-closed: no email is sent until BOTH studio email
// addresses and the Resend API key have been configured server-side.
const services = require('../data/services.json');
const serviceIds = new Set(services.map(item=>item.id));
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const allowedOrigins = new Set([
  'https://rose-lash-shop.vercel.app',
  'https://rose-lash-shop-anthonykieu.vercel.app'
]);
const clean = (value,limit) => typeof value==='string' ? value.trim().slice(0,limit) : '';
const safe = value => value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
const respond=(res,code,obj)=>{res.status(code).setHeader('Cache-Control','no-store').json(obj);};
module.exports = async function handler(req,res){
  if(req.method!=='POST'){res.setHeader('Allow','POST');return respond(res,405,{error:'Method not allowed'});}
  const origin=req.headers.origin||'';
  if(origin && !allowedOrigins.has(origin) && !/^https:\/\/rose-lash-shop-[a-z0-9-]+\.vercel\.app$/i.test(origin))return respond(res,403,{error:'Origin not allowed'});
  const size=Number(req.headers['content-length']||0);
  if(size>7000)return respond(res,413,{error:'The enquiry is too long'});
  let data=req.body;
  try{if(typeof data==='string')data=JSON.parse(data);}catch{return respond(res,400,{error:'Invalid enquiry data'});}
  if(!data||typeof data!=='object'||Array.isArray(data))return respond(res,400,{error:'Invalid enquiry data'});
  // Honeypot: appear successful to automated spam, but send no email.
  if(clean(data.website,200))return respond(res,200,{sent:false});
  const name=clean(data.name,100), email=clean(data.email,200), phone=clean(data.phone,35), service=clean(data.service,100), date=clean(data.date,20), time=clean(data.time,20), notes=clean(data.notes,1200);
  if(name.length<2||!emailPattern.test(email)|| (service&&!serviceIds.has(service)) || (date&&!/^\d{4}-\d{2}-\d{2}$/.test(date)) || (time&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)))return respond(res,400,{error:'Please check your name, email and treatment details.'});
  if(date){const selected=Date.parse(date+'T00:00:00Z'); if(!Number.isFinite(selected)||selected<Date.now()-86400000)return respond(res,400,{error:'Please choose a future date.'});}
  const apiKey=process.env.RESEND_API_KEY;
  const from=process.env.ROSE_BOOKING_FROM_EMAIL;
  const to=process.env.ROSE_BOOKING_TO_EMAIL;
  if(!apiKey||!from||!to||!emailPattern.test(from)||!emailPattern.test(to))return respond(res,503,{error:'Email booking is not configured yet. Please copy your enquiry instead.'});
  const found=services.find(item=>item.id===service);
  const lines=[['Name',name],['Email',email],['Phone',phone||'Not provided'],['Service',found?found.name:'Not sure yet'],['Preferred date',date||'Flexible'],['Preferred time',time||'Flexible'],['Notes',notes||'None']];
  const html='<h2>New Rose appointment enquiry</h2><p>This is NOT a confirmed booking.</p><table>'+lines.map(([k,v])=>'<tr><th align="left">'+safe(k)+'</th><td>'+safe(v)+'</td></tr>').join('')+'</table>';
  try{
    const apiResponse=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+apiKey,'Content-Type':'application/json'},body:JSON.stringify({from,to:[to],reply_to:email,subject:'Rose booking enquiry — '+(found?found.name:'General'),html,text:'Rose appointment enquiry (not confirmed)\n\n'+lines.map(([k,v])=>k+': '+v).join('\n')})});
    if(!apiResponse.ok)return respond(res,502,{error:'Email service unavailable. Please copy your enquiry instead.'});
    return respond(res,200,{sent:true,message:'Enquiry submitted; appointment subject to confirmation.'});
  }catch{return respond(res,502,{error:'Could not reach the email service. Please copy your enquiry instead.'});}
};
