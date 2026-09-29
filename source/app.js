// Entry: boot sequence, then the live (Firestore) app.
import { ACTIVE, LABS, byNewest, seatCode } from "./domain.js";
import { createState } from "./store.js";
import { createBoot } from "./boot.js";
import { ROLE_ICON, ROLE_LABEL, clearRole, getRole, mountLogin } from "./auth.js";
import { mountSeatMap } from "./seatmap.js";
import { mountReportSheet } from "./form.js";
import { mountDrawer, mountTracker } from "./tracker.js";
import { mountInsights } from "./analytics.js";
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
    const drawer = mountDrawer($("#ticket-drawer"), { store: api, state });
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
    mountInsights($("#insights"), state);
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
    $("#login").classList.add("is-ready");
  }
} catch (err) {
  console.error(err);
  boot.fail("Can't reach the database. Check the internet connection and try again.");
}