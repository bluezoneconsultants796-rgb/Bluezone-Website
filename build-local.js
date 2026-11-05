#!/usr/bin/env node
/* BlueZone LOCAL SEO builder.
   Usage:  node build-local.js        (run from the site folder, any time; safe to re-run)
   Makes:
     - study-in-<country>-from-mansehra.html   x14   ("Study in China from Mansehra, Abbottabad & KPK" ...)
     - study-abroad-consultants-mansehra.html / -abbottabad.html / -kpk.html   (the 3 local hub pages)
   Also: adds them to sitemap.xml + sitemap-extra.json, and links to them from the home page, the country pages and
   the destinations page (so Google can find them).
   Real data comes from academy.config.json (offices, phone, WhatsApp, email, social). EMPTY VALUES ARE LEFT OUT, nothing is invented.
   After you fill phone/address/WhatsApp in academy.config.json, run:  node build-academy.js   and then   node build-local.js   */
const fs = require('fs'), path = require('path');
const ROOT = __dirname;
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'academy.config.json'), 'utf8'));
const DOMAIN = (cfg.domain || 'https://bluezoneconsultants.com').replace(/\/+$/, '');
const BRAND = cfg.parentName || 'BlueZone Consultants';
const MOD = new Date().toISOString().slice(0, 10);
const MODTXT = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const url = f => DOMAIN + '/' + f;
const waNum = (cfg.whatsapp || '').replace(/\D/g, ''), telNum = (cfg.phone || '').replace(/[^\d+]/g, '');
const offices = (cfg.offices || []).filter(o => o && o.city);
const social = Object.values(cfg.social || {}).filter(v => v && /^https?:/.test(v));

const COUNTRIES = [
  ['uk', 'United Kingdom'], ['australia', 'Australia'], ['canada', 'Canada'], ['usa', 'United States'],
  ['new-zealand', 'New Zealand'], ['ireland', 'Ireland'], ['malaysia', 'Malaysia'], ['china', 'China'],
  ['dubai-uae', 'Dubai & UAE'], ['italy', 'Italy'], ['france', 'France'], ['south-korea', 'South Korea'],
  ['cyprus', 'Cyprus'], ['lithuania', 'Lithuania']
];
const localFile = c => 'study-in-' + c[0] + '-from-mansehra.html';
const HUBS = {
  mansehra: { file: 'study-abroad-consultants-mansehra.html', place: 'Mansehra' },
  abbottabad: { file: 'study-abroad-consultants-abbottabad.html', place: 'Abbottabad' },
  kpk: { file: 'study-abroad-consultants-kpk.html', place: 'KPK (Khyber Pakhtunkhwa)' }
};

/* ---------- shell (head assets, header, footer) cloned from a real built page so the look always matches ---------- */
const shellSrc = fs.readFileSync(path.join(ROOT, 'study-in-china.html'), 'utf8');
const assets = shellSrc.slice(shellSrc.indexOf('<link rel="icon"'), shellSrc.indexOf('<script type="application/ld+json">'));
const ldEnd = shellSrc.indexOf('</script>', shellSrc.indexOf('<script type="application/ld+json">')) + 9;
const headTail = shellSrc.slice(ldEnd, shellSrc.indexOf('</head>') + 7);
const bodyOpen = shellSrc.slice(shellSrc.indexOf('</head>') + 7, shellSrc.indexOf('<main'));
const footer = shellSrc.slice(shellSrc.indexOf('</main>') + 7);

/* ---------- html helpers ---------- */
const ul = a => '<ul>' + a.map(x => '<li>' + x + '</li>').join('') + '</ul>';
const ol = a => '<ol class="tlv">' + a.map((s, i) => '<li data-n="' + (i + 1) + '"><b>' + s[0] + '</b>' + (s[1] || '') + '</li>').join('') + '</ol>';
const faqHtml = a => '<div class="stp" style="max-width:860px">' + a.map(q => '<details><summary>' + q[0] + '</summary><p>' + q[1] + '</p></details>').join('') + '</div>';
const strip = h => h.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

function ctaButtons() {
  let h = '<a class="btn" href="contact.html">Talk to a counsellor</a>';
  if (waNum) h += ' <a class="btn o" href="https://wa.me/' + waNum + '" rel="noopener">WhatsApp us</a>';
  else if (telNum) h += ' <a class="btn o" href="tel:' + telNum + '">Call us</a>';
  return h;
}
function officeCards() {
  if (!offices.length) return '';
  return '<div class="off">' + offices.map(o => {
    let b = '<h3>BlueZone ' + esc(o.city) + '</h3>';
    b += o.address ? '<p>' + esc(o.address) + '</p>' : '<p>Visit our ' + esc(o.city) + ' office or get counselling online.</p>';
    if (o.hours) b += '<p><b>Hours:</b> ' + esc(o.hours) + '</p>';
    if (o.phone) b += '<p><b>Phone:</b> <a href="tel:' + esc(o.phone.replace(/[^\d+]/g, '')) + '">' + esc(o.phone) + '</a></p>';
    if (o.email) b += '<p><a href="mailto:' + esc(o.email) + '">' + esc(o.email) + '</a></p>';
    return '<div class="card">' + b + '</div>';
  }).join('') + '</div>';
}

/* ---------- JSON-LD ---------- */
function orgNodes() {
  const nodes = [{
    '@type': 'EducationalOrganization', '@id': DOMAIN + '/#org', name: BRAND, url: DOMAIN + '/', logo: url('images/logo.png'),
    ...(social.length ? { sameAs: social } : {}), ...(telNum ? { telephone: telNum } : {}), ...(cfg.email ? { email: cfg.email } : {})
  }];
  offices.forEach(o => {
    nodes.push({
      '@type': ['EducationalOrganization', 'LocalBusiness'], '@id': DOMAIN + '/#office-' + o.city.toLowerCase().replace(/\W+/g, '-'),
      name: BRAND + ' - ' + o.city, url: DOMAIN + '/', image: url('images/hero.jpg'), parentOrganization: { '@id': DOMAIN + '/#org' },
      description: 'Study abroad counselling, IELTS preparation and visa file support for students from ' + o.city + ', Hazara and Khyber Pakhtunkhwa.',
      address: { '@type': 'PostalAddress', ...(o.address ? { streetAddress: o.address } : {}), addressLocality: o.city, addressRegion: 'Khyber Pakhtunkhwa', addressCountry: 'PK' },
      areaServed: [{ '@type': 'City', name: 'Mansehra' }, { '@type': 'City', name: 'Abbottabad' }, { '@type': 'AdministrativeArea', name: 'Khyber Pakhtunkhwa' }, { '@type': 'Country', name: 'Pakistan' }],
      ...((o.phone || telNum) ? { telephone: o.phone || telNum } : {}), ...(o.email || cfg.email ? { email: o.email || cfg.email } : {}),
      ...(o.hours ? { openingHours: o.hours } : {}), ...(social.length ? { sameAs: social } : {})
    });
  });
  return nodes;
}
function ld(file, name, desc, crumbs, faq, extra) {
  const g = orgNodes().concat([
    { '@type': 'WebSite', '@id': DOMAIN + '/#site', url: DOMAIN + '/', name: BRAND, publisher: { '@id': DOMAIN + '/#org' }, inLanguage: 'en' },
    { '@type': 'WebPage', '@id': url(file) + '#page', url: url(file), name, description: desc, inLanguage: 'en-PK', isPartOf: { '@id': DOMAIN + '/#site' }, dateModified: MOD, about: { '@id': DOMAIN + '/#org' } },
    { '@type': 'BreadcrumbList', itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c[0], item: url(c[1]) })) },
    { '@type': 'FAQPage', mainEntity: faq.map(q => ({ '@type': 'Question', name: strip(q[0]), acceptedAnswer: { '@type': 'Answer', text: strip(q[1]) } })) }
  ]).concat(extra || []);
  return '<script type="application/ld+json">' + JSON.stringify({ '@context': 'https://schema.org', '@graph': g }) + '</script>';
}

function page(file, title, desc, ldHtml, main) {
  const t = esc(title), d = esc(desc), u = url(file);
  return '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">' +
    '<title>' + t + '</title><meta name="description" content="' + d + '"><link rel="canonical" href="' + u + '"><meta name="robots" content="index,follow,max-image-preview:large">' +
    '<meta name="theme-color" content="#2b2d91"><meta name="author" content="' + esc(BRAND) + '"><meta property="og:type" content="website"><meta property="og:locale" content="en_PK">' +
    '<meta property="og:site_name" content="' + esc(BRAND) + '"><meta property="og:title" content="' + t + '"><meta property="og:description" content="' + d + '"><meta property="og:url" content="' + u + '">' +
    '<meta property="og:image" content="' + url('images/hero.jpg') + '"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="' + t + '"><meta name="twitter:description" content="' + d + '">' +
    '<meta name="geo.region" content="PK-KP"><meta name="geo.placename" content="Mansehra, Abbottabad">' +
    assets + ldHtml + headTail + bodyOpen + main + footer;
}
const heroBlock = (crumb, h1, lead) => '<main id="p-page"><div id="pg"><div class="hero" style="padding:44px 0 90px"><div class="w" style="grid-template-columns:1fr"><div>' +
  '<p style="font-size:13px;margin:0 0 14px">' + crumb + '</p><h1 style="font-size:42px;max-width:860px">' + h1 + '</h1><p>' + lead + '</p>' +
  '<p class="upd">Last reviewed ' + MODTXT + '. Country figures link to our full guide, which lists its sources.</p>' + ctaButtons() + '</div></div></div>';
const crumbA = last => '<a href="index.html" style="color:var(--navy)">BlueZone</a> / <a href="study-abroad-consultants-mansehra.html" style="color:var(--navy)">Study abroad consultants in Mansehra</a> / ' + last;

/* ---------- country pages ---------- */
function readCountry(slug) {
  const s = fs.readFileSync(path.join(ROOT, 'study-in-' + slug + '.html'), 'utf8');
  const h1 = (s.match(/<h1[^>]*>(.*?)<\/h1>/) || [])[1] || '';
  const lead = (s.match(/<\/h1><p>(.*?)<\/p>/) || [])[1] || '';
  const fs0 = s.indexOf('<div class="facts">'), fe = s.indexOf('<div class="sub">');
  const facts = fs0 > -1 ? (s.slice(fs0, fe > fs0 ? fe : fs0 + 4000).match(/<div class="fc">.*?<\/div>/g) || []) : [];
  const sub = [...s.matchAll(/<a href="study-in-[^"]*" data-go="([^"]+)">([^<]+)<\/a>/g)].map(m => [m[1], m[2]]);
  const faq = [...s.matchAll(/<details><summary>(.*?)<\/summary><p>(.*?)<\/p><\/details>/g)].map(m => [m[1], m[2]]).slice(0, 2);
  return { h1, lead, facts, sub, faq };
}

function countryPage(c) {
  const [slug, name] = c, file = localFile(c), d = readCountry(slug);
  const title = 'Study in ' + name + ' from Mansehra & KPK | ' + BRAND.split(' ')[0];
  const desc = 'Study in ' + name + ' from Mansehra, Abbottabad and KPK: free counselling, visa steps, 2026 costs and scholarships with ' + BRAND + ' offices near you.';
  const faq = [
    ['Can I get help with ' + esc(name) + ' admission in Mansehra or Abbottabad?', 'Yes. ' + esc(BRAND) + ' counsels students from Mansehra, Abbottabad, Hazara and the rest of KPK, at our offices or online. We help with course choice, applications, documents and the visa file.'],
    ['Do I have to travel to Islamabad for ' + esc(name) + ' study plans?', 'Counselling, shortlisting, application and document checks can be done locally or online. Some steps, such as a visa application or biometrics, are done at the embassy or visa centre for that country, usually in a larger city. We tell you early which steps need travel.'],
    ['What does counselling cost?', 'Counselling with us is free. If any service fee applies later, ask for it in writing before you pay anything, and never pay a consultant for a guaranteed visa.'],
    ['How do I know if ' + esc(name) + ' is right for me?', 'It depends on your budget, course, English score and plans after study. Read the quick facts above, then book a session and we will compare ' + esc(name) + ' with two or three other options for your profile.']
  ].concat(d.faq);
  const subLinks = d.sub.length ? '<p>Our full ' + esc(name) + ' guide covers:</p><ul>' + d.sub.map(x => '<li><a class="l" href="study-in-' + slug + '.html#' + x[0] + '">' + x[1] + '</a></li>').join('') + '</ul>' : '';
  const others = COUNTRIES.filter(x => x[0] !== slug).map(x => '<a class="l" href="' + localFile(x) + '">' + esc(x[1]) + '</a>').join(' &nbsp;·&nbsp; ');
  const main = heroBlock(crumbA(esc(name)), 'Study in ' + esc(name) + ' from Mansehra, Abbottabad and KPK',
      'Planning to study in ' + esc(name) + ' from Mansehra, Abbottabad or anywhere in Khyber Pakhtunkhwa? ' + esc(BRAND) + ' guides you from the first idea to the visa file, in person or online. ' + d.lead) +
    (d.facts.length ? '<div class="w"><div class="facts">' + d.facts.join('') + '</div></div>' : '') +
    '<section style="padding-top:48px"><div class="w"><h2>How we help students from Mansehra and KPK study in ' + esc(name) + '</h2>' +
      '<p>Students in Hazara and KPK often travel far for advice. We bring the whole process closer to home: an honest talk about whether ' + esc(name) + ' fits your budget and goals, then clear steps with written costs.</p>' +
      ol([
        ['Free counselling', 'Meet us in Mansehra or Abbottabad, or book an online session. Bring your last result and your budget.'],
        ['Course and university shortlist', 'We compare options for your profile. Start with our <a class="l" href="find-a-course.html">course finder</a>.'],
        ['English test', 'See <a class="l" href="ielts-preparation-mansehra.html">IELTS preparation in Mansehra</a>, <a class="l" href="ielts-preparation-abbottabad.html">in Abbottabad</a> and <a class="l" href="ielts-booking-abbottabad-mansehra.html">how to book your test</a>.'],
        ['Documents and attestation', 'Follow our <a class="l" href="documents-and-attestation-pakistan.html">documents and attestation guide</a> so nothing is rejected late.'],
        ['Offer, money and visa file', 'Read <a class="l" href="after-receiving-an-offer.html">after receiving an offer</a> and <a class="l" href="money-transfer-for-students.html">how to send tuition legally</a>, then <a class="l" href="prepare-to-depart.html">prepare to depart</a>.']
      ]) + '</div></section>' +
    '<section class="alt"><div class="w"><h2>Study in ' + esc(name) + ': what to read next</h2>' + subLinks +
      '<p><a class="btn o" href="study-in-' + slug + '.html">Read the full ' + esc(name) + ' guide</a></p></div></section>' +
    (offices.length ? '<section><div class="w"><h2>Our offices near you</h2>' + officeCards() + '<p style="margin-top:16px">' + ctaButtons() + '</p></div></section>' : '') +
    '<section class="alt"><div class="w"><h2>Questions from students in Mansehra and KPK</h2>' + faqHtml(faq) + '</div></section>' +
    '<section><div class="w"><h2>Other countries from Mansehra</h2><p>' + others + '</p><p><a class="l" href="study-abroad-consultants-mansehra.html">Study abroad consultants in Mansehra</a> &nbsp;·&nbsp; <a class="l" href="study-abroad-consultants-abbottabad.html">in Abbottabad</a> &nbsp;·&nbsp; <a class="l" href="study-abroad-consultants-kpk.html">in KPK</a></p></div></section></div></main>';
  const crumbs = [['BlueZone', 'index.html'], ['Study abroad consultants in Mansehra', HUBS.mansehra.file], ['Study in ' + name, file]];
  return [file, page(file, title, desc, ld(file, 'Study in ' + name + ' from Mansehra, Abbottabad and KPK', desc, crumbs, faq,
    [{ '@type': 'Service', name: 'Study in ' + name + ' counselling for students from Mansehra, Abbottabad and KPK', serviceType: 'Study abroad counselling', provider: { '@id': DOMAIN + '/#org' }, areaServed: [{ '@type': 'City', name: 'Mansehra' }, { '@type': 'City', name: 'Abbottabad' }, { '@type': 'AdministrativeArea', name: 'Khyber Pakhtunkhwa' }], url: url(file) }]), main)];
}

/* ---------- hub pages ---------- */
function hubPage(key) {
  const H = HUBS[key], file = H.file;
  const T = {
    mansehra: {
      title: 'Study Abroad Consultants in Mansehra | ' + BRAND.split(' ')[0],
      h1: 'Study abroad consultants in Mansehra',
      lead: 'Looking for study abroad consultants in Mansehra? ' + BRAND + ' helps students from Mansehra city, Balakot, Oghi, Shinkiari and nearby areas choose a country, apply, prepare IELTS and build a visa file, without confusing promises.',
      desc: 'Study abroad consultants in Mansehra: free counselling for the UK, Australia, Canada, USA, China, Dubai and more. IELTS preparation, documents and visa file support.',
      local: [['IELTS preparation in Mansehra', 'ielts-preparation-mansehra.html'], ['Book your IELTS test (Abbottabad and Mansehra)', 'ielts-booking-abbottabad-mansehra.html'], ['English language courses in Abbottabad and Mansehra', 'english-language-courses-abbottabad-mansehra.html']],
      intro: 'If you live in Mansehra you should not need to travel to a big city just to get honest advice. Sit down with a counsellor, compare countries on your real budget and decide your next step.'
    },
    abbottabad: {
      title: 'Study Abroad Consultants in Abbottabad | ' + BRAND.split(' ')[0],
      h1: 'Study abroad consultants in Abbottabad',
      lead: 'Looking for study abroad consultants in Abbottabad? ' + BRAND + ' counsels students from Abbottabad, Havelian, Haripur and nearby towns on countries, universities, scholarships, IELTS and visas.',
      desc: 'Study abroad consultants in Abbottabad: free counselling for the UK, Australia, Canada, USA, China, Dubai and more. IELTS preparation, scholarships and visa file support.',
      local: [['IELTS preparation in Abbottabad', 'ielts-preparation-abbottabad.html'], ['Book your IELTS test (Abbottabad and Mansehra)', 'ielts-booking-abbottabad-mansehra.html'], ['English language courses in Abbottabad and Mansehra', 'english-language-courses-abbottabad-mansehra.html']],
      intro: 'Abbottabad is a major education hub in Hazara. Whether you finished FSc, a bachelor\u2019s degree or a master\u2019s, we help you turn that result into a realistic study abroad plan.'
    },
    kpk: {
      title: 'Study Abroad Consultants in KPK, Pakistan | ' + BRAND.split(' ')[0],
      h1: 'Study abroad consultants in KPK (Khyber Pakhtunkhwa)',
      lead: 'Students across Khyber Pakhtunkhwa, from Hazara to Peshawar, Swat and Mardan, can use ' + BRAND + ' for study abroad counselling in our Mansehra and Abbottabad offices or online.',
      desc: 'Study abroad consultants for students in KPK: free counselling for the UK, Australia, Canada, USA, China, Dubai and more, with offices in Mansehra and Abbottabad and online sessions.',
      local: [['IELTS preparation in Mansehra', 'ielts-preparation-mansehra.html'], ['IELTS preparation in Abbottabad', 'ielts-preparation-abbottabad.html'], ['Book your IELTS test', 'ielts-booking-abbottabad-mansehra.html']],
      intro: 'You do not need to be in Mansehra or Abbottabad to start. Online counselling works for students anywhere in KPK, and we explain early which steps, like visa biometrics, need a trip to a larger city.'
    }
  }[key];
  const faq = [
    ['Which are the best study abroad consultants in ' + esc(H.place) + '?', 'Judge a consultant by what they put in writing, not by promises. Ask for the full fee list, which universities they can apply to directly, and how they handle visa refusals. ' + esc(BRAND) + ' gives written costs and never promises a visa.'],
    ['Is counselling free?', 'Counselling with us is free. If a service fee applies later, ask for it in writing before you pay.'],
    ['Which countries can I apply to from ' + esc(H.place) + '?', 'We guide students to the UK, Australia, Canada, USA, New Zealand, Ireland, Malaysia, China, Dubai and UAE, Italy, France, South Korea, Cyprus and Lithuania.'],
    ['Can I get help with IELTS in ' + esc(H.place) + '?', 'Yes. See the IELTS pages below for preparation plans and how to book your test, including the test city for students from Mansehra and Abbottabad.'],
    ['Can I be counselled online?', 'Yes. Students anywhere in KPK can book an online session and share documents securely, then visit our office only if they want to.']
  ];
  const cards = '<div class="g3">' + COUNTRIES.map(c => '<a class="card" href="' + localFile(c) + '"><h3>Study in ' + esc(c[1]) + '</h3><p>Visa, costs and scholarships for students from ' + esc(H.place === 'KPK (Khyber Pakhtunkhwa)' ? 'KPK' : H.place) + '.</p><span class="l">Read more</span></a>').join('') + '</div>';
  const others = Object.keys(HUBS).filter(k => k !== key).map(k => '<a class="l" href="' + HUBS[k].file + '">Study abroad consultants in ' + (k === 'kpk' ? 'KPK' : HUBS[k].place) + '</a>').join(' &nbsp;·&nbsp; ');
  const main = heroBlock('<a href="index.html" style="color:var(--navy)">BlueZone</a> / ' + esc(T.h1), esc(T.h1), esc(T.lead)) +
    '<section style="padding-top:48px"><div class="w"><h2>Free study abroad counselling in ' + esc(H.place) + '</h2><p>' + esc(T.intro) + '</p>' +
      ul(['Choose a country and course that match your budget and result', 'University and scholarship shortlist, including Chevening, CSC and university awards', 'IELTS, PTE and TOEFL planning',
        'Documents, HEC attestation and a clean visa file', 'Help sending tuition legally and preparing to depart']) +
      '<p>' + ctaButtons() + '</p></div></section>' +
    '<section class="alt"><div class="w"><h2>Choose your study destination</h2>' + cards + '</div></section>' +
    '<section><div class="w"><h2>How to choose a study abroad consultant in ' + esc(H.place) + '</h2><p>Before you pay anyone, check these points. They protect you from the mistakes we see most often.</p>' +
      ol([['Written fees', 'Get every fee and what it covers in writing before you pay.'], ['No visa guarantees', 'Nobody can promise a visa. Walk away from anyone who does.'], ['Direct university applications', 'Ask which universities they apply to and whether you receive the offer letter in your own name.'], ['Your documents stay yours', 'Keep your own copies and your own application accounts.'], ['Pay universities directly', 'Tuition should go to the university\u2019s official account, with receipts. See our <a class="l" href="money-transfer-for-students.html">money transfer guide</a>.']]) + '</div></section>' +
    (offices.length ? '<section class="alt"><div class="w"><h2>Our offices</h2>' + officeCards() + '</div></section>' : '') +
    '<section><div class="w"><h2>IELTS and English in ' + esc(H.place) + '</h2>' + ul(T.local.map(x => '<a class="l" href="' + x[1] + '">' + x[0] + '</a>')) + '</div></section>' +
    '<section class="alt"><div class="w"><h2>Frequently asked questions</h2>' + faqHtml(faq) + '</div></section>' +
    '<section><div class="w"><h2>More local pages</h2><p>' + others + '</p></div></section></div></main>';
  const crumbs = [['BlueZone', 'index.html'], [T.h1, file]];
  const items = { '@type': 'ItemList', name: 'Study destinations for students from ' + H.place, itemListElement: COUNTRIES.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: 'Study in ' + c[1], url: url(localFile(c)) })) };
  return [file, page(file, T.title, T.desc, ld(file, T.h1, T.desc, crumbs, faq, [items]), main)];
}

/* ---------- write pages ---------- */
const out = COUNTRIES.map(countryPage).concat(Object.keys(HUBS).map(hubPage));
out.forEach(([f, h]) => fs.writeFileSync(path.join(ROOT, f), h));

/* ---------- sitemap ---------- */
const files = out.map(x => x[0]);
const ex = path.join(ROOT, 'sitemap-extra.json');
let extra = fs.existsSync(ex) ? JSON.parse(fs.readFileSync(ex, 'utf8')) : [];
files.forEach(f => { if (!extra.includes(f)) extra.push(f); });
fs.writeFileSync(ex, JSON.stringify(extra));
const sm = path.join(ROOT, 'sitemap.xml');
if (fs.existsSync(sm)) {
  let x = fs.readFileSync(sm, 'utf8');
  files.forEach(f => { if (x.indexOf('/' + f + '</loc>') < 0) x = x.replace('</urlset>', '  <url><loc>' + url(f) + '</loc><lastmod>' + MOD + '</lastmod><priority>' + (f.indexOf('consultants') > -1 ? '0.9' : '0.8') + '</priority></url>\n</urlset>'); });
  fs.writeFileSync(sm, x);
}

/* ---------- internal links so Google (and visitors) find the new pages ---------- */
const MARK = '<!--local-seo-->';
function inject(file, before, html) {
  const p = path.join(ROOT, file); if (!fs.existsSync(p)) return;
  let s = fs.readFileSync(p, 'utf8');
  s = s.replace(/<!--local-seo-->[\s\S]*?<!--\/local-seo-->/, '');
  const i = s.lastIndexOf(before); if (i < 0) return;
  fs.writeFileSync(p, s.slice(0, i) + MARK + html + '<!--/local-seo-->' + s.slice(i));
}
COUNTRIES.forEach(c => {
  const name = c[1];
  inject('study-in-' + c[0] + '.html', '</div></main>',
    '<section class="alt"><div class="w"><h2>Studying from Mansehra, Abbottabad or KPK?</h2><p>See how we help students from Hazara and KPK study in ' + esc(name) + ', with local counselling and online sessions.</p>' +
    '<p><a class="btn" href="' + localFile(c) + '">Study in ' + esc(name) + ' from Mansehra</a> &nbsp; <a class="btn o" href="' + HUBS.mansehra.file + '">Study abroad consultants in Mansehra</a></p></div></section>');
});
const homeLinks = '<section class="alt"><div class="w"><h2>Study abroad consultants near you</h2><p>Local counselling for students in <a class="l" href="' + HUBS.mansehra.file + '">Mansehra</a>, <a class="l" href="' + HUBS.abbottabad.file + '">Abbottabad</a> and across <a class="l" href="' + HUBS.kpk.file + '">KPK</a>.</p><p>' +
  COUNTRIES.map(c => '<a class="l" href="' + localFile(c) + '">Study in ' + esc(c[1]) + ' from Mansehra</a>').join(' &nbsp;·&nbsp; ') + '</p></div></section>';
inject('index.html', '<footer', homeLinks);
inject('study-destinations.html', '</div></main>', homeLinks);

console.log('Built ' + files.length + ' pages, updated sitemap.xml and links.');
const missing = [];
if (!telNum) missing.push('phone'); if (!waNum) missing.push('whatsapp'); if (!cfg.email) missing.push('email');
if (!offices.some(o => o.address)) missing.push('office addresses'); if (!social.length) missing.push('social / Google Business Profile links');
if (missing.length) console.log('\nIMPORTANT for ranking: academy.config.json is missing: ' + missing.join(', ') + '.\nFill them, then run: node build-academy.js && node build-local.js');
