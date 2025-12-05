
  // Sidebar toggle
const sidebar = document.getElementById("sidebar");
const menuBtn = document.getElementById("menuBtn");

menuBtn.addEventListener("click", () => {
  sidebar.classList.toggle("hidden");
});

// Filter toggle
const filterPanel = document.getElementById("filterPanel");
const filterIcon = document.querySelector(".filter-icon");
let isFilterOpen = false;

filterIcon.addEventListener("click", () => {
  isFilterOpen = !isFilterOpen;
  filterPanel.classList.toggle("show");

  if (!isFilterOpen) {
    applyFilters(); // Apply filters when panel is closed
  }
});

// Dummy filter apply function (can be extended with real logic)
function applyFilters() {
  const country = document.getElementById("countrySelect").value;
  const state = document.getElementById("stateSelect").value;
  const district = document.getElementById("districtSelect").value;
  const isGlobal = document.getElementById("globalCheckbox").checked;

  console.log("Applying filters:");
  console.log("Country:", country);
  console.log("State:", state);
  console.log("District:", district);
  console.log("Global:", isGlobal);

  // TODO: Apply filtering logic to leaderboard here
}
