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
  /* countries: 1 photo each */
  uk: ['london big ben'], australia: ['sydney opera house'], canada: ['toronto skyline'], usa: ['new york skyline'],
  'new-zealand': ['new zealand lake mountains'], ireland: ['cliffs of moher'], malaysia: ['kuala lumpur petronas'], china: ['shanghai skyline'],
  uae: ['dubai skyline'], italy: ['rome colosseum'], france: ['paris eiffel tower'], korea: ['seoul skyline'], cyprus: ['cyprus coast sea'], lithuania: ['vilnius old town'],
  /* topics: 4 different photos each, so cards on one page never repeat the same picture */
  ielts: ['students studying exam library', 'exam test writing pen paper', 'english teacher classroom whiteboard', 'student headphones laptop learning'],
  visa: ['passport boarding pass travel documents', 'airport departure terminal', 'passport stamp travel', 'documents folder desk paperwork'],
  scholarship: ['graduation caps celebration', 'graduate diploma ceremony', 'students celebrating success', 'certificate award handshake'],
  money: ['student budget laptop calculator', 'coins savings piggy bank', 'online banking smartphone payment', 'calculator documents finance desk'],
  health: ['doctor stethoscope health care', 'pharmacy medicine health', 'healthy lifestyle fitness', 'hospital reception nurse'],
  housing: ['student apartment dorm room', 'modern apartment living room', 'university dormitory building', 'keys rent apartment'],
  sim: ['smartphone mobile network city', 'phone sim card', 'video call smartphone', 'mobile phone hand app'],
  university: ['university campus historic building students', 'university library interior', 'campus lawn students walking', 'graduation hall university'],
  course: ['students lecture classroom university', 'laptop study notes desk', 'science laboratory students', 'group study students discussion'],
  journey: ['airport departure plane window', 'suitcase travel luggage airport', 'world map travel planning', 'young traveler backpack train'],
  blog: ['student writing notebook laptop cafe', 'reading book coffee desk', 'typing laptop workspace', 'notebook pen planning desk'],
  contact: ['counsellor meeting students office', 'customer support headset', 'handshake business meeting office', 'friendly advisor desk talking'],
  academy: ['english classroom teacher students', 'students learning classroom group', 'language learning books', 'teacher whiteboard explaining']
};
const out = path.join(__dirname, '..', 'images', 'photos');
fs.mkdirSync(out, { recursive: true });
const args = process.argv.slice(2), force = args.includes('--force'), only = args.filter(a => !a.startsWith('--'));
(async () => {
  const credits = [], sleep = ms => new Promise(r => setTimeout(r, ms));
  for (const k of Object.keys(Q)) {
    if (only.length && !only.includes(k)) continue;
    for (let i = 0; i < Q[k].length; i++) {
      const name = i === 0 ? k : k + '-' + (i + 1), file = path.join(out, name + '.jpg');
      if (fs.existsSync(file) && !force) { console.log('skip', name); continue; }
      try {
        const r = await fetch('https://pixabay.com/api/?key=' + KEY + '&image_type=photo&orientation=horizontal&min_width=1200&safesearch=true&order=popular&per_page=10&q=' + encodeURIComponent(Q[k][i]));
        if (!r.ok) throw new Error('API ' + r.status);
        const j = await r.json();
        const p = (j.hits || [])[0];
        if (!p) throw new Error('no result, try a simpler query');
        const img = await fetch(p.largeImageURL);
        fs.writeFileSync(file, Buffer.from(await img.arrayBuffer()));
        credits.push(name + ': ' + p.user + ' - ' + p.pageURL);
        console.log('ok  ', name, '<-', p.user);
      } catch (e) { console.log('FAIL', name, e.message); }
      await sleep(700); /* stay under Pixabay's 100 requests/minute */
    }
  }
  if (credits.length) fs.appendFileSync(path.join(out, 'CREDITS.txt'), credits.join('\n') + '\n');
  console.log('Done. Reload the site (Ctrl+F5).');
})();
