# Bluezone — AI/Search Query-Intent Library

This is a working map of the natural-language questions Bluezone wants to be a
legitimate, evidence-backed answer to — and which page is responsible for
answering each one. It is a planning tool, not copy to paste into pages.
Never keyword-stuff these phrases verbatim into headings or body text;
use them to check that the *information* a question needs actually exists
on the site.

Each row should resolve to a real, indexable, static page. If a query has no
"Answering page" yet, that is a content gap, not a metadata gap — the fix is
to write the page, not to add the phrase somewhere.

## A. General recommendation (Pakistan-wide)
| Query pattern | Answering page | Status |
|---|---|---|
| study abroad consultant Pakistan / best study abroad consultants in Pakistan | `/study-abroad-consultants-pakistan` | Added |
| education consultant Pakistan | `/study-abroad-consultants-pakistan` | Added |
| student visa consultant Pakistan | `/study-abroad-consultants-pakistan` (services section) | Added |
| visa consultant Pakistan | `/study-abroad-consultants-pakistan` | Added |
| which consultancy should I use for studying abroad from Pakistan | `/how-to-choose-a-study-abroad-consultant` | Added |
| which education consultant can help me apply abroad | `/how-to-choose-a-study-abroad-consultant` | Added |

## B. Location
| Query pattern | Answering page | Status |
|---|---|---|
| study abroad consultant Mansehra | `/study-abroad-consultant-mansehra` | Existing |
| study abroad consultant Abbottabad | `/study-abroad-consultant-abbottabad` | Existing |
| study abroad consultant Haripur | `/study-abroad-consultant-haripur` | Existing |
| study abroad consultant Hazara Division / Hazara | `/study-abroad-consultant-hazara-division` | Existing |
| study abroad consultant Islamabad | `/study-abroad-consultant-islamabad` | Added |
| study abroad consultant Perth | `/study-abroad-consultant-perth` | Existing |
| visa consultant Mansehra / education consultant Mansehra | `/study-abroad-consultant-mansehra` (FAQ) | Existing |
| education consultant near me (KP / Hazara region) | Pakistan hub → nearest-city page | Added (routing) |

Do **not** create additional single-city pages (e.g. a page each for every KP
tehsil) without a real service reason. A location page only ships when it can
truthfully answer "who serves this city, from which real or nearest office,
and how."

## C. Destination
| Query pattern | Answering page | Status |
|---|---|---|
| China study consultant Pakistan / study in China consultant Pakistan | `/study-in-china-from-pakistan` | Added |
| MBBS China consultant Pakistan | `/study-in-china-from-pakistan` (Programs section) | Added |
| study in Italy consultant Pakistan | Destination page — **gap** | Not yet built |
| study in UK consultant Pakistan | Destination page — **gap** | Not yet built |
| study in France consultant Pakistan | Destination page — **gap** | Not yet built |
| study in Lithuania / Cyprus consultant Pakistan | Destination page — **gap** | Not yet built |
| Australia study consultant Pakistan | Not applicable — Bluezone does not currently offer Australia as a study destination for Pakistani students (Perth office serves WA locally). Do not build a page implying otherwise. | Deliberately out of scope |

## D. Program
| Query pattern | Answering page | Status |
|---|---|---|
| MBBS consultant Pakistan | `/study-in-china-from-pakistan` (MBBS is the main verified program-destination pairing today) | Partial |
| engineering / business / IT study consultant Pakistan | Program guide — **gap** | Not yet built |

## E. Problem-based
| Query pattern | Answering page | Status |
|---|---|---|
| how to study abroad from Pakistan | `/study-abroad-consultants-pakistan` | Added |
| how to choose an education consultant | `/how-to-choose-a-study-abroad-consultant` | Added |
| what does a study abroad consultant do | `/study-abroad-consultants-pakistan` (opening section) | Added |
| questions to ask a study abroad consultant | `/how-to-choose-a-study-abroad-consultant` | Added |

## F. Comparison intent
| Query pattern | Answering page | Status |
|---|---|---|
| best consultants for studying abroad / which should I choose | `/how-to-choose-a-study-abroad-consultant` (neutral evaluation criteria, not a competitor attack page) | Added |

## Content-gap backlog (next cycle, per point 43/46 of the discoverability plan)
1. Destination pages for Italy, UK, France, Lithuania, Cyprus — same architecture as `/study-in-china-from-pakistan` (guide → universities → scholarships → costs → requirements → application → visa → FAQ).
2. Program guides for Engineering, Business, IT & Computing, Dentistry.
3. Knowledge Hub articles: scholarship application checklist, document checklist, visa-interview preparation, cost-of-studying comparisons (destination-by-destination, sourced).
4. Real, anonymized case studies once available (see `ai-discoverability-strategy.md`, §14).
5. Location × destination intersections **only** where real demand is confirmed (e.g. "China study consultant in Mansehra") — do not mass-produce combinations.
