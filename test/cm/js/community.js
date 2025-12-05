document.addEventListener("DOMContentLoaded", () => {
  const postBtn = document.getElementById("postBtn");
  const postContent = document.getElementById("postContent");
  const feed = document.getElementById("feed");

  // Mock function to simulate user name
  const getDisplayName = () => {
    return "Player_" + Math.floor(Math.random() * 1000);
  };

  // Function to create and append a post
  const createPost = (user, content) => {
    const postDiv = document.createElement("div");
    postDiv.classList.add("post");

    const userDiv = document.createElement("div");
    userDiv.classList.add("user");
    userDiv.textContent = user;

    const contentDiv = document.createElement("div");
    contentDiv.classList.add("content");
    contentDiv.textContent = content;

    postDiv.appendChild(userDiv);
    postDiv.appendChild(contentDiv);

    feed.prepend(postDiv);
  };

  // Event listener for posting
  postBtn.addEventListener("click", () => {
    const content = postContent.value.trim();
    if (content === "") return;

    const user = getDisplayName();
    createPost(user, content);
    postContent.value = "";
  });

  // Optional: Load previous posts if saved in database/localStorage
});
