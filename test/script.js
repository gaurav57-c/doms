console.log("Checking Firebase:", typeof firebase);
// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDp7aepzeBP4pgAcYJtYEJ_rC7p58sQx3A",
    authDomain: "ftest-e6bec.firebaseapp.com",
    projectId: "ftest-e6bec",
    storageBucket: "ftest-e6bec.firebasestorage.app",
    messagingSenderId: "665918705478",
    appId: "1:665918705478:web:0c5a622c7bcb53a7269f47",
};

// ✅ Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

document.addEventListener("DOMContentLoaded", function () {
    // Show Find button first, other options later
    let findButton = document.getElementById("findButton");
    let options = document.getElementById("options");
    let randomMatchmaking = document.getElementById("randomMatchPopup");
    let customMatchPopup = document.getElementById("customMatchPopup");

    options.style.display = "none";

    findButton.addEventListener("click", function () {
        options.style.display = "block";
    });

    document.getElementById("searchRandomly").addEventListener("click", function () {
        randomMatchmaking.style.display = "block";
    });

    document.getElementById("customMatch").addEventListener("click", function () {
        customMatchPopup.style.display = "block";
    });

    document.getElementById("closeRandomMatch").addEventListener("click", function () {
        randomMatchmaking.style.display = "none";
    });

    document.getElementById("closeCustomMatch").addEventListener("click", function () {
        customMatchPopup.style.display = "none";
    });
});
