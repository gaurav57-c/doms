
document.addEventListener("DOMContentLoaded", () => {
  const chatBox = document.getElementById("chatBox");
  const input = document.getElementById("messageInput");
  const sendBtn = document.getElementById("sendBtn");
  const header = document.getElementById("chatHeader");

  const usersRef = firestore.collection("users");
  const chatsRef = firestore.collection("chats");

  // Helper: scroll chat to bottom
  function scrollToBottom() {
    if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
  }


  const urlParams = new URLSearchParams(window.location.search);
  const currentChatId = urlParams.get("chatId");
  if (!currentChatId) {
    alert("No chat target provided.");
    throw new Error("No chat target provided");
  }
  header && (header.textContent = currentChatId);

  // Wait for auth
  firebase.auth().onAuthStateChanged(async (user) => {
    if (!user) {
      // 🔹 SHOW ALL EXISTING CHATS (chat list view)
const chatList = document.getElementById("chatList"); // create a div with id="chatList" in HTML
chatsRef
  .where("participants", "array-contains", user.uid)
  .orderBy("timestamp", "desc")
  .onSnapshot(async (snapshot) => {
    chatList.innerHTML = "";
    const meDoc = await usersRef.doc(user.uid).get();
    const myData = meDoc.data();
    const myName = myData.displayName;

    snapshot.forEach(doc => {
      const chat = doc.data();
      const friendName = chat.names.find(n => n !== myName);
      const div = document.createElement("div");
      div.className = "chat-card";
      div.innerHTML = `
        <div class="avatar">${friendName.charAt(0)}</div>
        <div class="meta">
          <div class="row">
            <div class="name">${friendName}</div>
            <div class="time">${chat.timestamp ? new Date(chat.timestamp.toDate()).toLocaleTimeString() : ""}</div>
          </div>
          <div class="message">${chat.lastMessage || "No messages yet"}</div>
        </div>`;
      div.onclick = () => window.location.href = `cp-1.html?chatId=${doc.id}`;
      chatList.appendChild(div);
    });
  });

      // Not signed in -> redirect to signin or show message
      alert("Please sign in first");
      window.location.href = "signin.html";
      return;
    }

    try {
      // Get current user's displayName from Firestore (not auth)
      const meDoc = await usersRef.doc(user.uid).get();
      const meData = meDoc.data() || {};
      const myName = (meData.displayName || "").trim();
      if (!myName) {
        alert("Your display name is missing. Please update profile.");
        return;
      }

      // Resolve friend's UID from displayName
      const parts = currentChatId.split("_");
      const friendUid = parts.find(id => id !== user.uid);
      if (!friendUid) {
        alert("Invalid chat target.");
        return;
      }
      chatsRef.doc(currentChatId).collection("messages")
        .orderBy("timestamp", "asc")
        .onSnapshot(snapshot => {
          chatBox.innerHTML = "";
          snapshot.forEach(doc => {
            const msg = doc.data();
            const div = document.createElement("div");
            div.className = (msg.senderUid === user.uid) ? "msg sent" : "msg received";
            // put name/time and text, you can style later
            const meta = document.createElement("div");
            meta.className = "msg-meta";
            meta.textContent = `${msg.senderName || msg.senderUid} • ${msg.timestamp ? new Date(msg.timestamp.toDate()).toLocaleTimeString() : ''}`;
            const text = document.createElement("div");
            text.className = "msg-text";
            text.textContent = msg.text;
            div.appendChild(meta);
            div.appendChild(text);
            chatBox.appendChild(div);
          });
          scrollToBottom();
        });

      // Send message handler
      sendBtn.addEventListener("click", async () => {
        const text = input.value.trim();
        if (!text) return;
        await chatsRef.doc(currentChatId).collection("messages").add({
          senderUid: user.uid,
          senderName: myName,
          receiverUid: friendUid,
          text,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        input.value = "";
      });

      // Optional: send on Enter
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          sendBtn.click();
        }
      });

    } catch (err) {
      console.error("Chat init error:", err);
      alert("Error opening chat. See console.");
    }
  });
});

