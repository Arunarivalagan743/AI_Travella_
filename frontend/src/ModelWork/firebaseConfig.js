// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";
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

// Connect to emulators if in development mode
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectAuthEmulator(auth, 'http://localhost:9099');
}