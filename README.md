# Bluezone Consultants — Website (GitHub Pages ready)

`index.html` sits at the repo root — that's where GitHub Pages looks for it.

## What's new in this update
- China office (Guangxi Future Link) added throughout the site
- New, detailed Success Stories page with a fillable story template
- Guangxi partnership section on the China destination page
- Homepage teaser linking to Success Stories
- More FAQ / structured data for AI & search visibility

## AI discoverability / GEO pass (2026-09-25)
Added the entity-clarity and content foundation described in
`src/docs/ai-discoverability-strategy.md`:
- `src/data/bluezone-facts.json` — single source-of-truth entity data model
- `src/docs/query-intent-library.md` — the AI/search question map, with an
  honest content-gap backlog (not pretending coverage is complete)
- `src/data/ai-visibility-test-queries.csv` — ~100-query test set for
  periodically checking whether Bluezone is mentioned/cited across AI
  answer engines, with columns to log results
- New static pages, all with `EducationalOrganization`/`LocalBusiness`,
  `FAQPage` and `BreadcrumbList` JSON-LD: `study-abroad-consultants-pakistan.html`
  (Pakistan-wide hub), `study-abroad-consultant-islamabad.html` (honest
  nearest-office page — no fabricated Islamabad branch),
  `study-in-china-from-pakistan.html` (first full destination-authority
  page), `how-to-choose-a-study-abroad-consultant.html` (neutral evaluation
  criteria, not a competitor-attack page), `knowledge-hub.html` (hub linking
  all of the above)
- `robots.txt` — explicit allow entries per named AI crawler (OAI-SearchBot,
  GPTBot, ChatGPT-User, ClaudeBot, PerplexityBot, Google-Extended, Bingbot,
  Applebot-Extended, CCBot)
- `sitemap.xml`, `llms.txt` and the homepage's `<noscript>` fallback updated
  with the new URLs
- Existing city pages (Mansehra, Abbottabad, Haripur, Hazara Division,
  Perth) now cross-link to the new Pakistan hub, Islamabad page and
  Knowledge Hub

Per this task's instructions, all dummy NAP data (phones, emails, WhatsApp,
social handles) was left untouched — see `src/docs/PLACEHOLDERS.md`.
Read `src/docs/ai-discoverability-strategy.md` for what's built, what's
intentionally left as a real-world action item (press mentions, GBP
verification, real case studies, cross-AI query testing), and how to extend
the system without rebuilding it.

See `src/docs/PLACEHOLDERS.md` for what to replace before fully launching (dummy
phone/email numbers, and the SAMPLE-labeled success story cards).

## How to deploy (replacing your existing repo content)

1. Delete everything currently in your `Bluezone-Website` repo.
2. Upload **every file and folder from inside this zip** straight into the repo
   root — `index.html` should sit next to `README.md` at the top level, not
   inside another folder.
3. GitHub repo → Settings → Pages → Source: **Deploy from a branch** → branch
   `main`, folder `/ (root)`.
4. Wait 1–2 minutes, then reload your Pages URL.
