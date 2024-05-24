document.addEventListener("DOMContentLoaded", function () {
    updateProfile();
  
    // Attach event listeners after the DOM has fully loaded
    document
      .getElementById("dropdown-button")
      .addEventListener("click", toggleDropdown);
  
    // Close dropdown menu when clicking outside of it
    document.addEventListener("click", function (event) {
      const dropdown = document.getElementById("dropdown-menu");
      if (!dropdown.contains(event.target)) {
        dropdown.style.display = "none";
      }
    });
  });
  
  function updateProfile() {
    const userProfile = document.getElementById("user-profile");
    const profilePicture = document.getElementById("profile-picture");
    const accountNameElement = document.getElementById("account-name");
  
    if (userLoggedIn) {
      const accountName = "John Doe";
  
      // Update account name
      accountNameElement.textContent = accountName;
  
      // Generate avatar with the first letter of the account name
      const firstLetter = accountName.charAt(0).toUpperCase();
      const avatarBackground = getRandomColor();
  
      // Update profile picture
      profilePicture.textContent = firstLetter;
      profilePicture.style.backgroundColor = avatarBackground;
  
      userProfile.style.display = "flex"; // Show the user profile section
    } else {
      accountNameElement.textContent = "";
      userProfile.style.display = "none"; // Hide the user profile section if not logged in
    }
  }
  
  function toggleDropdown() {
    const dropdownMenu = document.getElementById("dropdown-menu");
    dropdownMenu.style.display =
      dropdownMenu.style.display === "block" ? "none" : "block";
  }
  
  function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  