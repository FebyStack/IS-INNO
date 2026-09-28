// ==================================================
// AUTH.JS — Simple login system (2 roles)
// ==================================================

const PASSWORDS = {
  instructor: "instructor123",
  technician: "tech123"
};

const ROLE_LABELS = {
  instructor: "👨‍🏫 Instructor",
  technician: "🔧 Lab Technician"
};

// ==================================================
// SHOW MAIN APP
// ==================================================
export function showApp(role) {
  const loginScreen = document.getElementById("login-screen");
  const mainApp = document.getElementById("main-app");
  const roleLabel = document.getElementById("currentUserRole");

  loginScreen.style.display = "none";
  mainApp.style.display = "block";

  document.body.classList.remove("role-instructor", "role-technician");
  document.body.classList.add(`role-${role}`);

  if (roleLabel) roleLabel.textContent = ROLE_LABELS[role] || role;
}

// ==================================================
// LOGOUT
// ==================================================
export function logout() {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("userRole");

  document.getElementById("main-app").style.display = "none";
  document.getElementById("login-screen").style.display = "flex";

  document.body.classList.remove("role-instructor", "role-technician");
}

// ==================================================
// INIT LOGIN
// ==================================================
export function initAuth() {
  const loginBtn = document.getElementById("loginBtn");
  const loginRole = document.getElementById("loginRole");
  const loginPassword = document.getElementById("loginPassword");
  const loginError = document.getElementById("loginError");
  const logoutBtn = document.getElementById("logoutBtn");

  if (!loginBtn) return;

  loginBtn.addEventListener("click", () => {
    const role = loginRole.value;
    const password = loginPassword.value;

    if (PASSWORDS[role] === password) {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userRole", role);

      loginError.textContent = "";
      loginPassword.value = "";
      showApp(role);

      setTimeout(() => window.location.reload(), 100);
    } else {
      loginError.textContent = "❌ Wrong password. Try again.";
    }
  });

  loginPassword.addEventListener("keypress", (e) => {
    if (e.key === "Enter") loginBtn.click();
  });

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (confirm("Log out of the system?")) {
        logout();
        window.location.reload();
      }
    });
  }

  // Auto-login
  if (localStorage.getItem("isLoggedIn") === "true") {
    const role = localStorage.getItem("userRole") || "instructor";
    showApp(role);
  }
}