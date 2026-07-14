import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, EmailAuthProvider } from "firebase/auth";

// Firebase Console'dan kopyalanan kesin dogru yapilandirma
const firebaseConfig = {
  apiKey: "AIzaSyDDbEr3VC3QjIlwv9C5DAL1RuwRZA-sJn8",
  authDomain: "escorx.firebaseapp.com",
  projectId: "escorx",
  storageBucket: "escorx.firebasestorage.app",
  messagingSenderId: "518865633527",
  appId: "1:518865633527:web:506c4393090e1245ee53f2",
  measurementId: "G-6FT7610K5V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export { EmailAuthProvider };
