// firebase-config.js
// ⚠️ I-replace ang values gamit ang imong actual Firebase config
// Adto: Firebase Console → Project Settings → General → Your apps

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDBtt9Y-ouJ3-Bg6KOGwH0u9hbFGODQ0C4",
  authDomain: "lab-track-4897c.firebaseapp.com",
  projectId: "lab-track-4897c",
  storageBucket: "lab-track-4897c.firebasestorage.app",
  messagingSenderId: "228660419902",
  appId: "1:228660419902:web:3705433d5377c6fd04e06f"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);