document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById("menuBtn");
  const sidebar = document.getElementById("sidebar");
  const matchList = document.getElementById("matchList");
  const goToMatchmaking = document.getElementById("goToMatchmaking");

  // ---- Sidebar toggle ----
  if (menuBtn && sidebar) {
    menuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      sidebar.classList.toggle("hidden");
    });

    // click outside to close
    document.addEventListener("click", (e) => {
      if (!sidebar.contains(e.target) && e.target !== menuBtn) {
        sidebar.classList.add("hidden");
      }
    });
  }

  // ---- Matchmaking button ----
  if (goToMatchmaking) {
    goToMatchmaking.addEventListener("click", function () {
      // fixed path: use forward slashes and absolute path used by other pages
      window.location.href = "/test/dms/matchmaking.html";
    });
  }

  if (!matchList || typeof firestore === "undefined") return;

  // ---- Helpers ----
  function renderLoading() {
    matchList.innerHTML = `<div class="match-box">Loading matches...</div>`;
  }

  function renderEmpty() {
    matchList.innerHTML = `<div class="match-box">No matches available right now</div>`;
  }

  renderLoading();

  // ---- Fetch available matches from "rooms" collection ----
  firestore
    .collection("rooms")
    .where("status", "==", "waiting")
    .orderBy("createdAt", "desc")
    .limit(20)
    .onSnapshot(
      (snapshot) => {
        if (snapshot.empty) {
          renderEmpty();
          return;
        }

        matchList.innerHTML = "";

        snapshot.forEach((doc) => {
          const room = doc.data();

          const hostName = room.creatorName || room.hostName || "Unknown host";
          const playersCount = Array.isArray(room.participants)
            ? room.participants.length
            : (room.opponent ? 2 : 1);
          const title = room.title || "Match";

          const box = document.createElement("div");
          box.className = "match-box";
          box.innerHTML = `
            <div><strong>${title}</strong></div>
            <div>Host: ${hostName}</div>
            <div>Players: ${playersCount}</div>
            <div>Room ID: ${doc.id}</div>
          `;

          // Click → go to match-code / join page with this roomId
          box.addEventListener("click", () => {
            window.location.href =
              "dms/match-code.html?roomId=" + encodeURIComponent(doc.id);
          });

          matchList.appendChild(box);
        });
      },
      (err) => {
        console.error("Error loading rooms:", err);
        renderEmpty();
      }
    );
});
