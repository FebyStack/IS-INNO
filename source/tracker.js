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
