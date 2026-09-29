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
