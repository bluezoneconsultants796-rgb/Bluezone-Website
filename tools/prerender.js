/* BlueZone: turns every "#/..." page of the single-page app into a real, crawlable HTML file.
   Google cannot index "#/" routes, so each country guide, step, IELTS page, essentials guide, blog article,
   the blog index and the contact page get their own file, title, description, canonical URL and structured data.

   Needs Node + Playwright:   npm i playwright && npx playwright install chromium
   (or set CHROME_PATH to an existing Chrome/Chromium and use `npm i playwright-core`)
   Run from the site folder:  node tools/prerender.js
   Then run:                  node build-academy.js     (rebuilds sitemap.xml + js/site-config.js)
   Page text lives in js/main.js, js/destinations-new.js and js/pages-*.js. URLs live in js/routes.js. */
const fs = require('fs'), path = require('path'), { pathToFileURL } = require('url');
let pw; try { pw = require('playwright'); } catch (e) { pw = require('playwright-core'); }
const R = require('../js/routes.js');

const ROOT = path.resolve(__dirname, '..');
process.chdir(ROOT);
const cfg = JSON.parse(fs.readFileSync('academy.config.json', 'utf8'));
const DOM = (cfg.domain || 'https://bluezoneconsultants.com').replace(/\/+$/, '');
const MOD = cfg.dateModified || new Date().toISOString().slice(0, 10);
const BRAND = 'BlueZone Consultants';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const strip = s => String(s).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
function cut(s, n) { s = strip(s); if (s.length <= n) return s; var t = s.slice(0, n - 1); t = t.slice(0, t.lastIndexOf(' ')); return t.replace(/[,;:\s]+$/, '') + '…'; }

/* ---------- countries: name used in titles + words people type into Google ---------- */
const COUNTRIES = [
  ['uk', 'UK', 'the UK', 'uk', 'united kingdom britain british england scotland wales london uk student visa chevening'],
  ['australia', 'Australia', 'Australia', 'p/australia', 'australia aus sydney melbourne perth oshc'],
  ['canada', 'Canada', 'Canada', 'p/canada', 'canada canadian toronto vancouver study permit sds pgwp'],
  ['usa', 'USA', 'the USA', 'p/usa', 'usa us united states america american f-1 f1 visa'],
  ['new-zealand', 'New Zealand', 'New Zealand', 'p/new-zealand', 'new zealand nz auckland'],
  ['ireland', 'Ireland', 'Ireland', 'p/ireland', 'ireland irish dublin eu'],
  ['malaysia', 'Malaysia', 'Malaysia', 'p/malaysia', 'malaysia kuala lumpur student pass'],
  ['china', 'China', 'China', 'p/china', 'china chinese csc scholarship guangxi beijing x1 visa'],
  ['uae', 'Dubai & UAE', 'Dubai and the UAE', 'p/uae', 'dubai uae emirates abu dhabi sharjah united arab emirates'],
  ['italy', 'Italy', 'Italy', 'p/italy', 'italy italian dsu scholarship rome milan'],
  ['france', 'France', 'France', 'p/france', 'france french campus france paris'],
  ['south-korea', 'South Korea', 'South Korea', 'p/south-korea', 'south korea korean seoul gks d-2'],
  ['cyprus', 'Cyprus', 'Cyprus', 'p/cyprus', 'cyprus european cyprus nicosia eu degree'],
  ['lithuania', 'Lithuania', 'Lithuania', 'p/lithuania', 'lithuania baltic vilnius eu']
];
const CBY = {}; COUNTRIES.forEach(c => CBY[R.file('#/' + c[3])] = c);

const KW = {
  'p/steps': 'steps roadmap timeline how to study abroad', 'p/why-study-abroad': 'why benefits pros cons',
  'p/where-what-study': 'choose country course subject', 'p/how-apply': 'apply application admission',
  'p/documents': 'documents attestation hec ibcc mofa apostille transcript', 'p/after-offer': 'offer acceptance deposit cas coe i-20',
  'p/prepare-depart': 'depart flight packing checklist', 'p/arrive-thrive': 'arrive first month settle',
  'p/destinations': 'countries compare destinations', 'p/courses': 'course subject programme degree',
  'p/course-advice': 'course advice career subject choose', 'p/scholarships': 'scholarship funding chevening fulbright csc gks hec',
  'p/universities': 'university college verify list', 'p/rankings': 'ranking qs the world ranking',
  'p/ielts': 'ielts fees test pakistan band', 'p/what-is-ielts': 'ielts format academic general ukvi', 'p/ielts-prep': 'ielts preparation study plan tips',
  'p/book-test': 'book ielts test registration british council idp', 'p/english-tests': 'ielts pte toefl duolingo compare',
  'p/essentials': 'essentials loan insurance banking sim', 'p/education-loan': 'education loan financing emi qarz',
  'p/health-insurance': 'health insurance ihs oshc', 'p/money-transfer': 'money transfer tuition swift remittance',
  'p/accommodation': 'accommodation housing rent hostel', 'p/banking': 'bank account student banking', 'p/guardianship': 'guardian minor under 18',
  'p/sim-card': 'sim card mobile number esim', 'contact': 'contact book counselling free session phone whatsapp office', 'blog': 'blog articles news advice'
};
/* hand-tuned search titles (keep near 60 characters); anything not listed uses the page's own title */
const TITLES = {
  'p/why-study-abroad': 'Why Study Abroad? Costs, Benefits and Trade-offs | BlueZone',
  'p/where-what-study': 'Where and What to Study Abroad: Pick Country and Course | BlueZone',
  'p/how-apply': 'How to Apply to a Foreign University from Pakistan | BlueZone',
  'p/documents': 'Document Attestation for Study Abroad from Pakistan | BlueZone',
  'p/education-loan': 'Education Loan for Studying Abroad from Pakistan | BlueZone',
  'p/money-transfer': 'Send Tuition and Living Costs Abroad from Pakistan | BlueZone',
  'p/banking': 'Open a Bank Account as a Pakistani Student Abroad | BlueZone',
  'p/destinations': 'Study Abroad Destinations for Pakistani Students | BlueZone',
  'p/steps': 'Study Abroad Steps: 12-Month Roadmap for Pakistan | BlueZone',
  'p/what-is-ielts': 'What Is IELTS? Format, Bands, Academic vs General | BlueZone',
  'p/scholarships': 'Scholarships for Pakistani Students 2027 | BlueZone',
  'p/guardianship': 'Guardianship for Students Under 18 Abroad | BlueZone',
  'p/student-health-insurance': '',
  'p/health-insurance': 'Student Health Insurance Abroad: IHS, OSHC, UHIP | BlueZone',
  'p/course-advice': 'Course Advice: Pick a Subject That Fits Your Career | BlueZone',
  'p/universities': 'How to Verify a University Abroad | BlueZone',
  'p/essentials': 'Student Essentials: Loans, Insurance, Banking, SIM | BlueZone',
  'p/courses': 'Find a Course Abroad: Subject, University, Country | BlueZone',
  'p/ielts': 'IELTS in Pakistan: Fees, Format, Scores and Booking | BlueZone',
  'p/rankings': 'University Rankings Explained: QS, THE and How to Use Them | BlueZone',
  'p/english-tests': 'IELTS vs PTE vs TOEFL: Which Test Should You Take? | BlueZone'
};
const POPULAR = new Set(['uk', 'canada', 'australia', 'usa', 'italy', 'p/ielts', 'p/scholarships', 'p/steps']);

/* ---------- html helpers ---------- */
const idx = fs.readFileSync('index.html', 'utf8');
const cut2 = (a, b, inc) => idx.slice(idx.indexOf(a), idx.indexOf(b, idx.indexOf(a)) + (inc || 0));
const sym = idx.slice(idx.indexOf('<svg width="0"'), idx.indexOf('</svg>') + 6);
const head = cut2('<div class="top">', '</header>', 9);
const foot = cut2('<footer>', '</footer>', 9);
const fl = cut2('<div class="fl">', '</div>', 6);

/* rewrite only <a href>; never <use href="#icon"> */
function rw(h, ids) {
  return h.replace(/(<a\b[^>]*?\shref=")(#[^"]*)"/g, function (m, pre, a) {
    var f = R.file(a);
    if (a.indexOf('#/') === 0) return f ? pre + f + '"' : m;
    if (a === '#' || a === '#home') return pre + 'index.html"';
    var id = a.slice(1);
    if (ids && ids.has(id)) return m;                                   /* in-page anchor that exists on this page */
    return pre + 'index.html' + a + '"';                                 /* #offices, #dest ... live on the home page */
  });
}
/* highlight the top-level menu item that contains the current page */
function markNav(h, file) {
  return h.replace(/<nav>([\s\S]*?)<\/nav>/, function (m, inner) {
    return '<nav>' + inner.split('<div><a ').map(function (x, i) {
      if (!i) return x;
      var own = (x.match(/^href="([^"]*)"/) || [])[1], on = own === file || x.indexOf('href="' + file + '"') > -1;
      return '<div><a ' + (on ? 'class="cur" aria-current="page" ' : '') + x;
    }).join('') + '</nav>';
  });
}

function relatedCountries(file) {
  var me = CBY[file];
  return '<section class="alt"><div class="w"><h2>Explore other study destinations</h2><div class="relc">' +
    COUNTRIES.filter(c => c !== me).map(c => '<a href="' + R.file('#/' + c[3]) + '">Study in ' + c[1] + '<small>Visa, costs and scholarships</small></a>').join('') + '</div></div></section>';
}
function helpBlock(c) {
  var n = c[2];
  return '<section id="bluezone-help"><div class="w"><h2>Study in ' + c[1] + ' with BlueZone Consultants</h2>' +
    '<div class="two" style="align-items:center"><div><p>BlueZone Consultants guides students from Abbottabad, Mansehra, Hazara and across Pakistan through every stage of a ' + esc(c[1]) + ' application: choosing the course and university, checking documents and attestation, preparing the offer and visa file, then planning money, housing and arrival.</p>' +
    '<p>Your first counselling session is free. Bring your transcripts, passport and English test result if you have one, and we will tell you honestly whether ' + esc(n) + ' fits your grades and budget.</p></div>' +
    '<div class="card"><h3>Check your options for ' + esc(c[1]) + '</h3><p>Talk to a counsellor, then use the guides below to prepare.</p><div class="pills"><a href="contact.html">Book free counselling</a><a href="' + R.file('#/p/ielts') + '">IELTS in Pakistan</a><a href="' + R.file('#/p/scholarships') + '">Scholarships</a><a href="' + R.file('#/p/documents') + '">Documents and attestation</a></div></div></div></div></section>';
}

function pageHtml(o) {
  var url = DOM + '/' + o.file, title = o.title, desc = o.desc, body = o.body;
  var ids = new Set(); (body.match(/\sid="([^"]+)"/g) || []).forEach(x => ids.add(x.slice(5, -1)));
  body = rw(body, ids);
  var fq = (o.faq || []).filter(q => q[0] && q[1]);
  var org = { '@type': 'EducationalOrganization', '@id': DOM + '/#org', name: BRAND, url: DOM + '/', logo: DOM + '/images/logo.png' };
  var crumbs = [{ n: BRAND, u: DOM + '/' }].concat(o.crumbs || []).concat([{ n: o.crumb || o.h1, u: url }]);
  var node = o.kind === 'article'
    ? { '@type': 'Article', '@id': url + '#page', headline: o.h1, description: desc, mainEntityOfPage: url, url: url, inLanguage: 'en', datePublished: o.iso || MOD, dateModified: o.iso || MOD, articleSection: o.section, image: DOM + '/images/hero.jpg', author: { '@type': 'Organization', name: BRAND }, publisher: { '@id': DOM + '/#org' } }
    : { '@type': o.ldType || 'WebPage', '@id': url + '#page', name: o.h1, description: desc, url: url, inLanguage: 'en', dateModified: MOD, isPartOf: { '@id': DOM + '/#site' }, publisher: { '@id': DOM + '/#org' } };
  if (o.about) node.about = { '@type': 'Country', name: o.about };
  var graph = [org, { '@type': 'WebSite', '@id': DOM + '/#site', url: DOM + '/', name: BRAND, publisher: { '@id': DOM + '/#org' }, inLanguage: 'en' }, node,
    { '@type': 'BreadcrumbList', itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.n, item: c.u })) }];
  if (fq.length) graph.push({ '@type': 'FAQPage', mainEntity: fq.map(q => ({ '@type': 'Question', name: q[0], acceptedAnswer: { '@type': 'Answer', text: q[1] } })) });
  var scripts = (o.needsContent ? '<script src="js/content.js" defer></script>' : '') + '<script src="js/static.js" defer></script><script src="js/pro.js" defer></script>';
  var mainOpen = '<main id="' + (o.mainId || 'p-page') + '">', mainClose = '</main>';
  var inner = o.mainId ? body : '<div id="pg">' + body + '</div>';
  var h = '<!DOCTYPE html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">' +
    '<title>' + esc(title) + '</title><meta name="description" content="' + esc(desc) + '"><link rel="canonical" href="' + url + '">' +
    '<meta name="robots" content="index,follow,max-image-preview:large"><meta name="theme-color" content="#2b2d91"><meta name="author" content="' + BRAND + '">' +
    '<meta property="og:type" content="' + (o.kind === 'article' ? 'article' : 'website') + '"><meta property="og:locale" content="en_PK"><meta property="og:site_name" content="' + BRAND + '"><meta property="og:title" content="' + esc(title) + '"><meta property="og:description" content="' + esc(desc) + '"><meta property="og:url" content="' + url + '"><meta property="og:image" content="' + DOM + '/images/hero.jpg">' +
    '<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="' + esc(title) + '"><meta name="twitter:description" content="' + esc(desc) + '">' +
    '<link rel="icon" href="images/logo.png"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800&family=Inter:wght@400;500;600&display=swap"><link rel="stylesheet" href="css/style.css"><link rel="stylesheet" href="css/pro.css">' +
    '<script type="application/ld+json">' + JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }) + '</script>' +
    '<script src="js/routes.js"></script><script src="js/site-config.js"></script></head><body>' +
    sym + rw(markNav(head, o.file), ids) + mainOpen + inner + mainClose + rw(foot, ids) + rw(fl, ids) + scripts + '</body></html>';
  return h;
}

function sanitize() {      /* run inside the browser before the HTML is copied out */
  document.querySelectorAll('.rv,.in,.rv2').forEach(function (e) { e.classList.remove('rv', 'in', 'rv2'); if (!e.getAttribute('class')) e.removeAttribute('class'); });
  document.querySelectorAll('[style*="transition-delay"]').forEach(function (e) { e.style.transitionDelay = ''; if (!e.getAttribute('style')) e.removeAttribute('style'); });
}

(async () => {
  const exe = process.env.CHROME_PATH || undefined;
  const b = await pw.chromium.launch(exe ? { executablePath: exe, args: ['--no-sandbox'] } : {});
  const pg = await b.newPage({ viewport: { width: 1366, height: 900 } });
  const appUrl = n => pathToFileURL(path.resolve('index.html')).href + '?nr=1&r=' + n;
  let n = 0;
  async function open(hash) { await pg.goto(appUrl(++n) + hash); await pg.waitForTimeout(250); }

  await open('#/home');
  const meta = await pg.evaluate(() => ({
    P: Object.keys(window.P), G: Object.keys(window.G), hubOf: (() => { var m = {}; Object.keys(window.G).forEach(g => (window.G[g][1] || []).forEach(k => m[k] = g)); return m })(),
    gTitle: (() => { var m = {}; Object.keys(window.G).forEach(g => m[g] = window.G[g][0]); return m })(),
    X: (() => { var m = {}; Object.keys(window.X).forEach(k => m[k] = { t: window.X[k].t, m: window.X[k].m }); return m })(),
    A: window.A.map(a => ({ s: a.s, c: a.c, d: a.d, r: a.r, t: a.t, x: a.x, iso: a.iso, q: a.b.filter(p => typeof p === 'string').join(' ').slice(0, 1500) }))
  }));

  const out = [], search = [];
  const write = (o) => { fs.writeFileSync(o.file, pageHtml(o)); out.push(o.file); console.log('wrote', o.file.padEnd(52), String(o.title.length).padStart(3) + ' title chars,', String(o.desc.length).padStart(3) + ' desc chars,', (o.faq || []).length + ' FAQs'); };

  /* ----- content pages: countries, steps, IELTS, courses, essentials, hubs ----- */
  const pageKeys = [...new Set(['uk', ...meta.P.filter(k => k !== 'uk'), ...meta.G])];
  for (const k of pageKeys) {
    const route = k === 'uk' ? 'uk' : 'p/' + k, file = R.file('#/' + route);
    if (!file) { console.log('!! no URL in js/routes.js for', route); continue; }
    await open('#/' + route); await pg.waitForSelector('#pg h1');
    await pg.evaluate(sanitize);
    const body = await pg.$eval('#pg', e => e.innerHTML);
    const faq = await pg.$$eval('#pg details', ds => ds.map(d => [d.querySelector('summary').textContent.trim(), d.querySelector('p') ? d.querySelector('p').textContent.trim() : '']));
    const h1 = await pg.$eval('#pg h1', e => e.textContent.trim());
    const xk = k === 'uk' ? 'uk' : k, xm = meta.X[xk] || {};
    const c = CBY[file], hubKey = meta.hubOf[k];
    let title, desc, crumbs = [], crumb, kind = 'WebPage', about = null, section = null;
    if (c) {
      title = 'Study in ' + c[1] + ' from Pakistan 2026: Visa & Fees | BlueZone';
      desc = cut('Study in ' + c[1] + ' from Pakistan: visa steps, 2026 costs, scholarships, top universities and work rights. Free counselling with ' + BRAND + '.', 160);
      crumbs = [{ n: 'Study destinations', u: DOM + '/' + R.file('#/p/destinations') }]; crumb = 'Study in ' + c[1]; about = c[1];
    } else {
      const base = strip(xm.t || h1);
      title = TITLES['p/' + k] || (base.length > 52 ? base.slice(0, 52).replace(/\s+\S*$/, '') : base) + ' | BlueZone';
      desc = cut(xm.m || h1, 158);
      if (hubKey && R.file('#/p/' + hubKey)) crumbs = [{ n: meta.gTitle[hubKey], u: DOM + '/' + R.file('#/p/' + hubKey) }];
      crumb = base.split(':')[0];
      if (meta.G.indexOf(k) > -1) kind = 'CollectionPage';
    }
    let html = body;
    if (c) html += helpBlock(c) + relatedCountries(file);
    const needsContent = /data-wg=|data-go=/.test(html);
    write({ file, title, desc, body: html, faq, h1, crumbs, crumb, about, ldType: kind, needsContent });
    search.push({ t: c ? 'Study in ' + c[1] : (strip(xm.t || h1).split(':')[0]), u: file, d: desc, k: (c ? c[4] + ' study abroad from pakistan' : (KW[route] || '')), g: c ? 'Study destination' : (meta.G.indexOf(k) > -1 || /ielts|english-tests|book-test/.test(k) ? (/ielts|english-tests|book-test/.test(k) ? 'IELTS guide' : 'Guide hub') : (hubKey === 'essentials' ? 'Student essentials' : hubKey === 'steps' ? 'Study abroad step' : 'Guide')), p: POPULAR.has(route) ? 1 : 0 });
  }

  /* ----- blog articles ----- */
  const blogHub = R.file('#/blog');
  for (const a of meta.A) {
    const file = R.file('#/blog/' + a.s);
    if (!file) { console.log('!! no URL in js/routes.js for blog/' + a.s); continue; }
    await open('#/blog/' + a.s); await pg.waitForSelector('#ar h1');
    await pg.evaluate(sanitize);
    const body = await pg.$eval('#p-article', e => e.innerHTML);
    const iso = a.iso || (cfg.dateModified);
    write({ file, kind: 'article', mainId: 'p-article', title: cut(a.t, 62) + ' | BlueZone', desc: cut(a.x.length < 120 ? a.x + ' Written for Pakistani students by BlueZone Consultants.' : a.x, 158), body, faq: [], h1: a.t, crumb: a.t, crumbs: [{ n: 'Blog', u: DOM + '/' + blogHub }], iso: a.iso, section: a.c });
    search.push({ t: a.t, u: file, d: a.x, k: a.c + ' article blog', g: 'Article', p: 0 });
  }

  /* ----- blog index ----- */
  await open('#/blog'); await pg.waitForSelector('#bg .bc');
  const cats = meta.A.reduce((m, a) => (m[a.c] = 1, m), {});
  const bySlug = {}; meta.A.forEach(a => bySlug[R.file('#/blog/' + a.s)] = a);
  await pg.evaluate(sanitize);
  let blogBody = await pg.$eval('#p-blog', e => e.innerHTML);
  blogBody = blogBody.replace(/<a class="card bc" href="([^"]+)"><small>([^<]*)<\/small>/g, (m, href, cat) => { var f = R.file(href), a = f && bySlug[f]; return '<a class="card bc" href="' + href + '" data-c="' + esc(cat) + '" data-q="' + esc(a ? a.q : '') + '"><small>' + cat + '</small>'; });
  write({ file: blogHub, mainId: 'p-blog', ldType: 'Blog', title: 'Study Abroad Advice for Pakistani Students: Visas, IELTS, Scholarships | BlueZone', desc: 'Practical, sourced articles for Pakistani students: IELTS fees, HEC attestation, visa changes, scholarships, statements of purpose and life abroad.', body: blogBody, faq: [], h1: 'Study abroad advice, written for Pakistani students', crumb: 'Blog' });
  search.push({ t: 'Blog: study abroad advice', u: blogHub, d: 'Guides on applications, tests, visas, funding and life abroad.', k: KW.blog, g: 'Articles', p: 0 });

  /* ----- contact ----- */
  await open('#/contact'); await pg.waitForSelector('#cform');
  await pg.evaluate(sanitize);
  const contactBody = await pg.$eval('#p-contact', e => e.innerHTML);
  write({ file: R.file('#/contact'), mainId: 'p-contact', ldType: 'ContactPage', title: 'Contact BlueZone Consultants: Free Study Abroad Counselling in Pakistan', desc: 'Book free study abroad counselling with BlueZone Consultants. Offices in Mansehra and Abbottabad, with support for the UK, Canada, Australia, USA, Europe, Dubai and China.', body: contactBody, faq: [], h1: 'Book free counselling', crumb: 'Contact' });
  search.push({ t: 'Contact and free counselling', u: R.file('#/contact'), d: 'Book a free counselling session with BlueZone Consultants.', k: KW.contact, g: 'Contact', p: 0 });

  /* ----- 404 ----- */
  fs.writeFileSync('404.html', pageHtml({ file: '404.html', title: 'Page not found | BlueZone Consultants', desc: 'This page does not exist. Search BlueZone for a country, IELTS, scholarships or study abroad guides.', h1: 'Page not found', crumb: 'Not found', mainId: 'p-404',
    body: '<div class="hero" style="padding:70px 0 90px"><div class="w" style="grid-template-columns:1fr"><div><h1 style="font-size:42px">We could not find that page</h1><p>The link may be old or mistyped. Search for what you need, or open a popular guide.</p><p><button class="btn" type="button" data-search>Search the site</button> <a class="btn o" href="index.html">Go to the home page</a></p></div></div></div>' +
      '<section><div class="w"><h2>Popular guides</h2><div class="relc">' + COUNTRIES.slice(0, 5).map(c => '<a href="' + R.file('#/' + c[3]) + '">Study in ' + c[1] + '<small>Visa, costs and scholarships</small></a>').join('') + '<a href="' + R.file('#/p/ielts') + '">IELTS in Pakistan<small>Fees, format and booking</small></a><a href="' + R.file('#/p/scholarships') + '">Scholarships<small>Calendar and how to apply</small></a></div></div></section>' }).replace('content="index,follow,max-image-preview:large"', 'content="noindex,follow"'));
  console.log('wrote 404.html');

  /* ----- academy pages go into search + sitemap too ----- */
  const academy = ['academy.html', 'ielts-preparation-abbottabad.html', 'ielts-preparation-mansehra.html', 'ielts-booking-abbottabad-mansehra.html', 'english-language-courses-abbottabad-mansehra.html'];
  academy.forEach(f => {
    if (!fs.existsSync(f)) return;
    const s = fs.readFileSync(f, 'utf8'), t = (s.match(/<title>([^<]*)/) || [])[1] || f, d = (s.match(/<meta name="description" content="([^"]*)/) || [])[1] || '';
    search.push({ t: t.split('|')[0].trim(), u: f, d: d.replace(/&amp;/g, '&').replace(/&quot;/g, '"'), k: 'ielts academy abbottabad mansehra english course preparation classes level test', g: 'IELTS Academy', p: /^academy|ielts-preparation-abbottabad/.test(f) ? 1 : 0 });
  });
  const order = { 'Study destination': 0, 'IELTS Academy': 1, 'IELTS guide': 2, 'Guide hub': 3, 'Study abroad step': 4, 'Student essentials': 5, 'Guide': 6, 'Contact': 7, 'Articles': 8, 'Article': 9 };
  search.sort((a, b) => (order[a.g] ?? 9) - (order[b.g] ?? 9));
  fs.writeFileSync('js/search-index.js', '/* Generated by tools/prerender.js. Do not edit by hand. */\nwindow.BZS=' + JSON.stringify(search) + ';\n');
  if (!fs.existsSync('js/site-config.js')) fs.writeFileSync('js/site-config.js', 'window.BZC={};\n');

  fs.writeFileSync('sitemap-extra.json', JSON.stringify(out));
  await b.close();
  console.log('\nDone: ' + out.length + ' pages + 404.html + js/search-index.js (' + search.length + ' entries). Now run: node build-academy.js');
})();
