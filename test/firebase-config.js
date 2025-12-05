// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDp7aepzeBP4pgAcYJtYEJ_rC7p58sQx3A",
  authDomain: "ftest-e6bec.firebaseapp.com",
  projectId: "ftest-e6bec",
  storageBucket: "ftest-e6bec.firebasestorage.app",
  messagingSenderId: "665918705478",
  appId: "1:665918705478:web:0c5a622c7bcb53a7269f47",
  measurementId: "G-WQ68S1TKCY",
  databaseURL: "https://ftest-e6bec-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

// Initialize Firebase app only.
// Don't declare `const firestore` here to avoid duplicate-declaration errors
// in pages that run `const firestore = firebase.firestore();`.
firebase.initializeApp(firebaseConfig);

// If you need to access common firebase services globally, you can attach them to window:
// window.firebaseApp = firebase.app();
// window.firebaseAuth = firebase.auth();
// window.firebaseStorage = firebase.storage();
// But leave `firestore` to be created in each page like:
  const firestore = firebase.firestore();