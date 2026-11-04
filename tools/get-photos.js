/* BlueZone: downloads one landscape stock photo per page theme into images/photos/<key>.jpg using PIXABAY
   (free for commercial use, no attribution needed). Free key, instant after signup: https://pixabay.com/api/docs/
   Run from the site folder (Node 18+):
     Windows PowerShell:  $env:PIXABAY_KEY="your_key"; node tools/get-photos.js
     Mac/Linux:           PIXABAY_KEY=your_key node tools/get-photos.js
   Options:  node tools/get-photos.js uk canada     (only those keys)      --force  (replace existing)
   Pixabay gives up to 1280px wide, fine for banners. For sharper photos use the manual list in images/photos/HOW-TO.txt */
const fs = require('fs'), path = require('path');
const KEY = process.env.PIXABAY_KEY;
if (!KEY) { console.error('Set PIXABAY_KEY first (free: https://pixabay.com/api/docs/).'); process.exit(1); }
const Q = {
  uk: 'london big ben', australia: 'sydney opera house', canada: 'toronto skyline',
  usa: 'new york skyline', 'new-zealand': 'new zealand lake mountains', ireland: 'cliffs of moher',
  malaysia: 'kuala lumpur petronas', china: 'shanghai skyline', uae: 'dubai skyline',
  italy: 'rome colosseum', france: 'paris eiffel tower', korea: 'seoul skyline',
  cyprus: 'cyprus coast sea', lithuania: 'vilnius old town',
  ielts: 'students studying exam library', visa: 'passport boarding pass travel documents', scholarship: 'graduation caps celebration',
  money: 'student budget laptop calculator', health: 'doctor stethoscope health care', housing: 'student apartment dorm room',
  sim: 'smartphone mobile network city', university: 'university campus historic building students', course: 'students lecture classroom university',
  journey: 'airport departure plane window', blog: 'student writing notebook laptop cafe', contact: 'counsellor meeting students office',
  academy: 'english classroom teacher students'
};
const out = path.join(__dirname, '..', 'images', 'photos');
fs.mkdirSync(out, { recursive: true });
const args = process.argv.slice(2), force = args.includes('--force'), only = args.filter(a => !a.startsWith('--'));
(async () => {
  const credits = [];
  for (const k of Object.keys(Q)) {
    if (only.length && !only.includes(k)) continue;
    const file = path.join(out, k + '.jpg');
    if (fs.existsSync(file) && !force) { console.log('skip', k); continue; }
    try {
      const r = await fetch('https://pixabay.com/api/?key=' + KEY + '&image_type=photo&orientation=horizontal&min_width=1200&safesearch=true&order=popular&per_page=10&q=' + encodeURIComponent(Q[k]));
      if (!r.ok) throw new Error('API ' + r.status);
      const j = await r.json();
      const p = (j.hits || [])[0];
      if (!p) throw new Error('no result, try a simpler query');
      const img = await fetch(p.largeImageURL);
      fs.writeFileSync(file, Buffer.from(await img.arrayBuffer()));
      credits.push(k + ': ' + p.user + ' - ' + p.pageURL);
      console.log('ok  ', k, '<-', p.user);
    } catch (e) { console.log('FAIL', k, e.message); }
  }
  if (credits.length) fs.appendFileSync(path.join(out, 'CREDITS.txt'), credits.join('\n') + '\n');
  console.log('Done. Reload the site: photos fade in over the animated scenes.');
})();
