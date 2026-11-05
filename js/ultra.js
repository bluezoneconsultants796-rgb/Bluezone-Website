/* BlueZone ULTRA layer. Runs on every page after pro.js.
   1 cinematic photo banners   2 destination cards with photos   3 thumbnails on blog/guide cards
   4 article featured image    5 home destination ribbon          6 reveal / parallax / counters / magnetic buttons
   Photos: images/photos/<key>.jpg  (run tools/get-photos.js once to download them). Missing photo = animated scene. */
(function () {
  'use strict';
  var d = document, reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  var PH = 'images/photos/';
  d.documentElement.setAttribute('data-theme', 'light'); /* site is always light, on every device */

  /* ---------- keys ---------- */
  var COUNTRIES = {
    'uk': ['United Kingdom', 'UK', 'study-in-uk'], 'australia': ['Australia', 'Australia', 'study-in-australia'],
    'canada': ['Canada', 'Canada', 'study-in-canada'], 'usa': ['United States', 'USA', 'study-in-usa'],
    'new-zealand': ['New Zealand', 'New Zealand', 'study-in-new-zealand'], 'ireland': ['Ireland', 'Ireland', 'study-in-ireland'],
    'malaysia': ['Malaysia', 'Malaysia', 'study-in-malaysia'], 'china': ['China', 'China', 'study-in-china'],
    'uae': ['Dubai', 'Dubai & UAE', 'study-in-dubai-uae'], 'italy': ['Italy', 'Italy', 'study-in-italy'],
    'france': ['France', 'France', 'study-in-france'], 'korea': ['South Korea', 'South Korea', 'study-in-south-korea'],
    'cyprus': ['Cyprus', 'Cyprus', 'study-in-cyprus'], 'lithuania': ['Lithuania', 'Lithuania', 'study-in-lithuania']
  };
  /* sky top, sky bottom, accent, style (city | hills | sea) */
  var PAL = {
    uk: ['#1b2a63', '#c9d4ee', '#e0334c', 'city'], australia: ['#0b5d8f', '#ffc98a', '#ff8a3d', 'sea'],
    canada: ['#26456e', '#f5c9c0', '#e63946', 'hills'], usa: ['#14275f', '#b9c8ea', '#d62839', 'city'],
    'new-zealand': ['#0f4c5c', '#cfe8d5', '#2a9d8f', 'hills'], ireland: ['#0f5132', '#cfe9c7', '#2e9e5b', 'hills'],
    malaysia: ['#10306b', '#ffd27a', '#f4a300', 'city'], china: ['#5a0f1b', '#ffb88a', '#e63946', 'city'],
    uae: ['#2b1b4f', '#ffbf7a', '#e9a61a', 'city'], italy: ['#1f3d2b', '#f7dba7', '#c0392b', 'hills'],
    france: ['#16255c', '#e3d7f2', '#e63946', 'city'], korea: ['#1a2350', '#ffc2d1', '#e63946', 'city'],
    cyprus: ['#0b4f7a', '#bfe6f5', '#f4a300', 'sea'], lithuania: ['#1d3b2a', '#f5e2a9', '#e9a61a', 'hills'],
    ielts: ['#1f2170', '#9db4ff', '#e9a61a', 'city'], visa: ['#18235c', '#a8c0f5', '#e9a61a', 'city'],
    scholarship: ['#3a1f70', '#ffd9a0', '#e9a61a', 'hills'], money: ['#0f3d3e', '#b7e4d0', '#e9a61a', 'city'],
    health: ['#0b4f6c', '#c5ecf2', '#2ec4b6', 'hills'], housing: ['#2b2d91', '#ffd9a0', '#e9a61a', 'city'],
    sim: ['#1b1f6b', '#9fd0ff', '#e9a61a', 'city'], university: ['#21265f', '#e6d9b8', '#e9a61a', 'city'],
    course: ['#2b2d91', '#c7d2ff', '#e9a61a', 'city'], journey: ['#2b2d91', '#ffdca0', '#e9a61a', 'hills'],
    blog: ['#1f2170', '#c9d1ff', '#e9a61a', 'city'], contact: ['#2b2d91', '#ffd9a0', '#e9a61a', 'city'],
    academy: ['#1f2170', '#ffd9a0', '#e9a61a', 'city'], home: ['#2b2d91', '#ffd9a0', '#e9a61a', 'city']
  };

  function keyFor(s) {
    s = (s || '').toLowerCase().replace(/^.*\//, '').replace(/[#?].*$/, '').replace(/\.html$/, '');
    s = s.replace(/-from-(mansehra|abbottabad|kpk)$/, '');
    if (/^study-abroad-consultants/.test(s)) return 'contact';
    var m = s.match(/^study-in-(.+)$/);
    if (m) { var c = { 'dubai-uae': 'uae', 'south-korea': 'korea' }[m[1]] || m[1]; if (COUNTRIES[c]) return c; }
    if (/^study-destinations/.test(s)) return 'journey';
    if (/ielts|pte|toefl|english|academy|abbottabad|mansehra/.test(s)) return /academy|abbottabad|mansehra/.test(s) && !/ielts/.test(s) ? 'academy' : 'ielts';
    if (/visa|document|attest|hec|guardian/.test(s)) return 'visa';
    if (/scholar|chevening/.test(s)) return 'scholarship';
    if (/loan|money|bank|fees/.test(s)) return 'money';
    if (/insurance|health/.test(s)) return 'health';
    if (/accommodation|housing/.test(s)) return 'housing';
    if (/sim-card/.test(s)) return 'sim';
    if (/universit|ranking/.test(s)) return 'university';
    if (/course|where-and-what|statement|sop/.test(s)) return 'course';
    if (/^blog($|-)/.test(s)) return /graduate|first-month/.test(s) ? 'journey' : 'blog';
    if (/contact/.test(s)) return 'contact';
    if (/essentials/.test(s)) return 'housing';
    return 'journey';
  }

  /* ---------- generated scene (fallback when no photo) ---------- */
  function rng(seed) { var t = seed; return function () { t |= 0; t = t + 0x6D2B79F5 | 0; var r = Math.imul(t ^ t >>> 15, 1 | t); r = r + Math.imul(r ^ r >>> 7, 61 | r) ^ r; return ((r ^ r >>> 14) >>> 0) / 4294967296; }; }
  function hash(s) { var h = 7; for (var i = 0; i < s.length; i++) h = h * 31 + s.charCodeAt(i) | 0; return h; }
  function layer(r, kind, y, hmin, hmax, fill, op) {
    var p = '', x = -120;
    if (kind === 'city') {
      p = 'M-120 700';
      while (x < 1800) { var w = 40 + r() * 90, h = hmin + r() * (hmax - hmin); p += 'L' + x + ' ' + (y - h) + 'L' + (x + w) + ' ' + (y - h); x += w; }
      p += 'L' + x + ' 700Z';
    } else {
      p = 'M-120 700L-120 ' + y;
      while (x < 1800) { var w2 = 160 + r() * 240, h2 = hmin + r() * (hmax - hmin); p += 'Q' + (x + w2 / 2) + ' ' + (y - h2) + ' ' + (x + w2) + ' ' + y; x += w2; }
      p += 'L' + x + ' 700Z';
    }
    return '<path d="' + p + '" fill="' + fill + '" opacity="' + op + '"/>';
  }
  var sceneCache = {};
  function scene(key) {
    return '';
    if (sceneCache[key]) return sceneCache[key];
    var P = PAL[key] || PAL.journey, r = rng(hash(key)), id = 'g' + hash(key).toString(36).replace('-', 'n');
    var kind = P[3] === 'sea' ? 'hills' : P[3], stars = '', i;
    for (i = 0; i < 26; i++) stars += '<circle class="sc-st" cx="' + (r() * 1600 | 0) + '" cy="' + (r() * 260 | 0) + '" r="' + (1 + r() * 1.6).toFixed(1) + '" fill="#fff" style="animation-delay:-' + (r() * 4).toFixed(1) + 's"/>';
    var svg = '<svg viewBox="0 0 1600 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + P[0] + '"/><stop offset="1" stop-color="' + P[1] + '"/></linearGradient>' +
      '<radialGradient id="' + id + 's"><stop offset="0" stop-color="' + P[2] + '" stop-opacity=".95"/><stop offset="1" stop-color="' + P[2] + '" stop-opacity="0"/></radialGradient></defs>' +
      '<rect width="1600" height="700" fill="url(#' + id + ')"/>' + stars +
      '<circle cx="' + (900 + r() * 400 | 0) + '" cy="300" r="220" fill="url(#' + id + 's)"/>' +
      '<circle cx="' + (1000 + r() * 300 | 0) + '" cy="290" r="62" fill="' + P[2] + '" opacity=".9"/>' +
      '<g class="sc-cl"><ellipse cx="200" cy="150" rx="120" ry="22" fill="#fff" opacity=".22"/><ellipse cx="270" cy="136" rx="80" ry="18" fill="#fff" opacity=".22"/></g>' +
      '<g class="sc-cl2"><ellipse cx="0" cy="230" rx="150" ry="24" fill="#fff" opacity=".16"/></g>' +
      '<g class="sc-l2">' + layer(r, kind, 520, 60, 180, P[0], .55) + '</g>' +
      '<g class="sc-l1">' + layer(r, kind, 600, 50, 150, '#0d0f33', .75) + '</g>' +
      (P[3] === 'sea' ? '<rect y="560" width="1600" height="140" fill="' + P[0] + '" opacity=".55"/>' : '') +
      '<rect y="640" width="1600" height="60" fill="#0a0c2d" opacity=".6"/></svg>';
    return sceneCache[key] = svg;
  }

  /* ---------- photo layer: scene underneath, real photo fades in on top when file exists ---------- */
  var okCache = {}, seqN = {}, VARS = {};
  ['ielts', 'visa', 'scholarship', 'money', 'health', 'housing', 'sim', 'university', 'course', 'journey', 'blog', 'contact', 'academy'].forEach(function (k) { VARS[k] = 4; });
  /* each topic has up to 4 photos: key.jpg, key-2.jpg, key-3.jpg, key-4.jpg.
     Cards on one page take them in turn (never the same photo twice side by side); banners pick by page name. */
  function pick(key, seed) {
    var n = VARS[key] || 1; if (n < 2) return key;
    var i;
    if (seed && seed !== 'seq') i = Math.abs(hash(seed)) % n;
    else { seqN[key] = (seqN[key] || 0) + 1; i = (seqN[key] - 1) % n; }
    return i ? key + '-' + (i + 1) : key;
  }
  function bg(key, withKB, seed) {
    var el = d.createElement('div'); el.className = 'ub-bg-in';
    el.style.cssText = 'position:absolute;inset:0';
    el.innerHTML = '<div class="ub-scene">' + scene(key) + '</div><div class="ub-photo"></div>';
    var ph = el.querySelector('.ub-photo');
    if (!withKB) ph.style.animation = 'none';
    function show(file) {
      var url = PH + file + '.jpg';
      if (okCache[file] === false) { if (file !== key) show(key); return; }
      if (okCache[file]) { ph.style.backgroundImage = 'url(' + url + ')'; ph.className += ' on'; return; }
      var im = new Image();
      im.onload = function () { okCache[file] = true; ph.style.backgroundImage = 'url(' + url + ')'; requestAnimationFrame(function () { ph.className += ' on' }); };
      im.onerror = function () { okCache[file] = false; if (file !== key) show(key); };
      im.src = url;
    }
    show(pick(key, seed));
    return el;
  }

  /* ---------- 1. cinematic banner ---------- */
  var parallax = [];
  function banner() {
    var hero = d.querySelector('main .hero');
    if (!hero || d.querySelector('#p-home') || hero.classList.contains('ub')) return;
    var key = keyFor(location.pathname);
    hero.classList.add('ub');
    var wrap = d.createElement('div'); wrap.className = 'ub-bg'; wrap.appendChild(bg(key, true, 'h:' + location.pathname));
    var ov = d.createElement('div'); ov.className = 'ub-ov';
    hero.insertBefore(ov, hero.firstChild); hero.insertBefore(wrap, hero.firstChild);
  }

  /* ---------- 2. destination cards (.dc is built by main.js, so observe) ---------- */
  function countryOf(el) {
    var h = (el.getAttribute && el.getAttribute('href')) || '', k = keyFor(h);
    if (COUNTRIES[k] && /study-in-/.test(h)) return k;
    var t = (el.textContent || '').slice(0, 60), best = null;
    Object.keys(COUNTRIES).forEach(function (c) { if (!best && t.indexOf(COUNTRIES[c][0]) > -1) best = c; });
    return best;
  }
  function dcards(root) {
    (root || d).querySelectorAll('.dc:not([data-u])').forEach(function (el) {
      if (el.closest('#dest')) return;
      var k = countryOf(el); if (!k) return;
      el.setAttribute('data-u', 1);
      var ph = d.createElement('div'); ph.className = 'u-ph'; ph.appendChild(bg(k, false));
      el.insertBefore(ph, el.firstChild);
    });
  }

  /* ---------- 3. thumbnails on blog / guide cards ---------- */
  function thumbs(root) {
    (root || d).querySelectorAll('.bc:not([data-u]),a.card:not([data-u]),.g3>.card:not([data-u])').forEach(function (el) {
      if (el.closest('.dc,.rib,header,footer,.a2')) return;
      var a = el.tagName === 'A' ? el : el.querySelector('a[href]');
      var href = a ? a.getAttribute('href') : '';
      if (!href || /^(tel|mailto)/.test(href) || /#/.test(href) || /^https?:/.test(href) || /^(contact|index)\.html/.test(href)) return;
      el.setAttribute('data-u', 1);
      var th = d.createElement('div'); th.className = 'u-th'; th.appendChild(bg(keyFor(href), false, 'seq'));
      el.insertBefore(th, el.firstChild);
    });
  }

  /* ---------- 4. article featured image ---------- */
  function article() {
    var a = d.querySelector('.a2 h1'); if (!a || d.querySelector('.u-fig')) return;
    var fig = d.createElement('div'); fig.className = 'u-fig';
    var w = d.createElement('div'); w.className = 'ub-bg'; w.appendChild(bg(keyFor(location.pathname), true, 'h:' + location.pathname));
    fig.appendChild(w);
    var m = a.parentNode.querySelector('.m');
    (m || a).insertAdjacentElement('afterend', fig);
    parallax.push({ el: w, host: fig, soft: true });
  }

  /* ---------- 5. home ribbon ---------- */
  function ribbon() {
    var s = d.querySelector('#p-home .search'); if (!s || d.querySelector('.rib')) return;
    var keys = Object.keys(COUNTRIES), cards = '';
    keys.forEach(function (k, i) {
      cards += '<a class="rib-c" data-k="' + k + '" href="' + COUNTRIES[k][2] + '.html" aria-label="Study in ' + COUNTRIES[k][1] + '"><div class="rt"><strong>' + COUNTRIES[k][1] + '</strong></div></a>';
    });
    var sec = d.createElement('section'); sec.className = 'rib';
    sec.innerHTML = '<div class="hd"><h2>Study Abroad Destinations: Your Dream Country Awaits</h2><a class="btn o" href="study-destinations.html">Compare all countries</a></div><div class="rib-t">' + cards + cards + '</div>';
    sec.querySelectorAll('.rib-c').forEach(function (c) { c.insertBefore(bg(c.getAttribute('data-k'), false), c.firstChild); c.draggable = false; });
    var lead = d.querySelector('#dest .dlead'), dl = d.querySelector('#dest .dlinks');
    if (lead) { var lw = d.createElement('div'); lw.className = 'rib-lead'; lead.innerHTML = lead.innerHTML.replace(/\s*Hover or tap a card to read more\.?/i, ''); lw.appendChild(lead); sec.querySelector('.hd').insertAdjacentElement('afterend', lw); }
    if (dl) sec.appendChild(dl);
    s.insertAdjacentElement('afterend', sec);
    var first = sec.nextElementSibling; if (first && first.tagName === 'SECTION') first.style.paddingTop = '40px';
  }

  /* ---------- 6. reveal, counters, parallax, magnetic ---------- */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target; io.unobserve(el); el.classList.add('u-in');
      if (el.hasAttribute('data-cnt')) count(el);
      setTimeout(function () { el.classList.remove('u-r', 'u-in'); el.style.removeProperty('--d') }, 1200);
    });
  }, { threshold: .12, rootMargin: '0px 0px -6% 0px' }) : null;

  var SEL = 'section h2,.card,.dc,.fc,.bc,.stp details,.band>.w>div,.off>*,.amb>*,.cta,.nl,.tw,.rib-c';
  function reveal(root) {
    if (reduce || !io) return;
    (root || d).querySelectorAll(SEL).forEach(function (el) {
      if (el.hasAttribute('data-r') || el.closest('header,.dd,.mob')) return;
      el.setAttribute('data-r', 1);
      var r = el.getBoundingClientRect();
      if (r.top < innerHeight * .9 && r.bottom > 0 && !el.matches('.fc,.band>.w>div')) return; /* already visible: leave alone */
      var sib = el.parentNode ? Array.prototype.indexOf.call(el.parentNode.children, el) : 0;
      el.style.setProperty('--d', Math.min(sib, 6) * 0.07 + 's');
      el.classList.add('u-r'); if (el.tagName === 'H2') el.classList.add('u-ul');
      io.observe(el);
    });
  }
  function count(el) {
    var b = el.matches('b') ? el : el.querySelector('b'); if (!b || b.getAttribute('data-done')) return;
    b.setAttribute('data-done', 1);
    var t = b.textContent, m = t.match(/^([^\d]*)(\d[\d,]*)([^\d]*)$/); if (!m) return;
    var n = parseInt(m[2].replace(/,/g, ''), 10), comma = m[2].indexOf(',') > -1, t0 = performance.now(), D = 1400;
    if (n < 2) return;
    (function step(now) {
      var p = Math.min(1, (now - t0) / D), v = Math.round(n * (1 - Math.pow(1 - p, 3)));
      b.textContent = m[1] + (comma ? v.toLocaleString('en-US') : v) + m[3];
      if (p < 1) requestAnimationFrame(step); else b.textContent = t;
    })(t0);
  }
  function counters() {
    if (reduce || !io) return;
    d.querySelectorAll('.band>.w>div,.fc').forEach(function (el) { if (!el.hasAttribute('data-cnt')) { el.setAttribute('data-cnt', 1); if (!el.classList.contains('u-r')) io.observe(el); } });
  }

  setTimeout(function () {
    d.querySelectorAll('.u-r:not(.u-in)').forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < innerHeight * 1.2 && r.bottom > -200) { el.classList.add('u-in'); setTimeout(function () { el.classList.remove('u-r', 'u-in') }, 1200); }
    });
  }, 2500);

  var ticking = false;
  function onScroll() {
    if (ticking || reduce) return; ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      parallax.forEach(function (p) {
        var r = p.host.getBoundingClientRect(); if (r.bottom < -50 || r.top > innerHeight) return;
        p.el.style.transform = 'translate3d(0,' + ((-r.top) * (p.soft ? .08 : .22)).toFixed(1) + 'px,0)';
      });
    });
  }

  function magnetic() {
    if (reduce || !matchMedia('(hover:hover)').matches) return;
    d.addEventListener('mousemove', function (e) {
      var b = e.target.closest && e.target.closest('.hero .btn,.cta .btn');
      d.querySelectorAll('.btn[data-mg]').forEach(function (x) { if (x !== b) { x.style.transform = ''; x.removeAttribute('data-mg') } });
      if (!b) return;
      var r = b.getBoundingClientRect(); b.setAttribute('data-mg', 1);
      b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * .18).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * .28).toFixed(1) + 'px)';
    }, { passive: true });
  }


  /* ---------- 7. "BlueZone can help you" block above the footer (IDP style) ---------- */
  function help() {
    if (d.querySelector('.help') || d.querySelector('#p-contact,#p-home')) return;
    var f = d.querySelector('footer'); if (!f) return;
    var dest = Object.keys(COUNTRIES).map(function (k) { return '<option>' + COUNTRIES[k][1] + '</option>'; }).join('');
    var sec = d.createElement('section'); sec.className = 'help';
    sec.innerHTML = '<div class="w"><div><h2>BlueZone can help you</h2><p class="lead">Enter your details and one of our expert counsellors will reach out to you so we can connect you to the right course, country, university and even scholarships.</p>' +
      '<form id="hf" novalidate><label>First name*<input name="f" required autocomplete="given-name"></label><label>Last name*<input name="l" required autocomplete="family-name"></label>' +
      '<label class="full">Mobile number*<span class="ph2"><input value="+92" readonly aria-label="Country code"><input name="m" required inputmode="tel" autocomplete="tel"></span></label>' +
      '<label>Preferred study destination*<select name="c"><option value="">Select</option>' + dest + '<option>Not sure yet</option></select></label>' +
      '<label>When would you like to start?*<select name="w"><option value="">Select</option><option>Next intake</option><option>Within 6 months</option><option>Within 12 months</option><option>Not sure yet</option></select></label>' +
      '<label>Preferred study level*<select name="s"><option value="">Select</option><option>Foundation</option><option>Bachelor\u2019s</option><option>Master\u2019s</option><option>PhD</option></select></label>' +
      '<label>Nearest office*<select name="o"><option value="">Select</option><option>Mansehra</option><option>Abbottabad</option><option>Online</option></select></label>' +
      '<button class="btn" type="submit">Submit</button><div class="ok" role="status"></div></form></div>' +
      '<div class="help-r" aria-hidden="true"><i class="g1"></i><i class="b1"></i><i class="o1"></i><div class="help-ph"></div></div></div>';
    sec.querySelector('.help-ph').appendChild(bg('contact', true, 'h:' + location.pathname + 'x'));
    f.parentNode.insertBefore(sec, f);
    sec.querySelector('form').addEventListener('submit', function (e) {
      e.preventDefault();
      var fm = e.target, v = function (n) { return (fm.elements[n].value || '').trim() }, ok = fm.querySelector('.ok'), bad = false;
      ['f', 'l', 'm', 'c', 'w', 's', 'o'].forEach(function (n) { var el = fm.elements[n], x = !v(n); el.style.borderColor = x ? '#d93025' : ''; if (x) bad = true; });
      if (bad) { ok.style.color = '#d93025'; ok.textContent = 'Please fill the fields marked *'; return; }
      var msg = 'Hello BlueZone, I am ' + v('f') + ' ' + v('l') + ' (+92 ' + v('m') + '). Destination: ' + v('c') + '. Start: ' + v('w') + '. Level: ' + v('s') + '. Nearest office: ' + v('o') + '. Please contact me.';
      var C = window.BZC || {};
      ok.style.color = ''; ok.textContent = 'Thank you, ' + v('f') + '. A counsellor will contact you soon.';
      if (C.whatsapp) window.open('https://wa.me/' + C.whatsapp + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
      else if (C.email) location.href = 'mailto:' + C.email + '?subject=' + encodeURIComponent('Counselling request') + '&body=' + encodeURIComponent(msg);
      else setTimeout(function () { location.href = 'contact.html?msg=' + encodeURIComponent(msg) }, 900);
    });
  }

  /* ---------- 8. home "steps" visual: photo on a soft circle ---------- */
  function person() {
    var big = d.querySelector('.steps .big'); if (!big || big.classList.contains('u-person')) return;
    big.className = 'u-person'; big.removeAttribute('style');
    big.innerHTML = '<img src="images/steps-person.webp" width="800" height="987" loading="lazy" alt="BlueZone counsellor ready to guide your study abroad journey">';
    var go = function () { big.classList.add('in'); };
    if ('IntersectionObserver' in window && !reduce) {
      var o = new IntersectionObserver(function (e) { if (e[0].isIntersecting) { go(); o.disconnect(); } }, { threshold: .25 });
      o.observe(big); setTimeout(go, 4000);
    } else go();
  }

  /* ---------- 9. student video stories (IELTS pages + China pages) ---------- */
  function stories() {
    if (d.getElementById('u-stories')) return;
    var page = (location.pathname.split('/').pop() || 'index.html').replace(/\.html$/, '');
    var IELTS = [
      { v: 'hammad-ielts', n: 'Hammad But', t: 'IELTS success story' },
      { v: 'ikrash-ielts', n: 'Ikrash', t: 'IELTS success story' }
    ];
    var CHINA = [
      { v: 'abbas-khan-china', n: 'Abbas Khan', t: 'Study in China' },
      { v: 'zain-china', n: 'Zain', t: 'Study in China' }
    ];
    var sets = {
      'ielts-in-pakistan': { h: 'IELTS stories from our students', p: 'Hear it from students who prepared and booked their IELTS with BlueZone.', l: IELTS },
      'academy': { h: 'IELTS stories from our students', p: 'Hear it from students who prepared and booked their IELTS with BlueZone.', l: IELTS },
      'study-in-china': { h: 'China stories from our students', p: 'Students we helped on their way to study in China, in their own words.', l: CHINA },
      'study-in-china-from-mansehra': { h: 'China stories from our students', p: 'Students we helped on their way to study in China, in their own words.', l: CHINA }
    };
    var s = sets[page]; if (!s) return;
    var foot = d.querySelector('footer'); if (!foot) return;
    var sec = d.createElement('section'); sec.id = 'u-stories'; sec.className = 'u-stories';
    var cards = s.l.map(function (x) {
      return '<figure class="u-vid"><video controls playsinline preload="none" poster="videos/' + x.v + '.jpg" aria-label="' + x.n + ' - ' + x.t + '"><source src="videos/' + x.v + '.mp4" type="video/mp4"></video><figcaption><b>' + x.n + '</b><span>' + x.t + '</span></figcaption></figure>';
    }).join('');
    sec.innerHTML = '<div class="w"><div class="u-stories-in"><div class="u-stories-t"><h2>' + s.h + '</h2><p>' + s.p + '</p><a class="btn g" href="contact.html">Free counselling</a></div><div class="u-vids">' + cards + '</div></div></div>';
    foot.parentNode.insertBefore(sec, foot);
    var vs = sec.querySelectorAll('video');
    vs.forEach(function (v) { v.addEventListener('play', function () { vs.forEach(function (o) { if (o !== v) o.pause(); }); }); });
  }

  /* ---------- 10. scrolling universities strip (home, under the hero) ---------- */
  function unis() {
    if (d.getElementById('u-unis')) return;
    var anchor = d.querySelector('#p-home .rib'); if (!anchor) return;
    var L = [
      ['UK','Durham University'],['AU','Australian National University'],['CA','Dalhousie University'],['US','Northeastern University'],['IE','Dublin City University'],['NZ','Auckland University of Technology'],['AE','Heriot-Watt University Dubai'],['EU','HULT International Business School'],
      ['UK','Newcastle University'],['AU','Monash University'],['CA','Simon Fraser University'],['US','Drexel University'],['IE','Maynooth University'],['NZ','Massey University'],['AE','Middlesex University Dubai'],['EU','Eotvos Lorand University'],
      ['UK','Queen Mary University of London'],['AU','Macquarie University'],['CA','Brock University'],['US','University of Arizona'],['IE','National College of Ireland'],['NZ','Lincoln University'],['AE','Curtin University Dubai'],['EU','GISMA University of Applied Sciences'],
      ['UK','Brunel University London'],['AU','Deakin University'],['CA','University of Victoria'],['US','Oregon State University'],['IE','Atlantic Technological University'],['NZ','University of Canterbury'],['AE','De Montfort University Dubai'],['EU','Montpellier Business School'],
      ['UK','Cardiff Metropolitan University'],['AU','Griffith University'],['CA','Seneca College'],['US','Illinois Institute of Technology'],['AU','La Trobe University'],['CA','George Brown College'],['US','Arizona State University'],['UK','Heriot-Watt University'],
      ['UK','Aston University'],['AU','Curtin University'],['CA','Humber College'],['US','George Mason University'],['UK','Loughborough University'],['AU','Flinders University'],['CA','Conestoga College'],['US','University of Massachusetts Amherst']
    ];
    function row(a, cls) {
      var h = a.map(function (x) { return '<li><b>' + x[0] + '</b><span>' + x[1] + '</span></li>'; }).join('');
      return '<div class="u-un-row ' + cls + '"><ul>' + h + h + '</ul></div>';
    }
    var half = Math.ceil(L.length / 2);
    var sec = d.createElement('section'); sec.id = 'u-unis'; sec.className = 'u-unis';
    sec.innerHTML = '<div class="w u-un-hd"><div><p class="u-un-eb">Universities</p><h2>Popular universities across our study destinations</h2></div><a class="btn o" href="find-a-university.html">Find a university</a></div>' +
      '<div class="u-un-wrap" aria-label="Popular universities">' + row(L.slice(0, half), 'a') + row(L.slice(half), 'b') + '</div>';
    var host = anchor.closest('section') || anchor;
    if (host.contains(anchor) && host !== anchor && anchor.parentNode !== host.parentNode) host.insertAdjacentElement('afterend', sec); else anchor.insertAdjacentElement('afterend', sec);
  }

  /* ---------- run ---------- */
  function all(root) { dcards(root); thumbs(root); reveal(root); }
  function init() {
    banner(); article(); ribbon(); help(); person(); stories(); unis(); all(); counters(); magnetic(); onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    var t = 0;
    new MutationObserver(function () { if (t) return; t = setTimeout(function () { t = 0; all(); }, 80); }).observe(d.body, { childList: true, subtree: true });
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init); else init();
})();
