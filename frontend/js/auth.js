document.addEventListener("DOMContentLoaded", function () {

  const form = document.getElementById("register-form");
  const errorBox = document.getElementById("error-message");

  form.addEventListener("submit", function (e) {

      // Get values
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const confirm = document.getElementById("confirm-password").value;
      const terms = document.getElementById("terms").checked;

      // Reset error
      errorBox.textContent = "";

      // Email validation
      if (!email || !email.includes("@")) {
          errorBox.textContent = "Please enter a valid email address.";
          e.preventDefault();
          return;
      }

      // Password length
      if (password.length < 8) {
          errorBox.textContent = "Password must be at least 8 characters.";
          e.preventDefault();
          return;
      }

      // Password match
      if (password !== confirm) {
          errorBox.textContent = "Passwords do not match.";
          e.preventDefault();
          return;
      }

      // Terms checkbox
      if (!terms) {
          errorBox.textContent = "You must agree to the Terms of Service.";
          e.preventDefault();
          return;
      }
  });
});