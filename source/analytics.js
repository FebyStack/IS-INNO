// ==================================================
// ANALYTICS.JS — Insights para sa Technician
// CCS Lab Equipment Issue Tracker
// ==================================================

import {
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

export function renderAnalytics(db) {
  const container = document.getElementById("analytics-content");
  if (!container) return;

  onSnapshot(collection(db, "reports"), (snapshot) => {
    const reports = [];
    snapshot.forEach((doc) => reports.push(doc.data()));

    // Empty state
    if (reports.length === 0) {
      container.innerHTML = `
        <p style="color:#8B6B7A;">
          No data yet. Submit reports to see insights.
        </p>
      `;
      return;
    }

    // ==================================================
    // COMPUTE INSIGHTS
    // ==================================================
    const byRoom = { "Lab 1": 0, "Lab 2": 0, "Lab 3": 0 };
    const byEquipment = {};
    let duplicates = 0;
    let fixed = 0;

    reports.forEach((r) => {
      if (byRoom[r.labRoom] !== undefined) byRoom[r.labRoom]++;
      byEquipment[r.equipmentType] = (byEquipment[r.equipmentType] || 0) + 1;
      if (r.status === "Duplicate") duplicates++;
      if (r.status === "Fixed") fixed++;
    });

    const topEquip = Object.entries(byEquipment).sort((a, b) => b[1] - a[1])[0];
    const dupRate = ((duplicates / reports.length) * 100).toFixed(0);
    const fixRate = ((fixed / reports.length) * 100).toFixed(0);

    // ==================================================
    // RENDER INSIGHTS
    // ==================================================
    container.innerHTML = `
      <div class="insight">
        <strong>Lab 1 Reports</strong>
        ${byRoom["Lab 1"]} report${byRoom["Lab 1"] !== 1 ? "s" : ""}
      </div>

      <div class="insight">
        <strong>Lab 2 Reports</strong>
        ${byRoom["Lab 2"]} report${byRoom["Lab 2"] !== 1 ? "s" : ""}
      </div>

      <div class="insight">
        <strong>Lab 3 Reports</strong>
        ${byRoom["Lab 3"]} report${byRoom["Lab 3"] !== 1 ? "s" : ""}
      </div>

      <div class="insight">
        <strong>Most Problematic Equipment</strong>
        ${topEquip ? `${topEquip[0]} — ${topEquip[1]} reports` : "—"}
      </div>

      <div class="insight">
        <strong>Duplicate Rate</strong>
        ${duplicates} of ${reports.length} (${dupRate}%)
      </div>

      <div class="insight">
        <strong>Resolution Rate</strong>
        ${fixed} of ${reports.length} (${fixRate}%)
      </div>
    `;
  });
}