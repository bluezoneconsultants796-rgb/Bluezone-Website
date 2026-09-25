# Bluezone Consultants — Website (GitHub Pages ready)

This version is flattened for direct GitHub Pages deployment — `index.html`
sits at the repo root, which is where GitHub Pages looks for it first.

```
(repo root)
├── index.html                Homepage (main app — router, all content, JS)
├── study-abroad-consultant-*.html   (5 city landing pages)
├── css/bluezone.css          Shared stylesheet for the city pages
├── assets/                   logo-icon.png, logo-full.png, favicon-256.png
├── robots.txt
├── sitemap.xml
├── .nojekyll                 tells GitHub Pages: don't run Jekyll on this repo
└── src/                      reference-only, not part of the live site
    ├── data/bluezone-nap-master.csv
    └── docs/PLACEHOLDERS.md
```

## Why your last deploy showed the README instead of the site

GitHub Pages only auto-detects `index.html` at the **root** of the repo (or in
`/docs` if you set that as the Pages source). Your previous upload had
`index.html` inside a `public/` subfolder — GitHub Pages doesn't know to look
there, so with no root `index.html` it fell back to rendering `README.md`.

This version fixes that: every file GitHub Pages needs to serve is now at the
repo root.

## How to deploy

1. Delete everything currently in your `Bluezone-Website` repo (or make a
   fresh repo).
2. Upload **every file and folder from inside this zip** (not the zip itself,
   and not a wrapping folder) straight into the repo root — `index.html`
   should sit next to `README.md` at the top level, not inside another folder.
3. GitHub repo → Settings → Pages → Source: **Deploy from a branch** → branch
   `main`, folder `/ (root)`.
4. Wait 1–2 minutes, then visit
   `https://bluezoneconsultants796-rgb.github.io/Bluezone-Website/` again.

## Before going fully live

See `src/docs/PLACEHOLDERS.md` — replace every dummy phone/email/WhatsApp/
social link (search `DUMMY`, `0000`, `dummy.example`) inside `index.html`,
and set your Formspree endpoints in `CONFIG.endpoints` near the top of the
`<script>` block.
