// js/login.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".loginForm");
  const loginResult = document.getElementById("loginResult");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const usernameOrEmail = document.getElementById("UserId").value.trim();
    const password = document.getElementById("password").value;

    if (!usernameOrEmail || !password) {
      loginResult.textContent = "Please enter both fields.";
      loginResult.style.color = "red";
      return;
    }

    try {
      const response = await fetch("http://localhost:1804/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernameOrEmail, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        loginResult.textContent = data.message || "Login failed.";
        loginResult.style.color = "red";
        return;
      }

      // ✅ Login success
      loginResult.textContent = "Login successful!";
      loginResult.style.color = "green";

      // Save tokens to localStorage (or cookies if you want)
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect based on role
      switch (data.user.role_id) {
        case 1: // teaching_evaluator
          window.location.href = "adminpage.html";
          break;
        case 2: // non-teaching_evaluator
          window.location.href = "adminpage.html";
          break;
        case 3: // teaching_evaluator
          window.location.href = "clientpage(2).html";
          break;
        case 4: // nonteaching_employee
          window.location.href = "clientpage(2).html";
          break;
        default:
          window.location.href = "home.html";
      }
    } catch (err) {
      console.error("Login error:", err);
      loginResult.textContent = "Server error. Try again later.";
      loginResult.style.color = "red";
    }
  });
});
