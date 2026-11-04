/* BlueZone PRO behaviour (loaded on every page, after main.js on the home page).
   1 real links  2 contact details from config  3 progress bar + back to top  4 site search (Ctrl/Cmd+K)
   5 hero search  6 spotlight cards  7 scroll reveal on static pages */
(function () {
  var d = document, H = d.documentElement, reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* ---------- 1. old "#/..." links become real page links (crawlable by Google) ---------- */
  function fix(root) {
    if (!window.BZR) return;
    (root || d).querySelectorAll('a[href^="#/"]').forEach(function (a) {
      var f = BZR.file(a.getAttribute('href'));
      if (f) a.setAttribute('href', f);
    });
  }
  fix();
  var mt = 0;
  new MutationObserver(function () { if (mt) return; mt = setTimeout(function () { mt = 0; fix() }, 60) })
    .observe(d.body, { childList: true, subtree: true });

  /* ---------- 2. contact details come from js/site-config.js (built from academy.config.json) ---------- */
  var C = window.BZC || {}, O = C.offices || {};
  function val(kind, office) {
    var o = office ? (O[office] || {}) : C;
    return o[kind] || '';
  }
  d.querySelectorAll('[data-bz]').forEach(function (el) {
    var p = el.getAttribute('data-bz').split(':'), kind = p[0], office = p[1] || '', v = val(kind, office);
    if (!v) return;
    var a = el.querySelector('a') || (el.tagName === 'A' ? el : null), t = a || el;
    if (kind === 'phone' && a) a.href = 'tel:' + v.replace(/[^\d+]/g, '');
    if (kind === 'email' && a) a.href = 'mailto:' + v;
    t.textContent = v;
    el.hidden = false;
    var wrap = el.closest('[data-bz-wrap]'); if (wrap) wrap.hidden = false;
  });
  /* floating buttons: real call / WhatsApp when configured, otherwise the offices section / contact page */
  d.querySelectorAll('.fl a').forEach(function (a) {
    var l = a.getAttribute('aria-label');
    if (l === 'Call' && C.phone) { a.href = 'tel:' + C.phone.replace(/[^\d+]/g, '') }
    if (l === 'WhatsApp' && C.whatsapp) { a.href = 'https://wa.me/' + C.whatsapp; a.target = '_blank'; a.rel = 'noopener' }
  });
  d.querySelectorAll('[data-bz-social]').forEach(function (el) {
    var s = C.social || {}, names = { facebook: 'Facebook', instagram: 'Instagram', youtube: 'YouTube' }, h = '';
    Object.keys(names).forEach(function (k) { if (s[k]) h += '<a href="' + s[k] + '" rel="noopener" target="_blank">' + names[k] + '</a>' });
    if (h) { el.innerHTML = h; el.hidden = false }
  });

  /* ---------- 3. progress bar, back to top, header shadow ---------- */
  var bar = d.createElement('div'); bar.id = 'prog'; bar.setAttribute('aria-hidden', 'true'); d.body.appendChild(bar);
  var bt = d.createElement('button'); bt.className = 'btt'; bt.type = 'button'; bt.setAttribute('aria-label', 'Back to top');
  bt.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 15l6-6 6 6"/></svg>';
  bt.onclick = function () { scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }) };
  d.body.appendChild(bt);
  var tk = 0;
  function sc() {
    if (tk) return; tk = 1;
    requestAnimationFrame(function () {
      var m = H.scrollHeight - innerHeight;
      bar.style.transform = 'scaleX(' + (m > 0 ? scrollY / m : 0) + ')';
      bt.classList.toggle('on', scrollY > 700);
      var h = d.querySelector('header'); if (h) h.classList.toggle('sc2', scrollY > 8);
      tk = 0;
    });
  }
  addEventListener('scroll', sc, { passive: true }); sc();

  /* ---------- 6. spotlight on destination cards ---------- */
  d.addEventListener('pointermove', function (e) {
    var c = e.target.closest && e.target.closest('.dc'); if (!c) return;
    var r = c.getBoundingClientRect();
    c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });

  /* ---------- 7. static pages: reveal on scroll (the home page uses main.js for this) ---------- */
  if (!d.getElementById('p-home') && 'IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target) } });
    }, { threshold: .08, rootMargin: '0px 0px -4% 0px' });
    d.querySelectorAll('main h2,main .card,main .fc,main .tw,main .stp details,main .tlv li,main .note,main .banner,.relc a,main .bc').forEach(function (el, i) {
      var r = el.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) return;        /* already on screen: never hide it */
      el.classList.add('rv2'); el.style.transitionDelay = (i % 4 * 70) + 'ms'; io.observe(el);
    });
  }

  /* ---------- 4. site search ---------- */
  var sx, sin, sres, sopen, sidx = [], sel = -1, last, ICON = '<svg class="i" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>';
  function load(cb) {
    if (window.BZS) return cb();
    var s = d.createElement('script'); s.src = 'js/search-index.js'; s.onload = cb; d.head.appendChild(s);
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] }) }
  function re(w) { return new RegExp('\\b' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) }
  function short(t) { if (t.length <= 112) return t; t = t.slice(0, 112); return t.replace(/\s+\S*$/, '').replace(/[,;:.\s]+$/, '') + '…' }
  function build() {
    sx = d.createElement('div'); sx.className = 'sx'; sx.hidden = true; sx.setAttribute('role', 'dialog'); sx.setAttribute('aria-modal', 'true'); sx.setAttribute('aria-label', 'Search BlueZone');
    sx.innerHTML = '<div class="sx-b" data-close></div><div class="sx-p"><div class="sx-i">' + ICON + '<input type="search" autocomplete="off" spellcheck="false" placeholder="Search a country, IELTS, scholarship or guide" aria-label="Search"><button type="button" class="sx-x" data-close aria-label="Close search">Esc</button></div><ul class="sx-r" role="listbox"></ul><p class="sx-e" hidden>No match. Try a country name such as Canada, or a word like visa, IELTS or loan.</p></div>';
    d.body.appendChild(sx);
    sin = sx.querySelector('input'); sres = sx.querySelector('.sx-r');
    sx.addEventListener('click', function (e) { if (e.target.hasAttribute('data-close')) close() });
    sin.addEventListener('input', function () { render(sin.value) });
    sx.addEventListener('keydown', function (e) {
      var li = sres.querySelectorAll('a');
      if (e.key === 'Escape') { e.preventDefault(); close() }
      else if (e.key === 'ArrowDown') { e.preventDefault(); mark(Math.min(sel + 1, li.length - 1)) }
      else if (e.key === 'ArrowUp') { e.preventDefault(); mark(Math.max(sel - 1, 0)) }
      else if (e.key === 'Enter' && li.length) { e.preventDefault(); li[Math.max(sel, 0)].click() }
    });
  }
  function mark(i) {
    var li = sres.querySelectorAll('a'); sel = i;
    li.forEach(function (a, n) { a.classList.toggle('on', n === i); if (n === i) a.scrollIntoView({ block: 'nearest' }) });
  }
  function score(e, toks) {
    var t = e.t.toLowerCase(), k = (e.k || '').toLowerCase(), de = (e.d || '').toLowerCase(), s = 0;
    for (var i = 0; i < toks.length; i++) {
      var w = toks[i], x = 0;
      if (t.indexOf(w) === 0) x = 9; else if (re(w).test(t)) x = 6; else if (re(w).test(k)) x = 5; else if (w.length > 2 && re(w).test(de)) x = 1;
      if (!x) return 0; s += x;
    }
    return s + (e.p ? .5 : 0);
  }
  function render(q) {
    var toks = q.toLowerCase().split(/\s+/).filter(Boolean), list;
    if (!toks.length) list = sidx.filter(function (e) { return e.p }).slice(0, 8);
    else list = sidx.map(function (e) { return { e: e, s: score(e, toks) } }).filter(function (x) { return x.s }).sort(function (a, b) { return b.s - a.s }).slice(0, 8).map(function (x) { return x.e });
    sres.innerHTML = list.map(function (e) {
      return '<li role="option"><a href="' + e.u + '"><span class="sx-t">' + esc(e.t) + '</span><span class="sx-g">' + esc(e.g) + '</span><small>' + esc(short(e.d || '')) + '</small></a></li>';
    }).join('');
    sx.querySelector('.sx-e').hidden = !!list.length || !toks.length;
    sel = -1; if (list.length && toks.length) mark(0);
  }
  function open(q) {
    last = d.activeElement;
    load(function () {
      sidx = window.BZS || [];
      if (!sx) build();
      sx.hidden = false; sopen = true; d.body.classList.add('sx-on');
      sin.value = q || ''; render(sin.value); setTimeout(function () { sin.focus() }, 30);
    });
  }
  function close() {
    if (!sx || !sopen) return; sx.hidden = true; sopen = false; d.body.classList.remove('sx-on');
    if (last && last.focus) last.focus();
  }
  window.BZSearch = { open: open, close: close };
  d.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('[data-search]'); if (b) { e.preventDefault(); open() } });
  d.addEventListener('keydown', function (e) {
    var tg = (e.target.tagName || '').toLowerCase(), typing = tg === 'input' || tg === 'textarea' || tg === 'select' || e.target.isContentEditable;
    if ((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey)) { e.preventDefault(); sopen ? close() : open() }
    else if (e.key === '/' && !typing && !sopen) { e.preventDefault(); open() }
  });

  /* ---------- 5. hero search: destination -> its page, typed words -> site search, otherwise the chosen tab ---------- */
  var SLUG = { 'Australia': 'study-in-australia.html', 'UK': 'study-in-uk.html', 'Canada': 'study-in-canada.html', 'USA': 'study-in-usa.html', 'New Zealand': 'study-in-new-zealand.html', 'Ireland': 'study-in-ireland.html', 'Malaysia': 'study-in-malaysia.html', 'China': 'study-in-china.html', 'Dubai / UAE': 'study-in-dubai-uae.html', 'Italy': 'study-in-italy.html', 'France': 'study-in-france.html', 'South Korea': 'study-in-south-korea.html', 'Cyprus': 'study-in-cyprus.html', 'Lithuania': 'study-in-lithuania.html' };
  var TAB = { 'Courses': 'find-a-course.html', 'Scholarships': 'scholarships-for-pakistani-students.html', 'Universities': 'find-a-university.html', 'Events': '#offices', 'Guide me': 'study-abroad-steps.html', 'Get instant offer': 'contact.html' };
  var form = d.querySelector('.sf');
  if (form) {
    form.removeAttribute('onsubmit');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var sel = form.querySelector('select[aria-label="Destination"]'), v = sel && sel.value,
        on = d.querySelector('#tabs .on'), t = on ? on.textContent.trim() : 'Courses',
        inp = form.querySelector('input'), q = inp ? inp.value.trim() : '';
      if (v && SLUG[v]) { location.href = SLUG[v]; return }
      if (q) { open(q); return }
      var to = TAB[t] || 'find-a-course.html';
      if (to.charAt(0) === '#') location.hash = to; else location.href = to;
    });
  }
  var tb = d.getElementById('tabs');
  if (tb && form) {
    tb.addEventListener('click', function (e) {
      if (e.target.tagName != 'BUTTON') return;
      var tx = e.target.textContent.trim(), b = form.querySelector('.btn');
      if (b) b.textContent = tx == 'Get instant offer' ? 'Get offer' : 'Search ' + tx.toLowerCase();
      var i = form.querySelector('input');
      if (i) i.placeholder = { 'Courses': 'Enter course subject or country e.g. Law', 'Scholarships': 'Enter subject or country', 'Universities': 'Enter university or city', 'Events': 'Enter your city', 'Guide me': 'Tell us your goal', 'Get instant offer': 'Enter course subject e.g. Law' }[tx] || i.placeholder;
    });
  }
})();
