// Role + password sign-in. Same rules and storage keys as before (client-side demo passwords).
import { $ } from "./ui.js";

const PASSWORDS = { instructor: "instructor123", technician: "tech123" };

export const ROLE_LABEL = { instructor: "Instructor", technician: "Lab Technician" };
export const ROLE_ICON = { instructor: "chalkboard-teacher", technician: "toolbox" };

export const checkLogin = (role, password) => PASSWORDS[role] === password;

export function getRole() {
  try {
    return localStorage.getItem("isLoggedIn") === "true" ? localStorage.getItem("userRole") : null;
  } catch {
    return null;
  }
}

export function saveRole(role) {
  try {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userRole", role);
  } catch {}
}

export function clearRole() {
  try {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
  } catch {}
}

export function mountLogin({ onLogin, onDemo }) {
  const form = $("#login-form");
  const error = $("#login-error");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const role = form.role.value;
    if (!checkLogin(role, form.password.value)) {
      error.textContent = "Wrong password. Try again.";
      form.password.select();
      return;
    }
    error.textContent = "";
    form.password.value = "";
    saveRole(role);
    onLogin(role);
  });
  $("#demo-start").addEventListener("click", onDemo);
}