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

const sideLinks = document.querySelectorAll(
  ".sidebar .side-menu li a:not(.logout)"
);

sideLinks.forEach((item) => {
  const li = item.parentElement;
  item.addEventListener("click", () => {
    sideLinks.forEach((i) => {
      i.parentElement.classList.remove("active");
    });
    li.classList.add("active");
  });
});

const menuBar = document.querySelector(".content nav .bx.bx-menu");
const sideBar = document.querySelector(".sidebar");

menuBar.addEventListener("click", () => {
  sideBar.classList.toggle("close");
});

const searchBtn = document.querySelector(
  ".content nav form .form-input button"
);
const searchBtnIcon = document.querySelector(
  ".content nav form .form-input button .bx"
);
const searchForm = document.querySelector(".content nav form");

searchBtn.addEventListener("click", function (e) {
  if (window.innerWidth < 576) {
    e.preventDefault;
    searchForm.classList.toggle("show");
    if (searchForm.classList.contains("show")) {
      searchBtnIcon.classList.replace("bx-search", "bx-x");
    } else {
      searchBtnIcon.classList.replace("bx-x", "bx-search");
    }
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth < 768) {
    sideBar.classList.add("close");
  } else {
    sideBar.classList.remove("close");
  }
  if (window.innerWidth > 576) {
    searchBtnIcon.classList.replace("bx-x", "bx-search");
    searchForm.classList.remove("show");
  }
});

const toggler = document.getElementById("theme-toggle");

toggler.addEventListener("change", function () {
  if (this.checked) {
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }
});
