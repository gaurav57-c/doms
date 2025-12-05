document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.getElementById("registerForm");
    const signinRedirect = document.getElementById("signinRedirect");
    const errorMsg = document.getElementById("errorMsg") || {};

    if (signinRedirect) {
        signinRedirect.addEventListener("click", function () {
            window.location.href = "signin.html";
        });
    }

    registerForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        if (errorMsg.textContent !== undefined) errorMsg.textContent = "";

        const displayName = document.getElementById("displayName").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const country = document.getElementById("country")?.value.trim() || "";
        const state = document.getElementById("state")?.value.trim() || "";
        const district = document.getElementById("district")?.value.trim() || "";
        const city = document.getElementById("city")?.value.trim() || "";

        if (password.length < 6) {
            if (errorMsg.textContent !== undefined) errorMsg.textContent = "Password must be at least 6 characters";
            return;
        }

        try {
            // Check if display name exists
            const displayNameCheck = await firestore.collection("users").where("displayName", "==", displayName).get();
            if (!displayNameCheck.empty) {
                if (errorMsg.textContent !== undefined) errorMsg.textContent = "Display name is already taken.";
                return;
            }

            // Check if email exists
            const emailCheck = await firebase.auth().fetchSignInMethodsForEmail(email);
            if (emailCheck.length > 0) {
                if (errorMsg.textContent !== undefined) errorMsg.textContent = "Email already registered.";
                return;
            }

            // Create user
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Send verification email
            await user.sendEmailVerification();

            // Save user to Firestore
            await firestore.collection("users").doc(user.uid).set({
                uid: user.uid,
                displayName,
                email,
                country,
                state,
                district,
                city,
                profilePhoto: "",
                rank: 0,
                trophies: 0,
                friends: [],
                requests: [],
                blocked: [],
                emailVerified: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            alert("Registration successful! Verification email sent. Please check your email to verify your account.");
            window.location.href = "signin.html";

        } catch (error) {
            console.error("Registration error:", error.message);
            if (errorMsg.textContent !== undefined) errorMsg.textContent = "Registration failed: " + error.message;
        }
    });
});
