const config = window.INDIGO_CONFIG || {ready:false};
const byId = id => document.getElementById(id);
byId('year').textContent = new Date().getFullYear();
byId('preview-notice').hidden = config.ready;
if (!config.ready) { const meta = document.createElement('meta'); meta.name='robots'; meta.content='noindex,nofollow'; document.head.append(meta); }
byId('menu').addEventListener('click', () => {const expanded = byId('menu').getAttribute('aria-expanded') !== 'true'; byId('menu').setAttribute('aria-expanded',String(expanded)); byId('navigation').classList.toggle('open',expanded);});
document.querySelectorAll('#navigation a').forEach(a => a.addEventListener('click',() => {byId('navigation').classList.remove('open');byId('menu').setAttribute('aria-expanded','false');}));
document.querySelectorAll('[data-survey]').forEach(a => a.addEventListener('click', () => {byId('survey').value = a.dataset.survey;}));
if (config.email) {const a=document.createElement('a');a.href=`mailto:${config.email}`;a.textContent=config.email;byId('contact-details').append(a);}
if (config.phone) {const a=document.createElement('a');a.href=`tel:${config.phone.replace(/[^+0-9]/g,'')}`;a.textContent=config.phone;byId('contact-details').append(a);}
byId('coverage').textContent = config.coverage ? `Covering ${config.coverage}.` : '';
byId('legal-footer').textContent = config.legalFooter || 'Business registration and service delivery details will be confirmed before public launch.';
const policies = {
  privacy: ['Privacy notice', [
    `This website is operated by ${config.legalName || 'Indigo Surveys (legal operator to be confirmed before launch)'}. ${config.serviceModel || ''}`,
    'When you request a quote, we collect the contact details, property address, survey preference and optional message you provide. We use these to respond and take steps at your request before a potential contract. We do not use this form to subscribe you to marketing.',
    'Enquiries are delivered using Resend to our enquiry inbox. Vercel hosts the website. These providers may process data on our behalf under their service arrangements. Indigo Surveys provides surveys directly; your enquiry is handled by our team.',
    'We retain enquiries only for as long as needed for the enquiry, any resulting service and applicable legal obligations. You may ask about access, correction, deletion, restriction or objection, subject to the applicable legal conditions. You can complain to the Information Commissioner’s Office at ico.org.uk.',
    config.email ? `For privacy questions or rights requests, contact ${config.email}.` : 'A privacy contact must be added before public launch.'
  ]],
  cookies: ['Cookies & website data', ['This website does not use advertising cookies, tracking pixels or optional analytics. The enquiry form does not store its contents in your browser.', 'Our hosting provider may process technical data such as IP addresses and request logs to deliver and protect the website. If optional analytics or advertising are added later, this notice and the consent arrangements will be updated.']],
  terms: ['Website terms', ['The information on this website is general guidance. Survey suitability and the exact scope must be confirmed for each property. A quote enquiry does not book a survey or create a contract.', 'Any survey instruction is subject to the provider’s separate terms of engagement, confirmed fees, availability, inspection limits and exclusions. No fees or turnaround times are guaranteed by this website.', 'We aim to keep information accurate but cannot guarantee uninterrupted website access. Nothing in these terms excludes rights or liabilities that cannot lawfully be excluded.']]
};
document.querySelectorAll('[data-policy]').forEach(button => button.addEventListener('click',() => {const [title, paragraphs] = policies[button.dataset.policy];byId('policy-title').textContent=title;byId('policy-content').replaceChildren(...paragraphs.map(text => {const p=document.createElement('p');p.textContent=text;return p;}));byId('policy-dialog').showModal();}));
byId('close-dialog').addEventListener('click',() => byId('policy-dialog').close());
byId('quote-form').addEventListener('submit',async event => {
  event.preventDefault();
  const status=byId('form-status');
  if(!config.ready){status.textContent='This is a design preview. Enquiry delivery will be enabled before launch.';return;}
  byId('submit').disabled=true; status.textContent='Sending your enquiry…';
  try{
    const response=await fetch('/api/enquiry',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(event.target)))});
    const result=await response.json();
    if(!response.ok)throw new Error(result.error || 'We couldn’t send your enquiry. Please try again.');
    event.target.reset();status.textContent='Thank you — your enquiry has been sent. We’ll be in touch to discuss your survey quote.';
  }catch(error){status.textContent=(error.message || 'We couldn’t send your enquiry. Please try again.')+(config.email ? ` You can also email ${config.email}.`:'');}
  finally{byId('submit').disabled=false;}
});
