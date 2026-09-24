# Bluezone — dummy values to replace

Search every file for: `DUMMY`, `0000`, `dummy.example`. Replace, then re-run `build_city.py` for the city pages.

| Item | Dummy value | Where it lives |
|---|---|---|
| Mansehra phone / WhatsApp | +92 000 0000001 | `CONFIG.offices.mansehra` in bluezone_final.html; `PHONE` in build_city.py |
| Abbottabad phone / WhatsApp | +92 000 0000002 | `CONFIG.offices.abbottabad`; `PHONE` |
| Australia phone / WhatsApp | +61 0 0000 0003 | `CONFIG.offices.australia`; `PHONE` |
| Site-wide WhatsApp button | 920000000001 | `CONFIG.whatsapp` |
| Emails (3) | mansehra@ / abbottabad@ / australia@dummy.example | `CONFIG.offices.*.email`; `EMAIL` |
| Perth hours | Mon–Fri 09:00–17:00 AWST | `CONFIG.offices.australia.hours`; `PERTH_HOURS`; Perth FAQ |
| Facebook / Instagram / LinkedIn / YouTube | .../DUMMY_REPLACE_ME | `CONFIG.social`; `SOCIAL`; JSON-LD `sameAs` (head + city pages) |
| Google Maps links | Address-based search links (work now) | Replace with each Google Business Profile share link when verified |
| Formspree endpoints | empty | `CONFIG.endpoints` (forms still in demo mode) |

Also update: `hasMap`, `telephone`, `email`, `sameAs` in each city page's JSON-LD (generated from the config in build_city.py).
