// ==================================================
// APP.JS — Main Entry Point
// CCS Lab Equipment Issue Tracker
// ==================================================

import { db } from "./firebase-config.js";
import { initAuth } from "./auth.js";
import { setupForm } from "./form.js";
import { renderTracker } from "./tracker.js";
import { renderAnalytics } from "./analytics.js";

// 1. Setup login
initAuth();

// 2. Initialize modules
setupForm(db);
renderTracker(db);
renderAnalytics(db);

console.log("✅ CCS Lab Tracker initialized (2 roles).");