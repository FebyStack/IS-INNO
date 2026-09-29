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
  `${String(lab).replace(/[^a-z0-9]/gi, "").toUpperCase()}-PC${String(pcNumber(computer)).padStart(2, "0")}`;

export const shortId = (id) => `#${String(id).replace(/[^a-z0-9]/gi, "").slice(0, 6).toUpperCase()}`;

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
