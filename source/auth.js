// Role + password sign-in. Same rules and storage keys as before (client-side demo passwords).
import { $, reducedMotion } from "./ui.js";

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

// tvOS-style parallax: the logo tilts toward the pointer and a glare follows it.
function tilt(root, logo) {
  if (reducedMotion() || !matchMedia("(pointer: fine)").matches) return;
  const clamp = (v) => Math.max(-1, Math.min(1, v));
  root.addEventListener("pointermove", (e) => {
    const r = logo.getBoundingClientRect();
    const x = clamp((e.clientX - r.left - r.width / 2) / (r.width * 1.5));
    const y = clamp((e.clientY - r.top - r.height / 2) / (r.height * 1.5));
    logo.style.cssText = `--rx:${(-y * 12).toFixed(2)}deg;--ry:${(x * 12).toFixed(2)}deg;--gx:${50 + x * 40}%;--gy:${50 + y * 40}%;--glare:1;--px:${x.toFixed(3)};--py:${y.toFixed(3)}`;
    logo.dataset.active = "";
  });
  root.addEventListener("pointerleave", () => {
    logo.style.cssText = "";
    delete logo.dataset.active;
  });
}

export function mountLogin({ onLogin }) {
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
  tilt($("#login"), $(".login__logo"));
}