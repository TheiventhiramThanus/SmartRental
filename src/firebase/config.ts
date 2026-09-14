// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD3c2Vfemby5OfCi_Ibb1smtdOFWWDllZQ",
  authDomain: "smartrental-f7bb0.firebaseapp.com",
  projectId: "smartrental-f7bb0",
  storageBucket: "smartrental-f7bb0.firebasestorage.app",
  messagingSenderId: "520136391428",
  appId: "1:520136391428:web:c3af431f0587210488ee51",
  measurementId: "G-CBLE363F6J",
  databaseURL: "https://smartrental-f7bb0-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const rtdb = getDatabase(app);

// Export the initialized services
export { app, analytics, auth, db, storage, rtdb };
