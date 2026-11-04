/* BlueZone: behaviour that the old single-page app handled in main.js, for the real HTML pages.
   Loaded only on pages built by tools/prerender.js (not on the home page). */
(function () {
  var d = document;

  /* UK quick yearly cost estimate */
  var cl = d.getElementById('cl'), cc = d.getElementById('cc'), cr = d.getElementById('cr'), co = d.getElementById('co');
  if (cl && cc && cr && co) {
    var est = function () {
      var v = (+cl.value) + (+cc.value) * 12, r = +cr.value || 0;
      co.textContent = 'About £' + v.toLocaleString() + ' per year' + (r ? ' (PKR ' + (v * r).toLocaleString() + ')' : '');
    };
    ['cl', 'cc', 'cr'].forEach(function (i) { d.getElementById(i).addEventListener('input', est) });
    est();
  }

  /* contact form: opens WhatsApp (or email) with the student's details. Nothing is sent until a number or email
     is set in academy.config.json, and the form says so honestly instead of showing a fake thank-you. */
  var f = d.getElementById('cform');
  if (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var err = d.getElementById('err'), ok = d.getElementById('ok'), okh = d.getElementById('okh'),
        n = f.n.value.trim(), p = f.p.value.trim(), C = window.BZC || {};
      if (!n || p.replace(/\D/g, '').length < 7) { err.textContent = 'Please enter your name and a valid phone number.'; return }
      var msg = 'Assalam o Alaikum, I am ' + n + '. Phone: ' + p + (f.e && f.e.value ? '. Email: ' + f.e.value : '') +
        '. I want to study ' + (f.l ? f.l.value : '') + ' in ' + (f.c ? f.c.value : '') + '.' + (f.m && f.m.value.trim() ? ' ' + f.m.value.trim() : '');
      var note = ok && ok.querySelector('p');
      if (C.whatsapp) {
        window.open('https://wa.me/' + C.whatsapp + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
        if (note) note.textContent = 'WhatsApp opened with your details filled in. Press send and a counsellor will reply.';
      } else if (C.email) {
        location.href = 'mailto:' + C.email + '?subject=' + encodeURIComponent('Study abroad enquiry from ' + n) + '&body=' + encodeURIComponent(msg);
        if (note) note.textContent = 'Your email app opened with your details filled in. Press send and a counsellor will reply.';
      } else {
        err.textContent = 'Online sending is not switched on yet. Please call or visit your nearest office listed on this page.';
        return;
      }
      err.textContent = ''; okh.textContent = 'Thank you, ' + n.split(' ')[0]; ok.hidden = false; f.reset();
      ok.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth', block: 'center' });
    });
  }

  /* blog index: category tabs + search */
  var bg = d.getElementById('bg'), bs = d.getElementById('bs'), bc = d.getElementById('bc'), be = d.getElementById('be');
  if (bg && bs && bc) {
    var cat = 'All', cards = [].slice.call(bg.children);
    var apply = function () {
      var q = bs.value.toLowerCase().trim(), n = 0;
      cards.forEach(function (c) {
        var show = (cat === 'All' || c.getAttribute('data-c') === cat) && (c.textContent + ' ' + (c.getAttribute('data-q') || '')).toLowerCase().indexOf(q) > -1;
        c.hidden = !show; if (show) n++;
      });
      if (be) be.hidden = n > 0;
    };
    bc.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      cat = b.getAttribute('data-c') || b.textContent.trim();
      [].forEach.call(bc.querySelectorAll('button'), function (x) { x.classList.toggle('on', x === b) });
      apply();
    });
    bs.addEventListener('input', apply);
  }
})();
