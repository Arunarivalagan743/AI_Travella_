// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
// const analytics = getAnalytics(app);