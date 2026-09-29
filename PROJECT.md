# PROJECT.md: CCS Lab Tracker

Group project (IS-INNO): CCS computer-lab equipment reporting. Instructors report broken keyboards, mice and PCs; the lab technician starts and resolves repairs; everyone sees one live sheet. Repo `FebyStack/IS-INNO` is shared with teammates.

## Architecture (current, before the redesign)
- Static site, no build: `index.html`, `drama/*.css` (styles), `source/*.js` (ES modules). Firestore `reports` collection via Firebase SDK 10.12.0 (gstatic CDN); Firebase Hosting project `lab-track-4897c`.
- Roles `instructor` / `technician`: client-side passwords in `source/auth.js`, session in localStorage `isLoggedIn` + `userRole`.
- Duplicate rule (`source/form.js`): same lab + computer + equipment + exact description on a Reported / In Progress ticket.

## Run
- `python3 -m http.server 5173` from this folder (port 5000, Firebase's default, is taken by macOS AirPlay Receiver).
- No tests yet; the redesign plan adds `npm test` (node:test, zero dependencies).

## Decisions (2026-09-29, locked spec)
- Redesign: "seat map + asset tags", dark-only "violet ink" palette, Geist + Geist Mono, Phosphor icons, textures, overlays, motion graphics, animated logo loading screen (CCS Information Systems Society badge, `assets/brand/iss-logo.png`), demo seed + walkthrough.
- No new product features: keep 2 roles, client-side passwords, the duplicate rule, the technician actions and all Firestore field names. Only "Fixed" becomes "Resolved" (legacy docs read-mapped).
- Stay vanilla + Firebase (no framework, no bundler).

## Gotchas
- Firestore rules are open (no auth) and passwords sit in client JS. Known; out of scope for the redesign.
- `source/firebase-config.js` is public by design; keep it tracked.
- The outer folder `~/Developer/IS-INNO` is a stale clone of this repo; work here, in `~/Developer/IS-INNO/IS-INNO`.

## Status
- Plan: `docs/superpowers/plans/2026-09-29-ccs-lab-tracker-redesign.md` (not started; Task 10 rewrites this file).
