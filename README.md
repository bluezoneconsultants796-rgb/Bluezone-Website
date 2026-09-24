# Bluezone Consultants — Website

## Folder structure

```
bluezone-site/
├── public/                 ← DEPLOY THIS FOLDER'S CONTENTS to your web host / domain root
│   ├── index.html           Homepage (the main app — router, all page content, JS)
│   ├── study-abroad-consultant-mansehra.html
│   ├── study-abroad-consultant-abbottabad.html
│   ├── study-abroad-consultant-haripur.html
│   ├── study-abroad-consultant-hazara-division.html
│   ├── study-abroad-consultant-perth.html
│   ├── css/
│   │   └── bluezone.css     Shared stylesheet used by the city landing pages
│   ├── assets/
│   │   ├── logo-icon.png    Cropped logo mark (header / footer / favicon source)
│   │   ├── logo-full.png    Full logo with wordmark + tagline (transparent bg)
│   │   └── favicon-256.png  Browser tab / bookmark icon
│   ├── robots.txt
│   └── sitemap.xml
│
├── src/                     ← NOT deployed — reference/source material only
│   ├── data/
│   │   └── bluezone-nap-master.csv   Name/Address/Phone master list (for citations, GBP, directories)
│   └── docs/
│       └── PLACEHOLDERS.md           Every dummy value that must be replaced before launch
│
└── README.md                ← this file
```

## Before going live

1. Open `src/docs/PLACEHOLDERS.md` and replace every dummy phone number, email,
   WhatsApp number, and social media link inside `public/index.html`
   (search for `DUMMY`, `0000`, `dummy.example`).
2. Set up your Formspree endpoints and paste them into `CONFIG.endpoints` near
   the top of the `<script>` block in `public/index.html`.
3. Swap the stock photography (currently real, keyword-matched Creative Commons
   photos pulled live from LoremFlickr) for your own licensed office/campus
   photos once you have them — search `loremflickr.com` in `index.html` to find
   every image call.
4. Update `sitemap.xml`'s `<loc>` values if your final domain differs from
   `bluezoneconsultants.com`.

## Deployment

Upload everything **inside `public/`** (not the `public` folder itself) to your
hosting provider's web root — e.g. via cPanel File Manager, Netlify drag-and-drop,
Vercel, or GitHub Pages. `index.html` will load automatically as the homepage.

Do not upload `src/` to your live server — it's internal reference material only.
