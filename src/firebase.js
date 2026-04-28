// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCHqL0-F5lfPXM262QgPc3022W9ARzm7NI",
  authDomain: "aloo-bhujiya.firebaseapp.com",
  projectId: "aloo-bhujiya",
  storageBucket: "aloo-bhujiya.firebasestorage.app",
  messagingSenderId: "528037145918",
  appId: "1:528037145918:web:1c71d50ef4c791f4c7506f",
  measurementId: "G-KE9RDE003F"
};

// Initialize Firebase
 export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
  