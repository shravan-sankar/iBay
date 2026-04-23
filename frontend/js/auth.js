function redirectToBrowseIfLoggedIn() {
  if (!$("#login-form").length && !$("#register-form").length) {
    return;
  }

  $.ajax({
    url: "../../backend/me.php",
    method: "GET",
    xhrFields: { withCredentials: true }
  }).done(function (user) {
    const userId = user && user.id ? String(user.id) : "";
    const browseUrl = userId ? `browse.html?id=${encodeURIComponent(userId)}` : "browse.html";
    window.location.replace(browseUrl);
  });
}

function handleLoginForm() {
  const $form = $("#login-form");
  if (!$form.length) {
    return;
  }

  const $errorBox = $("#error-message");

  $form.on("submit", function (event) {
    event.preventDefault();
    $errorBox.css("color", "red").text("");

    $.ajax({
      url: "../../backend/login.php",
      method: "POST",
      data: $form.serialize(),
      xhrFields: { withCredentials: true }
    })
      .done(function (response) {
        if (response && response.success) {
          const userId = response.id ? String(response.id) : "";
          const fallbackUrl = userId ? `browse.html?id=${encodeURIComponent(userId)}` : "browse.html";
          window.location.replace(response.redirect || fallbackUrl);
          return;
        }

        $errorBox.text(response && response.message ? response.message : "Unable to sign in.");
      })
      .fail(function (xhr) {
        const response = xhr.responseJSON;
        $errorBox.text(response && response.message ? response.message : "Unable to sign in.");
      });
  });
}

function handleRegisterForm() {
  const form = document.getElementById("register-form");
  if (!form) {
    return;
  }

  const $form = $("#register-form");
  const errorBox = document.getElementById("error-message");
  const submitButton = form.querySelector(".submit-gate");
  const firstStepFields = form.querySelectorAll(".step-gate:not(.submit-gate)");
  const genreStep = document.getElementById("genre-step");
  const genreBubbleButtons = form.querySelectorAll(".genre-bubble");
  const preferredGenresInput = document.getElementById("preferred-genres");
  const genreBackButton = document.getElementById("genre-back-btn");
  let genreStepActive = false;

  function showGenreStep() {
    genreStepActive = true;
    firstStepFields.forEach((field) => field.classList.add("is-hidden"));
    genreStep.classList.add("is-visible");
    genreStep.setAttribute("aria-hidden", "false");
    submitButton.textContent = "Complete Registration";
    errorBox.textContent = "";
  }

  function showRegistrationStep() {
    genreStepActive = false;
    firstStepFields.forEach((field) => field.classList.remove("is-hidden"));
    genreStep.classList.remove("is-visible");
    genreStep.setAttribute("aria-hidden", "true");
    submitButton.textContent = "Register";
    errorBox.textContent = "";
  }

  function selectedGenres() {
    return Array.from(genreBubbleButtons)
      .filter((button) => button.classList.contains("is-selected"))
      .map((button) => button.dataset.genre);
  }

  genreBubbleButtons.forEach((button) => {
    button.addEventListener("click", function () {
      this.classList.toggle("is-selected");
    });
  });

  if (genreBackButton) {
    genreBackButton.addEventListener("click", function () {
      showRegistrationStep();
    });
  }

  form.addEventListener("submit", function (e) {
    if (genreStepActive) {
      const genres = selectedGenres();
      if (genres.length === 0) {
        e.preventDefault();
        errorBox.textContent = "Please choose at least one shopping genre.";
        return;
      }

      e.preventDefault();
      preferredGenresInput.value = genres.join(",");
      errorBox.textContent = "";

      $.ajax({
        url: "../../backend/register.php",
        method: "POST",
        data: $form.serialize()
      })
        .done(function (response) {
          if (response && response.success) {
            window.location.replace(response.redirect || "main-G06.html?registered=1");
            return;
          }

          errorBox.textContent = response && response.message ? response.message : "Unable to register.";
        })
        .fail(function (xhr) {
          const response = xhr.responseJSON;
          errorBox.textContent = response && response.message ? response.message : "Unable to register.";
        });
      return;
    }

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirm = document.getElementById("confirm-password").value;
    const terms = document.getElementById("terms").checked;

    errorBox.textContent = "";

    if (!email || !email.includes("@")) {
      errorBox.textContent = "Please enter a valid email address.";
      e.preventDefault();
      return;
    }

    if (password.length < 8) {
      errorBox.textContent = "Password must be at least 8 characters.";
      e.preventDefault();
      return;
    }

    if (password !== confirm) {
      errorBox.textContent = "Passwords do not match.";
      e.preventDefault();
      return;
    }

    if (!terms) {
      errorBox.textContent = "You must agree to the Terms of Service.";
      e.preventDefault();
      return;
    }

    e.preventDefault();
    showGenreStep();
  });
}

window.addEventListener("pageshow", function (event) {
  if (event.persisted) {
    redirectToBrowseIfLoggedIn();
  }
});

$(function () {
  const params = new URLSearchParams(window.location.search);
  if (params.get("registered") === "1") {
    $("#error-message")
      .css("color", "green")
      .text("Account created. Please sign in.");
    history.replaceState(null, "", window.location.pathname + window.location.hash);
  }

  redirectToBrowseIfLoggedIn();
  handleLoginForm();
  handleRegisterForm();
});