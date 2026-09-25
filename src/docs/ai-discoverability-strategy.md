# Bluezone — AI Discoverability / GEO Strategy

**Goal:** make Bluezone a legitimately understandable, evidence-backed,
citable entity for study-abroad / visa-consultancy queries across AI answer
engines and search — not a guarantee that any specific AI will recommend it.
No technique here manufactures fake authority; everything is either (a)
entity clarity and structured data, (b) genuinely useful content, or (c) a
process for pursuing real third-party validation over time.

This document tracks the 47-point brief against three states:
- **Already in place** — found in the existing site before this pass.
- **Added this pass** — built in this session.
- **Ongoing / requires real-world action** — cannot be "built" as files; needs
  people, time, real partners, or real credentials. Treated as a running
  program, not a one-time patch.

---

## Already in place
- Consistent entity identity (name, logo, description) in JSON-LD across
  homepage and city pages.
- `EducationalOrganization` + `LocalBusiness` structured data, `FAQPage`,
  `BreadcrumbList` on city pages; `EducationalOrganization` + `FAQPage` on
  the homepage.
- `llms.txt` at the site root summarizing the entity for AI systems.
- Static, non-JS-dependent city pages for Mansehra, Abbottabad, Haripur,
  Hazara Division and Perth — each with real/nearest-office honesty (Haripur
  and Hazara Division openly route to the Abbottabad/Mansehra offices rather
  than claiming a local office that doesn't exist).
- `noscript` fallback on the homepage summarizing core facts, because the
  homepage's destinations/programs/universities/blog content is rendered
  client-side (JavaScript SPA) and would otherwise be invisible to crawlers
  that don't execute JS.
- `robots.txt` allowing all crawlers, with a sitemap reference.
- A documented placeholder registry (`PLACEHOLDERS.md`) preventing dummy NAP
  data from silently being mistaken for real data.
- A single NAP CSV (`bluezone-nap-master.csv`) as a location-data source.
- Explicit non-guarantee language ("we do not guarantee admission,
  scholarships or visa outcomes") repeated consistently — this is exactly
  the kind of accurate, non-hyped framing that makes a source easy for an AI
  system to quote correctly.

## Added this pass
1. **`src/data/bluezone-facts.json`** — single canonical entity/services/
   destinations/offices data model (brief point 4). Every new page below
   was written from this file, not improvised, so descriptions stay
   consistent. Existing pages weren't rewritten from it yet (see backlog).
2. **`src/docs/query-intent-library.md`** — the structured question map
   (brief point 5), with an explicit content-gap backlog instead of
   pretending coverage is complete.
3. **New static pages**, all with JSON-LD (`EducationalOrganization`/
   `LocalBusiness` as appropriate, `FAQPage`, `BreadcrumbList`), descriptive
   (non-hype) titles, and internal links to existing city pages:
   - `/study-abroad-consultants-pakistan` — the Pakistan-wide hub answering
     "study abroad consultant/education consultant/visa consultant in
     Pakistan" and "best study abroad consultants in Pakistan" honestly:
     what a consultant does, how to evaluate one, what Bluezone actually
     offers, and where its offices are — not a "we are the best" page.
   - `/study-abroad-consultant-islamabad` — built on the same honest
     nearest-office pattern already used for Haripur/Hazara Division
     (Islamabad has no Bluezone office; the page says so and routes to the
     nearest real one).
   - `/study-in-china-from-pakistan` — first fully-built destination
     authority page (brief points 11/30): universities note, MBBS/program
     mention, Guangxi partner office, scholarships, visa guidance, FAQs,
     official-source links. Template for the remaining five destinations
     (Italy, UK, France, Lithuania, Cyprus — see backlog).
   - `/how-to-choose-a-study-abroad-consultant` — the neutral
     "Bluezone vs options" evaluation-criteria page (brief point 24):
     questions to ask, documents to expect, how to verify claims. Built so
     it can be cited as an educational resource on its own, independent of
     whether the reader picks Bluezone.
   - `/knowledge-hub` — landing page for the knowledge-base architecture
     (brief point 10), linking destination guides, the consultant-evaluation
     guide, and city pages, with room to add articles without rebuilding
     the hub.
4. **`robots.txt`** — added explicit `Allow: /` entries per known AI
   crawler (OAI-SearchBot, GPTBot, ChatGPT-User, PerplexityBot, ClaudeBot,
   Google-Extended, Applebot-Extended, CCBot, Bingbot) so none is
   accidentally caught by a future blanket disallow, plus a comment
   explaining why each is listed (brief point 18).
5. **`sitemap.xml`** and **`llms.txt`** updated with the new URLs.
6. **`src/data/ai-visibility-test-queries.csv`** — the ≥100-query test set
   (brief point 42) across Pakistan/location/destination/program/comparison
   intent, with columns to log whether Bluezone was mentioned, cited, which
   URL, competitor mentions, and date checked — a private measurement sheet,
   not an automated bot against any AI system's terms of service.

## Ongoing / requires real-world action (cannot be file-built)
These are the parts of the 47-point brief that are genuinely a *program*,
not a patch. Doing them "all at once" in code would mean fabricating
evidence, which the brief itself (points 13–16, 29) explicitly forbids.

- **Replace dummy NAP data** (phones, emails, WhatsApp, social handles,
  Formspree endpoints) once real values exist — tracked in
  `PLACEHOLDERS.md`. Per this task's instructions, left untouched for now.
- **Third-party validation** (point 15): real press mentions, directory
  listings, association memberships, partnerships. Nothing to build in code
  — this is outreach and relationship work over months, and the only
  legitimate way to earn the "recognizable beyond its own website" signal
  AI systems weight heavily.
- **Google Business Profile / Bing Places** for Mansehra and Abbottabad
  (point 17) — requires in-person verification, not something this session
  can do.
- **Real case studies** (point 14) — cannot be written until real,
  consenting, anonymizable student stories exist. A template structure
  (Background / Goal / Destination / Program / Route / Timeline / Outcome)
  is ready in `knowledge-hub.html`'s Success Stories link for when real
  stories are supplied; do not fill it with invented ones.
- **Cross-AI visibility testing** (points 25, 26, 42) — the query set and
  tracker sheet are built; actually running the ~100 queries against
  ChatGPT/Gemini/Copilot/Perplexity/Google AI Overviews and logging results
  is a recurring manual (or Bing Webmaster Tools "AI Performance"-assisted)
  process, not a one-time build.
- **Remaining destination and program pages** (Italy, UK, France,
  Lithuania, Cyprus; Engineering, Business, IT, Dentistry) — flagged as a
  backlog in `query-intent-library.md` rather than stubbed out with thin
  content, per the brief's explicit ban on thin/doorway pages (points 7, 23).
- **JS-rendered SPA content** (destinations/universities/programs/blog
  behind `#/` routes in `index.html`) is invisible to crawlers that don't
  execute JavaScript. The long-term fix is server-side rendering or
  pre-rendered static routes for those sections, mirroring what the city
  pages already do. That's an architecture change beyond a single content
  pass — flagged here so it isn't lost.

## How to keep this from becoming a one-time SEO patch (point 46)
- New country → add to `destinations` in `bluezone-facts.json`, then build
  one destination page from the `study-in-china-from-pakistan.html`
  template, then add it to `sitemap.xml`, `llms.txt`, and the Knowledge Hub.
- New office → add to `offices` in `bluezone-facts.json` and the NAP CSV,
  then build one city page from the Mansehra template (or a nearest-office
  page if it's a service area without its own office).
- New article → add to the Knowledge Hub's list; no rebuild required.
- Never let the JSON-LD on a page drift from `bluezone-facts.json` — if a
  fact changes, change it there first.

## The ~100-query AI-visibility test set
See `src/data/ai-visibility-test-queries.csv` for the full list and the
columns to fill in each measurement cycle:
`query, category, date_checked, engine, mentioned(y/n), cited(y/n),
bluezone_url_cited, wording_used, competitors_mentioned, notes`.
