# CCS Lab Tracker Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the group's CCS Lab Equipment Tracker into a techy, minimal, violet "seat map + asset tag" interface with textures, icons, overlays, motion graphics and an animated logo loading screen, plus a demo seed and guided walkthrough, without adding product features.

**Architecture:** Keep the existing no-build stack: static HTML, CSS and ES modules, with Firebase Firestore via CDN and Firebase Hosting. Every rule moves into pure, Node-tested modules (`domain.js`, `store.js`). Thin DOM view modules re-render from one tiny pub/sub state fed by a single realtime listener. Demo mode swaps the Firestore adapter for an in-memory adapter with the same interface, so demos never touch the shared record.

**Tech Stack:**
- **Page:** HTML5 and vanilla ES modules.
- **CSS:** custom properties, `@starting-style`, `:has()`, `color-mix()`, the View Transitions API and the popover API.
- **Data and hosting:** Firebase JS SDK 10.12.0 from the gstatic CDN (Firestore), Firebase Hosting.
- **Tests:** Node 22 `node:test` (dev only, zero dependencies).
- **Fonts and icons:** Geist and Geist Mono (self-hosted woff2), Phosphor icons (regular weight) as one SVG sprite.

## Global Constraints

- **No new product features.** The user answered "dont add any new feature" (2026-09-29). Keep:
  - the two roles (`instructor`, `technician`);
  - the client-side role + password login and its localStorage keys (`isLoggedIn`, `userRole`);
  - the original duplicate rule: same lab + computer + equipment + exact description on a `Reported` or `In Progress` ticket;
  - the technician actions (Start repair; Mark resolved);
  - the Firestore `reports` collection and its field names (`instructorName`, `reportedBy`, `labRoom`, `computerNumber`, `equipmentType`, `issueDescription`, `priority`, `status`, `isDuplicate`, `reportedAt`, `updatedAt`).
- **Only additions:** the redesign (seat map + asset tags, textures, icons, overlays, motion graphics, logo loading screen) and the demo seed + walkthrough.
- **Status wording:** new writes say `Resolved` instead of `Fixed` (the assignment's word). Legacy `Fixed` docs are read as `Resolved`.
- **Palette** ("Violet ink", dark only; tokens in Task 4):
  - Surfaces: bg `#0C0B13`, surface `#14131E`, raised `#1D1C2A`, line `#323142`, line-strong `#67667C`.
  - Text: text `#F0EFF5`, text-2 `#B0AFBF`, text-3 `#858495`.
  - Accent: accent `#7850DA`, accent-hi `#BFB1FF`, accent-lo `#302356`, on-accent `#FAFAFD`.
  - Status: reported `#F6B84D`, progress `#65CDF3`, resolved `#61DA92`, dup `#A4A3B1`, critical `#FD717C`, orchid `#E486C6` (demo only).
- **Fonts:** Geist + Geist Mono, self-hosted from `geist@1.7.2`. No Inter, no Google Fonts `<link>`.
- **Icons:** Phosphor `@phosphor-icons/core@2.1.1` regular only, through `assets/icons.svg`. No emoji anywhere in the UI, no hand-drawn icon paths.
- **Copy:** no em dashes or en dashes in UI files (lint-tested in Task 10). Sentence case. Labels sit above inputs.
- **Motion:**
  - Animate transform/opacity only, plus stroke-dashoffset and background-position on the loading screen.
  - `prefers-reduced-motion: reduce` switches every animation off (global guard in `drama/base.css`).
  - Grain lives only on the fixed `body::after` layer.
- **Contrast:** WCAG 2.1 AA for every text token (values above were computed, not eyeballed). Status always ships as icon + label + color.
- **Stack:**
  - No framework, no bundler, no runtime npm dependencies. `package.json` is dev-only (tests, icon build).
  - The Firebase SDK stays 10.12.0 from gstatic. `source/firebase-config.js` is not modified.
- **Local dev port:** 5173. Port 5000, Firebase's default, is held by the macOS AirPlay Receiver.
- **Where to work:**
  - Work in the nested clone `/Users/febrielotud/Developer/IS-INNO/IS-INNO`, on branch `redesign/seat-map`.
  - Never commit to `main`, never force-push (teammates share `FebyStack/IS-INNO`).
  - Don't write to the live database while testing: create/update flows are exercised in demo mode (Task 9).
- **Deploys:** any `firebase deploy` / `hosting:channel:deploy` runs only after the user confirms in chat.
- **Reviews:** one review pass at the end of the plan, not per task (user rule).
- **Commits:** end every commit message with the trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

---

## Locked Spec (confirmed 2026-09-29)

**Answers from the one-batch interview**

| Question | Answer |
|---|---|
| Visual direction | **Seat map + asset tags.** The home screen is the lab floor plan. Each PC is a seat tile lit by its open tickets, and tickets look like equipment property tags. |
| Palette | **Violet ink** (dark column of the approved preview). |
| Extra permissions | **None.** "dont add any new feature": capabilities per role stay exactly as today. |
| In-app submission extras | **Demo seed + walkthrough** only. |

**Mid-planning requirements (2026-09-29, from the user)**
- Use the CCS Information Systems Society logo (full-color purple badge on transparent, `assets/brand/iss-logo.png`). It replaced an earlier white JRMSU CCS Student Government crest.
- Add animations and motion graphics everywhere they carry meaning.
- Add an animated loading screen, so the app never looks static or plain.

**Stated defaults (kept)**
- **Stack:** stays vanilla + Firebase.
- **Devices:** phone (instructor reporting mid-class) + desktop (technician).
- **Status names:** Reported → In Progress → Resolved.
- **Privacy:** no tracking cookies, so no consent banner.
- **States:** logo loading screen tied to real startup steps, empty states that teach, and errors with a retry.
- **Hosting:** the existing Firebase project `lab-track-4897c`, with no Lovable or other site to integrate.

**Stated defaults (dropped because of "no new features", with reasons)**
- **Firebase Auth sign-in:** dropped because it changes how login works. Flagged under Security notes.
- **Lab in-charge role:** dropped as a new role.
- **Merging duplicates into a parent ticket:** dropped as new behavior. The asset tag only *counts* duplicates from existing data.
- **Removing the optional student-name field:** dropped, because changing the form is a product change. The field stays.
- **Light theme:** dropped. The approved preview is dark, and system light mode would swap the look on most lab PCs.
- **Skeleton loaders:** dropped. The loading screen waits for the first snapshot, so there is nothing to skeleton.

**Design read** (design-taste-frontend §0.B): the dials are `DESIGN_VARIANCE 4 / MOTION_INTENSITY 6 / VISUAL_DENSITY 5`.
- **What it is:** an internal ticketing tool (impeccable *Operate* mode) for CCS instructors and the lab technician.
- **Look:** a techy-minimal violet language.
- **Built with:** native CSS tokens, Geist/Geist Mono, Phosphor icons, and motion used only for hierarchy, feedback and state change.

---

## Blueprint

### Folder structure (after Task 10)

The existing folder names `drama/` (CSS) and `source/` (JS) are kept for the group.

```
IS-INNO/IS-INNO/                  # the app: github.com/FebyStack/IS-INNO
├── index.html                    # shell: loading screen, login, app regions, dialogs, toasts, walkthrough
├── assets/
│   ├── brand/iss-logo.png        # full-color ISS badge; its alpha also masks the shine and the loading reveal
│   ├── fonts/Geist-Variable.woff2, GeistMono-Variable.woff2
│   └── icons.svg                 # generated Phosphor sprite (npm run icons)
├── drama/
│   ├── tokens.css                # palette, type scale, radii, motion, z-index, tone mapping
│   ├── base.css                  # @font-face, reset, textures, app shell, reduced-motion guard
│   ├── components.css            # buttons, fields, segmented, chips, asset tag, sheets, confirm, toasts, empty states
│   └── boot.css login.css seatmap.css form.css tracker.css analytics.css demo.css
├── source/
│   ├── app.js                    # entry: loading screen → login or app, store wiring
│   ├── domain.js                 # every rule, pure (tested)
│   ├── store.js                  # app state + in-memory store (tested)
│   ├── firestore-store.js        # Firestore adapter, one realtime listener (browser only)
│   ├── firebase-config.js        # unchanged
│   ├── ui.js                     # icon(), toast(), confirmDialog(), swap(), countUp(), sheet()
│   └── boot.js auth.js seatmap.js form.js tracker.js analytics.js demo.js
├── scripts/build-icons.mjs       # dev only
├── tests/*.test.js               # node --test, zero dependencies (39 tests)
├── docs/superpowers/plans/       # this plan
├── PROJECT.md                    # memory file (honey-memory format)
├── package.json                  # dev scripts only
└── firebase.json firestore.rules firestore.indexes.json
```

### Component architecture

```
Firestore "reports" ─ onSnapshot ─► firestore-store ─┐
                                                      ├─► sync() ─► state { role, lab, reports, filter }
demo: memoryStore (same interface) ──────────────────┘          │ subscribe (reference-equality guards)
                     ┌───────────────┬───────────────┬───────────┴───┬──────────────┬─────────────┐
                  seatmap         tracker          drawer          insights       chrome        demo bar
                     │ onSeat        │ row/actions     │ actions                    (role chip)   + walkthrough
                     ▼               ▼                 ▼
            instructor: report sheet ─► buildReport() + findDuplicate() ─► api.add()    ─► store
            technician: drawer ─────────────────────────────────────────► api.update() ─► store
```

- Views never import Firebase. They call `api.add` / `api.update` and re-render from `state`.
- `domain.js` holds every rule (duplicates, seat states, metrics, filters, timeline, barcode), so the rules are unit-tested without a browser.
- `firebase-config.js` and `firestore-store.js` are loaded with dynamic `import()`, so demo mode also works offline.

### Design system

**Color:** the tokens in Task 4.
- The accent is used only for primary actions, selection and the current timeline step. Status colors are reserved for status.
- The dataviz validator flagged rose↔green at ΔE 7.0 for deuteranopes, so secondary encoding is mandatory. Every status carries an icon and a text label, and seats also expose it in `aria-label`.

**Type:** Geist for UI, Geist Mono for seat codes, ticket ids, times, counts and the loading log.
- Fixed rem scale 12 / 13 / 15 / 18 / 24 px.
- Headings are 600 weight at -0.015em tracking.
- Inputs are 16px so phones don't zoom.

**Shape:** panels 12px, controls 8px (nested segments 4px), chips pill. This is documented in `tokens.css`.

**Textures:**
- Film grain: SVG `feTurbulence`, 7% `overlay`, fixed `body::after`.
- A violet top glow plus vignette behind all content.
- A dot-grid "floor" under the seat map with a "Front of the room" marker.
- Asset tags: a punched hole, a per-ticket barcode (deterministic from the ticket id) and a foil sheen that sweeps on hover.

**Icons:** 23 Phosphor regular glyphs in one 9.9 KB sprite:
arrow-counter-clockwise, arrow-right, chalkboard-teacher, chart-bar, check, clock, copy, desktop-tower, hand-tap, info, keyboard, list-checks, magnifying-glass, monitor, mouse-simple, play, seal-check, sign-out, toolbox, user-switch, warning-circle, wrench, x.

**Overlays:**
- The loading screen.
- Native `<dialog>` sheets: a right drawer on desktop and a bottom sheet on phones, with a blurred scrim, `@starting-style` entry and a discrete exit.
- A confirm dialog.
- Toasts in a `popover` (top layer, so they sit above open dialogs).
- The walkthrough spotlight (scrim with an orchid ring and a step card).

**Motion inventory.** Every moment has a reason, all of it is off under reduced motion, and UI transitions run 120 to 320 ms.

| Moment | What moves | Why |
|---|---|---|
| Loading screen | Logo charges bottom-up (a gradient mask slides up over the full-color badge), a shine sweeps inside the badge shape, dotted progress ring draws per **real** startup step, log lines rise word by word, then the logo docks into its slot on the login or top bar (WAAPI FLIP) | Brand moment + honest progress |
| Login | Slow violet glow drift, periodic sheen across the logo | Ambient life on a waiting screen |
| Lab switch | Seats power on in a 12 ms stagger, LEDs flicker on in `steps(3)` | Shows *this* lab's seats appeared |
| Seat state | Reported LED breathes; In Progress LED blinks in `steps(2)`; lift on hover | Status you can see from across the room |
| Sheets and confirm | Slide or scale in, blurred scrim fades | Spatial continuity |
| Tracking sheet | New rows flash violet (realtime); a changed status chip "stamps" in; filter change cross-fades (View Transitions) | Feedback that the shared record changed |
| Ticket timeline | Connectors draw on, current step pops | State transition |
| Insights | Numbers count up; bars grow from the baseline | Hierarchy on reveal |
| Walkthrough | Spotlight and card fade between targets; smooth scroll | Guided storytelling |

### Responsive layouts

| Width | Layout |
|---|---|
| < 640px | Seat grid 5 columns (10 rows, ≥ 44px seats) |
| ≥ 640px | Seat grid 10 columns (5 rows), max 720px, centered on the floor |
| < 420px | Role chip and Log out collapse to icons (labels stay for screen readers) |
| < 768px | Sheets become bottom sheets; toasts move to the top |
| < 1024px | Tracking rows become cards (phones and tablets) |
| 1024 to 1279px | Tracking sheet hides the Instructor column (it stays in the drawer); action buttons may stack |
| ≥ 1024px | Technician: map + Insights side column (`minmax(300px, 360px)`), tracking sheet full width below. Instructor: single column |
| Coarse pointer | Buttons ≥ 44px, segments ≥ 40px |

### State management

- One `createState()` object: `{ role, lab, reports, filter }`, with subscribers.
- Views skip work with reference-equality guards (`s.reports === last.reports`).
- The seat map patches attributes on 50 persistent buttons instead of re-rendering them, so focus and LED animations survive realtime updates.
- The tracking sheet restores focus to the same row after a re-render.

### SEO

- This is an internal tool behind a demo login, so the page is `noindex` with a real `<title>`, `description` and `theme-color`.
- No sitemap or OG image (YAGNI).
- **Trade-off:** keeping the lab's issue list out of search results matters more than discoverability.

### Performance

- **Payload:**
  - Geist (70 KB, preloaded) and Geist Mono (71 KB, `swap`).
  - The logo (160 KB, preloaded; shown as a background image, its alpha reused as a mask for the shine).
  - The 10 KB sprite, about 25 KB of CSS and about 25 KB of own JS.
  - The Firebase SDK, as before.
- **Reads:** one Firestore listener instead of two (the old tracker and analytics each opened one), which halves snapshot reads.
- **Painting:**
  - Animations use transform/opacity, and the grain is static.
  - The duplicate check runs on the loaded list, so there's no query round-trip before a submit.

### Accessibility

- **Contrast:** WCAG 2.1 AA, verified. Every text token is at least 4.5:1 on bg, surface and raised; input borders are 3.3:1; white on accent is 5.1:1.
- **Seats:**
  - Seats are real `<button>`s with full labels (for example "LAB2-PC14, 2 open reports, Reported, high priority").
  - They use roving tabindex with Arrow, Home and End keys.
  - The high-priority corner is shape plus color.
- **Dialogs:** native `<dialog>` handles focus trap and restore, and Esc closes.
- **Announcements:** toasts use `role="status"` in an `aria-live` region.
- **Motion and focus:** `:focus-visible` rings everywhere, plus the reduced-motion global guard.
- **Structure:** semantic landmarks, one `h1` per screen, and `lang="en"`.

### Analytics integration

- No third-party analytics or cookies (privacy default, so no consent banner).
- The in-app **Insights** panel is the analytics this lab needs, with the same metrics as before: reports by lab, by equipment, resolution rate and duplicate rate.
- **Trade-off:** there is no usage telemetry. Adding Firebase Analytics later would need a consent step.

### Deployment workflow

1. **Local:** `npm run dev` (http://localhost:5173) and `npm test`.
2. **Review:** `firebase hosting:channel:deploy redesign --expires 7d` produces a preview URL the group can open on phones. It needs `firebase login` and the user's OK.
3. **Release:** PR `redesign/seat-map` → `main` on GitHub, then `firebase deploy --only hosting`.

Notes:
- Firestore rules and indexes are unchanged, so there is no `firestore` deploy.
- `firebase.json` now ignores dev files (`package.json`, `scripts/`, `tests/`, `docs/`, `*.md`).

### Key trade-offs

1. **Vanilla over React/Vite.**
   - Pro: teammates keep editing plain files with zero build and zero dependencies.
   - Con: manual DOM patching.
   - Mitigation: rules live in one pure module, and each view is under 180 lines.
2. **Duplicate check on the in-memory list instead of a Firestore query.**
   - Pro: the rule is identical, it's instant, and it powers the "Already open on this PC" nudge. The old composite index (which lacked `computerNumber`) is no longer needed.
   - Con: two instructors submitting within the same second can both pass. The same race existed before.
3. **Dark only.**
   - Pro: matches the approved preview and halves QA.
   - Con: no light theme for very bright rooms.
4. **Demo on an in-memory store.**
   - Pro: it never pollutes the shared record, works offline and resets on reload.
   - Con: demo data isn't shared across devices, which is fine for a presentation.
5. **impeccable launcher not run.** Its Setup downloads a platform binary (github.com/pbakaus/impeccable releases). That download wasn't approved, so planning used the skill's documented fallback (read the project directly). The user can approve it later for `impeccable critique` or `audit` on the built UI.

### Security notes (unchanged on purpose, flagged)

- **Open Firestore rules:** `firestore.rules` lets anyone read, create and update `reports` without signing in.
- **Passwords in the repo:** the role passwords sit in client JS, in a public repo.
- **Why kept:** the redesign keeps both because of the no-new-features rule.
- **Recommended follow-up:** Firebase Auth plus role-checked rules.
- **`source/firebase-config.js` stays tracked:** Firebase web config is public by design. The old `.gitignore` line meant to hide it was written in UTF-16 and never worked. Untracking it now would break teammates' clones.

---

## Assignment coverage

| Assignment item | Where it lands |
|---|---|
| 1. Draw current process + 2 problems | Group deliverable (not in the app). The two problems the app answers: no shared record → repeat reports; no status → instructors can't tell if it's fixed |
| 2. Proposed process + responsibilities | Group deliverable. Roles in the app: Instructor reports from the seat map, Technician starts repair and resolves; everyone sees the same sheet live |
| 3. Build the form and tracking sheet | Report sheet (Task 7) + Tracking sheet (Task 6) |
| 4. Test five fictional reports, incl. one duplicate | Demo seed (Task 9) + `tests/demo.test.js` proves exactly one duplicate |
| 5. One ticket Reported → Resolved | Walkthrough steps 4 to 6 (Task 9): LAB1-PC07 |
| 6. What the test revealed | See below |

**The 5 fictional reports** (seeded in demo mode):

| # | Seat | Equipment | Issue | Priority | Instructor | Result |
|---|---|---|---|---|---|---|
| 1 | LAB1-PC07 | Computer | Won't power on. No lights on the system unit. | High | Engr. Ramil Dagohoy | Reported, then Resolved in the walkthrough |
| 2 | LAB2-PC14 | Keyboard | Keys E, R and T don't respond. | Medium | Ms. Rhea Tampus (student: Kyla Bontilao) | Reported |
| 3 | LAB2-PC03 | Mouse | Cursor freezes and the scroll wheel is loose. | Low | Mr. Joel Saavedra | Reported |
| 4 | LAB3-PC21 | Computer | Stuck on the boot screen and restarts by itself. | High | Prof. Liza Macaraeg | Reported |
| 5 | LAB2-PC14 | Keyboard | Keys E, R and T don't respond. | Medium | Engr. Dennis Cabahug | **Duplicate** of #2 |

**What the test reveals** (material for task 6, not features):
- **Exact wording only:** the duplicate rule only catches word-for-word repeats (#5). A reworded report of the same broken keyboard would become a second ticket. The seat map's "Already open on this PC" list is the practical guard, because the instructor sees the open ticket before typing.
- **Priority can disagree:** the reporting instructor picks it, so two reports of one problem can say different things.
- **No history per step:** only the current status and `updatedAt` are stored, so the timeline can't say *when* each step happened or *who* moved it.

---

## Preflight (checked 2026-09-29)

- **Folder:** the app is the nested clone `/Users/febrielotud/Developer/IS-INNO/IS-INNO` (`origin` = `https://github.com/FebyStack/IS-INNO.git`, `main` at `db2ea7d`). The outer folder `/Users/febrielotud/Developer/IS-INNO` is a stale clone of the same repo (only the initial `.gitattributes` commit), so don't work there.
- **Docker:** not needed.
- **Ports:** 5173 is free. 5000 is held by ControlCenter (AirPlay Receiver).
- **Tools:** Node 22.23.1 ✓. firebase-tools 15.17.0 ✓ (deploy only). Java is missing, which is fine: no emulator is needed because rules are unchanged.
- **Browser preview:** `/Users/febrielotud/Developer/IS-INNO/.claude/launch.json` has the config `ccs-lab-tracker` (`python3 -m http.server 5173 --directory …/IS-INNO/IS-INNO`).
- **Database migrations:** none. The Firestore schema is unchanged, and legacy `Fixed` is mapped on read.
- **Logo file:** `assets/brand/iss-logo.png` was already copied into the nested clone during planning (untracked). Task 1 commits it.

---

### Task 1: Branch, tooling, assets, repo hygiene

**Files:**
- Create: `package.json`, `scripts/build-icons.mjs`, `assets/icons.svg` (generated), `assets/fonts/Geist-Variable.woff2`, `assets/fonts/GeistMono-Variable.woff2`, `tests/assets.test.js`
- Commit (already on disk from planning): `assets/brand/iss-logo.png`, `PROJECT.md`, `docs/superpowers/plans/2026-09-29-ccs-lab-tracker-redesign.md`
- Modify: `.gitignore` (line 7 is UTF-16 garbage that breaks the `Thumbs.db` entry), `firebase.json` (keep dev files off Hosting)

**Interfaces:**
- Consumes: nothing.
- Produces: `ICONS: string[]` exported by `scripts/build-icons.mjs` (the lint test in Task 10 checks UI usage against it); sprite symbol ids equal Phosphor names; `npm test` / `npm run icons` / `npm run dev`.

- [ ] **Step 1: Branch from the latest shared main**

```bash
cd /Users/febrielotud/Developer/IS-INNO/IS-INNO
git fetch origin
git log --oneline -3 origin/main
git status --short
```

Expected: `db2ea7d Remove firebase-config kay naka public ang repo HAHAHAAH` on top; status shows only the planning session's untracked files: `?? PROJECT.md`, `?? assets/`, `?? docs/`. If `origin/main` has newer commits, stop and tell the user (teammates changed files; the plan's edits may need rebasing).

```bash
git switch -c redesign/seat-map origin/main
```

- [ ] **Step 2: Add the dev-only package.json** (needed so Node treats `.js` as ES modules)

`package.json`

```json
{
  "name": "ccs-lab-tracker",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test",
    "icons": "node scripts/build-icons.mjs",
    "dev": "python3 -m http.server 5173"
  }
}
```

- [ ] **Step 3: Write the failing test**

`tests/assets.test.js`

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { ICONS } from "../scripts/build-icons.mjs";

const read = (path, enc) => readFile(new URL(`../${path}`, import.meta.url), enc);

test("the icon sprite has every icon in the build list", async () => {
  const sprite = await read("assets/icons.svg", "utf8");
  for (const name of ICONS) assert.ok(sprite.includes(`<symbol id="${name}"`), `missing ${name}`);
});

test("fonts are real woff2 files", async () => {
  for (const f of ["Geist-Variable.woff2", "GeistMono-Variable.woff2"]) {
    assert.equal((await read(`assets/fonts/${f}`)).subarray(0, 4).toString(), "wOF2", f);
  }
});

test("the logo is a PNG with transparency", async () => {
  const png = await read("assets/brand/iss-logo.png");
  assert.equal(png.subarray(1, 4).toString(), "PNG");
  assert.equal(png[25], 6, "color type 6 = RGBA");
});
```

- [ ] **Step 4: Run it to see it fail**

Run: `npm test`
Expected: FAIL, `ERR_MODULE_NOT_FOUND` for `scripts/build-icons.mjs`.

- [ ] **Step 5: Add the icon build script**

`scripts/build-icons.mjs`

```js
// Builds assets/icons.svg from Phosphor (regular weight) so the app ships one small sprite.
// Run: npm run icons   (needs internet; commit the generated file)
import { writeFile } from "node:fs/promises";

const VERSION = "2.1.1";
export const ICONS = [
  "arrow-counter-clockwise", "arrow-right", "chalkboard-teacher", "chart-bar", "check", "clock",
  "copy", "desktop-tower", "hand-tap", "info", "keyboard", "list-checks", "magnifying-glass",
  "monitor", "mouse-simple", "play", "seal-check", "sign-out", "toolbox", "user-switch",
  "warning-circle", "wrench", "x",
];

if (import.meta.url === `file://${process.argv[1]}`) {
  const symbols = await Promise.all(
    ICONS.map(async (name) => {
      const res = await fetch(`https://cdn.jsdelivr.net/npm/@phosphor-icons/core@${VERSION}/assets/regular/${name}.svg`);
      if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
      const inner = (await res.text()).replace(/^<svg[^>]*>|<\/svg>\s*$/g, "");
      return `<symbol id="${name}" viewBox="0 0 256 256">${inner}</symbol>`;
    })
  );
  await writeFile(
    new URL("../assets/icons.svg", import.meta.url),
    `<svg xmlns="http://www.w3.org/2000/svg">${symbols.join("")}</svg>\n`
  );
  console.log(`assets/icons.svg: ${ICONS.length} icons`);
}
```

- [ ] **Step 6: Generate the sprite and download the fonts** (pinned versions from jsDelivr)

```bash
npm run icons
mkdir -p assets/fonts
curl -fsSL -o assets/fonts/Geist-Variable.woff2 https://cdn.jsdelivr.net/npm/geist@1.7.2/dist/fonts/geist-sans/Geist-Variable.woff2
curl -fsSL -o assets/fonts/GeistMono-Variable.woff2 https://cdn.jsdelivr.net/npm/geist@1.7.2/dist/fonts/geist-mono/GeistMono-Variable.woff2
wc -c assets/fonts/*.woff2 assets/icons.svg
```

Expected: `assets/icons.svg: 23 icons`; sizes `69652`, `71368`, `9888` bytes.

- [ ] **Step 7: Run the test to see it pass**

Run: `npm test`
Expected: PASS (3 tests).

- [ ] **Step 8: Fix `.gitignore`** (replace the whole file; the old line 7 was written as UTF-16 by PowerShell and matched nothing)

`.gitignore`

```gitignore
node_modules/
.firebase/
.env
.env.local
*.log
.DS_Store
Thumbs.db
```

Keep `source/firebase-config.js` tracked: Firebase web config is public by design and teammates' clones need it.

- [ ] **Step 9: Keep dev files off Firebase Hosting** (replace `firebase.json`)

`firebase.json`

```json
{
  "hosting": {
    "public": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**",
      "package.json",
      "scripts/**",
      "tests/**",
      "docs/**",
      "*.md"
    ],
    "rewrites": [
      { "source": "**", "destination": "/index.html" }
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

- [ ] **Step 10: Commit**

```bash
git add package.json scripts/build-icons.mjs assets tests/assets.test.js .gitignore firebase.json PROJECT.md docs
git commit -m "chore: add test runner, Phosphor sprite, Geist fonts, logo, plan and PROJECT.md" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Domain rules (pure, tested)

**Files:**
- Create: `source/domain.js`, `tests/domain.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces (all exported from `source/domain.js`):
  - **Constants:** `LABS`, `SEATS_PER_LAB` (50), `EQUIPMENT`, `ACTIVE` (`["Reported","In Progress"]`), `STATUS` (`{ [status]: { tone, icon } }`), `EQUIPMENT_ICON`.
  - **IDs and codes:** `normalizeStatus(s)`, `pcNumber(computer)`, `seatCode(lab, computer) → "LAB2-PC14"`, `shortId(id) → "#A7F3C2"`.
  - **Duplicates and reports:** `findDuplicate(report, reports) → report|null`, `reportCount(ticket, reports) → number`, `buildReport(fields, reports) → { report, dup }`.
  - **Seats and metrics:** `seatStates(lab, reports) → [{ n, open, status, high }]`, `openCount(lab, reports)`, `summarize(reports) → { total, byStatus, open, byLab, byEquipment, resolutionRate, duplicateRate }`.
  - **Lists and status flow:** `filterReports(reports, { status, query })`, `byNewest`, `nextActions(status)`, `timeline(status) → [{ step, state }]`.
  - **Display helpers:** `timeAgo(date, now)`, `barcode(id) → { image, width }`.

- [ ] **Step 1: Write the failing test**

`tests/domain.test.js`

```js
import test from "node:test";
import assert from "node:assert/strict";
import * as d from "../source/domain.js";

const r = (over = {}) => ({
  id: "abc123xyz",
  labRoom: "Lab 2",
  computerNumber: "Computer 14",
  equipmentType: "Keyboard",
  issueDescription: "Keys E, R and T don't respond.",
  priority: "Medium",
  status: "Reported",
  instructorName: "Ms. Rhea Tampus",
  ...over,
});

test("seatCode pads the PC number", () => {
  assert.equal(d.seatCode("Lab 2", "Computer 3"), "LAB2-PC03");
  assert.equal(d.seatCode("Lab 1", 14), "LAB1-PC14");
});

test("shortId keeps the original 6-character ticket id", () => {
  assert.equal(d.shortId("a7f3c2Zz"), "#A7F3C2");
});

test("normalizeStatus maps legacy Fixed to Resolved", () => {
  assert.equal(d.normalizeStatus("Fixed"), "Resolved");
  assert.equal(d.normalizeStatus("Reported"), "Reported");
});

test("findDuplicate keeps the original rule: exact same issue on an open ticket", () => {
  const open = r();
  assert.equal(d.findDuplicate(r({ id: undefined }), [open]), open);
  assert.equal(d.findDuplicate(r({ issueDescription: "Keys stuck" }), [open]), null);
  assert.equal(d.findDuplicate(r(), [r({ status: "Resolved" })]), null);
  assert.equal(d.findDuplicate(r(), [r({ status: "In Progress" })])?.status, "In Progress");
});

test("buildReport trims input and flags duplicates", () => {
  const fields = {
    instructorName: "  Engr. Dennis Cabahug ",
    reportedBy: "",
    labRoom: "Lab 2",
    computerNumber: "Computer 14",
    equipmentType: "Keyboard",
    issueDescription: "Keys E, R and T don't respond. ",
    priority: "Medium",
  };
  const { report, dup } = d.buildReport(fields, [r()]);
  assert.equal(report.status, "Duplicate");
  assert.equal(report.isDuplicate, true);
  assert.equal(dup.id, "abc123xyz");
  assert.equal(report.instructorName, "Engr. Dennis Cabahug");
  assert.equal(report.reportedBy, "N/A");
  assert.equal(d.buildReport(fields, []).report.status, "Reported");
});

test("reportCount adds the duplicates filed against a ticket", () => {
  const t = r();
  const others = [r({ id: "dup1", status: "Duplicate" }), r({ id: "x", computerNumber: "Computer 2", status: "Duplicate" })];
  assert.equal(d.reportCount(t, [t, ...others]), 2);
});

test("seatStates: Reported outranks In Progress and High flags the seat", () => {
  const seats = d.seatStates("Lab 2", [
    r({ status: "In Progress" }),
    r({ id: "b", priority: "High" }),
    r({ id: "c", status: "Resolved", computerNumber: "Computer 1" }),
    r({ id: "e", labRoom: "Lab 1" }),
  ]);
  assert.equal(seats.length, 50);
  assert.equal(seats[13].status, "Reported");
  assert.equal(seats[13].open.length, 2);
  assert.equal(seats[13].high, true);
  assert.equal(seats[0].status, null);
});

test("summarize keeps the original analytics metrics", () => {
  const m = d.summarize([
    r(),
    r({ id: "b", status: "Resolved", labRoom: "Lab 1", equipmentType: "Mouse" }),
    r({ id: "c", status: "Duplicate" }),
    r({ id: "e", status: "In Progress", equipmentType: "Computer" }),
  ]);
  assert.equal(m.total, 4);
  assert.equal(m.open, 2);
  assert.equal(m.resolutionRate, 25);
  assert.equal(m.duplicateRate, 25);
  assert.deepEqual(m.byLab, [["Lab 1", 1], ["Lab 2", 3], ["Lab 3", 0]]);
  assert.deepEqual(m.byEquipment[0], ["Keyboard", 2]);
});

test("filterReports matches status and search text, including seat codes", () => {
  const list = [r(), r({ id: "b", status: "Resolved", computerNumber: "Computer 3", equipmentType: "Mouse" })];
  assert.equal(d.filterReports(list, { status: "Resolved" }).length, 1);
  assert.equal(d.filterReports(list, { query: "lab2-pc03" })[0].id, "b");
  assert.equal(d.filterReports(list, { query: "tampus" }).length, 2);
});

test("nextActions mirrors the original technician buttons", () => {
  assert.deepEqual(d.nextActions("Reported"), ["In Progress", "Resolved"]);
  assert.deepEqual(d.nextActions("In Progress"), ["Resolved"]);
  assert.deepEqual(d.nextActions("Duplicate"), []);
});

test("timeline marks done, current and todo steps", () => {
  assert.deepEqual(d.timeline("In Progress").map((s) => s.state), ["done", "current", "todo"]);
});

test("timeAgo buckets", () => {
  const now = new Date("2026-09-29T10:00:00Z");
  assert.equal(d.timeAgo(new Date("2026-09-29T09:59:30Z"), now), "just now");
  assert.equal(d.timeAgo(new Date("2026-09-29T09:15:00Z"), now), "45m ago");
  assert.equal(d.timeAgo(new Date("2026-09-29T07:00:00Z"), now), "3h ago");
  assert.equal(d.timeAgo(new Date("2026-09-27T10:00:00Z"), now), "2d ago");
  assert.equal(d.timeAgo(null, now), "just now");
});

test("barcode is stable per id and differs across ids", () => {
  assert.deepEqual(d.barcode("abc"), d.barcode("abc"));
  assert.notEqual(d.barcode("abc").image, d.barcode("abd").image);
  assert.ok(d.barcode("abc").width > 0);
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `node --test tests/domain.test.js`
Expected: FAIL, `ERR_MODULE_NOT_FOUND` for `source/domain.js`.

- [ ] **Step 3: Implement**

`source/domain.js`

```js
// Pure rules for tickets, seats and insights. No DOM, no Firebase: covered by `npm test`.

export const LABS = ["Lab 1", "Lab 2", "Lab 3"];
export const SEATS_PER_LAB = 50;
export const EQUIPMENT = ["Keyboard", "Mouse", "Computer"];
export const ACTIVE = ["Reported", "In Progress"];

export const STATUS = {
  Reported: { tone: "reported", icon: "warning-circle" },
  "In Progress": { tone: "progress", icon: "wrench" },
  Resolved: { tone: "resolved", icon: "seal-check" },
  Duplicate: { tone: "dup", icon: "copy" },
};

export const EQUIPMENT_ICON = { Keyboard: "keyboard", Mouse: "mouse-simple", Computer: "desktop-tower" };

// Tickets saved before the rename say "Fixed".
export const normalizeStatus = (s) => (s === "Fixed" ? "Resolved" : s);

export const pcNumber = (computer) => Number(String(computer).replace(/\D/g, "")) || 0;

export const seatCode = (lab, computer) =>
  `${String(lab).replace(/\s/g, "").toUpperCase()}-PC${String(pcNumber(computer)).padStart(2, "0")}`;

export const shortId = (id) => `#${String(id).slice(0, 6).toUpperCase()}`;

const sameIssue = (a, b) =>
  a.labRoom === b.labRoom &&
  a.computerNumber === b.computerNumber &&
  a.equipmentType === b.equipmentType &&
  a.issueDescription === b.issueDescription;

// Original rule: same lab, computer, equipment and exact description on a ticket that is still open.
export const findDuplicate = (report, reports) =>
  reports.find((r) => ACTIVE.includes(r.status) && sameIssue(r, report)) ?? null;

// The ticket itself plus every duplicate filed against it.
export const reportCount = (ticket, reports) =>
  1 + reports.filter((r) => r.status === "Duplicate" && sameIssue(r, ticket)).length;

export function buildReport(fields, reports) {
  const report = {
    instructorName: fields.instructorName.trim(),
    reportedBy: (fields.reportedBy ?? "").trim() || "N/A",
    labRoom: fields.labRoom,
    computerNumber: fields.computerNumber,
    equipmentType: fields.equipmentType,
    issueDescription: fields.issueDescription.trim(),
    priority: fields.priority,
    status: "Reported",
    isDuplicate: false,
  };
  const dup = findDuplicate(report, reports);
  if (dup) Object.assign(report, { status: "Duplicate", isDuplicate: true });
  return { report, dup };
}

export function seatStates(lab, reports) {
  const seats = Array.from({ length: SEATS_PER_LAB }, (_, i) => ({ n: i + 1, open: [], status: null, high: false }));
  for (const r of reports) {
    const seat = r.labRoom === lab && ACTIVE.includes(r.status) && seats[pcNumber(r.computerNumber) - 1];
    if (!seat) continue;
    seat.open.push(r);
    if (seat.status !== "Reported") seat.status = r.status; // Reported outranks In Progress
    seat.high ||= r.priority === "High";
  }
  return seats;
}

export const openCount = (lab, reports) =>
  reports.filter((r) => r.labRoom === lab && ACTIVE.includes(r.status)).length;

// Same metrics the original analytics panel showed.
export function summarize(reports) {
  const total = reports.length;
  const count = (key, value) => reports.filter((r) => r[key] === value).length;
  const pct = (n) => (total ? Math.round((n / total) * 100) : 0);
  const byStatus = Object.fromEntries(Object.keys(STATUS).map((s) => [s, count("status", s)]));
  return {
    total,
    byStatus,
    open: byStatus.Reported + byStatus["In Progress"],
    byLab: LABS.map((lab) => [lab, count("labRoom", lab)]),
    byEquipment: EQUIPMENT.map((e) => [e, count("equipmentType", e)]).sort((a, b) => b[1] - a[1]),
    resolutionRate: pct(byStatus.Resolved),
    duplicateRate: pct(byStatus.Duplicate),
  };
}

export function filterReports(reports, { status = "All", query = "" } = {}) {
  const q = query.trim().toLowerCase();
  return reports.filter(
    (r) =>
      (status === "All" || r.status === status) &&
      (!q ||
        [seatCode(r.labRoom, r.computerNumber), r.labRoom, r.computerNumber, r.equipmentType, r.instructorName, r.issueDescription]
          .some((v) => String(v ?? "").toLowerCase().includes(q)))
  );
}

export const byNewest = (a, b) => (b.reportedAt?.getTime() ?? 0) - (a.reportedAt?.getTime() ?? 0);

// Technician buttons per status, unchanged from the original tracker.
export const nextActions = (status) =>
  status === "Reported" ? ["In Progress", "Resolved"] : status === "In Progress" ? ["Resolved"] : [];

export function timeline(status) {
  const at = ["Reported", "In Progress", "Resolved"].indexOf(status);
  return ["Reported", "In Progress", "Resolved"].map((step, i) => ({
    step,
    state: i < at ? "done" : i === at ? "current" : "todo",
  }));
}

export function timeAgo(date, now = new Date()) {
  const s = date ? Math.max(0, (now - date) / 1000) : 0;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

// Decorative barcode for the asset tag, stable per ticket id (FNV-1a seed).
export function barcode(id, bars = 18) {
  let h = 2166136261;
  let x = 0;
  for (const c of String(id)) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const stops = [];
  for (let i = 0; i < bars; i++) {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    const w = 1 + ((h >>> 0) % 3);
    stops.push(`currentColor ${x}px ${x + w}px`, `transparent ${x + w}px ${x + w + 2}px`);
    x += w + 2;
  }
  return { image: `linear-gradient(90deg,${stops.join(",")})`, width: x };
}
```

- [ ] **Step 4: Run the tests**

Run: `npm test`
Expected: PASS (16 tests).

- [ ] **Step 5: Commit**

```bash
git add source/domain.js tests/domain.test.js
git commit -m "feat: pure ticket, seat and insight rules" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: State and stores

**Files:**
- Create: `source/store.js`, `source/firestore-store.js`, `tests/store.test.js`

**Interfaces:**
- Consumes: `normalizeStatus` (Task 2).
- Produces:
  - `createState(initial) → { get(), set(patch), subscribe(fn) → unsubscribe }`.
  - `memoryStore(now?)` and `firestoreStore(db)`, both returning `{ subscribe(onChange, onError) → unsubscribe, add(report) → Promise<id>, update(id, patch) → Promise }`.
  - Reports arrive with `id`, `reportedAt: Date|null`, `updatedAt: Date|null`, `status` normalized.

- [ ] **Step 1: Write the failing test**

`tests/store.test.js`

```js
import test from "node:test";
import assert from "node:assert/strict";
import { createState, memoryStore } from "../source/store.js";

test("createState merges patches and notifies subscribers", () => {
  const state = createState({ a: 1, b: 1 });
  const seen = [];
  const off = state.subscribe((s) => seen.push(s.a));
  state.set({ a: 2 });
  off();
  state.set({ a: 3 });
  assert.deepEqual(seen, [2]);
  assert.deepEqual(state.get(), { a: 3, b: 1 });
});

test("memoryStore adds, updates and streams copies", async () => {
  const store = memoryStore(() => new Date("2026-09-29T10:00:00Z"));
  let latest = [];
  store.subscribe((list) => (latest = list));
  const id = await store.add({ status: "Reported" });
  assert.equal(latest.length, 1);
  assert.equal(latest[0].id, id);
  assert.ok(latest[0].reportedAt instanceof Date);
  await store.update(id, { status: "Resolved" });
  assert.equal(latest[0].status, "Resolved");
  latest[0].status = "tampered";
  await store.update(id, {});
  assert.equal(latest[0].status, "Resolved");
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `node --test tests/store.test.js`
Expected: FAIL, `ERR_MODULE_NOT_FOUND` for `source/store.js`.

- [ ] **Step 3: Implement the state + in-memory store**

`source/store.js`

```js
// App state, plus an in-memory ticket store with the same interface as firestore-store.js
// ({ subscribe, add, update }). Demo mode and the tests run on it; nothing touches Firestore.

export function createState(initial) {
  let state = initial;
  const subs = new Set();
  return {
    get: () => state,
    set(patch) {
      state = { ...state, ...patch };
      subs.forEach((fn) => fn(state));
    },
    subscribe(fn) {
      subs.add(fn);
      return () => subs.delete(fn);
    },
  };
}

export function memoryStore(now = () => new Date()) {
  let reports = [];
  const subs = new Set();
  const snapshot = () => reports.map((r) => ({ ...r }));
  const emit = () => subs.forEach((fn) => fn(snapshot()));
  return {
    subscribe(fn) {
      subs.add(fn);
      fn(snapshot());
      return () => subs.delete(fn);
    },
    async add(report) {
      const id = crypto.randomUUID().replace(/-/g, "").slice(0, 20);
      reports = [...reports, { ...report, id, reportedAt: now(), updatedAt: now() }];
      emit();
      return id;
    },
    async update(id, patch) {
      reports = reports.map((r) => (r.id === id ? { ...r, ...patch, updatedAt: now() } : r));
      emit();
    },
  };
}
```

- [ ] **Step 4: Implement the Firestore adapter** (browser only: it imports the gstatic CDN, so Node tests never load it; it is exercised live in Task 5)

`source/firestore-store.js`

```js
// Firestore adapter: one realtime listener feeds the whole app (the old tracker and analytics each opened their own).
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { normalizeStatus } from "./domain.js";

const toDate = (t) => t?.toDate?.() ?? null;

export function firestoreStore(db) {
  const reports = collection(db, "reports");
  return {
    subscribe: (onChange, onError) =>
      onSnapshot(
        reports,
        (snap) =>
          onChange(
            snap.docs.map((d) => {
              const r = d.data({ serverTimestamps: "estimate" });
              return {
                ...r,
                id: d.id,
                status: normalizeStatus(r.status),
                reportedAt: toDate(r.reportedAt),
                updatedAt: toDate(r.updatedAt),
              };
            })
          ),
        onError
      ),
    add: (report) =>
      addDoc(reports, { ...report, reportedAt: serverTimestamp(), updatedAt: serverTimestamp() }).then((ref) => ref.id),
    update: (id, patch) => updateDoc(doc(db, "reports", id), { ...patch, updatedAt: serverTimestamp() }),
  };
}
```

- [ ] **Step 5: Run the tests**

Run: `npm test`
Expected: PASS (18 tests).

- [ ] **Step 6: Commit**

```bash
git add source/store.js source/firestore-store.js tests/store.test.js
git commit -m "feat: app state, in-memory store and single-listener Firestore adapter" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Design system and UI helpers

**Files:**
- Create: `drama/tokens.css`, `drama/base.css`, `drama/components.css`, `source/ui.js`, `tests/ui.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - **CSS custom properties:** the whole token set, plus `[data-tone]` → `--tone` for tones `reported|progress|resolved|dup|critical|info`.
  - **Shared classes:** `.crest`, `.btn(--primary|--secondary|--ghost|--sm|--block|--icon)`, `.field`, `.segmented`, `.seg`, `.chip(--quiet)`, `.tag`, `.sheet*`, `.confirm`, `.toasts`, `.toast`, `.empty`, `.panel`, `.label`, `.muted`, `.icon`.
  - **From `source/ui.js`:** `$`, `esc`, `icon(name, cls)`, `words(text)`, `reducedMotion()`, `wait(ms)`, `swap(update)`, `toast(message, tone, iconName)`, `confirmDialog(message, confirmLabel) → Promise<boolean>`, `sheet(dialog)`, `countUp(el, to, suffix)`.

- [ ] **Step 1: Write the failing test**

`tests/ui.test.js`

```js
import test from "node:test";
import assert from "node:assert/strict";
import { esc, icon, words } from "../source/ui.js";

test("esc escapes html", () => {
  assert.equal(esc(`<a href="x">'&`), "&lt;a href=&quot;x&quot;&gt;&#39;&amp;");
  assert.equal(esc(undefined), "");
});

test("icon points at the sprite and hides from assistive tech", () => {
  const svg = icon("wrench");
  assert.match(svg, /href="assets\/icons\.svg#wrench"/);
  assert.match(svg, /aria-hidden="true"/);
});

test("words wraps each word with a stagger index", () => {
  assert.equal(
    words("Syncing tickets"),
    '<span class="w" style="--i:0">Syncing</span> <span class="w" style="--i:1">tickets</span>'
  );
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `node --test tests/ui.test.js`
Expected: FAIL, `ERR_MODULE_NOT_FOUND` for `source/ui.js`.

- [ ] **Step 3: Implement the helpers** (every user string goes through `esc()` before `innerHTML`)

`source/ui.js`

```js
// Small DOM helpers shared by every view. Nothing here runs at import time, so tests can import it.

export const $ = (sel, root = document) => root.querySelector(sel);

export const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export const icon = (name, cls = "") =>
  `<svg class="icon ${cls}" aria-hidden="true" focusable="false"><use href="assets/icons.svg#${name}"></use></svg>`;

// Word-by-word ramp: each word gets its own stagger index for CSS.
export const words = (text) =>
  esc(text)
    .split(" ")
    .map((w, i) => `<span class="w" style="--i:${i}">${w}</span>`)
    .join(" ");

export const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Cross-fade a DOM update with the View Transitions API when available.
export function swap(update) {
  if (!document.startViewTransition || reducedMotion()) return update();
  document.startViewTransition(update).ready.catch(() => {}); // skipped transitions still run update()
}

// Toasts live in a popover so they sit above any open dialog.
export function toast(message, tone = "info", iconName = "info") {
  const region = $("#toasts");
  const el = document.createElement("div");
  el.className = "toast";
  el.dataset.tone = tone;
  el.innerHTML = `${icon(iconName)}<p>${esc(message)}</p>`;
  region.append(el);
  if (region.matches(":popover-open")) region.hidePopover();
  region.showPopover();
  setTimeout(() => {
    el.classList.add("is-leaving");
    setTimeout(() => {
      el.remove();
      if (!region.children.length) region.hidePopover();
    }, 250);
  }, 4200);
}

export function confirmDialog(message, confirmLabel) {
  const dialog = $("#confirm");
  $("#confirm-message").textContent = message;
  $("#confirm-ok").textContent = confirmLabel;
  dialog.returnValue = ""; // Esc keeps the previous value otherwise
  dialog.showModal();
  return new Promise((resolve) =>
    dialog.addEventListener("close", () => resolve(dialog.returnValue === "ok"), { once: true })
  );
}

// Close buttons + click on the backdrop for a sheet dialog.
export function sheet(dialog) {
  dialog.querySelector(".sheet__close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (e) => e.target === dialog && dialog.close());
  return dialog;
}

export function countUp(el, to, suffix = "") {
  const from = Number(el.dataset.value ?? 0);
  el.dataset.value = to;
  if (reducedMotion() || from === to) return void (el.textContent = to + suffix);
  const t0 = performance.now();
  const tick = (t) => {
    const k = Math.min(1, (t - t0) / 700);
    el.textContent = Math.round(from + (to - from) * (1 - (1 - k) ** 3)) + suffix;
    if (k < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
```

- [ ] **Step 4: Add the tokens**

`drama/tokens.css`

```css
/* Design tokens: dark-only "violet ink" theme. Hex values come from OKLCH (hue 288/292) and pass WCAG AA
   on --bg, --surface and --raised. Shape rule: panels 12px, controls 8px (nested segments 4px), chips pill. */
:root {
  color-scheme: dark;

  --bg: #0C0B13;
  --surface: #14131E;
  --raised: #1D1C2A;
  --line: #323142;
  --line-strong: #67667C; /* 3:1 on surface, for input borders */
  --text: #F0EFF5;
  --text-2: #B0AFBF;
  --text-3: #858495;

  --accent: #7850DA; /* white text on it: 5.1:1 */
  --accent-hi: #BFB1FF;
  --accent-lo: #302356;
  --on-accent: #FAFAFD;

  /* Status colors always ship with an icon and a text label. */
  --reported: #F6B84D;
  --progress: #65CDF3;
  --resolved: #61DA92;
  --dup: #A4A3B1;
  --critical: #FD717C;
  --orchid: #E486C6; /* demo mode only */

  --font-sans: "Geist", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "Geist Mono", ui-monospace, Menlo, monospace;
  --fs-xs: .75rem;
  --fs-sm: .8125rem;
  --fs-md: .9375rem;
  --fs-lg: 1.125rem;
  --fs-xl: 1.5rem;

  --r-panel: 12px;
  --r-ctl: 8px;
  --r-pill: 999px;
  --shadow: inset 0 1px 0 rgb(255 255 255 / .04), 0 18px 40px -18px rgb(4 2 16 / .75);

  --ease-out: cubic-bezier(.16, 1, .3, 1);
  --ease-io: cubic-bezier(.65, 0, .35, 1);
  --t1: 120ms;
  --t2: 200ms;
  --t3: 320ms;

  --z-sticky: 10;
  --z-coach: 60;
  --z-boot: 70;
  --z-texture: 80;
}

[data-tone="reported"] { --tone: var(--reported); }
[data-tone="progress"] { --tone: var(--progress); }
[data-tone="resolved"] { --tone: var(--resolved); }
[data-tone="dup"] { --tone: var(--dup); }
[data-tone="critical"] { --tone: var(--critical); }
[data-tone="info"] { --tone: var(--accent-hi); }
```

- [ ] **Step 5: Add base styles** (fonts, textures, shell, reduced-motion guard)

`drama/base.css`

```css
@font-face { font-family: "Geist"; src: url("../assets/fonts/Geist-Variable.woff2") format("woff2"); font-weight: 100 900; font-display: swap; }
@font-face { font-family: "Geist Mono"; src: url("../assets/fonts/GeistMono-Variable.woff2") format("woff2"); font-weight: 100 900; font-display: swap; }

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { background: var(--bg); }
body {
  min-height: 100dvh;
  color: var(--text);
  font: 400 var(--fs-md)/1.5 var(--font-sans);
  -webkit-font-smoothing: antialiased;
}

/* Textures: violet glow + vignette behind content, film grain over everything. Fixed and non-interactive. */
body::before, body::after { content: ""; position: fixed; inset: 0; pointer-events: none; }
body::before {
  z-index: -1;
  background:
    radial-gradient(80% 55% at 50% -12%, rgb(120 80 218 / .16), transparent 70%),
    radial-gradient(130% 110% at 50% 45%, transparent 55%, rgb(3 2 8 / .6));
}
body::after {
  z-index: var(--z-texture);
  opacity: .07;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E");
}

h1, h2, h3 { font-weight: 600; line-height: 1.2; letter-spacing: -.015em; }
h2 { font-size: var(--fs-lg); }
button, input, textarea { font: inherit; color: inherit; }
code, .mono { font-family: var(--font-mono); }
.label { display: block; font: 500 var(--fs-xs)/1.4 var(--font-sans); color: var(--text-2); letter-spacing: .01em; }
.muted { color: var(--text-3); }
.icon { width: 1.15em; height: 1.15em; flex: none; fill: currentColor; }
:focus-visible { outline: 2px solid var(--accent-hi); outline-offset: 2px; }
[hidden] { display: none !important; }
body[data-role="instructor"] [data-for="technician"],
body[data-role="technician"] [data-for="instructor"] { display: none !important; }

/* CCS Information Systems Society logo: shown in full color; its alpha masks the shine so light stays inside the badge. */
.crest { position: relative; aspect-ratio: 1; background: url("../assets/brand/iss-logo.png") center / contain no-repeat; }
.crest::after {
  content: ""; position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(105deg, transparent 40%, rgb(255 255 255 / .7) 50%, transparent 60%) 150% 0 / 250% 100% no-repeat;
  -webkit-mask: url("../assets/brand/iss-logo.png") center / contain no-repeat;
  mask: url("../assets/brand/iss-logo.png") center / contain no-repeat;
}

/* Visually hidden on small phones, still read by screen readers */
@media (max-width: 419px) {
  .hide-sm { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
}

/* App shell */
.topbar {
  position: sticky; top: 0; z-index: var(--z-sticky);
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  height: 60px; padding: 0 clamp(16px, 3vw, 32px);
  background: rgb(12 11 19 / .8);
  backdrop-filter: blur(12px) saturate(140%);
  border-bottom: 1px solid var(--line);
}
.brand { display: flex; align-items: center; gap: 10px; font-weight: 600; letter-spacing: -.01em; white-space: nowrap; }
.brand__crest { width: 34px; }
.topbar__end { display: flex; align-items: center; gap: 8px; }
.role-chip {
  display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 12px;
  border-radius: var(--r-pill); background: var(--accent-lo); color: var(--accent-hi); font-size: var(--fs-xs); font-weight: 500;
}
.layout { display: grid; gap: 16px; max-width: 1400px; margin: 0 auto; padding: 16px 16px 48px; }
@media (min-width: 1024px) {
  .layout { gap: 20px; padding: 24px clamp(24px, 3vw, 40px) 64px; }
  body[data-role="technician"] .layout { grid-template-columns: minmax(0, 1fr) minmax(300px, 360px); }
  .tracker { grid-column: 1 / -1; }
}
.panel {
  min-width: 0;
  padding: clamp(16px, 2vw, 24px);
  border: 1px solid var(--line);
  border-radius: var(--r-panel);
  background: var(--surface);
  box-shadow: var(--shadow);
}
.panel__head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px 16px; margin-bottom: 16px; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 1ms !important;
    animation-delay: 0ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 1ms !important;
    transition-delay: 0ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 6: Add the shared components**

`drama/components.css`

```css
/* Buttons */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  min-height: 40px; padding: 0 16px;
  border: 1px solid transparent; border-radius: var(--r-ctl);
  background: none; font-size: var(--fs-sm); font-weight: 500; line-height: 1; white-space: nowrap; cursor: pointer;
  transition: background var(--t2), border-color var(--t2), color var(--t2), box-shadow var(--t2), scale var(--t1);
}
.btn:active:not(:disabled) { scale: .98; }
.btn:disabled { opacity: .45; cursor: not-allowed; }
.btn--primary { background: var(--accent); color: var(--on-accent); }
.btn--primary:hover:not(:disabled) { box-shadow: inset 0 1px 0 rgb(255 255 255 / .2), 0 8px 20px -8px rgb(120 80 218 / .8); }
.btn--secondary { background: var(--raised); border-color: var(--line); }
.btn--secondary:hover:not(:disabled) { border-color: var(--line-strong); }
.btn--ghost { color: var(--text-2); }
.btn--ghost:hover:not(:disabled) { color: var(--text); background: var(--raised); }
.btn--sm { min-height: 32px; padding: 0 12px; font-size: var(--fs-xs); }
.btn--block { width: 100%; }
.btn--icon { width: 40px; padding: 0; }
@media (pointer: coarse) { .btn { min-height: 44px; } .btn--sm { min-height: 40px; } .btn--icon { width: 44px; } }

/* Fields: label above, 16px text so phones don't zoom */
.field { display: grid; gap: 8px; border: 0; min-width: 0; }
.field input, .field textarea {
  width: 100%; min-height: 44px; padding: 10px 12px;
  border: 1px solid var(--line-strong); border-radius: var(--r-ctl);
  background: var(--bg); font-size: 1rem; line-height: 1.4;
  transition: border-color var(--t2), box-shadow var(--t2);
}
.field textarea { min-height: 88px; resize: vertical; }
.field input:focus, .field textarea:focus { outline: none; border-color: var(--accent-hi); box-shadow: 0 0 0 3px rgb(191 177 255 / .18); }
.field :user-invalid { border-color: var(--critical); }
::placeholder { color: var(--text-3); }
.field__error { min-height: 1.25em; color: var(--critical); font-size: var(--fs-sm); }

/* Segmented controls: radio labels or aria-pressed buttons */
.segmented { display: inline-flex; flex-wrap: wrap; gap: 4px; padding: 4px; border: 1px solid var(--line); border-radius: var(--r-ctl); background: var(--bg); }
.segmented--fill { display: flex; }
.segmented--fill .seg { flex: 1; justify-content: center; }
.seg {
  position: relative; display: inline-flex; align-items: center; gap: 8px;
  min-height: 32px; padding: 0 12px; border: 0; border-radius: 4px;
  background: none; color: var(--text-2); font-size: var(--fs-sm); font-weight: 500; cursor: pointer;
  transition: background var(--t2), color var(--t2), box-shadow var(--t2);
}
.seg:hover { color: var(--text); }
.seg[aria-pressed="true"], .seg:has(:checked) { background: var(--raised); color: var(--text); box-shadow: inset 0 0 0 1px var(--line-strong); }
.seg input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
.seg:has(:focus-visible) { outline: 2px solid var(--accent-hi); outline-offset: 2px; }
.seg .count { font: 500 var(--fs-xs)/1 var(--font-mono); color: var(--text-3); }
@media (pointer: coarse) { .seg { min-height: 40px; } }

/* Chips */
.chip {
  display: inline-flex; align-items: center; gap: 6px; height: 24px; padding: 0 10px 0 8px;
  border-radius: var(--r-pill); white-space: nowrap; font-size: var(--fs-xs); font-weight: 500;
  color: var(--tone, var(--text-2));
  background: color-mix(in oklab, var(--tone, var(--text-3)) 14%, transparent);
}
.chip .icon { width: 14px; height: 14px; }
.chip--quiet { padding: 0 10px; background: none; color: var(--text-2); box-shadow: inset 0 0 0 1px var(--line); }
.chip--quiet[data-priority="High"] { color: var(--critical); box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--critical) 45%, transparent); }

/* Asset tag: the ticket's signature component (punched hole, barcode, foil sheen on hover) */
.tag {
  position: relative; overflow: hidden; display: grid; gap: 12px;
  padding: 14px 16px 14px 30px;
  border: 1px solid var(--line); border-radius: var(--r-panel);
  background: linear-gradient(180deg, var(--raised), var(--surface));
  box-shadow: inset 0 2px 0 var(--tone, var(--line));
}
.tag::before {
  content: ""; position: absolute; left: 11px; top: calc(50% - 4px);
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--bg); box-shadow: inset 0 1px 2px rgb(0 0 0 / .7), 0 0 0 1px var(--line);
}
.tag::after {
  content: ""; position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(105deg, transparent 35%, rgb(191 177 255 / .12) 50%, transparent 65%);
  translate: -100% 0; transition: translate .9s var(--ease-out);
}
.tag:hover::after { translate: 100% 0; }
.tag__head { display: flex; align-items: center; gap: 12px; font: 500 var(--fs-sm)/1 var(--font-mono); }
.tag__code { color: var(--text); letter-spacing: .02em; }
.tag__bars { height: 14px; color: var(--text-3); opacity: .8; background-repeat: no-repeat; }
.tag__id { margin-left: auto; color: var(--text-3); }
.tag__body { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px; color: var(--text-2); font-size: var(--fs-sm); }
.tag__count { padding: 4px 8px; border-radius: var(--r-pill); background: var(--accent-lo); color: var(--accent-hi); font: 500 var(--fs-xs)/1 var(--font-mono); }

/* Sheets: right drawer on desktop, bottom sheet on phones */
.sheet {
  position: fixed; inset: 0 0 0 auto; width: min(460px, 100%); height: 100dvh;
  max-width: none; max-height: none; margin: 0; padding: 0;
  border: 0; border-left: 1px solid var(--line);
  background: var(--surface); color: var(--text);
  box-shadow: -24px 0 60px -24px rgb(0 0 0 / .7);
  translate: 100% 0;
  transition: translate var(--t3) var(--ease-out), display var(--t3) allow-discrete, overlay var(--t3) allow-discrete;
}
.sheet[open] { translate: 0 0; }
@starting-style { .sheet[open] { translate: 100% 0; } }
.sheet::backdrop, .confirm::backdrop {
  background: rgb(8 7 14 / .6); backdrop-filter: blur(4px); opacity: 0;
  transition: opacity var(--t3), display var(--t3) allow-discrete, overlay var(--t3) allow-discrete;
}
.sheet[open]::backdrop, .confirm[open]::backdrop { opacity: 1; }
@starting-style { .sheet[open]::backdrop, .confirm[open]::backdrop { opacity: 0; } }
.sheet__inner { display: flex; flex-direction: column; height: 100%; }
.sheet__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 20px 20px 16px; border-bottom: 1px solid var(--line); }
.sheet__title { margin-top: 2px; font: 600 var(--fs-xl)/1.1 var(--font-mono); letter-spacing: -.01em; }
.sheet__body { flex: 1; overflow-y: auto; overscroll-behavior: contain; display: grid; align-content: start; gap: 20px; padding: 20px; }
.sheet__foot { padding: 16px 20px calc(16px + env(safe-area-inset-bottom)); border-top: 1px solid var(--line); }
@media (max-width: 767px) {
  .sheet { inset: auto 0 0; width: 100%; height: auto; max-height: 92dvh; border: 0; border-top: 1px solid var(--line); border-radius: 16px 16px 0 0; translate: 0 100%; }
  .sheet[open] { translate: 0 0; }
  @starting-style { .sheet[open] { translate: 0 100%; } }
  .sheet__inner { height: auto; max-height: 92dvh; }
}

/* Confirm dialog */
.confirm {
  margin: auto; width: min(400px, calc(100% - 32px)); padding: 24px;
  border: 1px solid var(--line); border-radius: var(--r-panel);
  background: var(--raised); color: var(--text); box-shadow: var(--shadow);
  opacity: 0; scale: .96;
  transition: opacity var(--t2), scale var(--t2) var(--ease-out), display var(--t2) allow-discrete, overlay var(--t2) allow-discrete;
}
.confirm[open] { opacity: 1; scale: 1; }
@starting-style { .confirm[open] { opacity: 0; scale: .96; } }
.confirm p { margin-bottom: 20px; }
.confirm__actions { display: flex; justify-content: flex-end; gap: 8px; }

/* Toasts (popover = top layer, above open dialogs) */
.toasts {
  position: fixed; inset: auto 16px 16px auto; width: min(380px, calc(100% - 32px));
  margin: 0; padding: 0; border: 0; background: none; overflow: visible;
  display: grid; gap: 8px; pointer-events: none;
}
.toasts:not(:popover-open) { display: none; }
.toast {
  display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px;
  border: 1px solid var(--line); border-radius: var(--r-panel);
  background: var(--raised); box-shadow: var(--shadow); color: var(--text);
  font-size: var(--fs-sm); pointer-events: auto;
  animation: toast-in var(--t3) var(--ease-out) both;
}
.toast .icon { width: 18px; height: 18px; margin-top: 1px; color: var(--tone); }
.toast.is-leaving { opacity: 0; translate: 0 6px; transition: opacity var(--t2), translate var(--t2); }
@keyframes toast-in { from { opacity: 0; translate: 0 10px; } }
@media (max-width: 767px) { .toasts { inset: 72px 16px auto; width: auto; } }

/* Empty states teach the next step */
.empty { display: grid; justify-items: center; gap: 8px; padding: 48px 16px; color: var(--text-2); text-align: center; }
.empty .icon { width: 36px; height: 36px; margin-bottom: 4px; color: var(--text-3); }
.empty__title { color: var(--text); font-weight: 600; }
```

- [ ] **Step 7: Run the tests**

Run: `npm test`
Expected: PASS (21 tests). The CSS is not linked yet; Task 5 verifies it on screen.

- [ ] **Step 8: Commit**

```bash
git add drama/tokens.css drama/base.css drama/components.css source/ui.js tests/ui.test.js
git commit -m "feat: violet ink design system, textures and UI helpers" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Shell: loading screen, login, app frame

**Files:**
- Replace: `index.html`, `source/auth.js`, `drama/login.css`, `source/app.js`
- Create: `source/boot.js`, `drama/boot.css`, `tests/shell.test.js`
- Delete: `drama/main.css` (replaced by `tokens.css` + `base.css`)

**Interfaces:**
- Consumes: Task 2 (`LABS`, `byNewest`), Task 3 (`createState`, `firestoreStore`), Task 4 (`$`, `confirmDialog`, `icon`, `swap`, `toast`, `wait`, `words`, `reducedMotion`).
- Produces:
  - **From `source/boot.js`:** `createBoot(el, steps) → { advance(), fail(message, { onDemo }), finish(targetEl) }`.
  - **From `source/auth.js`:** `checkLogin(role, pw)`, `getRole()`, `saveRole(role)`, `clearRole()`, `mountLogin({ onLogin, onDemo })`, `ROLE_LABEL`, `ROLE_ICON`.
  - **`index.html` ids:** every region later tasks mount into (`seatmap`, `insights`, `tracker`, `report-sheet`, `ticket-drawer`, `confirm`, `toasts`, `demo-bar`, `coach`).
  - **`source/app.js` v1:** `state`, `api`, `sync()`, `showApp()`.
  - Demo entry buttons ship `hidden`; Task 9 reveals them once they work.

- [ ] **Step 1: Write the failing test**

`tests/shell.test.js`

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { checkLogin, getRole } from "../source/auth.js";

test("checkLogin keeps the original demo passwords", () => {
  assert.ok(checkLogin("instructor", "instructor123"));
  assert.ok(checkLogin("technician", "tech123"));
  assert.ok(!checkLogin("technician", "instructor123"));
});

test("getRole is null when nobody is signed in", () => {
  assert.equal(getRole(), null);
});

test("index.html has every region the app mounts into", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  for (const id of ["boot", "login", "login-form", "app", "role-chip", "sign-out", "seatmap", "insights", "tracker", "report-sheet", "ticket-drawer", "confirm", "toasts"]) {
    assert.ok(html.includes(`id="${id}"`), `missing #${id}`);
  }
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `node --test tests/shell.test.js`
Expected: FAIL, `The requested module '../source/auth.js' does not provide an export named 'checkLogin'`.

- [ ] **Step 3: Replace `index.html`** (all regions for the whole redesign; stylesheets for later tasks are added by those tasks)

`index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>CCS Lab Tracker</title>
  <meta name="description" content="Report broken keyboards, mice and PCs in the CCS computer labs and track every repair.">
  <meta name="robots" content="noindex">
  <meta name="theme-color" content="#0C0B13">
  <link rel="preload" href="assets/fonts/Geist-Variable.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="assets/brand/iss-logo.png" as="image">
  <link rel="stylesheet" href="drama/tokens.css">
  <link rel="stylesheet" href="drama/base.css">
  <link rel="stylesheet" href="drama/components.css">
  <link rel="stylesheet" href="drama/boot.css">
  <link rel="stylesheet" href="drama/login.css">
  <script type="module" src="source/app.js"></script>
</head>
<body>

  <!-- Loading screen -->
  <div id="boot" class="boot" role="status" aria-label="Loading CCS Lab Tracker">
    <div class="boot__stage">
      <svg class="boot__ring" viewBox="0 0 120 120" aria-hidden="true">
        <circle class="boot__track" cx="60" cy="60" r="56"/>
        <circle class="boot__progress" cx="60" cy="60" r="56" pathLength="100"/>
      </svg>
      <div class="crest boot__crest" role="img" aria-label="CCS Information Systems Society logo"></div>
    </div>
    <p class="boot__title">CCS Lab Tracker</p>
    <ol class="boot__log"></ol>
    <div class="boot__error" hidden>
      <p class="boot__message"></p>
      <div class="boot__actions">
        <button type="button" class="btn btn--primary" data-retry>Try again</button>
        <button type="button" class="btn btn--ghost" data-demo hidden>Open the demo</button>
      </div>
    </div>
  </div>

  <!-- Login -->
  <main id="login" class="login" hidden>
    <section class="login__brand">
      <div class="crest login__crest" aria-hidden="true"></div>
      <h1>CCS Lab Tracker</h1>
      <p>Report broken lab equipment and follow every repair in one shared sheet.</p>
    </section>
    <form id="login-form" class="panel login__card">
      <fieldset class="field">
        <legend class="label">Sign in as</legend>
        <div class="segmented segmented--fill">
          <label class="seg"><input type="radio" name="role" value="instructor" checked><svg class="icon" aria-hidden="true"><use href="assets/icons.svg#chalkboard-teacher"/></svg>Instructor</label>
          <label class="seg"><input type="radio" name="role" value="technician"><svg class="icon" aria-hidden="true"><use href="assets/icons.svg#toolbox"/></svg>Lab Technician</label>
        </div>
      </fieldset>
      <label class="field">
        <span class="label">Password</span>
        <input name="password" type="password" autocomplete="current-password" required>
      </label>
      <p id="login-error" class="field__error" role="alert"></p>
      <button class="btn btn--primary btn--block">Log in</button>
      <button id="demo-start" type="button" class="btn btn--ghost btn--block" hidden><svg class="icon" aria-hidden="true"><use href="assets/icons.svg#play"/></svg>Try the demo</button>
      <dl class="login__hint">
        <dt>Demo passwords</dt>
        <dd><span>Instructor</span><code>instructor123</code></dd>
        <dd><span>Technician</span><code>tech123</code></dd>
      </dl>
    </form>
  </main>

  <!-- App -->
  <div id="app" class="app" hidden>
    <header class="topbar">
      <div class="brand"><div class="crest brand__crest" aria-hidden="true"></div><span>CCS Lab Tracker</span></div>
      <div class="topbar__end">
        <span id="role-chip" class="role-chip"></span>
        <button id="sign-out" type="button" class="btn btn--ghost btn--sm"><svg class="icon" aria-hidden="true"><use href="assets/icons.svg#sign-out"/></svg><span class="hide-sm">Log out</span></button>
      </div>
    </header>

    <div id="demo-bar" class="demobar" hidden>
      <p><strong>Demo mode</strong>Test data stays in this tab.</p>
      <div id="demo-role" class="segmented" role="group" aria-label="View as">
        <button type="button" class="seg" data-role="instructor" aria-pressed="true">Instructor</button>
        <button type="button" class="seg" data-role="technician" aria-pressed="false">Technician</button>
      </div>
      <button id="demo-seed" type="button" class="btn btn--secondary btn--sm"><svg class="icon" aria-hidden="true"><use href="assets/icons.svg#list-checks"/></svg>Load 5 test reports</button>
      <button id="demo-tour" type="button" class="btn btn--primary btn--sm" disabled><svg class="icon" aria-hidden="true"><use href="assets/icons.svg#play"/></svg>Walkthrough</button>
      <button id="demo-exit" type="button" class="btn btn--ghost btn--sm"><svg class="icon" aria-hidden="true"><use href="assets/icons.svg#x"/></svg>Exit demo</button>
    </div>

    <main class="layout">
      <section id="seatmap" class="panel seatmap" aria-labelledby="seatmap-title">
        <header class="panel__head">
          <div>
            <h2 id="seatmap-title">Lab map</h2>
            <p class="seatmap__meta"></p>
          </div>
          <div class="segmented seatmap__labs" role="group" aria-label="Choose a lab"></div>
        </header>
        <div class="seatmap__floor">
          <p class="seatmap__front">Front of the room</p>
          <div class="seatmap__grid" role="group" aria-label="Computers"></div>
        </div>
        <footer class="seatmap__foot">
          <p class="seatmap__hint" data-for="instructor"><svg class="icon" aria-hidden="true"><use href="assets/icons.svg#hand-tap"/></svg>Tap a PC to report a problem.</p>
          <p class="seatmap__hint" data-for="technician"><svg class="icon" aria-hidden="true"><use href="assets/icons.svg#hand-tap"/></svg>Tap a lit PC to open its tickets.</p>
          <ul class="legend">
            <li data-tone="reported"><svg class="icon" aria-hidden="true"><use href="assets/icons.svg#warning-circle"/></svg>Reported</li>
            <li data-tone="progress"><svg class="icon" aria-hidden="true"><use href="assets/icons.svg#wrench"/></svg>In progress</li>
            <li><span class="legend__high" aria-hidden="true"></span>High priority</li>
            <li><svg class="icon" aria-hidden="true"><use href="assets/icons.svg#monitor"/></svg>No open reports</li>
          </ul>
        </footer>
      </section>

      <aside id="insights" class="panel insights" data-for="technician" aria-labelledby="insights-title">
        <header class="panel__head"><h2 id="insights-title">Insights</h2></header>
        <div class="stats">
          <div class="stat"><p class="stat__label">Open now</p><p class="stat__value" data-stat="open">0</p></div>
          <div class="stat"><p class="stat__label">Resolved</p><p class="stat__value" data-stat="resolved">0%</p></div>
          <div class="stat"><p class="stat__label">Duplicates</p><p class="stat__value" data-stat="dup">0%</p></div>
        </div>
        <h3 class="label">Reports by lab</h3>
        <ol class="bars" data-bars="lab" aria-label="Reports by lab"></ol>
        <h3 class="label">Reports by equipment</h3>
        <ol class="bars" data-bars="equipment" aria-label="Reports by equipment"></ol>
      </aside>

      <section id="tracker" class="panel tracker" aria-labelledby="tracker-title">
        <header class="panel__head">
          <h2 id="tracker-title">Tracking sheet</h2>
          <label class="search tracker__search">
            <svg class="icon" aria-hidden="true"><use href="assets/icons.svg#magnifying-glass"/></svg>
            <input type="search" placeholder="Search seat, equipment, instructor" aria-label="Search tickets">
          </label>
        </header>
        <div class="segmented tracker__filters" role="group" aria-label="Filter by status"></div>
        <div class="table-wrap"><table class="table"><thead></thead><tbody></tbody></table></div>
        <div class="empty tracker__empty" hidden></div>
      </section>
    </main>
  </div>

  <!-- Report sheet (instructor) -->
  <dialog id="report-sheet" class="sheet" aria-labelledby="report-title">
    <form class="sheet__inner">
      <header class="sheet__head">
        <div><p class="label">Report a problem</p><h2 id="report-title" class="sheet__title"></h2></div>
        <button type="button" class="btn btn--ghost btn--icon sheet__close" aria-label="Close"><svg class="icon" aria-hidden="true"><use href="assets/icons.svg#x"/></svg></button>
      </header>
      <div class="sheet__body">
        <div class="sheet__existing" hidden></div>
        <input type="hidden" name="labRoom">
        <input type="hidden" name="computerNumber">
        <label class="field">
          <span class="label">Instructor name</span>
          <input name="instructorName" autocomplete="name" required>
        </label>
        <fieldset class="field">
          <legend class="label">What's broken?</legend>
          <div class="tiles">
            <label class="tile"><input type="radio" name="equipmentType" value="Keyboard" required><svg class="icon" aria-hidden="true"><use href="assets/icons.svg#keyboard"/></svg>Keyboard</label>
            <label class="tile"><input type="radio" name="equipmentType" value="Mouse"><svg class="icon" aria-hidden="true"><use href="assets/icons.svg#mouse-simple"/></svg>Mouse</label>
            <label class="tile"><input type="radio" name="equipmentType" value="Computer"><svg class="icon" aria-hidden="true"><use href="assets/icons.svg#desktop-tower"/></svg>Computer</label>
          </div>
        </fieldset>
        <label class="field">
          <span class="label">Describe the problem</span>
          <textarea name="issueDescription" rows="3" placeholder="What happens? When did it start?" required></textarea>
        </label>
        <label class="field">
          <span class="label">Student who reported it <span class="muted">(optional)</span></span>
          <input name="reportedBy" autocomplete="off">
        </label>
        <fieldset class="field">
          <legend class="label">Priority</legend>
          <div class="segmented segmented--fill">
            <label class="seg"><input type="radio" name="priority" value="Low">Low</label>
            <label class="seg"><input type="radio" name="priority" value="Medium" checked>Medium</label>
            <label class="seg"><input type="radio" name="priority" value="High">High</label>
          </div>
        </fieldset>
      </div>
      <footer class="sheet__foot"><button type="submit" class="btn btn--primary btn--block">Send report</button></footer>
    </form>
  </dialog>

  <!-- Ticket drawer -->
  <dialog id="ticket-drawer" class="sheet" aria-labelledby="drawer-title">
    <div class="sheet__inner">
      <header class="sheet__head">
        <div><p class="label">Tickets</p><h2 id="drawer-title" class="sheet__title"></h2></div>
        <button type="button" class="btn btn--ghost btn--icon sheet__close" aria-label="Close"><svg class="icon" aria-hidden="true"><use href="assets/icons.svg#x"/></svg></button>
      </header>
      <div class="sheet__body"></div>
    </div>
  </dialog>

  <!-- Confirm -->
  <dialog id="confirm" class="confirm" aria-labelledby="confirm-message">
    <form method="dialog">
      <p id="confirm-message"></p>
      <div class="confirm__actions">
        <button value="cancel" class="btn btn--secondary">Cancel</button>
        <button id="confirm-ok" value="ok" class="btn btn--primary">OK</button>
      </div>
    </form>
  </dialog>

  <div id="toasts" class="toasts" popover="manual" role="status" aria-live="polite"></div>

  <!-- Demo walkthrough -->
  <div id="coach" class="coach" hidden>
    <div class="coach__spot"></div>
    <div class="coach__card" role="dialog" aria-label="Walkthrough" aria-live="polite">
      <p class="coach__count"></p>
      <p class="coach__text"></p>
      <div class="coach__actions">
        <button type="button" class="btn btn--ghost btn--sm coach__skip">Skip</button>
        <button type="button" class="btn btn--primary btn--sm coach__next">Next</button>
      </div>
    </div>
  </div>

</body>
</html>
```

- [ ] **Step 4: Replace `source/auth.js`** (same passwords, same storage keys, no reload hack)

`source/auth.js`

```js
// Role + password sign-in. Same rules and storage keys as before (client-side demo passwords).
import { $ } from "./ui.js";

const PASSWORDS = { instructor: "instructor123", technician: "tech123" };

export const ROLE_LABEL = { instructor: "Instructor", technician: "Lab Technician" };
export const ROLE_ICON = { instructor: "chalkboard-teacher", technician: "toolbox" };

export const checkLogin = (role, password) => PASSWORDS[role] === password;

export function getRole() {
  try {
    return localStorage.getItem("isLoggedIn") === "true" ? localStorage.getItem("userRole") : null;
  } catch {
    return null;
  }
}

export function saveRole(role) {
  try {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userRole", role);
  } catch {}
}

export function clearRole() {
  try {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
  } catch {}
}

export function mountLogin({ onLogin, onDemo }) {
  const form = $("#login-form");
  const error = $("#login-error");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const role = form.role.value;
    if (!checkLogin(role, form.password.value)) {
      error.textContent = "Wrong password. Try again.";
      form.password.select();
      return;
    }
    error.textContent = "";
    form.password.value = "";
    saveRole(role);
    onLogin(role);
  });
  $("#demo-start").addEventListener("click", onDemo);
}
```

- [ ] **Step 5: Add the loading screen controller**

`source/boot.js`

```js
// Loading screen: the crest charges up, each real startup step ticks off, then the crest docks into place.
import { icon, reducedMotion, wait, words } from "./ui.js";

const seen = () => {
  try {
    return sessionStorage.getItem("booted") === "1";
  } catch {
    return false;
  }
};

export function createBoot(el, steps) {
  const t0 = performance.now();
  const minMs = reducedMotion() ? 300 : seen() ? 700 : 1700;
  const ring = el.querySelector(".boot__progress");
  const log = el.querySelector(".boot__log");
  log.innerHTML = steps.map((s) => `<li>${icon("check")}<span>${words(s)}</span></li>`).join("");
  const items = [...log.children];
  let at = 0;
  items[0].classList.add("is-active");

  return {
    advance() {
      items[at]?.classList.replace("is-active", "is-done");
      items[++at]?.classList.add("is-active");
      ring.style.strokeDashoffset = 100 - (at / steps.length) * 100;
    },

    fail(message, { onDemo }) {
      el.classList.add("is-error");
      el.querySelector(".boot__message").textContent = message;
      el.querySelector(".boot__error").hidden = false;
      el.querySelector("[data-retry]").onclick = () => location.reload();
      el.querySelector("[data-demo]").onclick = onDemo;
    },

    async finish(target) {
      await wait(Math.max(0, minMs - (performance.now() - t0)));
      try {
        sessionStorage.setItem("booted", "1");
      } catch {}
      const crest = el.querySelector(".boot__crest");
      if (target && !reducedMotion()) {
        const a = crest.getBoundingClientRect();
        const b = target.getBoundingClientRect();
        el.classList.add("is-docking");
        await crest.animate(
          [
            { transform: "none" },
            {
              transform: `translate(${b.x + b.width / 2 - (a.x + a.width / 2)}px, ${b.y + b.height / 2 - (a.y + a.height / 2)}px) scale(${b.width / a.width})`,
            },
          ],
          { duration: 700, easing: "cubic-bezier(.16, 1, .3, 1)", fill: "forwards" }
        ).finished;
      }
      el.classList.add("is-done");
      await wait(reducedMotion() ? 0 : 300);
      el.hidden = true;
    },
  };
}
```

- [ ] **Step 6: Add the loading screen styles**

`drama/boot.css`

```css
/* Loading screen: the logo charges bottom-up, a shine passes, the ring tracks real startup steps, then the crest docks. */
.boot { position: fixed; inset: 0; z-index: var(--z-boot); display: grid; place-content: center; justify-items: center; gap: 24px; padding: 24px; }
.boot::before {
  content: ""; position: absolute; inset: 0; z-index: -1;
  background: radial-gradient(55% 45% at 50% 40%, #1B1433, var(--bg) 70%);
  transition: opacity .45s;
}
.boot__stage { position: relative; display: grid; place-items: center; width: 196px; aspect-ratio: 1; filter: drop-shadow(0 0 28px rgb(120 80 218 / .45)); }
.boot__ring { position: absolute; inset: 0; rotate: -90deg; overflow: visible; }
.boot__ring circle { fill: none; stroke-width: 1.5; }
.boot__track { stroke: var(--line-strong); stroke-dasharray: 1 5; stroke-linecap: round; }
.boot__progress { stroke: var(--accent-hi); stroke-linecap: round; stroke-dasharray: 100; stroke-dashoffset: 100; transition: stroke-dashoffset .6s var(--ease-out); }
/* Charge: a gradient mask slides up, revealing the full-color logo from the bottom (dim ghost above the line). */
.boot__crest {
  width: 148px;
  -webkit-mask: linear-gradient(0deg, #000 50%, rgb(0 0 0 / .18) 50%) 0 0 / 100% 200%;
  mask: linear-gradient(0deg, #000 50%, rgb(0 0 0 / .18) 50%) 0 0 / 100% 200%;
  animation: charge 1.3s var(--ease-out) .1s both;
}
.boot__crest::after { animation: shine 1.1s var(--ease-io) 1.2s both; }
.boot__title { font-size: var(--fs-lg); font-weight: 600; letter-spacing: -.01em; animation: rise .6s var(--ease-out) .3s both; }
.boot__log { display: grid; gap: 6px; min-width: 240px; list-style: none; font: 400 var(--fs-sm)/1.4 var(--font-mono); color: var(--text-3); }
.boot__log li { display: flex; align-items: center; gap: 8px; opacity: 0; }
.boot__log li:is(.is-active, .is-done) { opacity: 1; }
.boot__log li.is-active { color: var(--text-2); }
.boot__log .icon { width: 14px; height: 14px; color: var(--resolved); opacity: 0; scale: .4; transition: opacity var(--t2), scale var(--t3) var(--ease-out); }
.boot__log li.is-done .icon { opacity: 1; scale: 1; }
.boot__log .w { display: inline-block; }
.boot__log li.is-active .w { animation: rise .5s var(--ease-out) both; animation-delay: calc(var(--i) * 60ms); }
.boot__error { display: grid; justify-items: center; gap: 16px; max-width: 34ch; text-align: center; color: var(--text-2); }
.boot__actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
.boot.is-error .boot__log { display: none; }
.boot.is-error .boot__crest { animation: none; -webkit-mask: none; mask: none; filter: grayscale(1); opacity: .5; }

/* Exit: everything but the crest fades, the crest flies to its slot, then the layer fades. */
.boot.is-docking::before, .boot.is-docking :is(.boot__ring, .boot__title, .boot__log) { opacity: 0; transition: opacity .3s; }
.boot.is-docking .boot__stage { filter: none; }
.boot.is-done { opacity: 0; transition: opacity .3s; }

@keyframes charge { from { -webkit-mask-position: 0 0; mask-position: 0 0; } to { -webkit-mask-position: 0 100%; mask-position: 0 100%; } }
@keyframes shine { to { background-position: -50% 0; } }
@keyframes rise { from { opacity: 0; translate: 0 6px; } }
```

- [ ] **Step 7: Replace `drama/login.css`**

`drama/login.css`

```css
.login {
  position: relative; display: grid; align-items: center; gap: 40px;
  min-height: 100dvh; max-width: 1180px; margin: 0 auto; padding: 48px clamp(16px, 5vw, 72px);
}
@media (min-width: 900px) { .login { grid-template-columns: 1.1fr .9fr; } }

/* Slow ambient glow so the screen never sits dead still */
.login::before {
  content: ""; position: fixed; left: -10vmax; bottom: -15vmax; z-index: -1; pointer-events: none;
  width: 60vmax; aspect-ratio: 1; border-radius: 50%;
  background: radial-gradient(closest-side, rgb(120 80 218 / .2), transparent);
  animation: drift 18s var(--ease-io) infinite alternate;
}
.login__brand { display: grid; justify-items: start; gap: 18px; }
.login__crest { width: clamp(128px, 18vw, 208px); filter: drop-shadow(0 12px 32px rgb(120 80 218 / .35)); }
.login__crest::after { animation: sheen 7s var(--ease-io) 1.5s infinite; }
.login__brand h1 { font-size: clamp(2.25rem, 4.5vw, 3.5rem); line-height: 1.02; letter-spacing: -.035em; }
.login__brand p { max-width: 34ch; color: var(--text-2); font-size: var(--fs-lg); }
.login__card { display: grid; gap: 18px; width: 100%; max-width: 420px; padding: clamp(20px, 5vw, 28px); }
.login__card .seg { white-space: nowrap; }
@media (min-width: 900px) { .login__card { justify-self: end; } }
.login__card .field__error { min-height: 0; }
.login__card .field__error:empty { display: none; }
.login__hint { display: grid; gap: 4px; padding-top: 16px; border-top: 1px solid var(--line); font-size: var(--fs-xs); color: var(--text-3); }
.login__hint dt { color: var(--text-2); margin-bottom: 2px; }
.login__hint dd { display: flex; justify-content: space-between; }
.login__hint code { color: var(--accent-hi); }

@keyframes drift { to { translate: 24vw -12vh; } }
@keyframes sheen { 0%, 55% { background-position: 150% 0; } 100% { background-position: -50% 0; } }
```

- [ ] **Step 8: Replace `source/app.js`** (v1: loading screen, login, app frame)

`source/app.js`

```js
// Entry: boot sequence, then the live (Firestore) or demo (in-memory) app.
import { LABS, byNewest } from "./domain.js";
import { createState } from "./store.js";
import { createBoot } from "./boot.js";
import { ROLE_ICON, ROLE_LABEL, clearRole, getRole, mountLogin } from "./auth.js";
import { $, confirmDialog, icon, swap, toast } from "./ui.js";

const state = createState({ role: getRole(), lab: LABS[0], reports: [], filter: { status: "All", query: "" } });
const boot = createBoot($("#boot"), ["Loading interface", "Connecting to Firestore", "Syncing tickets"]);
let store;
let stopSync = () => {};
const api = { add: (r) => store.add(r), update: (id, patch) => store.update(id, patch) };

function sync(next) {
  stopSync();
  store = next;
  return new Promise((resolve, reject) => {
    stopSync = store.subscribe(
      (reports) => {
        state.set({ reports: reports.sort(byNewest) });
        resolve();
      },
      (err) => {
        console.error(err);
        toast("Lost the connection to the database.", "critical", "warning-circle");
        reject(err);
      }
    );
  });
}

let mounted = false;
function showApp() {
  if (!mounted) {
    mounted = true;
    state.subscribe(chrome);
    $("#sign-out").addEventListener("click", async () => {
      if (!(await confirmDialog("Log out of the system?", "Log out"))) return;
      clearRole();
      location.reload();
    });
  }
  $("#login").hidden = true;
  $("#app").hidden = false;
  chrome(state.get());
}

function chrome({ role }) {
  document.body.dataset.role = role;
  $("#role-chip").innerHTML = `${icon(ROLE_ICON[role])}<span class="hide-sm">${ROLE_LABEL[role]}</span>`;
}

mountLogin({
  onLogin: (role) => {
    state.set({ role });
    swap(showApp);
  },
});

const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error("Timed out")), ms));

try {
  await document.fonts.ready;
  boot.advance();
  const [{ db }, { firestoreStore }] = await Promise.all([import("./firebase-config.js"), import("./firestore-store.js")]);
  boot.advance();
  await Promise.race([sync(firestoreStore(db)), timeout(10000)]);
  boot.advance();
  if (state.get().role) {
    showApp();
    await boot.finish($(".topbar .crest"));
  } else {
    $("#login").hidden = false;
    await boot.finish($(".login__crest"));
  }
} catch (err) {
  console.error(err);
  boot.fail("Can't reach the database. Check the internet connection and try again.", {});
}
```

- [ ] **Step 9: Remove the old global stylesheet**

```bash
git rm drama/main.css
```

- [ ] **Step 10: Run the tests**

Run: `npm test`
Expected: PASS (24 tests).

- [ ] **Step 11: Visual check** (controller runs it; Browser pane)

Start the `ccs-lab-tracker` preview (http://localhost:5173), then check each of these:

1. **Loading screen:**
   - The logo charges bottom-up and the shine passes.
   - "Loading interface", "Connecting to Firestore" and "Syncing tickets" tick off while the dotted ring fills.
   - The logo flies into its place on the login screen.
2. **Login:**
   - Violet primary button, role segments with icons, demo passwords in mono.
   - The glow drifts and the logo sheen repeats.
3. **Wrong password:** the error shows "Wrong password. Try again."
4. **Log in as Instructor with `instructor123`:**
   - The top bar shows the logo, "CCS Lab Tracker" and the Instructor chip.
   - The panels are empty for now.
5. **Log out:**
   - Clicking Log out opens the styled confirm dialog.
   - Confirming reloads to the login, with a short loading screen this time.
6. **Console:** no errors.
7. **Phone (375px):** the login stacks and "Lab Technician" stays on one line.

- [ ] **Step 12: Commit**

```bash
git add index.html source/auth.js source/boot.js source/app.js drama/boot.css drama/login.css tests/shell.test.js
git commit -m "feat: logo loading screen, redesigned login and app shell" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Tracking sheet and ticket drawer

**Files:**
- Replace: `source/tracker.js`, `drama/tracker.css`
- Create: `tests/tracker.test.js`
- Modify: `source/app.js`, `index.html`

**Interfaces:**
- Consumes:
  - From Task 2: `ACTIVE`, `EQUIPMENT_ICON`, `STATUS`, `barcode`, `filterReports`, `nextActions`, `reportCount`, `seatCode`, `shortId`, `summarize`, `timeAgo`, `timeline`.
  - From Task 4: `$`, `confirmDialog`, `esc`, `icon`, `sheet`, `swap`, `toast`.
  - From Task 5: `state`, `api`.
- Produces (all from `source/tracker.js`):
  - **Pure HTML builders:** `chip(status)`, `tag(report, reports)`, `rowHtml(report, role, now?)`.
  - **Status change:** `setStatus(store, id, status)` (confirm, then update, then toast).
  - **Mounts:** `mountTracker(root, { store, state, drawer })` and `mountDrawer(dialog, { store, state }) → { open(ids, title) }`.
  - **DOM hooks:** rows carry `data-id`, `data-seat`, `data-status`; action buttons carry `data-act="In Progress"|"Resolved"`.

- [ ] **Step 1: Write the failing test**

`tests/tracker.test.js`

```js
import test from "node:test";
import assert from "node:assert/strict";
import { chip, rowHtml, tag } from "../source/tracker.js";

const r = (over = {}) => ({
  id: "a7f3c2e9",
  labRoom: "Lab 2",
  computerNumber: "Computer 14",
  equipmentType: "Keyboard",
  issueDescription: "Keys E, R and T don't respond.",
  priority: "Medium",
  status: "Reported",
  instructorName: "Ms. Rhea Tampus",
  reportedAt: new Date("2026-09-29T09:00:00Z"),
  ...over,
});

test("rows escape instructor input", () => {
  const html = rowHtml(r({ issueDescription: `<img src=x onerror="alert(1)">` }), "instructor");
  assert.ok(!html.includes("<img"));
  assert.ok(html.includes("&lt;img"));
});

test("technicians get the original actions; instructors get none", () => {
  assert.equal((rowHtml(r(), "technician").match(/data-act=/g) ?? []).length, 2);
  assert.equal((rowHtml(r({ status: "In Progress" }), "technician").match(/data-act=/g) ?? []).length, 1);
  assert.ok(rowHtml(r({ status: "Resolved" }), "technician").includes("Done"));
  assert.ok(!rowHtml(r(), "instructor").includes('data-col="actions"'));
});

test("rows carry the seat code and short ticket id", () => {
  const html = rowHtml(r(), "instructor");
  assert.ok(html.includes('data-seat="LAB2-PC14"'));
  assert.ok(html.includes("#A7F3C2"));
});

test("the asset tag counts duplicates filed against the ticket", () => {
  const t = r();
  assert.ok(tag(t, [t, r({ id: "d1", status: "Duplicate" })]).includes("2 reports"));
  assert.ok(!tag(t, [t]).includes("reports"));
});

test("status chips carry their tone", () => {
  assert.ok(chip("Resolved").includes('data-tone="resolved"'));
  assert.ok(chip("In Progress").includes('data-tone="progress"'));
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `node --test tests/tracker.test.js`
Expected: FAIL. The old `tracker.js` imports the Firebase CDN URL, so Node reports `ERR_UNSUPPORTED_ESM_URL_SCHEME`.

- [ ] **Step 3: Replace `source/tracker.js`**

`source/tracker.js`

```js
// Tracking sheet (every role) and the ticket drawer (technician actions live in both).
import {
  ACTIVE,
  EQUIPMENT_ICON,
  STATUS,
  barcode,
  filterReports,
  nextActions,
  reportCount,
  seatCode,
  shortId,
  summarize,
  timeAgo,
  timeline,
} from "./domain.js";
import { $, confirmDialog, esc, icon, sheet, swap, toast } from "./ui.js";

const FILTERS = ["All", "Reported", "In Progress", "Resolved", "Duplicate"];
const COLUMNS = [
  ["ticket", "Ticket"], ["equipment", "Equipment"], ["issue", "Issue"], ["priority", "Priority"],
  ["status", "Status"], ["when", "Reported"], ["by", "Instructor"], ["actions", "Actions"],
];
const ACTION = {
  "In Progress": { label: "Start repair", icon: "wrench", ask: "Start repair on this ticket?" },
  Resolved: { label: "Mark resolved", icon: "seal-check", ask: "Mark this ticket as resolved?" },
};

export const chip = (status) =>
  `<span class="chip" data-tone="${STATUS[status]?.tone ?? "dup"}">${icon(STATUS[status]?.icon ?? "info")}${esc(status)}</span>`;

const equipment = (r) => `${icon(EQUIPMENT_ICON[r.equipmentType] ?? "monitor")}${esc(r.equipmentType)}`;

const actionButtons = (r) =>
  nextActions(r.status)
    .map(
      (s) =>
        `<button type="button" class="btn btn--sm ${s === "Resolved" ? "btn--primary" : "btn--secondary"}" data-act="${s}">` +
        `${icon(ACTION[s].icon)}${ACTION[s].label}</button>`
    )
    .join("");

export function tag(r, reports) {
  const bars = barcode(r.id);
  const count = ACTIVE.includes(r.status) ? reportCount(r, reports) : 1;
  return `<div class="tag" data-tone="${STATUS[r.status]?.tone ?? "dup"}">
    <div class="tag__head"><span class="tag__code">${seatCode(r.labRoom, r.computerNumber)}</span>
      <span class="tag__bars" style="width:${bars.width}px;background-image:${bars.image}"></span>
      <span class="tag__id">${shortId(r.id)}</span></div>
    <div class="tag__body">${equipment(r)}${count > 1 ? `<span class="tag__count">${count} reports</span>` : ""}${chip(r.status)}</div>
  </div>`;
}

export function rowHtml(r, role, now = new Date()) {
  const code = seatCode(r.labRoom, r.computerNumber);
  return `<tr data-id="${esc(r.id)}" data-seat="${code}" data-status="${esc(r.status)}">
    <td data-col="ticket"><button type="button" class="ticket-link">${code}<span>${shortId(r.id)}</span></button></td>
    <td data-col="equipment">${equipment(r)}</td>
    <td data-col="issue">${esc(r.issueDescription)}</td>
    <td data-col="priority"><span class="chip chip--quiet" data-priority="${esc(r.priority)}">${esc(r.priority)}</span></td>
    <td data-col="status">${chip(r.status)}</td>
    <td data-col="when"><time datetime="${r.reportedAt?.toISOString() ?? ""}" title="${r.reportedAt?.toLocaleString() ?? ""}">${timeAgo(r.reportedAt, now)}</time></td>
    <td data-col="by">${esc(r.instructorName)}</td>
    ${role === "technician" ? `<td data-col="actions">${actionButtons(r) || `<span class="muted">Done</span>`}</td>` : ""}
  </tr>`;
}

export async function setStatus(store, id, status) {
  if (!(await confirmDialog(ACTION[status].ask, ACTION[status].label))) return;
  try {
    await store.update(id, { status });
    toast(status === "Resolved" ? "Marked resolved. Everyone can see it's fixed." : "Repair started.", STATUS[status].tone, STATUS[status].icon);
  } catch (err) {
    console.error(err);
    toast("Couldn't update the ticket. Try again.", "critical", "warning-circle");
  }
}

export function mountTracker(root, { store, state, drawer }) {
  const filters = $(".tracker__filters", root);
  const search = $(".tracker__search input", root);
  const head = $("thead", root);
  const body = $("tbody", root);
  const wrap = $(".table-wrap", root);
  const empty = $(".tracker__empty", root);
  let last = {};
  let known = null; // id -> status from the previous render

  filters.innerHTML = FILTERS.map(
    (f) => `<button type="button" class="seg" data-filter="${f}">${f}<span class="count">0</span></button>`
  ).join("");

  filters.addEventListener("click", (e) => {
    const b = e.target.closest("[data-filter]");
    if (b) swap(() => state.set({ filter: { ...state.get().filter, status: b.dataset.filter } }));
  });
  search.addEventListener("input", () => state.set({ filter: { ...state.get().filter, query: search.value } }));
  empty.addEventListener("click", (e) => {
    if (!e.target.closest("[data-clear]")) return;
    search.value = "";
    state.set({ filter: { status: "All", query: "" } });
  });
  body.addEventListener("click", (e) => {
    const row = e.target.closest("tr[data-id]");
    if (!row) return;
    const act = e.target.closest("[data-act]");
    if (act) setStatus(store, row.dataset.id, act.dataset.act);
    else drawer.open([row.dataset.id], row.dataset.seat);
  });

  function render(s) {
    if (s.reports === last.reports && s.filter === last.filter && s.role === last.role) return;
    last = s;
    const sum = summarize(s.reports);
    filters.querySelectorAll("[data-filter]").forEach((b) => {
      b.setAttribute("aria-pressed", b.dataset.filter === s.filter.status);
      b.lastChild.textContent = b.dataset.filter === "All" ? sum.total : sum.byStatus[b.dataset.filter];
    });

    const cols = COLUMNS.filter(([key]) => key !== "actions" || s.role === "technician");
    head.innerHTML = `<tr>${cols.map(([key, label]) => `<th scope="col" data-col="${key}">${label}</th>`).join("")}</tr>`;

    const rows = filterReports(s.reports, s.filter);
    const focusId = document.activeElement?.closest?.("tr[data-id]")?.dataset.id;
    const now = new Date();
    body.innerHTML = rows.map((r) => rowHtml(r, s.role, now)).join("");
    if (known) {
      for (const tr of body.rows) {
        const before = known.get(tr.dataset.id);
        if (before === undefined) tr.classList.add("is-new");
        else if (before !== tr.dataset.status) tr.classList.add("is-changed");
      }
    }
    known = new Map(s.reports.map((r) => [r.id, r.status]));
    if (focusId) body.querySelector(`tr[data-id="${CSS.escape(focusId)}"] .ticket-link`)?.focus();

    wrap.hidden = !rows.length;
    empty.hidden = !!rows.length;
    empty.innerHTML = s.reports.length
      ? `${icon("magnifying-glass")}<p class="empty__title">No tickets match</p><button type="button" class="btn btn--secondary btn--sm" data-clear>Clear filters</button>`
      : `${icon("list-checks")}<p class="empty__title">No reports yet</p><p>${
          s.role === "instructor"
            ? "Tap a PC on the lab map to send the first one."
            : "New reports from instructors show up here the moment they're sent."
        }</p>`;
  }

  state.subscribe(render);
  render(state.get());
}

function ticketHtml(r, reports, role) {
  const steps =
    r.status === "Duplicate"
      ? `<p class="note">${icon("copy")}Saved as a duplicate. The original ticket tracks the repair.</p>`
      : `<ol class="timeline">${timeline(r.status)
          .map(({ step, state }, k) => `<li data-state="${state}" style="--k:${k}">${icon(STATUS[step].icon)}<span>${step}</span></li>`)
          .join("")}</ol>`;
  return `<article class="ticket" data-id="${esc(r.id)}">
    ${tag(r, reports)}
    <p class="ticket__issue">${esc(r.issueDescription)}</p>
    <dl class="facts">
      <dt>Priority</dt><dd>${esc(r.priority)}</dd>
      <dt>Reported</dt><dd>${r.reportedAt?.toLocaleString() ?? "Just now"}</dd>
      <dt>Instructor</dt><dd>${esc(r.instructorName)}</dd>
      <dt>Student</dt><dd>${esc(r.reportedBy || "N/A")}</dd>
    </dl>
    ${steps}
    ${role === "technician" && nextActions(r.status).length ? `<div class="ticket__actions">${actionButtons(r)}</div>` : ""}
  </article>`;
}

export function mountDrawer(dialog, { store, state }) {
  const body = $(".sheet__body", dialog);
  let ids = [];
  sheet(dialog);

  const paint = () => {
    const { reports, role } = state.get();
    const list = ids.map((id) => reports.find((r) => r.id === id)).filter(Boolean);
    body.innerHTML = list.map((r) => ticketHtml(r, reports, role)).join("") || `<p class="muted">This ticket no longer exists.</p>`;
  };

  state.subscribe(() => dialog.open && paint());
  body.addEventListener("click", (e) => {
    const act = e.target.closest("[data-act]");
    if (act) setStatus(store, act.closest("[data-id]").dataset.id, act.dataset.act);
  });

  return {
    open(list, title) {
      ids = list;
      $(".sheet__title", dialog).textContent = title;
      paint();
      dialog.showModal();
    },
  };
}
```

- [ ] **Step 4: Replace `drama/tracker.css`**

`drama/tracker.css`

```css
.search {
  display: flex; align-items: center; gap: 8px; width: min(100%, 320px); padding: 0 12px;
  border: 1px solid var(--line-strong); border-radius: var(--r-ctl); background: var(--bg); color: var(--text-3);
  transition: border-color var(--t2);
}
.search:focus-within { border-color: var(--accent-hi); }
.search input { flex: 1; min-width: 0; min-height: 40px; border: 0; outline: 0; background: none; font-size: 1rem; }
.tracker__filters { margin-bottom: 16px; }

.table-wrap { overflow-x: auto; }
.table { width: 100%; border-collapse: collapse; font-size: var(--fs-sm); }
.table th { padding: 10px 12px; border-bottom: 1px solid var(--line); color: var(--text-3); font-size: var(--fs-xs); font-weight: 500; text-align: left; white-space: nowrap; }
.table td { padding: 12px; border-bottom: 1px solid var(--line); color: var(--text-2); vertical-align: middle; }
.table tbody tr { cursor: pointer; transition: background var(--t2); }
.table tbody tr:hover { background: var(--raised); }
.table tbody tr:last-child td { border-bottom: 0; }
.table td[data-col="equipment"] { white-space: nowrap; }
.table td[data-col="equipment"] .icon { margin-right: 8px; vertical-align: -3px; color: var(--text-3); }
.table td[data-col="issue"] { min-width: 22ch; max-width: 40ch; color: var(--text); }
@media (min-width: 1024px) and (max-width: 1279px) { .table [data-col="by"] { display: none; } }
.table td[data-col="actions"] { min-width: 9.5rem; }
.table td[data-col="actions"] .btn { margin: 3px 6px 3px 0; }
.table time { font: 400 var(--fs-xs)/1 var(--font-mono); font-variant-numeric: tabular-nums; white-space: nowrap; }
.ticket-link { display: grid; gap: 3px; border: 0; background: none; text-align: left; font: 500 var(--fs-sm)/1.2 var(--font-mono); white-space: nowrap; cursor: pointer; }
.ticket-link span { color: var(--text-3); font-size: var(--fs-xs); }

/* Realtime feedback: new rows flash violet, status changes stamp in */
.table tr.is-new { animation: row-new 1.8s var(--ease-out); }
.table tr.is-changed .chip:not(.chip--quiet) { animation: stamp .55s var(--ease-out); }
@keyframes row-new { from { background: color-mix(in oklab, var(--accent) 24%, transparent); } }
@keyframes stamp { 0% { opacity: 0; scale: 1.4; } 60% { opacity: 1; scale: .95; } }

/* Phones and tablets: rows become cards */
@media (max-width: 1023px) {
  .table thead { display: none; }
  .table, .table tbody, .table td { display: block; }
  .table tr { display: grid; grid-template-columns: 1fr auto; gap: 8px 12px; padding: 14px 2px; border-bottom: 1px solid var(--line); }
  .table tbody tr:last-child { border-bottom: 0; }
  .table td { padding: 0; border: 0; }
  .table td:is([data-col="issue"], [data-col="actions"]) { grid-column: 1 / -1; max-width: none; }
  .table td[data-col="by"] { color: var(--text-3); font-size: var(--fs-xs); }
}

/* Ticket drawer */
.ticket { display: grid; gap: 16px; padding-bottom: 24px; border-bottom: 1px solid var(--line); }
.ticket:last-child { padding-bottom: 0; border-bottom: 0; }
.ticket__issue { font-size: var(--fs-md); }
.facts { display: grid; grid-template-columns: auto 1fr; gap: 8px 16px; font-size: var(--fs-sm); }
.facts dt { color: var(--text-3); }
.ticket__actions { display: flex; flex-wrap: wrap; gap: 8px; }
.note { display: flex; align-items: center; gap: 8px; color: var(--text-2); font-size: var(--fs-sm); }

/* Status timeline: connectors draw on up to the current step */
.timeline { display: grid; grid-template-columns: repeat(3, 1fr); list-style: none; }
.timeline li { position: relative; display: grid; justify-items: center; gap: 6px; color: var(--text-3); font-size: var(--fs-xs); text-align: center; }
.timeline .icon { position: relative; z-index: 1; width: 34px; height: 34px; padding: 8px; border: 1px solid var(--line); border-radius: 50%; background: var(--bg); }
.timeline li:not(:first-child)::before, .timeline li:not(:first-child)::after {
  content: ""; position: absolute; top: 16px; right: 50%; width: 100%; height: 2px; background: var(--line);
}
.timeline li:is([data-state="done"], [data-state="current"]):not(:first-child)::after {
  background: var(--accent-hi); transform-origin: left;
  animation: draw .6s var(--ease-out) both; animation-delay: calc(var(--k) * 180ms);
}
.timeline li[data-state="done"] .icon { color: var(--accent-hi); border-color: var(--accent-hi); }
.timeline li[data-state="current"] { color: var(--text); }
.timeline li[data-state="current"] .icon {
  color: var(--on-accent); background: var(--accent); border-color: var(--accent);
  box-shadow: 0 0 0 4px rgb(120 80 218 / .25);
  animation: pop .5s var(--ease-out) both; animation-delay: calc(var(--k) * 180ms);
}
@keyframes draw { from { transform: scaleX(0); } }
@keyframes pop { from { scale: .6; opacity: 0; } }
```

- [ ] **Step 5: Wire it in** (exact replacements)

1. In `source/app.js` replace:

```js
import { ROLE_ICON, ROLE_LABEL, clearRole, getRole, mountLogin } from "./auth.js";
```

   with:

```js
import { ROLE_ICON, ROLE_LABEL, clearRole, getRole, mountLogin } from "./auth.js";
import { mountDrawer, mountTracker } from "./tracker.js";
```

2. In `source/app.js` replace:

```js
    mounted = true;
```

   with:

```js
    mounted = true;
    const drawer = mountDrawer($("#ticket-drawer"), { store: api, state });
    mountTracker($("#tracker"), { store: api, state, drawer });
```

3. In `index.html` replace:

```html
  <link rel="stylesheet" href="drama/login.css">
```

   with:

```html
  <link rel="stylesheet" href="drama/login.css">
  <link rel="stylesheet" href="drama/tracker.css">
```

- [ ] **Step 6: Run the tests**

Run: `npm test`
Expected: PASS (29 tests).

- [ ] **Step 7: Visual check** (live data is read-only here: don't press Start repair or Mark resolved on real tickets)

Log in as Technician with `tech123`, then check each of these:

1. **Filters:** the chips show counts, and a filter change cross-fades.
2. **Search:** narrows the rows. Seat codes like `lab1-pc07` work.
3. **Empty states:**
   - With no data, the sheet shows "No reports yet".
   - With a no-match search, it shows "No tickets match" and a "Clear filters" button.
4. **Row click:** the drawer opens with the asset tag (punched hole, barcode, id), facts and a status timeline.
5. **Tag hover:** the foil sheen sweeps across.
6. **Closing the drawer:** Esc and a backdrop click both close it.
7. **Width 1024px:** the Instructor column is hidden.
8. **Phone:** rows become cards.

- [ ] **Step 8: Commit**

```bash
git add source/tracker.js drama/tracker.css tests/tracker.test.js source/app.js index.html
git commit -m "feat: tracking sheet with live feedback and asset-tag ticket drawer" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Seat map and report sheet (the instructor flow)

**Files:**
- Create: `source/seatmap.js`, `drama/seatmap.css`, `tests/seatmap.test.js`
- Replace: `source/form.js`, `drama/form.css`
- Modify: `source/app.js`, `index.html`

**Interfaces:**
- Consumes:
  - From Task 2: `LABS`, `SEATS_PER_LAB`, `STATUS`, `openCount`, `seatCode`, `seatStates`, `ACTIVE`, `EQUIPMENT_ICON`, `buildReport`, `shortId`, `timeAgo`.
  - From Task 4: `$`, `esc`, `icon`, `sheet`, `toast`.
  - From Task 6: `chip`, `drawer.open`.
- Produces:
  - **From `source/seatmap.js`:** `seatLabel(lab, seat)` and `mountSeatMap(root, state, { onSeat(lab, n) })`.
  - **From `source/form.js`:** `mountReportSheet(dialog, { store, state }) → { open(lab, n) }`.
  - **Seat DOM hooks:** `.seat[data-n][data-tone][data-high]` and `.seatmap__grid.is-booting`.

- [ ] **Step 1: Write the failing test**

`tests/seatmap.test.js`

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { seatLabel } from "../source/seatmap.js";

test("seat labels read well for screen readers", () => {
  assert.equal(seatLabel("Lab 2", { n: 3, open: [], status: null, high: false }), "LAB2-PC03, no open reports");
  assert.equal(
    seatLabel("Lab 2", { n: 14, open: [{}, {}], status: "Reported", high: true }),
    "LAB2-PC14, 2 open reports, Reported, high priority"
  );
  assert.equal(seatLabel("Lab 1", { n: 7, open: [{}], status: "In Progress", high: false }), "LAB1-PC07, 1 open report, In Progress");
});

test("the report sheet posts the same field names the original form saved", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const sheet = html.slice(html.indexOf('id="report-sheet"'), html.indexOf("</dialog>", html.indexOf('id="report-sheet"')));
  for (const name of ["instructorName", "labRoom", "computerNumber", "equipmentType", "issueDescription", "reportedBy", "priority"]) {
    assert.ok(sheet.includes(`name="${name}"`), `missing ${name}`);
  }
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `node --test tests/seatmap.test.js`
Expected: FAIL, `ERR_MODULE_NOT_FOUND` for `source/seatmap.js`.

- [ ] **Step 3: Add the seat map**

`source/seatmap.js`

```js
// Lab floor plan: one tile per PC, lit by its open tickets. Arrow keys move between seats.
import { LABS, SEATS_PER_LAB, STATUS, openCount, seatCode, seatStates } from "./domain.js";
import { $, icon } from "./ui.js";

export function seatLabel(lab, seat) {
  const code = seatCode(lab, seat.n);
  if (!seat.status) return `${code}, no open reports`;
  const n = seat.open.length;
  return `${code}, ${n} open report${n > 1 ? "s" : ""}, ${seat.status}${seat.high ? ", high priority" : ""}`;
}

export function mountSeatMap(root, state, { onSeat }) {
  const labs = $(".seatmap__labs", root);
  const grid = $(".seatmap__grid", root);
  const meta = $(".seatmap__meta", root);
  let last = {};

  labs.innerHTML = LABS.map((l) => `<button type="button" class="seg" data-lab="${l}">${l}</button>`).join("");
  grid.innerHTML = Array.from(
    { length: SEATS_PER_LAB },
    (_, i) =>
      `<button type="button" class="seat" data-n="${i + 1}" style="--i:${i}" tabindex="${i ? -1 : 0}">` +
      `${icon("warning-circle", "seat__icon")}<span>${String(i + 1).padStart(2, "0")}</span><span class="seat__led"></span></button>`
  ).join("");
  const seats = [...grid.children];

  const powerOn = () => {
    grid.classList.remove("is-booting");
    void grid.offsetWidth; // restart the stagger
    grid.classList.add("is-booting");
    setTimeout(() => grid.classList.remove("is-booting"), 1400);
  };

  function paint(s) {
    if (s.lab === last.lab && s.reports === last.reports) return;
    if (s.lab !== last.lab) powerOn();
    last = s;
    const states = seatStates(s.lab, s.reports);
    labs.querySelectorAll("[data-lab]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.lab === s.lab));
    meta.innerHTML = `<span><b>${SEATS_PER_LAB}</b> PCs</span><span><b>${openCount(s.lab, s.reports)}</b> open</span>`;
    seats.forEach((btn, i) => {
      const seat = states[i];
      const tone = seat.status ? STATUS[seat.status].tone : "";
      if (btn.dataset.tone !== tone) {
        btn.dataset.tone = tone;
        if (tone) btn.querySelector("use").setAttribute("href", `assets/icons.svg#${STATUS[seat.status].icon}`);
      }
      btn.toggleAttribute("data-high", seat.high);
      btn.setAttribute("aria-label", seatLabel(s.lab, seat));
    });
  }

  labs.addEventListener("click", (e) => {
    const b = e.target.closest("[data-lab]");
    if (b) state.set({ lab: b.dataset.lab });
  });

  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".seat");
    if (!btn) return;
    seats.forEach((s) => (s.tabIndex = s === btn ? 0 : -1));
    onSeat(state.get().lab, Number(btn.dataset.n));
  });

  grid.addEventListener("keydown", (e) => {
    const i = seats.indexOf(document.activeElement);
    const cols = getComputedStyle(grid).gridTemplateColumns.split(" ").length;
    const j = { ArrowRight: i + 1, ArrowLeft: i - 1, ArrowDown: i + cols, ArrowUp: i - cols, Home: 0, End: seats.length - 1 }[e.key];
    if (i < 0 || j === undefined || !seats[j]) return;
    e.preventDefault();
    seats[i].tabIndex = -1;
    seats[j].tabIndex = 0;
    seats[j].focus();
  });

  state.subscribe(paint);
  paint(state.get());
}
```

- [ ] **Step 4: Add the seat map styles**

`drama/seatmap.css`

```css
.seatmap__meta { display: flex; gap: 14px; margin-top: 4px; font: 400 var(--fs-xs)/1 var(--font-mono); color: var(--text-3); }
.seatmap__meta b { font-weight: 500; color: var(--text); }

/* Floor plan: dot-grid texture, "front of the room" marker, rows of PCs */
.seatmap__floor {
  position: relative; padding: 44px 16px 20px;
  border: 1px solid var(--line); border-radius: var(--r-ctl);
  background: radial-gradient(circle at 1px 1px, rgb(255 255 255 / .08) 1px, transparent 1.5px) 0 0 / 16px 16px, var(--bg);
}
.seatmap__front {
  position: absolute; top: 12px; left: 50%; translate: -50% 0;
  padding: 3px 14px; border: 1px solid var(--line); border-radius: var(--r-pill);
  background: var(--surface); color: var(--text-3); font: 400 var(--fs-xs)/1.4 var(--font-mono); white-space: nowrap;
}
.seatmap__grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 8px; max-width: 720px; margin: 0 auto; }
@media (min-width: 640px) { .seatmap__grid { grid-template-columns: repeat(10, minmax(0, 1fr)); } }

.seat {
  position: relative; display: grid; place-items: center; aspect-ratio: 1.1;
  border: 1px solid var(--line); border-radius: var(--r-ctl);
  background: var(--surface); color: var(--text-3);
  font: 500 var(--fs-xs)/1 var(--font-mono); cursor: pointer;
  transition: translate var(--t1), border-color var(--t2), background var(--t2), color var(--t2);
}
.seat:hover { translate: 0 -1px; border-color: var(--line-strong); color: var(--text); }
.seat__icon { position: absolute; top: 5px; left: 5px; width: 12px; height: 12px; color: var(--tone); display: none; }
.seat__led { position: absolute; bottom: 5px; left: calc(50% - 2.5px); width: 5px; height: 5px; border-radius: 50%; background: var(--line); }

/* Power-on sequence each time a lab is shown */
.seatmap__grid.is-booting .seat { animation: seat-on .42s var(--ease-out) both; animation-delay: calc(var(--i) * 12ms); }
.seatmap__grid.is-booting .seat__led { animation: led-on .5s steps(3, jump-none) both; animation-delay: calc(var(--i) * 12ms + .2s); }

/* Lit seats: tone border + wash, icon, LED (breathes when Reported, blinks when In Progress) */
.seat:is([data-tone="reported"], [data-tone="progress"]) {
  color: var(--text);
  border-color: color-mix(in oklab, var(--tone) 55%, var(--line));
  background: color-mix(in oklab, var(--tone) 10%, var(--surface));
}
.seat:is([data-tone="reported"], [data-tone="progress"]) .seat__icon { display: block; }
.seat:is([data-tone="reported"], [data-tone="progress"]) .seat__led { background: var(--tone); box-shadow: 0 0 6px var(--tone); }
.seat[data-tone="reported"] .seat__led { animation: breathe 2.4s var(--ease-io) infinite; }
.seat[data-tone="progress"] .seat__led { animation: blink 1s steps(2, jump-none) infinite; }
.seat[data-high]::after, .legend__high {
  content: ""; position: absolute; top: -1px; right: -1px; width: 12px; height: 12px;
  border-top-right-radius: var(--r-ctl); background: linear-gradient(225deg, var(--critical) 50%, transparent 50%);
}

.seatmap__foot { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px 24px; margin-top: 16px; }
.seatmap__hint { display: flex; align-items: center; gap: 8px; color: var(--text-2); font-size: var(--fs-sm); }
.legend { display: flex; flex-wrap: wrap; gap: 6px 16px; list-style: none; color: var(--text-2); font-size: var(--fs-xs); }
.legend li { position: relative; display: flex; align-items: center; gap: 6px; }
.legend .icon { width: 14px; height: 14px; color: var(--tone, var(--text-3)); }
.legend__high { position: relative; top: 0; right: 0; width: 14px; height: 14px; border: 1px solid var(--line); border-radius: 4px; }

@keyframes seat-on { from { opacity: 0; scale: .9; } }
@keyframes led-on { 0% { background: var(--line); } 50% { background: var(--accent-hi); box-shadow: 0 0 6px var(--accent-hi); } }
@keyframes breathe { 50% { opacity: .35; box-shadow: none; } }
@keyframes blink { 50% { opacity: .25; } }
```

- [ ] **Step 5: Replace `source/form.js`** (report sheet with the "Already open on this PC" nudge)

`source/form.js`

```js
// Instructor report sheet: opens from a seat, shows what's already open there, checks duplicates on send.
import { ACTIVE, EQUIPMENT_ICON, buildReport, seatCode, shortId, timeAgo } from "./domain.js";
import { $, esc, icon, sheet, toast } from "./ui.js";
import { chip } from "./tracker.js";

export function mountReportSheet(dialog, { store, state }) {
  const form = $("form", dialog);
  const existing = $(".sheet__existing", dialog);
  sheet(dialog);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const send = $("[type=submit]", form);
    send.disabled = true;
    send.textContent = "Sending";
    const { report, dup } = buildReport(Object.fromEntries(new FormData(form)), state.get().reports);
    const code = seatCode(report.labRoom, report.computerNumber);
    try {
      await store.add(report);
      dialog.close();
      if (dup) toast(`Already reported. Saved as a duplicate of ${code} ${shortId(dup.id)}.`, "reported", "copy");
      else toast(`Report sent for ${code}. The technician can see it now.`, "resolved", "check");
    } catch (err) {
      console.error(err);
      toast("Couldn't send the report. Check the connection and try again.", "critical", "warning-circle");
    } finally {
      send.disabled = false;
      send.textContent = "Send report";
    }
  });

  return {
    open(lab, n) {
      const computer = `Computer ${n}`;
      form.reset();
      form.labRoom.value = lab;
      form.computerNumber.value = computer;
      $(".sheet__title", dialog).textContent = seatCode(lab, n);
      const open = state
        .get()
        .reports.filter((r) => r.labRoom === lab && r.computerNumber === computer && ACTIVE.includes(r.status));
      existing.hidden = !open.length;
      existing.innerHTML = open.length
        ? `<p class="label">Already open on this PC. Same problem? No need to send it again.</p>` +
          open
            .map(
              (r) =>
                `<div class="existing">${icon(EQUIPMENT_ICON[r.equipmentType] ?? "monitor")}` +
                `<p>${esc(r.issueDescription)}<span>${esc(r.equipmentType)}, ${timeAgo(r.reportedAt)}</span></p>${chip(r.status)}</div>`
            )
            .join("")
        : "";
      dialog.showModal();
    },
  };
}
```

- [ ] **Step 6: Replace `drama/form.css`**

`drama/form.css`

```css
/* Report sheet */
.tiles { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.tile {
  position: relative; display: grid; justify-items: center; gap: 8px; padding: 14px 8px;
  border: 1px solid var(--line); border-radius: var(--r-ctl);
  background: var(--bg); color: var(--text-2); font-size: var(--fs-sm); cursor: pointer;
  transition: border-color var(--t2), color var(--t2), background var(--t2);
}
.tile input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
.tile .icon { width: 28px; height: 28px; transition: scale var(--t3) var(--ease-out), color var(--t2); }
.tile:hover { border-color: var(--line-strong); color: var(--text); }
.tile:has(:checked) { border-color: var(--accent-hi); color: var(--text); background: color-mix(in oklab, var(--accent) 14%, var(--bg)); }
.tile:has(:checked) .icon { scale: 1.1; color: var(--accent-hi); }
.tile:has(:focus-visible) { outline: 2px solid var(--accent-hi); outline-offset: 2px; }

/* "Already open on this PC" nudge: the duplicate check, shown before typing */
.sheet__existing {
  display: grid; gap: 10px; padding: 14px;
  border: 1px solid color-mix(in oklab, var(--reported) 40%, var(--line)); border-radius: var(--r-ctl);
  background: color-mix(in oklab, var(--reported) 7%, var(--surface));
}
.sheet__existing .label { color: var(--reported); }
.existing { display: flex; align-items: flex-start; gap: 10px; font-size: var(--fs-sm); }
.existing > .icon { width: 18px; height: 18px; margin-top: 2px; color: var(--text-2); }
.existing p { flex: 1; }
.existing p span { display: block; color: var(--text-3); font-size: var(--fs-xs); }
```

- [ ] **Step 7: Wire it in** (exact replacements)

1. In `source/app.js` replace:

```js
import { LABS, byNewest } from "./domain.js";
```

   with:

```js
import { ACTIVE, LABS, byNewest, seatCode } from "./domain.js";
```

2. In `source/app.js` replace:

```js
import { mountDrawer, mountTracker } from "./tracker.js";
```

   with:

```js
import { mountSeatMap } from "./seatmap.js";
import { mountReportSheet } from "./form.js";
import { mountDrawer, mountTracker } from "./tracker.js";
```

3. In `source/app.js` replace:

```js
    mountTracker($("#tracker"), { store: api, state, drawer });
```

   with:

```js
    mountTracker($("#tracker"), { store: api, state, drawer });
    const sheet = mountReportSheet($("#report-sheet"), { store: api, state });
    mountSeatMap($("#seatmap"), state, {
      onSeat(lab, n) {
        const { role, reports } = state.get();
        if (role === "instructor") return sheet.open(lab, n);
        const open = reports.filter((r) => r.labRoom === lab && r.computerNumber === `Computer ${n}` && ACTIVE.includes(r.status));
        if (open.length) drawer.open(open.map((r) => r.id), seatCode(lab, n));
        else toast(`${seatCode(lab, n)} has no open tickets.`, "info", "info");
      },
    });
```

4. In `index.html` replace:

```html
  <link rel="stylesheet" href="drama/login.css">
```

   with:

```html
  <link rel="stylesheet" href="drama/login.css">
  <link rel="stylesheet" href="drama/seatmap.css">
  <link rel="stylesheet" href="drama/form.css">
```

- [ ] **Step 8: Run the tests**

Run: `npm test`
Expected: PASS (31 tests).

- [ ] **Step 9: Visual check** (don't submit to the live database; sending is exercised in demo mode in Task 9)

Log in as Instructor, then check each of these:

1. **Power-on stagger:** seats power on in a stagger, and again on every lab switch.
2. **Floor texture:** the dot-grid floor shows, with a "Front of the room" pill.
3. **Keyboard:** Tab reaches one seat, then the arrow keys, Home and End move focus.
4. **Report sheet:** clicking a seat slides the sheet in from the right, with its seat code as the title in mono.
5. **Validation:** empty required fields block the send.
6. **Esc:** closes the sheet and returns focus to the seat.
7. **Phone:** the sheet rises from the bottom and the grid has 5 columns.
8. **Technician on a dark seat:** shows the toast "LAB1-PC01 has no open tickets."

- [ ] **Step 10: Commit**

```bash
git add source/seatmap.js drama/seatmap.css source/form.js drama/form.css tests/seatmap.test.js source/app.js index.html
git commit -m "feat: lab seat map and report sheet with open-ticket nudge" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Technician insights

**Files:**
- Replace: `source/analytics.js`, `drama/analytics.css`
- Create: `tests/analytics.test.js`
- Modify: `source/app.js`, `index.html`

**Interfaces:**
- Consumes: `summarize` (Task 2); `$`, `countUp`, `esc` (Task 4).
- Produces: `barsHtml(pairs: [label, n][]) → string` (first max gets `is-top`, widths `--w = n / max`); `mountInsights(root, state)`.

Chart rules (dataviz skill):
- **Form:** stat tiles (proportional figures) plus two single-series emphasis bar lists, so no legend.
- **Marks:** bars 10px thick with a 4px rounded data end, growing from the baseline.
- **Labels:** values at the tip in text tokens.
- **Interaction:** a hover lift, but no tooltip. Every bar is direct-labeled, and each row is plain text, so the rows double as the table view.

- [ ] **Step 1: Write the failing test**

`tests/analytics.test.js`

```js
import test from "node:test";
import assert from "node:assert/strict";
import { barsHtml } from "../source/analytics.js";

test("the largest bar is emphasized and widths are relative to it", () => {
  const html = barsHtml([["Lab 1", 1], ["Lab 2", 4], ["Lab 3", 2]]);
  assert.equal((html.match(/is-top/g) ?? []).length, 1);
  assert.match(html, /<li class="is-top"><span>Lab 2<\/span>/);
  assert.match(html, /--w:0\.25;/);
  assert.match(html, /--w:1;/);
});

test("no emphasis when everything is zero", () => {
  assert.ok(!barsHtml([["Keyboard", 0], ["Mouse", 0], ["Computer", 0]]).includes("is-top"));
});

test("ties emphasize the first bar only", () => {
  const html = barsHtml([["Keyboard", 2], ["Computer", 2], ["Mouse", 1]]);
  assert.equal((html.match(/is-top/g) ?? []).length, 1);
  assert.match(html, /<li class="is-top"><span>Keyboard/);
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `node --test tests/analytics.test.js`
Expected: FAIL. The old `analytics.js` imports the Firebase CDN URL, so Node reports `ERR_UNSUPPORTED_ESM_URL_SCHEME`.

- [ ] **Step 3: Replace `source/analytics.js`**

`source/analytics.js`

```js
// Technician insights: the original metrics, drawn as stat tiles and emphasis bars (top value in violet).
import { summarize } from "./domain.js";
import { $, countUp, esc } from "./ui.js";

export function barsHtml(pairs) {
  const max = Math.max(1, ...pairs.map(([, n]) => n));
  const top = pairs.reduce((a, b) => (b[1] > a[1] ? b : a));
  return pairs
    .map(
      ([label, n], i) =>
        `<li${n && label === top[0] ? ' class="is-top"' : ""}><span>${esc(label)}</span>` +
        `<span class="bars__bar" style="--w:${n / max};--i:${i}"></span><span class="bars__value">${n}</span></li>`
    )
    .join("");
}

export function mountInsights(root, state) {
  let last;
  const paint = (s) => {
    if (s.role !== "technician" || s.reports === last) return;
    last = s.reports;
    const m = summarize(s.reports);
    countUp($("[data-stat=open]", root), m.open);
    countUp($("[data-stat=resolved]", root), m.resolutionRate, "%");
    countUp($("[data-stat=dup]", root), m.duplicateRate, "%");
    $("[data-bars=lab]", root).innerHTML = barsHtml(m.byLab);
    $("[data-bars=equipment]", root).innerHTML = barsHtml(m.byEquipment);
  };
  state.subscribe(paint);
  paint(state.get());
}
```

- [ ] **Step 4: Replace `drama/analytics.css`**

`drama/analytics.css`

```css
/* Technician insights: stat tiles + emphasis bars (top value in violet, rest recessive gray). */
.insights { display: grid; align-content: start; gap: 14px; }
.insights .panel__head { margin-bottom: 0; }
.stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 8px; }
.stat { padding: 12px; border: 1px solid var(--line); border-radius: var(--r-ctl); background: var(--bg); }
.stat__label { color: var(--text-2); font-size: var(--fs-xs); }
.stat__value { margin-top: 6px; font-size: var(--fs-xl); font-weight: 600; line-height: 1.1; letter-spacing: -.02em; }
.bars { display: grid; gap: 10px; margin-bottom: 8px; list-style: none; }
.bars li { display: grid; grid-template-columns: 5.5rem 1fr 3ch; align-items: center; gap: 10px; color: var(--text-2); font-size: var(--fs-sm); }
.bars__bar {
  width: calc(var(--w) * 100%); height: 10px; border-radius: 0 4px 4px 0;
  background: var(--line-strong); transform-origin: left;
  transition: transform .8s var(--ease-out) calc(var(--i) * 80ms), filter var(--t2);
}
@starting-style { .bars__bar { transform: scaleX(0); } }
.bars li:hover .bars__bar { filter: brightness(1.25); }
.bars .is-top { color: var(--text); }
.bars .is-top .bars__bar { background: var(--accent); }
.bars__value { font: 500 var(--fs-xs)/1 var(--font-mono); font-variant-numeric: tabular-nums; text-align: right; }
```

- [ ] **Step 5: Wire it in** (exact replacements)

1. In `source/app.js` replace:

```js
import { mountDrawer, mountTracker } from "./tracker.js";
```

   with:

```js
import { mountDrawer, mountTracker } from "./tracker.js";
import { mountInsights } from "./analytics.js";
```

2. In `source/app.js` replace:

```js
    state.subscribe(chrome);
```

   with:

```js
    mountInsights($("#insights"), state);
    state.subscribe(chrome);
```

3. In `index.html` replace:

```html
  <link rel="stylesheet" href="drama/tracker.css">
```

   with:

```html
  <link rel="stylesheet" href="drama/tracker.css">
  <link rel="stylesheet" href="drama/analytics.css">
```

- [ ] **Step 6: Run the tests**

Run: `npm test`
Expected: PASS (34 tests).

- [ ] **Step 7: Visual check**

Log in as Technician at 1440px, then check each of these:

1. **Layout:** Insights sits right of the map, and the tracking sheet runs full width below.
2. **Motion:** numbers count up and bars grow on the first reveal.
3. **Emphasis:** only the top lab and the top equipment are violet.
4. **Instructor view:** Insights is not shown.

- [ ] **Step 8: Commit**

```bash
git add source/analytics.js drama/analytics.css tests/analytics.test.js source/app.js index.html
git commit -m "feat: technician insights with count-up tiles and emphasis bars" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Demo mode and walkthrough

**Files:**
- Create: `source/demo.js`, `drama/demo.css`, `tests/demo.test.js`
- Modify: `source/app.js`, `index.html` (stylesheet + reveal the two demo buttons)

**Interfaces:**
- Consumes: `buildReport`, `seatCode` (Task 2); `memoryStore` (Task 3); `$`, `reducedMotion`, `toast` (Task 4); DOM hooks from Tasks 6 and 7 (`tr[data-seat]`, `tr[data-status]`, `[data-act]`, `#seatmap`, `#demo-role`).
- Produces: `DEMO_REPORTS` (the 5 fictional reports), `seedDemo(store, getReports)`, `WALKTHROUGH` (`{ target, text, enter?, next? }[]`), `mountDemo({ store, state })`.

- [ ] **Step 1: Write the failing test**

`tests/demo.test.js`

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { DEMO_REPORTS, WALKTHROUGH, seedDemo } from "../source/demo.js";
import { memoryStore } from "../source/store.js";

test("the 5 fictional reports produce exactly one duplicate: report 5 repeats report 2", async () => {
  const store = memoryStore();
  let reports = [];
  store.subscribe((list) => (reports = list));
  await seedDemo(store, () => reports);
  assert.equal(DEMO_REPORTS.length, 5);
  assert.deepEqual(
    reports.map((r) => r.status),
    ["Reported", "Reported", "Reported", "Reported", "Duplicate"]
  );
  assert.equal(reports[4].computerNumber, reports[1].computerNumber);
});

test("walkthrough ids exist in index.html", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  for (const { target } of WALKTHROUGH) {
    const id = target.match(/^#([\w-]+)/)?.[1];
    assert.ok(html.includes(`id="${id}"`), `missing #${id}`);
  }
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `node --test tests/demo.test.js`
Expected: FAIL, `ERR_MODULE_NOT_FOUND` for `source/demo.js`.

- [ ] **Step 3: Add demo mode**

`source/demo.js`

```js
// Demo mode: in-memory data, the 5 fictional test reports, and a guided Reported -> Resolved walkthrough.
import { buildReport, seatCode } from "./domain.js";
import { $, reducedMotion, toast } from "./ui.js";

// Report 5 repeats report 2 word for word, so the original duplicate rule catches it.
export const DEMO_REPORTS = [
  { instructorName: "Engr. Ramil Dagohoy", reportedBy: "", labRoom: "Lab 1", computerNumber: "Computer 7", equipmentType: "Computer", issueDescription: "Won't power on. No lights on the system unit.", priority: "High" },
  { instructorName: "Ms. Rhea Tampus", reportedBy: "Kyla Bontilao", labRoom: "Lab 2", computerNumber: "Computer 14", equipmentType: "Keyboard", issueDescription: "Keys E, R and T don't respond.", priority: "Medium" },
  { instructorName: "Mr. Joel Saavedra", reportedBy: "", labRoom: "Lab 2", computerNumber: "Computer 3", equipmentType: "Mouse", issueDescription: "Cursor freezes and the scroll wheel is loose.", priority: "Low" },
  { instructorName: "Prof. Liza Macaraeg", reportedBy: "", labRoom: "Lab 3", computerNumber: "Computer 21", equipmentType: "Computer", issueDescription: "Stuck on the boot screen and restarts by itself.", priority: "High" },
  { instructorName: "Engr. Dennis Cabahug", reportedBy: "", labRoom: "Lab 2", computerNumber: "Computer 14", equipmentType: "Keyboard", issueDescription: "Keys E, R and T don't respond.", priority: "Medium" },
];

export async function seedDemo(store, getReports) {
  for (const fields of DEMO_REPORTS) await store.add(buildReport(fields, getReports()).report);
}

// Wait until a smooth scroll has moved the element and it has held still for 5 frames (max ~1s).
async function settle(el) {
  for (let i = 0, still = 0, prev; el && i < 60 && still < 5; i++) {
    await new Promise(requestAnimationFrame);
    const y = el.getBoundingClientRect().top;
    still = y === prev ? still + 1 : 0;
    prev = y;
  }
}

const find = (state, code) =>
  state.get().reports.find((r) => seatCode(r.labRoom, r.computerNumber) === code && r.status !== "Duplicate");

// enter(): set the view up for the step. next(): the action performed when the presenter clicks Next.
export const WALKTHROUGH = [
  { target: "#seatmap", text: "Five test reports are in. PCs with open tickets light up on the lab map.", enter: ({ state }) => state.set({ lab: "Lab 2", filter: { status: "All", query: "" } }) },
  { target: '#tracker tr[data-status="Duplicate"]', text: "Report 5 repeats report 2 word for word, so it was saved as a Duplicate instead of a new ticket." },
  { target: "#demo-role", text: "Next, the lab technician's view.", next: ({ state }) => state.set({ role: "technician" }) },
  { target: '#tracker tr[data-seat="LAB1-PC07"] [data-act="In Progress"]', text: "LAB1-PC07 won't power on. The technician starts the repair.", next: ({ store, state }) => store.update(find(state, "LAB1-PC07").id, { status: "In Progress" }) },
  { target: '#tracker tr[data-seat="LAB1-PC07"] [data-act="Resolved"]', text: "Repaired. The technician marks it resolved.", next: ({ store, state }) => store.update(find(state, "LAB1-PC07").id, { status: "Resolved" }) },
  { target: "#seatmap", text: "Everyone sees it: LAB1-PC07 is no longer lit and the sheet shows Resolved.", enter: ({ state }) => state.set({ lab: "Lab 1" }) },
];

export function mountDemo(ctx) {
  const { store, state } = ctx;
  const bar = $("#demo-bar");
  const coach = $("#coach");
  const spot = $(".coach__spot", coach);
  const card = $(".coach__card", coach);
  const next = $(".coach__next", coach);
  let at = -1;
  bar.hidden = false;
  document.body.dataset.demo = "";

  $("#demo-seed").addEventListener("click", async (e) => {
    e.currentTarget.disabled = true;
    await seedDemo(store, () => state.get().reports);
    $("#demo-tour").disabled = false;
    toast("5 test reports loaded. One is a duplicate.", "info", "list-checks");
  });
  $("#demo-role").addEventListener("click", (e) => {
    const b = e.target.closest("[data-role]");
    if (b) state.set({ role: b.dataset.role });
  });
  state.subscribe(({ role }) =>
    bar.querySelectorAll("[data-role]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.role === role))
  );
  $("#demo-exit").addEventListener("click", () => location.reload());
  $("#demo-tour").addEventListener("click", () => show(0));

  async function show(i) {
    at = i;
    const step = WALKTHROUGH[i];
    coach.hidden = false;
    coach.classList.add("is-moving");
    step.enter?.(ctx);
    const el = document.querySelector(step.target);
    el?.scrollIntoView({ block: "center", behavior: reducedMotion() ? "auto" : "smooth" });
    await settle(el);
    $(".coach__count", card).textContent = `Step ${i + 1} of ${WALKTHROUGH.length}`;
    $(".coach__text", card).textContent = step.text;
    next.textContent = i === WALKTHROUGH.length - 1 ? "Done" : "Next";
    const box = el?.getBoundingClientRect() ?? new DOMRect(innerWidth / 2, innerHeight / 2);
    Object.assign(spot.style, { left: `${box.x - 8}px`, top: `${box.y - 8}px`, width: `${box.width + 16}px`, height: `${box.height + 16}px` });
    const h = card.offsetHeight;
    const y = box.bottom + 16 + h <= innerHeight ? box.bottom + 16 : box.top - 16 - h >= 0 ? box.top - 16 - h : innerHeight - h - 16;
    card.style.setProperty("--x", `${Math.min(Math.max(16, box.x), innerWidth - card.offsetWidth - 16)}px`);
    card.style.setProperty("--y", `${y}px`);
    coach.classList.remove("is-moving");
    next.focus();
  }

  const close = () => {
    coach.hidden = true;
    at = -1;
  };
  next.addEventListener("click", async () => {
    await WALKTHROUGH[at].next?.(ctx);
    at + 1 < WALKTHROUGH.length ? show(at + 1) : close();
  });
  $(".coach__skip", coach).addEventListener("click", close);
  addEventListener("keydown", (e) => e.key === "Escape" && at >= 0 && close());
}
```

- [ ] **Step 4: Add the demo styles**

`drama/demo.css`

```css
/* Demo mode wears orchid so nobody mistakes test data for the live sheet. */
.demobar {
  display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px;
  padding: 10px clamp(16px, 3vw, 32px);
  border-bottom: 1px solid color-mix(in oklab, var(--orchid) 35%, var(--line));
  background: color-mix(in oklab, var(--orchid) 9%, var(--bg));
  color: var(--text-2); font-size: var(--fs-sm);
}
.demobar p { margin-right: auto; }
.demobar strong { margin-right: 8px; color: var(--orchid); font-weight: 600; }
body[data-demo] #sign-out { display: none; }

/* Walkthrough: dim everything, ring the step target, card beside it */
.coach { position: fixed; inset: 0; z-index: var(--z-coach); }
.coach__spot {
  position: fixed; border-radius: var(--r-panel); pointer-events: none;
  box-shadow: 0 0 0 200vmax rgb(8 7 14 / .74), 0 0 0 2px var(--orchid);
  transition: opacity var(--t3);
}
.coach__card {
  position: fixed; top: var(--y); left: var(--x); width: min(340px, calc(100vw - 32px));
  display: grid; gap: 10px; padding: 16px;
  border: 1px solid var(--line); border-radius: var(--r-panel); background: var(--raised); box-shadow: var(--shadow);
  transition: opacity var(--t3), translate var(--t3) var(--ease-out);
}
.coach.is-moving :is(.coach__spot, .coach__card) { opacity: 0; }
.coach.is-moving .coach__card { translate: 0 6px; }
.coach__count { color: var(--orchid); font: 500 var(--fs-xs)/1 var(--font-mono); }
.coach__actions { display: flex; justify-content: flex-end; gap: 8px; }
@media (max-width: 767px) { .coach__card { inset: auto 16px 16px; width: auto; } }
```

- [ ] **Step 5: Wire it in** (exact replacements)

1. In `source/app.js` replace:

```js
import { createState } from "./store.js";
```

   with:

```js
import { createState, memoryStore } from "./store.js";
```

2. In `source/app.js` replace:

```js
import { mountInsights } from "./analytics.js";
```

   with:

```js
import { mountInsights } from "./analytics.js";
import { mountDemo } from "./demo.js";
```

3. In `source/app.js` replace:

```js
mountLogin({
```

   with:

```js
async function startDemo() {
  $("#boot").hidden = true;
  await sync(memoryStore());
  state.set({ role: "instructor", lab: LABS[0] });
  mountDemo({ store: api, state });
  swap(showApp);
}

mountLogin({
```

4. In `source/app.js` replace:

```js
    swap(showApp);
  },
});
```

   with:

```js
    swap(showApp);
  },
  onDemo: startDemo,
});
```

5. In `source/app.js` replace:

```js
try again.", {});
```

   with:

```js
try again.", { onDemo: startDemo });
```

6. In `index.html` replace:

```html
  <link rel="stylesheet" href="drama/analytics.css">
```

   with:

```html
  <link rel="stylesheet" href="drama/analytics.css">
  <link rel="stylesheet" href="drama/demo.css">
```

7. In `index.html` replace:

```html
<button type="button" class="btn btn--ghost" data-demo hidden>
```

   with:

```html
<button type="button" class="btn btn--ghost" data-demo>
```

8. In `index.html` replace:

```html
<button id="demo-start" type="button" class="btn btn--ghost btn--block" hidden>
```

   with:

```html
<button id="demo-start" type="button" class="btn btn--ghost btn--block">
```

- [ ] **Step 6: Run the tests**

Run: `npm test`
Expected: PASS (36 tests).

- [ ] **Step 7: Visual check (the class demo)**

At 1440px, then at 375px, check each of these:

1. **Enter demo:** clicking Try the demo shows the orchid "Demo mode" bar.
2. **Load 5 test reports:**
   - LAB1-PC07 lights amber with the rose high-priority corner.
   - Lab 2 shows PC03 and PC14 lit.
   - The sheet counts read Reported 4 and Duplicate 1.
   - The toast says one report is a duplicate.
3. **Instructor on LAB2-PC14:** the sheet lists the open keyboard ticket under "Already open on this PC".
4. **Send a test report here:** it's in-memory, so it's safe. The toast confirms it and the row flashes violet.
5. **Walkthrough:** six steps, with the spotlight and card placed beside each target (docked at the bottom for tall targets):
   - Step 2 rings the Duplicate row.
   - Step 3 switches to Technician.
   - Steps 4 and 5 move LAB1-PC07 to In Progress, then Resolved, and the chip stamps each time.
   - Step 6 shows Lab 1 dark again.
6. **Esc or Skip:** closes the walkthrough.
7. **Exit demo:** reloads to the login.
8. **Offline check:** disable the network and reload. The loading screen shows the error with "Try again" and "Open the demo", and the demo still works.

- [ ] **Step 8: Commit**

```bash
git add source/demo.js drama/demo.css tests/demo.test.js source/app.js index.html
git commit -m "feat: demo mode with 5 fictional reports and guided walkthrough" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Final checks, memory file, review

**Files:**
- Create: `tests/lint.test.js`
- Replace: `PROJECT.md`

**Interfaces:**
- Consumes: everything above.
- Produces: the finished branch `redesign/seat-map`, ready for a PR.

- [ ] **Step 1: Add the guard test** (a guard, not TDD: it should pass on the first run. If it fails, fix the offending file, never loosen the test)

`tests/lint.test.js`

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { ICONS } from "../scripts/build-icons.mjs";
import { EQUIPMENT_ICON, STATUS } from "../source/domain.js";
import { ROLE_ICON } from "../source/auth.js";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");
const uiFiles = async () => [
  "index.html",
  ...(await readdir(new URL("source/", root))).filter((f) => f !== "firebase-config.js").map((f) => `source/${f}`),
  ...(await readdir(new URL("drama/", root))).map((f) => `drama/${f}`),
];

test("no em/en dashes or emoji in UI files", async () => {
  for (const file of await uiFiles()) {
    const text = await read(file);
    assert.doesNotMatch(text, /[–—]/, `${file} has an em or en dash`);
    assert.doesNotMatch(text, /\p{Extended_Pictographic}/u, `${file} has an emoji`);
  }
});

test("reduced motion switches every animation off", async () => {
  assert.match(await read("drama/base.css"), /prefers-reduced-motion: reduce\)[\s\S]*animation-duration: 1ms !important/);
});

test("every icon the UI uses is in the sprite", async () => {
  const sprite = await read("assets/icons.svg");
  const used = new Set([
    ...Object.values(STATUS).map((s) => s.icon),
    ...Object.values(EQUIPMENT_ICON),
    ...Object.values(ROLE_ICON),
  ]);
  for (const file of await uiFiles()) {
    for (const m of (await read(file)).matchAll(/icons\.svg#([\w-]+)|icon\("([\w-]+)"|icon: "([\w-]+)"/g)) {
      used.add(m[1] ?? m[2] ?? m[3]);
    }
  }
  for (const name of used) {
    assert.ok(ICONS.includes(name), `${name} missing from ICONS in scripts/build-icons.mjs`);
    assert.ok(sprite.includes(`id="${name}"`), `${name} missing from assets/icons.svg (run npm run icons)`);
  }
});
```

- [ ] **Step 2: Run the whole suite**

Run: `npm test`
Expected: PASS (39 tests).

- [ ] **Step 3: QA matrix in the Browser pane** (one batched round, fix everything found, then one confirming round; two rounds max)

| Viewport | Check |
|---|---|
| 1440 × 900 | Loading screen → login dock; technician layout (map + insights + full-width sheet); no horizontal page scroll |
| 1024 × 768 | Tracking sheet as a table without the Instructor column; walkthrough card never covers its target row |
| 320 × 640 | Top bar fits (icon-only role chip and Log out); no horizontal page scroll |
| 768 × 1024 | Tracking rows as cards; insights stacked under the map |
| 390 × 844 | 5-column seat grid; bottom sheets; card rows; toasts at top; demo bar wraps cleanly; every tap target ≥ 44px |
| Any | Keyboard only: Tab → seat → Enter opens the sheet → Esc returns focus; no console errors; `document.querySelectorAll('img:not([alt])').length === 0` |

- [ ] **Step 4: Update `PROJECT.md`** (replace the whole file)

`PROJECT.md`

```markdown
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
```

- [ ] **Step 5: Commit**

```bash
git add tests/lint.test.js PROJECT.md
git commit -m "test: UI lint guard; docs: PROJECT.md for the redesign" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 6: One review pass for the whole plan** (user rule)

Use superpowers:requesting-code-review on `origin/main..redesign/seat-map`. Fix confirmed findings in one batch, then re-run `npm test`.

- [ ] **Step 7: Hand off** (ask before anything outward-facing)

Ask the user whether to take each of these steps:
1. Push `redesign/seat-map` and open a PR to `FebyStack/IS-INNO`.
2. Deploy a 7-day preview channel with `firebase hosting:channel:deploy redesign --expires 7d`.

Run nothing outward-facing without a clear yes.

---

## Out of scope (per "no new features")

- Firebase Auth and role-checked Firestore rules (recommended security follow-up).
- A Lab in-charge role and its capabilities.
- CSV or PDF export.
- Reopening resolved tickets.
- Merging duplicates into a parent ticket.
- An in-app workflow diagram page, reflection page or first-run tips.
- A light theme, a PWA or offline queueing.
- Paraphrase-aware duplicate detection (see "What the test reveals").

## Self-review (done while writing)

- **Spec coverage:**
  - Direction → Tasks 6 and 7.
  - Palette, textures, icons and overlays → Tasks 4 to 9.
  - Loading screen and motion → Tasks 5 to 9.
  - Logo → Tasks 1 and 5.
  - Demo seed + walkthrough → Task 9.
  - Roles and features unchanged → the Global Constraints, enforced by the Task 5 and 6 tests.
  - Architect blueprint → the Blueprint section.
- **Verified before saving:** every code block was run.
  - A replay applied the tasks to the original repo in order. The suite passed after each task (3, 16, 18, 21, 24, 29, 31, 34, 36, 39), and the final tree was byte-identical to a prototype checked in the browser at 320, 375, 768, 1024, 1280 and 1440px.
  - The browser check covered the loading screen, login, demo seed, the full walkthrough, the report sheet, the drawer and the phone layouts.
- **Consistency:**
  - Names used across tasks match their definitions: `mountDrawer` → `drawer.open(ids, title)`, `chip` shared by Tasks 6 and 7, and `api.add` / `api.update`.
  - The `WALKTHROUGH` targets exist in `index.html`, which is tested.
