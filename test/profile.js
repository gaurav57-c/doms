document.addEventListener("DOMContentLoaded", function () {
    const profileInfo = document.getElementById("profileInfo");
    const editSection = document.getElementById("editSection");
    const editBtn = document.getElementById("editBtn");
    const cancelBtn = document.getElementById("cancelBtn");
    const profileForm = document.getElementById("profileForm");
    const saveMsg = document.getElementById("saveMsg");

    let currentUser = null;
    let userDataCache = null;

    // Load user profile
    firebase.auth().onAuthStateChanged(async user => {
        if (!user) {
            window.location.href = "signin.html";
            return;
        }

        currentUser = user;
        const userDoc = await firestore.collection("users").doc(user.uid).get();
        
        if (!userDoc.exists) {
            profileInfo.innerHTML = "<p>User data not found.</p>";
            return;
        }

        userDataCache = userDoc.data();
        displayProfile(userDataCache);
    });

    function displayProfile(userData) {
        profileInfo.innerHTML = `
            <div>
                <img src="${userData.profilePictureURL || 'https://via.placeholder.com/120'}" class="profile-pic">
                <div class="info-display">
                    <p><strong>Display Name:</strong> ${userData.displayName}</p>
                    <p><strong>Username:</strong> @${userData.username}</p>
                    <p><strong>Full Name:</strong> ${userData.fullName}</p>
                    <p><strong>Email:</strong> ${userData.email}</p>
                    <p><strong>Address:</strong> ${userData.street || ''}, ${userData.city}, ${userData.state}, ${userData.country} - ${userData.pincode}</p>
                    <p><strong>Trophies:</strong> ${userData.trophies || 0}</p>
                    <p><strong>Rank:</strong> ${userData.rank || 'Unranked'}</p>
                </div>
            </div>
        `;
    }

    editBtn.addEventListener("click", function () {
        editSection.style.display = "block";
        populateForm(userDataCache);
    });

    cancelBtn.addEventListener("click", function () {
        editSection.style.display = "none";
        saveMsg.textContent = "";
    });

    function populateForm(userData) {
        document.getElementById("displayNameInput").value = userData.displayName;
        document.getElementById("usernameInput").value = userData.username;
        document.getElementById("fullNameInput").value = userData.fullName;
        document.getElementById("pincodeInput").value = userData.pincode;
        document.getElementById("streetInput").value = userData.street || '';
        document.getElementById("cityInput").value = userData.city;
        document.getElementById("stateInput").value = userData.state;
        document.getElementById("countryInput").value = userData.country;
        document.getElementById("profilePicPreview").src = userData.profilePictureURL || 'https://via.placeholder.com/120';
    }

    // Handle profile picture change preview
    document.getElementById("profilePicInput").addEventListener("change", function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                document.getElementById("profilePicPreview").src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Save profile changes
    profileForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        saveMsg.textContent = "Saving...";

        try {
            const newDisplayName = document.getElementById("displayNameInput").value.trim();
            const newUsername = document.getElementById("usernameInput").value.trim().toLowerCase();
            const profilePicFile = document.getElementById("profilePicInput").files[0];

            // Check if display name changed and is unique
            if (newDisplayName !== userDataCache.displayName) {
                const check = await firestore.collection("users").where("displayName", "==", newDisplayName).get();
                if (!check.empty) {
                    saveMsg.textContent = "Display name already taken!";
                    saveMsg.style.color = "red";
                    return;
                }
            }

            // Check if username changed and is unique
            if (newUsername !== userDataCache.username) {
                const check = await firestore.collection("users").where("username", "==", newUsername).get();
                if (!check.empty) {
                    saveMsg.textContent = "Username already taken!";
                    saveMsg.style.color = "red";
                    return;
                }
            }

            let profilePictureURL = userDataCache.profilePictureURL;

            // Upload new profile picture if provided
            if (profilePicFile) {
                try {
                    const storageRef = firebase.storage().ref();
                    const fileRef = storageRef.child(`profile-pics/${currentUser.uid}`);
                    await fileRef.put(profilePicFile);
                    profilePictureURL = await fileRef.getDownloadURL();
                } catch (err) {
                    console.error("Picture upload error:", err);
                }
            }

            // Update Firestore
            await firestore.collection("users").doc(currentUser.uid).update({
                displayName: newDisplayName,
                username: newUsername,
                fullName: document.getElementById("fullNameInput").value.trim(),
                pincode: document.getElementById("pincodeInput").value.trim(),
                street: document.getElementById("streetInput").value.trim(),
                city: document.getElementById("cityInput").value.trim(),
                state: document.getElementById("stateInput").value.trim(),
                country: document.getElementById("countryInput").value.trim(),
                profilePictureURL: profilePictureURL,
                lastProfileUpdate: firebase.firestore.FieldValue.serverTimestamp()
            });

            userDataCache = (await firestore.collection("users").doc(currentUser.uid).get()).data();
            displayProfile(userDataCache);
            editSection.style.display = "none";
            saveMsg.textContent = "Profile updated successfully!";
            saveMsg.style.color = "green";
        } catch (error) {
            console.error("Update error:", error);
            saveMsg.textContent = "Error saving profile: " + error.message;
            saveMsg.style.color = "red";
        }
    });
});
