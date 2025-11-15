// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { 
  getAuth, 
  connectAuthEmulator,
  setPersistence,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCah9S4jR6nUBbX_G89_hgGeKYQvJgDWBk",
  authDomain: "aitripplanner-b26a9.firebaseapp.com",
  projectId: "aitripplanner-b26a9",
  storageBucket: "aitripplanner-b26a9.firebasestorage.app",
  messagingSenderId: "1096112296852",
  appId: "1:1096112296852:web:ca24a67b6cc4fdcfb7b581",
  measurementId: "G-PZ3X11S3MW"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Prefer durable, cookie-less persistence where possible (helps with partitioned storage)
if (typeof window !== 'undefined') {
  auth.languageCode = 'en';
  // Try IndexedDB first, then localStorage, then sessionStorage
  setPersistence(auth, indexedDBLocalPersistence)
    .catch(() => setPersistence(auth, browserLocalPersistence))
    .catch(() => setPersistence(auth, browserSessionPersistence))
    .catch(() => {
      // If all fail, keep default in-memory persistence
      // No-op: some embedded/locked-down browsers restrict storage entirely
    });
}

// Connect to emulators if in development mode
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectAuthEmulator(auth, 'http://localhost:9099');
}