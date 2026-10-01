#!/usr/bin/env node
/* BlueZone Academy static page builder.
   Usage:  node build-academy.js
   Reads academy.config.json, writes the academy HTML pages, sitemap.xml and robots.txt next to index.html.
   Static HTML (not the #/ router) is what lets Google index each page for local searches. */
const fs = require('fs'), path = require('path');
const ROOT = __dirname;
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'academy.config.json'), 'utf8'));
const NAME = cfg.academyName || 'BlueZone Academy', PARENT = cfg.parentName || 'BlueZone Consultants';
const DOMAIN = (cfg.domain || '').replace(/\/+$/, '');
const N = cfg.studentsCount || '300+';
const MOD = cfg.dateModified || '2026-10-01';
const MODTXT = '1 October 2026';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const waNum = (cfg.whatsapp || '').replace(/\D/g, ''), telNum = (cfg.phone || '').replace(/[^\d+]/g, '');
const url = f => DOMAIN ? DOMAIN + '/' + f : f;

/* ---------- html helpers ---------- */
const ul = a => '<ul>' + a.map(x => '<li>' + x + '</li>').join('') + '</ul>';
const ol = a => '<ol class="tlv">' + a.map((s, i) => '<li data-n="' + (i + 1) + '"><b>' + s[0] + '</b>' + (s[1] || '') + '</li>').join('') + '</ol>';
const chk = a => '<ul class="chk">' + a.map(x => '<li>' + x + '</li>').join('') + '</ul>';
const table = (h, r, cap) => '<div class="tw"><table><thead><tr>' + h.map(x => '<th>' + x + '</th>').join('') + '</tr></thead><tbody>' + r.map(x => '<tr>' + x.map(c => '<td>' + c + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>' + (cap ? '<p class="src" style="margin-top:12px">' + cap + '</p>' : '');
const note = t => '<div class="note">' + t + '</div>';
const warn = t => '<div class="note warn"><b>Watch out: </b>' + t + '</div>';
const cards = a => '<div class="g3">' + a.map(c => '<div class="card"><h3>' + c[0] + '</h3><p>' + c[1] + '</p>' + (c[2] ? '<a class="l" href="' + c[2] + '">' + (c[3] || 'Read more') + ' ›</a>' : '') + '</div>').join('') + '</div>';
const cols = a => '<div class="cols2">' + a.map(c => '<div class="card"><h3>' + c[0] + '</h3>' + ul(c[1]) + '</div>').join('') + '</div>';
const kv = a => '<div class="kv">' + a.map(k => '<div><b>' + k[0] + '</b><span>' + k[1] + '</span></div>').join('') + '</div>';
const p = t => '<p>' + t + '</p>';
const urdu = t => '<div class="note" lang="ur-Latn"><b>Roman Urdu khulasa: </b>' + t + '</div>';
const S = 'index.html#/p/';

function cta(label) {
  const l = label || 'Book a free level test';
  const out = [];
  if (waNum) out.push('<a class="btn" href="https://wa.me/' + waNum + '?text=' + encodeURIComponent('Assalam o Alaikum, I want to ask about IELTS / English courses at ' + NAME + '.') + '" rel="noopener">' + l + ' on WhatsApp</a>');
  if (telNum) out.push('<a class="btn o" href="tel:' + telNum + '">Call ' + esc(cfg.phone) + '</a>');
  if (!out.length) out.push('<a class="btn" href="index.html#offices">' + l + '</a>');
  return '<div style="display:flex;gap:12px;flex-wrap:wrap">' + out.join('') + '</div>';
}

/* ---------- shared layout ---------- */
const PAGES_NAV = [
  ['academy.html', 'Academy home'],
  ['ielts-preparation-abbottabad.html', 'IELTS preparation Abbottabad'],
  ['ielts-preparation-mansehra.html', 'IELTS preparation Mansehra'],
  ['ielts-booking-abbottabad-mansehra.html', 'IELTS test booking'],
  ['english-language-courses-abbottabad-mansehra.html', 'English language courses']
];
function header() {
  const burger = '<button class="burger" aria-label="Menu" onclick="document.getElementById(\'m\').classList.toggle(\'open\')"><svg class="i" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>';
  return '<header><div class="w"><a class="logo" href="index.html"><img src="images/logo.png" alt="' + esc(PARENT) + ' logo" width="44" height="44"><span>BlueZone<small>ACADEMY</small></span></a><nav>' +
    '<div><a href="academy.html">Academy</a><div class="dd">' + PAGES_NAV.slice(1).map(x => '<a href="' + x[0] + '">' + x[1] + '</a>').join('') + '</div></div>' +
    '<div><a href="' + S + 'ielts">IELTS guides</a><div class="dd"><a href="' + S + 'what-is-ielts">What is IELTS?</a><a href="' + S + 'ielts-prep">IELTS study plan</a><a href="' + S + 'book-test">Fees and booking</a><a href="' + S + 'english-tests">IELTS vs PTE vs TOEFL</a></div></div>' +
    '<div><a href="' + S + 'steps">Study abroad</a><div class="dd"><a href="' + S + 'destinations">Destinations</a><a href="' + S + 'scholarships">Scholarships</a><a href="' + S + 'documents">Documents</a></div></div>' +
    '</nav><div class="hr"><a class="btn g" href="' + (waNum ? 'https://wa.me/' + waNum : 'index.html#offices') + '">Free level test</a>' + burger + '</div></div>' +
    '<div class="mob" id="m">' + PAGES_NAV.map(x => '<a href="' + x[0] + '">' + x[1] + '</a>').join('') + '<a href="index.html">Study abroad home</a><a href="index.html#offices">Offices</a></div></header>';
}
function officeLines() {
  return (cfg.offices || []).map(o => '<div class="card"><h3>' + esc(o.city) + ' office</h3><p>' + (o.address ? esc(o.address) : esc(o.city) + ', Khyber Pakhtunkhwa, Pakistan') + (o.hours ? '<br>' + esc(o.hours) : '') + '</p><a class="l" href="https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent((o.address || NAME + ' ' + o.city) + ' ' + o.city + ' Pakistan') + '" rel="noopener" target="_blank">Get directions ›</a></div>').join('');
}
function footer() {
  return '<footer><div class="w"><div class="top2"><a class="logo" href="index.html"><img src="images/logo.png" alt="" style="background:#fff;border-radius:8px;padding:3px" width="44" height="44"><span>BlueZone<small>ACADEMY</small></span></a>' + (waNum ? '<a class="btn o" style="color:#fff;border-color:#fff" href="https://wa.me/' + waNum + '" rel="noopener">WhatsApp us</a>' : '<a class="btn o" style="color:#fff;border-color:#fff" href="index.html#offices">Find our offices</a>') + '</div>' +
    '<div class="cols"><div><h4>Academy</h4>' + PAGES_NAV.map(x => '<a href="' + x[0] + '">' + x[1] + '</a>').join('') + '</div>' +
    '<div><h4>IELTS guides</h4><a href="' + S + 'what-is-ielts">What is IELTS?</a><a href="' + S + 'ielts-prep">IELTS study plan</a><a href="' + S + 'book-test">Fees and booking</a><a href="' + S + 'english-tests">IELTS vs PTE vs TOEFL</a></div>' +
    '<div><h4>Study abroad</h4><a href="' + S + 'steps">Study abroad steps</a><a href="' + S + 'scholarships">Scholarships</a><a href="' + S + 'documents">Documents</a><a href="index.html">' + esc(PARENT) + '</a></div>' +
    '<div><h4>Find us</h4>' + (cfg.offices || []).map(o => '<a href="academy.html#offices">' + esc(o.city) + (o.address ? ': ' + esc(o.address) : '') + '</a>').join('') + (telNum ? '<a href="tel:' + telNum + '">' + esc(cfg.phone) + '</a>' : '') + (cfg.email ? '<a href="mailto:' + esc(cfg.email) + '">' + esc(cfg.email) + '</a>' : '') + '</div></div>' +
    '<hr><div>Copyright © 2026 ' + esc(PARENT) + '. ' + esc(NAME) + ' is an independent IELTS preparation and English teaching academy. IELTS is jointly owned by the British Council, IDP IELTS and Cambridge University Press &amp; Assessment. We are not the British Council, IDP or Cambridge.</div></div></footer>' +
    (waNum ? '<a class="wa" href="https://wa.me/' + waNum + '" rel="noopener" aria-label="Chat on WhatsApp">WhatsApp</a>' : '');
}

/* ---------- JSON-LD ---------- */
function orgLd() {
  const o = {
    '@type': ['EducationalOrganization', 'LanguageSchool'], '@id': url('academy.html') + '#academy', name: NAME, description: 'IELTS preparation, IELTS test booking assistance and English language courses from beginner to advanced in Abbottabad and Mansehra, Khyber Pakhtunkhwa, Pakistan.',
    parentOrganization: { '@type': 'Organization', name: PARENT },
    areaServed: [{ '@type': 'City', name: 'Abbottabad' }, { '@type': 'City', name: 'Mansehra' }],
    knowsAbout: ['IELTS', 'IELTS Academic', 'IELTS General Training', 'English language teaching', 'Study abroad'],
    location: (cfg.offices || []).map(of => ({ '@type': 'Place', name: NAME + ' ' + of.city, address: Object.assign({ '@type': 'PostalAddress', addressLocality: of.city, addressRegion: 'Khyber Pakhtunkhwa', addressCountry: 'PK' }, of.address ? { streetAddress: of.address } : {}), openingHours: of.hours || undefined }))
  };
  if (DOMAIN) { o.url = DOMAIN + '/academy.html'; o.logo = DOMAIN + '/images/logo.png'; o.image = DOMAIN + '/images/logo.png'; }
  if (cfg.phone) o.telephone = cfg.phone; if (cfg.email) o.email = cfg.email;
  const same = Object.values(cfg.social || {}).filter(Boolean); if (same.length) o.sameAs = same;
  return o;
}
function courseLd(c) { return { '@type': 'Course', name: c.name, description: c.desc, provider: { '@type': 'EducationalOrganization', name: NAME, sameAs: DOMAIN ? DOMAIN + '/academy.html' : undefined }, educationalLevel: c.level, inLanguage: 'en', teaches: c.teaches, availableLanguage: ['English', 'Urdu'] }; }

/* ---------- page renderer ---------- */
function render(pg) {
  const desc = pg.desc, title = pg.title;
  if (title.length > 62) console.warn('  [seo] title long (' + title.length + '): ' + pg.file);
  if (desc.length > 160) console.warn('  [seo] description long (' + desc.length + '): ' + pg.file);
  const canon = DOMAIN ? '<link rel="canonical" href="' + url(pg.file) + '">' : '';
  const og = '<meta property="og:type" content="website"><meta property="og:title" content="' + esc(title) + '"><meta property="og:description" content="' + esc(desc) + '"><meta property="og:locale" content="en_PK"><meta property="og:site_name" content="' + esc(NAME) + '">' + (DOMAIN ? '<meta property="og:url" content="' + url(pg.file) + '"><meta property="og:image" content="' + DOMAIN + '/images/hero.jpg">' : '') + '<meta name="twitter:card" content="summary_large_image">';
  const crumbs = [['Home', 'index.html'], ['Academy', 'academy.html']].concat(pg.file === 'academy.html' ? [] : [[pg.crumb, pg.file]]);
  const graph = [orgLd(),
    { '@type': 'WebPage', '@id': url(pg.file), name: title, description: desc, dateModified: MOD, inLanguage: 'en', isPartOf: { '@type': 'WebSite', name: PARENT }, about: { '@id': url('academy.html') + '#academy' } },
    { '@type': 'BreadcrumbList', itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c[0], item: url(c[1]) })) }]
    .concat((pg.courses || []).map(courseLd));
  if (pg.faq && pg.faq.length) graph.push({ '@type': 'FAQPage', mainEntity: pg.faq.map(q => ({ '@type': 'Question', name: q[0], acceptedAnswer: { '@type': 'Answer', text: q[1].replace(/<[^>]+>/g, '') } })) });
  const ld = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/<\//g, '<\\/');
  const bc = '<p style="font-size:13px;margin:0 0 14px">' + crumbs.map((c, i) => i === crumbs.length - 1 ? c[0] : '<a href="' + c[1] + '" style="color:var(--navy)">' + c[0] + '</a>').join(' / ') + '</p>';
  let h = '<!DOCTYPE html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<title>' + esc(title) + '</title><meta name="description" content="' + esc(desc) + '">' + canon + '<meta name="robots" content="index,follow,max-image-preview:large"><meta name="geo.region" content="PK-KP"><meta name="geo.placename" content="Abbottabad, Mansehra">' + og +
    '<link rel="icon" href="images/logo.png"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800&family=Inter:wght@400;500;600&display=swap"><link rel="stylesheet" href="css/style.css">\n<script type="application/ld+json">' + ld + '</script></head><body>\n' + header() + '\n<main>';
  h += '<div class="hero" style="padding:44px 0 ' + (pg.facts ? 90 : 56) + 'px"><div class="w" style="grid-template-columns:1fr"><div>' + bc + '<h1 style="font-size:40px;max-width:860px">' + pg.h1 + '</h1><p>' + pg.lead + '</p><p class="upd">Last reviewed ' + MODTXT + '. Fees and rules are checked against the official sources linked at the bottom of each page.</p>' + cta() + '</div></div></div>';
  if (pg.facts) h += '<div class="w"><div class="facts">' + pg.facts.map(f => '<div class="fc"><b>' + f[0] + '</b><span>' + f[1] + '</span></div>').join('') + '</div></div>';
  const secs = pg.sec.slice();
  if (pg.faq) secs.push({ id: 'faq', t: 'Frequently asked questions', nav: 'FAQs', c: '<div class="stp" style="max-width:860px">' + pg.faq.map(q => '<details><summary>' + q[0] + '</summary><p>' + q[1] + '</p></details>').join('') + '</div>' });
  h += '<div class="sub"><div class="w">' + secs.map(s => '<a href="#' + s.id + '">' + (s.nav || s.t) + '</a>').join('') + '</div></div>';
  secs.forEach((s, i) => { h += '<section id="' + s.id + '"' + (i % 2 ? ' class="alt"' : '') + (i === 0 ? ' style="padding-top:48px"' : '') + '><div class="w"><h2>' + s.t + '</h2>' + s.c + '</div></section>'; });
  h += '<section' + (secs.length % 2 ? ' class="alt"' : '') + '><div class="w"><div class="banner"><div><h3>' + (pg.bannerT || 'Find your level, then plan your band') + '</h3><p>' + (pg.bannerP || 'Tell us your target university or visa and your exam date. A counsellor will suggest the right course and the date to book.') + '</p></div>' + (waNum ? '<a class="btn" href="https://wa.me/' + waNum + '" rel="noopener">Message us on WhatsApp</a>' : '<a class="btn" href="index.html#offices">Find our offices</a>') + '</div></div></section>';
  h += '<section' + ((secs.length + 1) % 2 ? ' class="alt"' : '') + '><div class="w"><h2>Keep reading</h2><div class="g3">' + PAGES_NAV.filter(x => x[0] !== pg.file).slice(0, 3).map(x => '<a class="card bc" href="' + x[0] + '"><small>Academy</small><h3>' + x[1] + '</h3><p>' + (PAGE_BLURB[x[0]] || '') + '</p><span class="m">Read more</span></a>').join('') + '</div></div></section>';
  if (pg.src) h += '<section><div class="w"><h2>Sources</h2><ul class="src">' + pg.src.map(s => '<li><a href="' + s[1] + '" target="_blank" rel="noopener">' + s[0] + '</a></li>').join('') + '</ul></div></section>';
  h += '</main>\n' + footer() + '\n</body></html>\n';
  return h;
}
const PAGE_BLURB = {
  'academy.html': 'IELTS preparation, booking help and English courses in one place.',
  'ielts-preparation-abbottabad.html': 'Tracks, skill training, mock tests and score targets.',
  'ielts-preparation-mansehra.html': 'IELTS coaching for students in Mansehra and nearby towns.',
  'ielts-booking-abbottabad-mansehra.html': 'Current British Council fees, steps and booking help.',
  'english-language-courses-abbottabad-mansehra.html': 'A1 to C1 levels with a clear path to IELTS.'
};
const BC_SRC = [['British Council Pakistan: book IELTS and current fees', 'https://www.britishcouncil.pk/exam/ielts/book-test'], ['British Council Pakistan: results and Enquiry on Results', 'https://www.britishcouncil.pk/exam/ielts/results'], ['British Council Pakistan: One Skill Retake', 'https://www.britishcouncil.pk/exam/ielts/one-skill-retake']];
const FEES = table(['Test','Fee (PKR)','Where it applies'], [
  ['IELTS Academic or General Training on computer','<b>75,600</b>','Abbottabad, Islamabad, Karachi, Peshawar, Quetta, Hyderabad, Sukkur, Mirpur'],
  ['IELTS on computer, Punjab centres','76,240','Lahore, Multan, Faisalabad and other listed Punjab cities'],
  ['IELTS for UKVI on computer','72,000','Approved UKVI centres, for UK visa routes that need a SELT'],
  ['IELTS Life Skills (A1 and B1)','50,000','UK family, settlement and citizenship routes. Not for university entry'],
  ['Enquiry on Results (computer)','39,650','Remark request within 6 weeks. Refunded if a section score rises']],
  'British Council Pakistan, in effect from 9 June 2026, checked on ' + MODTXT + '. IELTS is priced against a dollar rate, so the rupee fee can change. Confirm on the booking page on the day you pay.');
const PLAN_NOTE = 'See also our free <a href="' + S + 'ielts-prep">IELTS preparation plan</a> and the <a href="' + S + 'what-is-ielts">full guide to the test</a>.';

/* ================= PAGES ================= */
const pages = [];

/* ---- HUB ---- */
pages.push({
  file: 'academy.html', crumb: 'Academy',
  title: 'IELTS Academy Abbottabad & Mansehra | ' + NAME,
  desc: 'IELTS preparation, IELTS test booking help and English courses from beginner to advanced in Abbottabad and Mansehra. ' + N + ' students have taken IELTS with us.',
  h1: 'IELTS preparation, booking and English courses in Abbottabad and Mansehra',
  lead: N + ' students have taken IELTS after preparing with us. Study IELTS, learn English from beginner to advanced, and get your test booked correctly, with study-abroad guidance from ' + PARENT + ' under the same roof.',
  facts: [[N, 'Students who have taken IELTS with us'], ['2 offices', 'Abbottabad and Mansehra'], ['A1 to C1', 'English course levels'], ['Rs 75,600', 'British Council IELTS fee, Abbottabad (from 9 June 2026)']],
  courses: [{ name: 'IELTS Preparation (Academic and General Training)', desc: 'Preparation for all four IELTS skills with a diagnostic test, skill training, timed mock tests and feedback on Writing and Speaking.', level: 'Intermediate to Advanced', teaches: 'IELTS Listening, Reading, Writing and Speaking' }, { name: 'English Language Courses A1 to C1', desc: 'Level-based English language courses from beginner (A1) to advanced (C1), including spoken English.', level: 'Beginner to Advanced', teaches: 'General English: speaking, listening, reading, writing, grammar and vocabulary' }],
  sec: [
    { id: 'services', t: 'What we offer', nav: 'Services', c: cards([
      ['IELTS Preparation', 'Academic and General Training. All four skills, timed mock tests and written feedback. Tracks from Foundation to Band 7+.', 'ielts-preparation-abbottabad.html', 'See IELTS courses'],
      ['IELTS Booking Service', 'We help you choose the right version, date and centre, register with matching ID, pay the official fee safely and send your results.', 'ielts-booking-abbottabad-mansehra.html', 'See booking help'],
      ['English Language Courses', 'Clear CEFR levels from A1 beginner to C1 advanced, plus spoken English, so you build the base before the exam.', 'english-language-courses-abbottabad-mansehra.html', 'See English levels']]) },
    { id: 'why', t: 'Why students from Abbottabad and Mansehra choose us', nav: 'Why us', c: ul([
      '<b>' + N + ' students</b> have already taken IELTS after preparing with us.',
      '<b>Target first.</b> We are part of ' + PARENT + ', which handles university admissions and visas. We set your target band from your university and visa requirement, not from a guess.',
      '<b>Two local offices</b> in Abbottabad and Mansehra, so you do not need to travel to a large city for classes.',
      '<b>Honest advice.</b> If your English needs a course before IELTS, we tell you. We never promise a band score, because no one can.',
      '<b>Booking help included in the journey.</b> Preparation, test date, results and next steps are handled by one team, so deadlines do not slip.']) },
    { id: 'how', t: 'How our IELTS programme works', nav: 'How it works', c: ol([
      ['Level test and target', 'A diagnostic test shows your current band in each skill. We compare it with the score your course or visa needs, including any minimum per skill.'],
      ['Personal plan', 'You get a plan built on your weakest skill, because one weak section can fail a visa or admission even with a good overall band.'],
      ['Skill training', 'Listening, Reading, Writing and Speaking are taught as separate skills with technique, vocabulary and grammar attached to each.'],
      ['Timed mock tests', 'Full and sectional tests under exam conditions, marked against the official band descriptors, with computer practice for the on-screen format.'],
      ['Feedback on Writing and Speaking', 'These two skills cannot be self-marked reliably, so every essay and speaking answer gets specific correction.'],
      ['Booking and test day', 'We help you choose the date and register correctly, then prepare you for the test-day rules.'],
      ['Results and next step', 'We review your results, then advise: apply, retake, One Skill Retake, or send to universities.']]) },
    { id: 'which', t: 'Which service do you need?', nav: 'Which service', c: table(['Your situation', 'Start with'], [
      ['My English is basic, below intermediate (B1)', '<a href="english-language-courses-abbottabad-mansehra.html">English course (A2 to B1)</a>, then IELTS'],
      ['I speak some English but have never practised IELTS', '<a href="ielts-preparation-abbottabad.html">IELTS Foundation or Core track</a>'],
      ['I scored 6.0 and need 6.5 or 7.0', '<a href="ielts-preparation-abbottabad.html#tracks">Target-band or skill clinic</a> for your weakest section'],
      ['I know my level and only need a test date', '<a href="ielts-booking-abbottabad-mansehra.html">IELTS booking service</a>'],
      ['My application deadline is close', 'Fast-track preparation plus booking help. Tell us the deadline first.'],
      ['I live in or near Mansehra', '<a href="ielts-preparation-mansehra.html">IELTS preparation in Mansehra</a>']]) },
    { id: 'test', t: 'IELTS test in Abbottabad: the quick facts', nav: 'Test facts', c: kv([['Fee', 'Rs 75,600 for IELTS on computer at Abbottabad (British Council, from 9 June 2026)'], ['Results', 'Usually 1 to 2 days after a computer test'], ['Validity', '2 years from the test date'], ['Format', 'Listening about 30 min, Reading 60, Writing 60, Speaking 11 to 14'], ['Retake', 'One Skill Retake within 60 days on computer tests'], ['Free e-TRFs', 'Five extra electronic score reports sent to institutions with a British Council booking']]) + p('Full steps, payment routes and warnings are on our <a href="ielts-booking-abbottabad-mansehra.html">IELTS booking page</a>. ' + PLAN_NOTE) },
    { id: 'offices', t: 'Our offices in Abbottabad and Mansehra', nav: 'Offices', c: '<div class="g3">' + officeLines() + '</div>' + (cfg.offices && cfg.offices.some(o => o.address) ? '' : p('Visit the <a href="index.html#offices">offices section</a> of our main site for the nearest branch and contact options.')) },
    { id: 'urdu', t: 'Urdu mein khulasa', nav: 'Roman Urdu', c: urdu('Abbottabad aur Mansehra mein IELTS ki tayari, IELTS test booking aur English language courses (beginner se advanced tak). ' + N + ' students humare saath IELTS de chuke hain. Pehle level test, phir target band, phir mock tests aur Writing/Speaking feedback. Apna level maloom karne ke liye aaj hi rabta karein.') }
  ],
  faq: [
    ['Which is the best IELTS academy in Abbottabad and Mansehra?', 'We do not rank ourselves. Compare academies on what you can check: how they test your level, how many full mock tests you get, who marks Writing and Speaking, and whether they will tell you honestly if you need an English course first. ' + N + ' students have taken IELTS after preparing with us, and you are welcome to ask us how we track progress.'],
    ['How long does IELTS preparation take?', 'It depends on your starting level and target. Students near band 6.0 who study regularly often need 6 to 8 weeks to move up by half to one band. Students starting near band 5.0 may need 10 to 12 weeks, and students below B1 usually need an English course first. A diagnostic test gives a real estimate.'],
    ['Do you teach both IELTS Academic and General Training?', 'Yes. Listening and Speaking are the same in both. Reading and Writing differ, so we prepare you for the version your university, visa or employer requires. If you are unsure, ask us before you book, because a wrong version wastes a test fee.'],
    ['Where can I take the IELTS test near Mansehra?', 'The British Council booking page lists Abbottabad as a computer-delivered IELTS city. As of ' + MODTXT + ' Mansehra is not listed as a separate test centre, so students from Mansehra normally sit the test in Abbottabad. Check the booking page for live centres and dates.'],
    ['How much is the IELTS test fee in Abbottabad?', 'British Council Pakistan lists Rs 75,600 for IELTS on computer at Abbottabad from 9 June 2026. Fees change with exchange rates, so confirm on the day you book.'],
    ['How much is your IELTS course fee?', 'Fees depend on the track, batch type and length of the course, so we give them after your level test. Contact us for the current fee, and ask for it in writing together with what is included.'],
    ['Can you guarantee a band score?', 'No. No academy, agent or teacher can guarantee a band. Be careful with anyone who does, especially if they offer leaked papers or a paid score. Misconduct can cancel your result and ban you from the test.'],
    ['Can I book the test through you?', 'Yes. We help you choose the version, date and centre, register with matching ID, and understand the payment steps. The exam fee goes to the exam provider under its official payment instructions. Read the details on the <a href="ielts-booking-abbottabad-mansehra.html">booking page</a>.'],
    ['I want to study abroad. Can you help beyond IELTS?', 'Yes. ' + PARENT + ' offers free counselling, university applications, scholarships and visa guidance. Start with the <a href="' + S + 'steps">study abroad roadmap</a>.']],
  src: BC_SRC
});

/* ---- IELTS PREP ABBOTTABAD ---- */
pages.push({
  file: 'ielts-preparation-abbottabad.html', crumb: 'IELTS preparation Abbottabad',
  title: 'IELTS Preparation in Abbottabad | ' + NAME,
  desc: 'IELTS Academic and General Training preparation in Abbottabad: level test, skill training, timed mocks and Writing and Speaking feedback. Ask about batches.',
  h1: 'IELTS preparation in Abbottabad: Academic and General Training courses',
  lead: 'A structured IELTS course for students in Abbottabad who need a specific band for admission, a visa or registration. We start with your target and your weakest skill, then train, test and correct.',
  facts: [['4 skills', 'Listening, Reading, Writing, Speaking'], ['6.5 overall', 'Typical master’s requirement, often with 6.0 minimum per skill'], ['Rs 75,600', 'IELTS on computer, Abbottabad (British Council)'], [N, 'Students who have taken IELTS with us']],
  courses: [{ name: 'IELTS Preparation Course Abbottabad', desc: 'Preparation for IELTS Academic and General Training with a diagnostic test, skill-by-skill training, timed mock tests and feedback on Writing and Speaking.', level: 'Intermediate to Advanced', teaches: 'IELTS Listening, Reading, Writing and Speaking' }],
  sec: [
    { id: 'who', t: 'Who this course is for', nav: 'Who it is for', c: ul(['Students applying to universities in the UK, Australia, Canada, Ireland, New Zealand, the USA, China or Malaysia', 'Nurses, doctors and other health professionals who must meet a regulator’s per-skill score', 'People applying for work or migration routes that accept IELTS General Training or Academic', 'Anyone who already took IELTS and is stuck one band below the target', 'Students who were told to “just take IELTS” but have never seen the test']) + p('If your English is below intermediate (B1), start with our <a href="english-language-courses-abbottabad-mansehra.html">English language course</a>. IELTS preparation works best once you can already follow everyday English.') },
    { id: 'tracks', t: 'Course tracks', nav: 'Tracks', c: table(['Track', 'Best for', 'Target', 'Main focus'], [
      ['Foundation', 'First-time test takers with a basic or mid B1 level', 'Band 5.5 to 6.0', 'Test format, core grammar and vocabulary, simple essay and speaking structure'],
      ['Core', 'Students near band 6.0 who need to move up', 'Band 6.5', 'Technique for every question type, timed practice, regular Writing and Speaking feedback'],
      ['Advanced', 'Students at 6.5 who need 7.0 or higher', 'Band 7.0 to 7.5', 'Precision, range of language, argument quality, fluent natural Speaking'],
      ['Fast-track', 'Students with a close exam or application date', 'Set after the level test', 'Intensive plan built around the weakest skill. Success depends on your starting level and daily practice'],
      ['Skill clinic', 'Students with one weak section, such as Writing at 5.5', 'One section up by half to one band', 'Focused sessions on a single skill, then a retake or One Skill Retake'],
      ['Retake support', 'Students who already took the test', 'Your original target', 'Review of the score report, error analysis, and a plan to fix the exact marks lost']],
      'Batch timing, duration and fees depend on the track. Contact us for the current schedule and ask for the fee in writing, with a list of what is included.') },
    { id: 'skills', t: 'What we teach in each skill', nav: 'Skills', c: cols([
      ['Listening', ['Following four recordings from everyday conversation to an academic lecture', 'Reading ahead and predicting answers before the audio plays', 'Spelling, plural forms and number formats where marks are often lost', 'Map, plan and diagram labelling', 'Computer-based practice so the screen layout is familiar']],
      ['Reading', ['Skimming for structure and scanning for names, dates and keywords', 'True, False, Not Given: the exact difference and how to prove each', 'Matching headings, information and features', 'Time control, about 20 minutes per passage', 'Vocabulary in context for academic texts']],
      ['Writing', ['Task 1: describing graphs, tables, maps and processes (Academic) or letters (General Training)', 'Task 2: essay types, clear position, paragraph logic and natural linking', 'Grammar range and accuracy, and vocabulary precision', 'Timed essays marked against the official band descriptors', 'Individual correction and a record of your repeated errors']],
      ['Speaking', ['Part 1: extended answers on familiar topics', 'Part 2: a two-minute talk with a planning minute', 'Part 3: abstract discussion and justifying opinions', 'Fluency, pronunciation and natural, non-memorised answers', 'Mock interviews with examiner-style follow-up questions']]]) },
    { id: 'week', t: 'What a typical week and course look like', nav: 'Course structure', c: ol([
      ['Skill sessions', 'Two to three sessions a week on a focus skill, each with a technique, a practice set and corrections.'],
      ['Writing workshop', 'A weekly timed essay or report, returned with comments on task response, coherence, vocabulary and grammar.'],
      ['Speaking practice', 'Regular recorded or live practice, with feedback on fluency and pronunciation.'],
      ['Timed section tests', 'One full section under exam time each week, so Listening and Reading stamina builds early.'],
      ['Full mock test', 'Full mocks at set points in the course, and a final mock in the last week. The final mock is for confidence, not for learning new skills.'],
      ['Review', 'After every mock we list the error types, not just the score, and change the plan.']]) + note('The exact weekly timetable depends on your track and batch. Ask us for the current batch plan before you enrol.') },
    { id: 'scores', t: 'Which band do you need?', nav: 'Score targets', c: table(['Purpose', 'Typical overall band', 'Notes'], [
      ['Foundation or pathway course', '5.0 to 5.5', 'Sometimes with a pre-sessional English course'],
      ['Bachelor’s degree', '6.0 to 6.5', 'Some universities set 5.5 or 6.0 minimum in each skill'],
      ['Master’s degree, most subjects', '6.5', 'Writing 6.0 or 6.5 minimum is common'],
      ['Law, medicine, nursing, education', '7.0 or higher', 'The professional regulator sets its own score'],
      ['UK student visa', 'Set by the university', 'Some routes need IELTS for UKVI. Check your CAS conditions'],
      ['Australia student visa', 'Often 5.5 minimum, universities ask more', 'Test in person where required. Check Home Affairs']],
      'Typical ranges only. Read your own offer letter, because each university and visa route sets its own requirement. Use our <a href="' + S + 'ielts">band calculator</a> to check your section scores.') },
    { id: 'versions', t: 'Academic or General Training?', nav: 'Which version', c: table(['Version', 'Use it for', 'Difference'], [['IELTS Academic', 'University admission and professional registration', 'Reading uses academic texts. Writing Task 1 describes a graph, chart, table, map or process'], ['IELTS General Training', 'Work, training below degree level and some migration routes', 'Reading uses everyday and workplace texts. Writing Task 1 is a letter'], ['IELTS for UKVI', 'UK visa routes that require a Secure English Language Test', 'Same skills, taken at an approved UKVI centre with extra security']]) + p('Ask your university or visa office before you choose. See <a href="' + S + 'what-is-ielts">What is IELTS?</a> for the full format.') },
    { id: 'mistakes', t: 'Mistakes we see again and again', nav: 'Common mistakes', c: ol([
      ['Memorised Speaking answers', 'Examiners are trained to spot them and will change the topic. Natural answers with reasons and examples score higher.'],
      ['Writing under the word count or off topic', 'A short Task 2 loses marks automatically, and an answer to a different question scores low however good the English is.'],
      ['Missing small Listening details', 'Spelling, plural “s”, numbers and word limits cost many students half a band.'],
      ['Confusing False and Not Given', 'False means the text says the opposite. Not Given means it does not say.'],
      ['Preparing only the strong skill', 'Students practise what they enjoy. The weakest section decides whether you meet a per-skill minimum.'],
      ['Booking too early or too late', 'Test only when your mock scores are stable at the target, but leave time for a retake before the deadline.']]) },
    { id: 'test', t: 'Taking the test in Abbottabad', nav: 'Test in Abbottabad', c: p('British Council Pakistan lists Abbottabad as a test city for IELTS on computer. The fee is <b>Rs 75,600</b> from 9 June 2026. Results usually arrive in 1 to 2 days, and an electronic report is valid for 2 years. Our <a href="ielts-booking-abbottabad-mansehra.html">booking page</a> explains the steps, payment routes and what to carry. ' + PLAN_NOTE) + cta('Ask about the next batch') }
  ],
  faq: [
    ['Is there an IELTS test centre in Abbottabad?', 'Yes. British Council Pakistan lists Abbottabad among its cities for IELTS on computer. Check the booking page for live dates and seats.'],
    ['How many weeks do I need to prepare for IELTS?', 'Most students starting near band 6.0 need 6 to 8 weeks of focused practice to gain half to one band. Starting at 5.0 or 5.5 may need 10 to 12 weeks. Your weakest skill and daily practice decide the real time.'],
    ['Can I improve from 6.0 to 7.0?', 'It is possible for some students, but a full band is a large step and depends on your starting skills, your weakest section and the time you give. We test your level first and tell you a realistic plan, not a promise.'],
    ['Do you provide mock tests?', 'Yes, timed section tests and full mock tests are part of the course structure. Ask about the number of mocks in your track and how Writing and Speaking are marked.'],
    ['Is computer-based IELTS different from paper-based?', 'The content and scoring are the same. On computer you type your answers and results arrive faster, usually in 1 to 2 days. Speaking is still face to face with an examiner. Practise typing 250 words in 40 minutes.'],
    ['Which IELTS version do I need for a UK or Australian visa?', 'It depends on the university and the visa route. Some UK routes need IELTS for UKVI, and Australia expects approved tests to be taken in person. Your offer letter or visa guidance will say.'],
    ['What happens if I miss one band in one skill?', 'Ask whether your institution accepts a pre-sessional course. Otherwise consider a One Skill Retake on computer tests within 60 days, if your institution accepts it. See the <a href="' + S + 'what-is-ielts">IELTS guide</a>.'],
    ['What should I bring to the test?', 'The same valid passport or ID you used to book, and your booking confirmation. Follow the British Council instructions for personal items.']],
  src: BC_SRC.concat([['British Council: IELTS on computer familiarisation test', 'https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-english-practice-tests/ielts-on-computer/familiarisation-test']]),
  bannerT: 'Start with a level test', bannerP: 'A diagnostic test shows your band in each skill and how long you realistically need. Bring your target score and exam date.'
});

/* ---- IELTS PREP MANSEHRA ---- */
pages.push({
  file: 'ielts-preparation-mansehra.html', crumb: 'IELTS preparation Mansehra',
  title: 'IELTS Preparation in Mansehra | ' + NAME,
  desc: 'IELTS classes in Mansehra for students from Mansehra city and nearby towns. Level test, mock tests, Writing and Speaking feedback, and test-day planning.',
  h1: 'IELTS preparation in Mansehra: coaching close to home',
  lead: 'You should not need to move to a big city to prepare for IELTS. Our Mansehra office serves students from Mansehra and the surrounding area, and helps you plan the test day in Abbottabad.',
  facts: [['Mansehra', 'Local office for classes and counselling'], ['Abbottabad', 'Nearest IELTS computer test city'], ['Rs 75,600', 'IELTS on computer, Abbottabad (British Council)'], [N, 'Students who have taken IELTS with us']],
  courses: [{ name: 'IELTS Preparation Course Mansehra', desc: 'IELTS preparation for students in Mansehra with a diagnostic test, skill training, timed mocks and feedback on Writing and Speaking.', level: 'Intermediate to Advanced', teaches: 'IELTS Listening, Reading, Writing and Speaking' }],
  sec: [
    { id: 'local', t: 'IELTS classes for Mansehra and nearby towns', nav: 'Local classes', c: p('Our Mansehra office is the closest option if you live in Mansehra city or in nearby towns such as Balakot, Oghi, Shinkiari, Garhi Habibullah or Battagram. Studying locally saves travel time and cost every week, which is where many students lose consistency.') + p('The same programme runs across our Abbottabad and Mansehra offices: level test, skill training, mock tests, and individual feedback. The full syllabus and tracks are on the <a href="ielts-preparation-abbottabad.html">IELTS preparation page</a>. This page explains how the plan fits students who live in Mansehra.') },
    { id: 'profiles', t: 'Study plans for common Mansehra student profiles', nav: 'Student profiles', c: table(['Profile', 'Typical target', 'How we usually plan it'], [
      ['FSc student aiming for a bachelor’s abroad', 'Band 6.0 to 6.5', 'Foundation or Core track, with Writing and Speaking basics early. Start 6 months before applications if possible'],
      ['BS or BSc graduate aiming for a UK, Irish or Australian master’s', 'Band 6.5, often 6.0 minimum per skill', 'Core track, weekly essays and a mock every two weeks. Check the university’s exact per-skill rule first'],
      ['Nurse or health professional', 'Often 7.0 in some skills', 'Advanced track aimed at the regulator’s score. Confirm the score with the registration body before you start'],
      ['Engineer or IT graduate for Canada, Germany or Ireland', 'Band 6.0 to 7.0', 'Target depends on the programme. Skill clinic if one section is weak'],
      ['Working professional studying in the evening', 'Band 6.5', 'Shorter daily practice, weekend mocks, and focus on the weakest skill'],
      ['Student who scored 5.5 or 6.0 and retook', 'One band higher', 'Retake support: analyse the score report, fix repeated error types, then retake or use One Skill Retake']],
      'Targets are typical. Always confirm the exact score on your university, visa or regulator page.') },
    { id: 'daily', t: 'A realistic daily routine for a student in Mansehra', nav: 'Daily routine', c: ol([
      ['Morning, 30 minutes', 'Listening practice with one section or one recording, and correct every error.'],
      ['Midday, 30 minutes', 'Reading: one passage, timed, then review the question types you missed.'],
      ['Evening, 45 minutes', 'Writing: plan, write and check one answer, and keep an error log.'],
      ['Evening, 15 minutes', 'Speaking: record yourself on one topic and listen back.'],
      ['Weekly', 'A full timed section and one mock under real exam time.']]) + p('Two hours a day is a sensible minimum. Power cuts and weak internet are real issues in some areas, so we encourage downloading practice material and doing timed sections offline.') },
    { id: 'testday', t: 'Planning test day when you live in Mansehra', nav: 'Test-day plan', c: p('As of ' + MODTXT + ' British Council Pakistan lists Abbottabad, not Mansehra, as the test city for IELTS on computer, so students from Mansehra normally travel to Abbottabad. Plan the journey in advance.') + chk(['Check your test time and venue on your booking confirmation a few days before', 'Carry the same valid passport or ID you used to book', 'Leave early and allow extra time for traffic, especially in bad weather or winter', 'Consider arriving the evening before if your test starts early', 'Keep your confirmation on your phone and a printed copy', 'Sleep, eat and drink water before the test. Attempt every question, since there is no negative marking']) + p('We can help with booking and payment. See the <a href="ielts-booking-abbottabad-mansehra.html">IELTS booking service</a>.') },
    { id: 'abroad', t: 'IELTS and study abroad in one place', nav: 'Study abroad', c: p('Many students in Mansehra take IELTS because they plan to study abroad. ' + PARENT + ' has an office in Mansehra, so your IELTS plan can be linked to your applications, scholarships and visa. Read the <a href="' + S + 'steps">12-month roadmap</a> and the <a href="' + S + 'scholarships">scholarship calendar</a> to see how IELTS timing fits.') + cta('Book a free level test') }
  ],
  faq: [
    ['Do you offer IELTS classes in Mansehra?', 'Yes, our Mansehra office serves students from Mansehra and nearby areas. Contact us for current batch timings and the level test.'],
    ['Is there an IELTS test centre in Mansehra?', 'As of ' + MODTXT + ' the British Council booking page lists Abbottabad, not Mansehra. Students from Mansehra normally take the test in Abbottabad. Check the booking page for live centres.'],
    ['Can I study in Mansehra and take the test in Abbottabad?', 'Yes. This is the usual route. We help you pick a date and plan the journey.'],
    ['How much is IELTS in Abbottabad?', 'Rs 75,600 for IELTS on computer from 9 June 2026, per British Council Pakistan. Check the live price when you book.'],
    ['I am working. Can I still prepare?', 'Yes, with a smaller daily routine, evening or weekend practice and a focus on the weakest skill. Tell us your working hours at the level test.'],
    ['Do you help with a UK, Australia or Canada application?', 'Yes. ' + PARENT + ' provides free counselling, university applications, scholarships and visa guidance from the Mansehra office.'],
    ['Can I pay for IELTS and a course in instalments?', 'Payment terms for the course are set by the academy, so ask for them in writing. The exam fee is paid under the exam provider’s official instructions.']],
  src: BC_SRC,
  bannerT: 'Start your IELTS plan in Mansehra', bannerP: 'Bring your target score, your exam deadline and any previous IELTS result. We will suggest a track and a test date.'
});

/* ---- BOOKING ---- */
pages.push({
  file: 'ielts-booking-abbottabad-mansehra.html', crumb: 'IELTS test booking',
  title: 'IELTS Test Booking Abbottabad & Mansehra | Fees 2026',
  desc: 'IELTS test booking help for Abbottabad and Mansehra: current British Council fee Rs 75,600, steps, payment routes, retakes, results and scam warnings.',
  h1: 'IELTS test booking in Abbottabad and Mansehra: fees, steps and help',
  lead: 'Choose the right IELTS version, pick a date that leaves time for results, register with matching ID and pay through the official route. We help at every step, and we show you the official fee.',
  facts: [['Rs 75,600', 'IELTS on computer, Abbottabad (from 9 June 2026)'], ['3 days', 'Payment must reach the British Council within 3 days of booking'], ['1–2 days', 'Computer test results'], ['5', 'Free e-TRFs to send to institutions']],
  sec: [
    { id: 'fees', t: 'Official IELTS fees in Pakistan (2026)', nav: 'Fees', c: FEES + note('The exam fee is the British Council’s price. Our booking help is separate from the exam fee. Ask any booking service for a written breakdown of the exam fee and its own service fee before you pay, and pay the exam fee under the exam provider’s official instructions.') },
    { id: 'help', t: 'How our booking service helps', nav: 'What we do', c: ul(['Choose the right version: Academic, General Training, UKVI or Life Skills, based on your university or visa page', 'Check that your ID matches your application, and what to do for under-18 applicants', 'Pick a date and centre that leaves time for results before your deadline', 'Walk you through registration on the official booking site', 'Explain payment routes and the 3-day payment rule', 'Help you add institutions in the Test Taker Portal and send your e-TRF', 'Advise on One Skill Retake or Enquiry on Results if your score is close']) + warn('We cannot guarantee a score or a seat, and we never sell leaked papers or promise a band. IELTS is owned by the British Council, IDP IELTS and Cambridge University Press & Assessment, and we are an independent academy.') },
    { id: 'steps', t: 'Booking steps', nav: 'Steps', c: ol([
      ['Confirm the version you need', 'Academic, General Training, UKVI or Life Skills. Check your university or visa page. A wrong version wastes the fee.'],
      ['Check your ID', 'Use a valid passport or national ID that matches your applications. Under-18 applicants need written consent from a parent or guardian.'],
      ['Choose date and centre', 'British Council Pakistan lists Abbottabad among its cities for IELTS on computer. Leave time for results before your application deadline.'],
      ['Register on the official booking page', 'Use the British Council booking page for computer tests, or the UKVI booking site for UKVI and Life Skills.'],
      ['Pay', 'Online by card, or offline through IBFT, cash deposit at designated bank branches, or bank draft. Cheques are not accepted.'],
      ['Receive confirmation', 'You get an email with time and venue. You can choose your Speaking time from a week before to a week after the main date, if seats are available.']]) + note('Payment must reach the British Council within 3 days of registration and at least 3 days before your first exam session. Offline payments are confirmed the next working day. If you get no confirmation within 48 hours, email your payment proof and registration reference to the British Council.') },
    { id: 'pay', t: 'Payment routes', nav: 'Payment', c: ul(['<b>Offline IBFT.</b> The British Council describes interbank fund transfer as its most economical route.', '<b>Card payment.</b> Card payments in rupees to an international merchant are settled in foreign currency, so the amount on your statement can differ from the listed price.', '<b>Cash deposit or bank draft.</b> Use the exact bank details in the official booking instructions.', '<b>Keep proof.</b> Save the transfer slip and your registration reference until your confirmation arrives.']) },
    { id: 'after', t: 'After the test: results and sending scores', nav: 'Results', c: p('For computer tests, results usually appear in the Test Taker Portal in 1 to 2 days. You can download an electronic Test Report Form (e-TRF) for up to two years. A British Council booking includes five extra e-TRFs that you can send free to institutions. Add institutions in the portal and keep the portal e-TRF, not a screenshot, as your proof.') + table(['Situation', 'Option', 'Cost or deadline'], [
      ['You want to improve one section', 'IELTS One Skill Retake', 'Computer tests only, one section, once per test, within 60 days'],
      ['You think a score is wrong', 'Enquiry on Results', 'Within 6 weeks. Rs 39,650 (computer). Refunded if a section score rises. The score can stay or go up, not down'],
      ['You cannot attend', 'Reschedule or cancel', 'Follow the British Council policy. Fees and deadlines apply']]) },
    { id: 'safe', t: 'Booking scams and what to ask before you pay', nav: 'Avoid scams', c: ul(['Do not pay anyone who promises a guaranteed band, a “leaked” paper or a “paid” score.', 'Never share your portal password or let someone else take your test. Impersonation can lead to a ban.', 'Ask for a written breakdown: exam fee, service fee, and what the service fee covers.', 'Check that you receive an official booking confirmation by email from the exam provider, not just a screenshot.', 'Book directly on the official page if you prefer. A service is only helpful if it saves you time or mistakes.']) }
  ],
  faq: [
    ['How much is IELTS in Abbottabad?', 'British Council Pakistan lists Rs 75,600 for IELTS on computer, effective 9 June 2026, in the group that includes Abbottabad. UKVI is Rs 72,000. Confirm the live price on the booking page.'],
    ['Where can I take IELTS near Mansehra?', 'British Council Pakistan lists Abbottabad. As of ' + MODTXT + ' Mansehra is not listed as a separate IELTS test centre.'],
    ['How do I book IELTS in Abbottabad?', 'Choose the version, register on the British Council booking page, pay through the official route and keep your confirmation. We can walk you through each step.'],
    ['Do you charge for booking help?', 'Contact us for the current service fee and ask for it in writing. The exam fee itself is the British Council’s published price.'],
    ['How early should I book?', 'Book as soon as your mock scores are stable at the target, and leave time for results and a possible retake before your deadline. Seats and dates vary, so check the live calendar.'],
    ['When will I get my IELTS result?', 'For computer tests, usually 1 to 2 days, in the Test Taker Portal.'],
    ['Can I send my result to more than one university?', 'Yes. A British Council booking includes five extra e-TRFs for institutions at no extra charge.'],
    ['What is the difference between IELTS and IELTS for UKVI?', 'UKVI is the same test with extra security, taken at approved centres for UK visa routes that need a Secure English Language Test. Your offer letter or CAS conditions will say if you need it.'],
    ['Can I change my test date?', 'Follow the British Council reschedule and cancellation policy on its site. Fees and deadlines apply.']],
  src: BC_SRC,
  bannerT: 'Not sure which version or date to book?', bannerP: 'Send us your target university or visa and your deadline. We will tell you which version to book and which date works.'
});

/* ---- ENGLISH COURSES ---- */
const LV = [
  ['A1', 'Beginner', 'You know very little English or are starting again.', 'Introduce yourself, ask and answer simple personal questions, understand very basic phrases spoken slowly.', 'Alphabet and sounds, present simple, numbers, everyday vocabulary, simple questions and short sentences.', 'Below IELTS 4.0', '90–100'],
  ['A2', 'Elementary', 'You understand simple English but cannot hold a conversation.', 'Handle simple routine tasks, describe your background and surroundings, shop, ask for directions, talk about work and family.', 'Past and future forms, basic connectors, everyday listening, short emails and messages, confidence in short conversations.', 'Below IELTS 4.0', '180–200'],
  ['B1', 'Intermediate', 'You manage everyday situations but make many mistakes.', 'Deal with most travel and daily situations, write simple connected text, describe experiences and plans and give reasons.', 'Tenses in context, conditionals, longer speaking turns, reading short articles, paragraph writing, listening to clear speech.', 'About IELTS 4.0 to 5.0', '350–400'],
  ['B2', 'Upper-intermediate', 'You speak fairly well and want fluency and accuracy.', 'Interact fluently with native speakers, write clear detailed texts, explain a viewpoint with advantages and disadvantages.', 'Complex grammar, discussion and argument, academic vocabulary, essay writing, listening to lectures and discussions, pronunciation and intonation.', 'About IELTS 5.5 to 6.5', '500–600'],
  ['C1', 'Advanced', 'You are fluent and need precision for study or work.', 'Express ideas fluently and spontaneously, use language flexibly for academic and professional purposes, write well-structured detailed texts on complex topics.', 'Advanced grammar and style, nuance and register, critical reading, extended academic writing, presentations, near-natural spoken fluency.', 'About IELTS 7.0 to 8.0', '700–800']
];
pages.push({
  file: 'english-language-courses-abbottabad-mansehra.html', crumb: 'English language courses',
  title: 'English Language Courses Abbottabad & Mansehra | A1–C1',
  desc: 'Spoken English and English language courses in Abbottabad and Mansehra from beginner (A1) to advanced (C1). Level test, clear outcomes and a path to IELTS.',
  h1: 'English language courses in Abbottabad and Mansehra: beginner to advanced',
  lead: 'Five clear levels based on the Common European Framework (CEFR), from A1 beginner to C1 advanced. Every level has a goal you can test, and the higher levels lead directly into IELTS.',
  facts: [['A1 to C1', 'Five CEFR-based levels'], ['Spoken English', 'Speaking is practised at every level'], ['Level test', 'To place you at the right level'], ['IELTS path', 'B1 and above can move into IELTS']],
  courses: LV.map(l => ({ name: 'English Course ' + l[0] + ' ' + l[1] + ' (Abbottabad and Mansehra)', desc: l[3] + ' Focus: ' + l[4], level: l[0] + ' ' + l[1], teaches: 'English language: speaking, listening, reading, writing, grammar and vocabulary' })),
  sec: [
    { id: 'levels', t: 'The five levels at a glance', nav: 'Levels', c: table(['Level', 'Name', 'After this level you can…', 'Approximate IELTS', 'Typical guided hours (cumulative)'], LV.map(l => ['<b>' + l[0] + '</b>', l[1], l[3], l[5], l[6]]), 'CEFR level descriptions are summarised from the Council of Europe framework. Hours are Cambridge’s general guidance for guided learning, shown as cumulative hours from zero. Real progress depends on practice outside class. IELTS does not test A1 and A2 reliably, so those levels are shown as below 4.0.') },
    { id: 'detail', t: 'What each level covers', nav: 'Level detail', c: '<div class="cols2">' + LV.map(l => '<div class="card"><h3>' + l[0] + ' ' + l[1] + '</h3><p><b>For you if:</b> ' + l[2] + '</p><p><b>Focus:</b> ' + l[4] + '</p><p><b>Goal:</b> ' + l[3] + '</p></div>').join('') + '</div>' },
    { id: 'skills', t: 'Skills in every course', nav: 'Skills', c: cols([
      ['Speaking', ['Short conversations and role plays from day one', 'Pronunciation and stress that make you easy to understand', 'Presentations and discussion at higher levels']],
      ['Listening', ['Graded audio from slow clear speech to natural speed', 'Accents you will meet at university and work', 'Note-taking at B2 and C1']],
      ['Reading and vocabulary', ['Short texts at A1 and A2, articles and academic texts later', 'Word families and collocations, not just word lists', 'Reading strategies for exams']],
      ['Writing and grammar', ['Sentences to paragraphs to essays', 'Grammar taught through use, with correction', 'Emails and professional writing at B1 and above']]]) },
    { id: 'spoken', t: 'Spoken English course', nav: 'Spoken English', c: p('Many students understand English but freeze when they have to speak. Our spoken English work focuses on talking every session: daily-life conversations, interviews, discussion and presentation skills, with correction of pronunciation and common mistakes. It suits students who plan to study or work abroad, and professionals who need confidence in meetings and interviews.') + ul(['Everyday conversation and role play', 'Job interview and university interview practice', 'Fluency drills and pronunciation work', 'Presentations and group discussion', 'Vocabulary for study, work and travel']) },
    { id: 'placement', t: 'How we place you at the right level', nav: 'Placement', c: ol([['Level test', 'A written and speaking test places you on the CEFR scale.'], ['Goal conversation', 'We ask what you need English for: IELTS, study abroad, a job, an interview or everyday confidence.'], ['Recommendation', 'You get a level and a clear next step, including whether to go straight to IELTS.'], ['Progress check', 'We review progress at the end of each level before you move up.']]) + note('Batch timings, course length and fees depend on the level and batch. Contact us for current options and ask for fees in writing with what is included.') },
    { id: 'ielts', t: 'From English course to IELTS', nav: 'Path to IELTS', c: table(['Your level', 'What we usually advise'], [['A1 or A2', 'Take the English course first. IELTS is not a reliable test at this level.'], ['B1', 'Build to B2 with an English course, or start a Foundation IELTS track if your deadline is near and you study daily.'], ['B2', 'Start IELTS preparation. Most students at this level aim for 6.0 to 6.5.'], ['C1', 'IELTS Advanced track for 7.0 and above, with focus on precision and range.']]) + p('See the <a href="ielts-preparation-abbottabad.html">IELTS preparation courses</a> and <a href="ielts-preparation-mansehra.html">IELTS classes in Mansehra</a>.') + cta('Book a free level test') }
  ],
  faq: [
    ['Do you teach English from absolute beginner level?', 'Yes. The A1 course starts with the alphabet, sounds and simple sentences, so you do not need any English to join.'],
    ['How long does it take to move up one level?', 'Cambridge’s general guidance suggests roughly 200 hours of guided learning to move up one CEFR level, so most learners need several months of regular classes per level, plus practice outside class. We confirm the pace for your batch after the level test.'],
    ['Do you offer a spoken English course?', 'Yes. Speaking is practised at every level, and there is a spoken English focus for students who understand English but cannot speak confidently.'],
    ['Is there a course in Mansehra as well as Abbottabad?', 'Yes. We have offices in both cities. Contact us for the current batches in each.'],
    ['Do I need IELTS or an English course first?', 'If your English is below B1 an English course should come first. If you are at B2 or above, IELTS preparation is the better use of time. A level test tells you.'],
    ['Can English courses help me get a visa or university place?', 'Better English improves your chances of meeting the IELTS or PTE requirement, but a course alone does not meet a visa rule. You still need an approved test where one is required.'],
    ['What is CEFR?', 'The Common European Framework of Reference for Languages divides ability into six levels, A1, A2, B1, B2, C1 and C2. Universities and employers use it to describe English ability.'],
    ['Do you teach children or teenagers?', 'Contact us to ask about the current batches and age groups before enrolling.']],
  src: [['Council of Europe: CEFR global scale', 'https://www.coe.int/en/web/common-european-framework-reference-languages/table-1-cefr-3.3-common-reference-levels-global-scale'], ['Cambridge English: how long does it take to learn English', 'https://www.cambridgeenglish.org/learning-english/']],
  bannerT: 'Find your English level today', bannerP: 'Take a level test and get a clear course recommendation for your goal, whether it is IELTS, study abroad, a job or confidence.'
});

/* ---------- write ---------- */
let failed = false;
pages.forEach(pg => { fs.writeFileSync(path.join(ROOT, pg.file), render(pg)); console.log('wrote ' + pg.file + ' (' + pg.sec.length + ' sections, ' + (pg.faq || []).length + ' FAQs)'); });
if (DOMAIN) {
  const urls = ['index.html'].concat(pages.map(x => x.file));
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls.map(u => '  <url><loc>' + DOMAIN + '/' + (u === 'index.html' ? '' : u) + '</loc><lastmod>' + MOD + '</lastmod></url>').join('\n') + '\n</urlset>\n');
  fs.writeFileSync(path.join(ROOT, 'robots.txt'), 'User-agent: *\nAllow: /\n\nSitemap: ' + DOMAIN + '/sitemap.xml\n');
  console.log('wrote sitemap.xml and robots.txt for ' + DOMAIN);
} else {
  fs.writeFileSync(path.join(ROOT, 'robots.txt'), 'User-agent: *\nAllow: /\n');
  console.log('\n!! domain is empty in academy.config.json: canonical tags, sitemap.xml and absolute schema URLs were skipped.');
}
['phone', 'whatsapp', 'email'].forEach(k => { if (!cfg[k]) console.log('!! ' + k + ' is empty: buttons fall back to the offices section and it is left out of the schema.'); });
(cfg.offices || []).forEach(o => { if (!o.address) console.log('!! ' + o.city + ' address is empty (important for local SEO and Google Maps).'); });
