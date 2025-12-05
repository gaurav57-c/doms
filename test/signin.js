document.addEventListener("DOMContentLoaded", function () {
    const signinForm = document.getElementById("signinForm");
    const googleSignInBtn = document.getElementById("googleSignIn");
    const errorMsg = document.getElementById("errorMsg");
    const forgotBtn = document.getElementById("forgotPasswordBtn");

    // Email/Username/UID Sign In
    if (signinForm) {
        signinForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            errorMsg.textContent = "";

            const emailOrUsernameOrUid = document.getElementById("emailOrUsernameOrUid").value.trim();
            const password = document.getElementById("password").value;

            try {
                let email = emailOrUsernameOrUid;

                // If input looks like email, use directly
                if (emailOrUsernameOrUid.includes("@")) {
                    email = emailOrUsernameOrUid;
                } else {
                    // Search Firestore for username or UID
                    const usernameSnap = await firestore.collection("users")
                        .where("username", "==", emailOrUsernameOrUid.toLowerCase())
                        .limit(1)
                        .get();

                    if (!usernameSnap.empty) {
                        email = usernameSnap.docs[0].data().email;
                    } else {
                        // Try as UID
                        const uidSnap = await firestore.collection("users").doc(emailOrUsernameOrUid).get();
                        if (uidSnap.exists) {
                            email = uidSnap.data().email;
                        } else {
                            errorMsg.textContent = "User not found.";
                            return;
                        }
                    }
                }

                // Sign in with resolved email
                const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
                const user = userCredential.user;

                // Update last login
                await firestore.collection("users").doc(user.uid).update({
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                });

                console.log("Signed in as:", user.email);
                window.location.href = "find.html";
            } catch (error) {
                console.error("Sign-in error:", error.message);
                errorMsg.textContent = "Sign-in failed: " + error.message;
            }
        });
    } else {
        console.error("signinForm not found");
    }

    // Forgot password
    if (forgotBtn) {
        forgotBtn.addEventListener('click', function () {
            const email = prompt('Enter your account email to receive reset link:');
            if (!email) return;
            firebase.auth().sendPasswordResetEmail(email)
                .then(() => alert('Password reset email sent'))
                .catch(err => {
                    console.error('Password reset error', err);
                    alert('Could not send reset email: ' + err.message);
                });
        });
    }

    // Google Sign In
    if (googleSignInBtn) {
        googleSignInBtn.addEventListener("click", async function () {
            try {
                const provider = new firebase.auth.GoogleAuthProvider();
                const userCredential = await firebase.auth().signInWithPopup(provider);
                const user = userCredential.user;

                // Check if user exists in Firestore
                const userDoc = await firestore.collection("users").doc(user.uid).get();
                if (!userDoc.exists) {
                    // Create new user from Google sign-in
                    const username = user.email.split("@")[0].toLowerCase();
                    await firestore.collection("users").doc(user.uid).set({
                        uid: user.uid,
                        displayName: user.displayName || "User",
                        username: username,
                        fullName: user.displayName || "",
                        email: user.email,
                        profilePictureURL: user.photoURL || "",
                        country: "",
                        state: "",
                        district: "",
                        city: "",
                        pincode: "",
                        trophies: 0,
                        rank: 0,
                        isEmailVerified: true,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                        isDeleted: false
                    });
                } else {
                    // Update last login
                    await firestore.collection("users").doc(user.uid).update({
                        lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }

                window.location.href = "/test/dms/find.html";
            } catch (error) {
                console.error("Google sign-in error:", error.message);
                errorMsg.textContent = "Google sign-in failed: " + error.message;
            }
        });
    }
});
