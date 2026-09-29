# PROJECT.md: CCS Lab Tracker

Group project (IS-INNO): CCS computer-lab equipment reporting. Instructors report broken keyboards, mice and PCs; the lab technician starts and resolves repairs; everyone sees one live sheet. Repo `FebyStack/IS-INNO` is shared with teammates.

## Architecture
- Static site, no build: `index.html` + `drama/*.css` + `source/*.js` (ES modules). Firestore `reports` collection via Firebase SDK 10.12.0 (gstatic CDN); Firebase Hosting project `lab-track-4897c`.
- Every rule lives in `source/domain.js` (pure, unit-tested). Views (`seatmap.js`, `form.js`, `tracker.js`, `analytics.js`, `demo.js`) render from one `createState()` store fed by one listener (`firestore-store.js`). Views only call `api.add` / `api.update`.
- Demo mode swaps in `memoryStore` (same interface). It never writes to Firestore and resets on reload.
- Design tokens: `drama/tokens.css` (dark-only "violet ink"). Icons: Phosphor sprite `assets/icons.svg`, list in `scripts/build-icons.mjs`. The logo (`assets/brand/iss-logo.png`, class `.crest`) shows in full color; its alpha doubles as the mask for the shine and the loading reveal.

## Commands
- `npm run dev` -> http://localhost:5173 (port 5000 is taken by macOS AirPlay Receiver).
- `npm test` -> node:test, zero dependencies.
- `npm run icons` after adding a name to `ICONS`.
- Preview deploy: `firebase hosting:channel:deploy redesign --expires 7d`. Release: `firebase deploy --only hosting`. Rules are unchanged, so no firestore deploy.

## Decisions (2026-09-29)
- Redesign added no product features: 2 roles, client-side role passwords, the exact-text duplicate rule (same lab + PC + equipment + description on an open ticket) and the technician actions are unchanged.
- New writes say `Resolved`; legacy `Fixed` docs are mapped in `normalizeStatus`.
- The duplicate check runs on the in-memory list, not a Firestore query, so `firestore.indexes.json` is unused.
- Dark-only theme, Geist + Geist Mono, no emoji and no em/en dashes in UI files (enforced by `tests/lint.test.js`).
- Stay vanilla (no framework, no bundler) so teammates keep editing plain files.

## Gotchas
- Firestore rules are open and passwords sit in client JS. Known; the fix (Firebase Auth + rules) is a separate change.
- `source/firebase-config.js` is public by design; keep it tracked.
- The outer folder `~/Developer/IS-INNO` is a stale clone of this repo; work in `~/Developer/IS-INNO/IS-INNO`.
- Local dev caches CSS hard; if a style change doesn't show, force-reload.
- Don't test create/update flows against the live database; use demo mode.
