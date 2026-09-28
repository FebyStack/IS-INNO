// ==================================================
// FORM.JS — Report submission + duplicate check
// CCS Lab Equipment Issue Tracker
// ==================================================

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

export function setupForm(db) {
  const form = document.getElementById("report-form");
  const message = document.getElementById("form-message");
  const submitBtn = document.getElementById("submit-btn");
  const computerSelect = document.getElementById("computerNumber");

  if (!form) return;

  // ==================================================
  // AUTO-GENERATE COMPUTER NUMBERS 1-50
  // ==================================================
  if (computerSelect && computerSelect.options.length <= 1) {
    for (let i = 1; i <= 50; i++) {
      const opt = document.createElement("option");
      opt.value = `Computer ${i}`;
      opt.textContent = `Computer ${i}`;
      computerSelect.appendChild(opt);
    }
  }

  // ==================================================
  // FORM SUBMIT HANDLER
  // ==================================================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    submitBtn.disabled = true;
    message.textContent = "⏳ Checking for duplicates...";
    message.style.color = "#8B6B7A";

    const data = {
      instructorName: form.instructorName.value.trim(),
      reportedBy: form.reportedBy.value.trim() || "N/A",
      labRoom: form.labRoom.value,
      computerNumber: form.computerNumber.value,
      equipmentType: form.equipmentType.value,
      issueDescription: form.issueDescription.value.trim(),
      priority: form.priority.value,
      status: "Reported",
      isDuplicate: false,
      reportedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    try {
      // ==================================================
      // DUPLICATE CHECK
      // Same lab + same computer + same equipment + same issue
      // + still active (Reported or In Progress)
      // ==================================================
      const dupQuery = query(
        collection(db, "reports"),
        where("labRoom", "==", data.labRoom),
        where("computerNumber", "==", data.computerNumber),
        where("equipmentType", "==", data.equipmentType),
        where("issueDescription", "==", data.issueDescription),
        where("status", "in", ["Reported", "In Progress"])
      );

      const dupSnap = await getDocs(dupQuery);

      if (!dupSnap.empty) {
        data.isDuplicate = true;
        data.status = "Duplicate";
      }

      // ==================================================
      // SAVE TO FIRESTORE
      // ==================================================
      await addDoc(collection(db, "reports"), data);

      // ==================================================
      // FEEDBACK
      // ==================================================
      if (data.isDuplicate) {
        message.textContent = "⚠️ Duplicate detected! Marked as Duplicate.";
        message.style.color = "#B88548";
      } else {
        message.textContent = "✅ Report submitted successfully!";
        message.style.color = "#4E8C5A";
      }

      form.reset();
      setTimeout(() => {
        message.textContent = "";
      }, 4000);

    } catch (err) {
      console.error("❌ Error submitting report:", err);
      message.textContent = "❌ Failed to submit. Check console for details.";
      message.style.color = "#7A1F4F";
    } finally {
      submitBtn.disabled = false;
    }
  });
}