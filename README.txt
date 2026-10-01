BlueZone Consultants website

Open index.html in a browser, or upload the whole folder to any host (cPanel, Netlify, Vercel, GitHub Pages).

index.html  page markup (Home, UK, Contact, Blog, Articles)
css/style.css  all styling and colour tokens (:root)
js/main.js  routing, animations, blog data (var A), forms
images/  logo.png, hero.jpg (replace hero.jpg to change the photo)

Contact and newsletter forms only show a thank-you message. Connect them to Formspree, Google Sheets or your backend before going live.

---- Content upgrade (Oct 2026) ----
js/content.js         rich page engine, calculators (IELTS, planner, funds, loan, PKR), JSON-LD, article renderer
js/pages-steps.js     steps hub + 6 stages + documents/attestation
js/pages-ielts.js     IELTS hub, what-is, prep, booking, IELTS vs PTE vs TOEFL
js/pages-courses.js   courses hub, course advice, scholarships, universities, rankings
js/pages-essentials.js essentials hub + 7 guides
js/pages-more.js      destinations hub, China, 5 new blog articles
To edit a page: open the matching file and change the text. Every page lists its sources at the bottom.
Re-check fees/deadlines before each intake. BZ.UPDATED in content.js sets the "last reviewed" date.

---- BlueZone Academy (static SEO pages) ----
academy.html, ielts-preparation-abbottabad.html, ielts-preparation-mansehra.html,
ielts-booking-abbottabad-mansehra.html, english-language-courses-abbottabad-mansehra.html
These are real HTML pages (not #/ routes) so Google can index each one.
1) Open academy.config.json and fill: domain (https://yourdomain.com), phone, whatsapp (92300xxxxxxx),
   email, both office addresses, social links.
2) Run:  node build-academy.js   (needs Node.js). It rewrites the 5 pages, sitemap.xml and robots.txt.
   Empty fields are left out, nothing fake is published.
3) Upload the whole folder to your hosting, then submit sitemap.xml in Google Search Console.
4) Create/claim the Google Business Profile for BOTH offices (biggest factor for "IELTS near me" searches).
Edit wording in build-academy.js (page text lives there), then run the build again.
