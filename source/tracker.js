// ==================================================
// TRACKER.JS — Real-time tracking sheet
// CCS Lab Equipment Issue Tracker
// ==================================================

import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let allReports = [];

export function renderTracker(db) {
  const tbody = document.getElementById("tracker-body");
  const filterStatus = document.getElementById("filterStatus");
  const searchBox = document.getElementById("searchBox");

  if (!tbody) return;

  // ==================================================
  // REAL-TIME LISTENER
  // ==================================================
  onSnapshot(
    collection(db, "reports"),
    (snapshot) => {
      allReports = [];

      snapshot.forEach((docSnap) => {
        allReports.push({ id: docSnap.id, ...docSnap.data() });
      });

      // Sort: newest first
      allReports.sort((a, b) => {
        const aT = a.reportedAt?.seconds || 0;
        const bT = b.reportedAt?.seconds || 0;
        return bT - aT;
      });

      renderTable();
      updateSummary();
    },
    (err) => {
      console.error("❌ Firestore listener error:", err);
      tbody.innerHTML = `
        <tr>
          <td colspan="10" style="text-align:center;color:#7A1F4F;padding:20px;">
            ⚠️ Failed to load reports. Check console.
          </td>
        </tr>
      `;
    }
  );

  // ==================================================
  // FILTER LISTENERS
  // ==================================================
  if (filterStatus) filterStatus.addEventListener("change", renderTable);
  if (searchBox) searchBox.addEventListener("input", renderTable);

  // ==================================================
  // TABLE RENDERING
  // ==================================================
  function renderTable() {
    const status = filterStatus ? filterStatus.value : "All";
    const search = searchBox ? searchBox.value.toLowerCase().trim() : "";

    const filtered = allReports.filter((r) => {
      const matchStatus = status === "All" || r.status === status;
      const matchSearch =
        !search ||
        (r.labRoom || "").toLowerCase().includes(search) ||
        (r.computerNumber || "").toLowerCase().includes(search) ||
        (r.equipmentType || "").toLowerCase().includes(search) ||
        (r.instructorName || "").toLowerCase().includes(search) ||
        (r.issueDescription || "").toLowerCase().includes(search);

      return matchStatus && matchSearch;
    });

    // Empty state
    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="10" style="text-align:center;color:#8B6B7A;padding:20px;">
            No reports found.
          </td>
        </tr>
      `;
      return;
    }

    // Build rows
    tbody.innerHTML = "";

    filtered.forEach((r) => {
      const shortId = r.id.slice(0, 6).toUpperCase();
      const statusClass = "status-" + (r.status || "").replace(/\s/g, "");
      const reportedTime = r.reportedAt?.toDate
        ? r.reportedAt.toDate().toLocaleString()
        : "—";

      const row = document.createElement("tr");
      row.innerHTML = `
        <td><strong>#${shortId}</strong></td>
        <td>${escapeHtml(r.instructorName)}</td>
        <td>${escapeHtml(r.labRoom)}</td>
        <td>${escapeHtml(r.computerNumber || "—")}</td>
        <td>${escapeHtml(r.equipmentType)}</td>
        <td>${escapeHtml(r.issueDescription)}</td>
        <td class="priority-${r.priority}">${escapeHtml(r.priority)}</td>
        <td><span class="status ${statusClass}">${escapeHtml(r.status)}</span></td>
        <td>${reportedTime}</td>
        <td>${renderActions(r)}</td>
      `;
      tbody.appendChild(row);
    });

    attachActionHandlers();
  }

  // ==================================================
  // ACTION BUTTONS (Technician only — admin-like)
  // ==================================================
  function renderActions(r) {
    const role = localStorage.getItem("userRole") || "instructor";

    // Instructor: view-only
    if (role !== "technician") {
      return `<span style="color:#B8A5AE;font-size:0.8rem;">view-only</span>`;
    }

    // Completed tickets: no actions
    if (r.status === "Fixed" || r.status === "Duplicate") {
      return "—";
    }

    const btns = [];

    if (r.status === "Reported") {
      btns.push(`
        <button
          data-id="${r.id}"
          data-action="progress"
          class="action-progress">
          Start Repair
        </button>
      `);
    }

    btns.push(`
      <button
        data-id="${r.id}"
        data-action="fixed"
        class="action-fixed">
        Mark Fixed
      </button>
    `);

    return btns.join(" ");
  }

  // ==================================================
  // ACTION HANDLERS
  // ==================================================
  function attachActionHandlers() {
    tbody.querySelectorAll("button[data-id]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const reportId = btn.dataset.id;
        const action = btn.dataset.action;
        const newStatus = action === "fixed" ? "Fixed" : "In Progress";

        const confirmMsg =
          action === "fixed"
            ? "Mark this ticket as FIXED?"
            : "Start repair on this ticket?";

        if (!confirm(confirmMsg)) return;

        btn.disabled = true;
        btn.textContent = "Updating...";

        try {
          await updateDoc(doc(db, "reports", reportId), {
            status: newStatus,
            updatedAt: serverTimestamp()
          });
          // Real-time listener mo-refresh automatically
        } catch (err) {
          console.error("❌ Update failed:", err);
          alert("❌ Failed to update status. Check console.");
          btn.disabled = false;
          btn.textContent =
            action === "fixed" ? "Mark Fixed" : "Start Repair";
        }
      });
    });
  }

  // ==================================================
  // SUMMARY COUNTERS
  // ==================================================
  function updateSummary() {
    const count = (s) => allReports.filter((r) => r.status === s).length;

    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    set("countTotal", allReports.length);
    set("countReported", count("Reported"));
    set("countProgress", count("In Progress"));
    set("countFixed", count("Fixed"));
    set("countDuplicate", count("Duplicate"));
  }
}

// ==================================================
// HELPERS
// ==================================================
function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}