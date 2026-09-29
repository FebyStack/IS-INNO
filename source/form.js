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
