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
