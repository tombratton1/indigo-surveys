const { randomUUID } = require('node:crypto');
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control','no-store');
  if(req.method !== 'POST'){res.setHeader('Allow','POST');return res.status(405).json({error:'Method not allowed.'});}
  const origin=req.headers.origin;
  if(!origin || origin !== `https://${req.headers.host}` && origin !== `http://${req.headers.host}`)return res.status(403).json({error:'Please submit through this website.'});
  if(process.env.LAUNCH_READY !== 'true' || !process.env.RESEND_API_KEY || !process.env.ENQUIRY_TO_EMAIL || !process.env.ENQUIRY_FROM_EMAIL)return res.status(503).json({error:'Online enquiries are temporarily unavailable. Please contact us directly.'});
  let data;
  try{data=typeof req.body === 'string' ? JSON.parse(req.body) : req.body;}catch{return res.status(400).json({error:'Invalid enquiry.'});}
  if(!data || typeof data !== 'object' || Array.isArray(data))return res.status(400).json({error:'Invalid enquiry.'});
  if(data.website)return res.status(400).json({error:'Unable to submit this enquiry.'});
  const limits={name:100,email:254,phone:40,address:300,survey:40,message:2000};
  const clean={};
  for(const [key,max] of Object.entries(limits)){
    if(data[key] !== undefined && typeof data[key] !== 'string')return res.status(400).json({error:'Please check the enquiry fields.'});
    clean[key]=(data[key]||'').trim();
    if(clean[key].length>max)return res.status(400).json({error:'An enquiry field is too long.'});
  }
  if(!clean.name || !clean.address || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email) || !['Level 2','Level 3','Not sure'].includes(clean.survey))return res.status(400).json({error:'Please provide your name, a valid email, property address and survey type.'});
  try{
    const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':randomUUID()},signal:AbortSignal.timeout(12000),body:JSON.stringify({from:process.env.ENQUIRY_FROM_EMAIL,to:[process.env.ENQUIRY_TO_EMAIL],reply_to:clean.email,subject:'New Indigo Surveys quote enquiry',text:Object.entries(clean).map(([key,value])=>`${key}: ${value}`).join('\n\n')})});
    if(!response.ok)return res.status(502).json({error:'Your enquiry could not be delivered. Please try again or contact us directly.'});
    return res.status(200).json({ok:true});
  }catch{return res.status(502).json({error:'Your enquiry could not be delivered. Please try again or contact us directly.'});}
};
