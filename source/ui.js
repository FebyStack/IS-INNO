// Small DOM helpers shared by every view. Nothing here runs at import time, so tests can import it.

export const $ = (sel, root = document) => root.querySelector(sel);

export const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export const icon = (name, cls = "") =>
  `<svg class="icon ${cls}" aria-hidden="true" focusable="false"><use href="assets/icons.svg#${name}"></use></svg>`;

// Word-by-word ramp: each word gets its own stagger index for CSS.
export const words = (text) =>
  esc(text)
    .split(" ")
    .map((w, i) => `<span class="w" style="--i:${i}">${w}</span>`)
    .join(" ");

export const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Cross-fade a DOM update with the View Transitions API when available.
export function swap(update) {
  if (!document.startViewTransition || reducedMotion()) return update();
  document.startViewTransition(update).ready.catch(() => {}); // skipped transitions still run update()
}

// Toasts live in a popover so they sit above any open dialog. A persistent
// live region announces the message since the popover itself isn't reliably read.
export function toast(message, tone = "info", iconName = "info") {
  const region = $("#toasts");
  const el = document.createElement("div");
  el.className = "toast";
  el.dataset.tone = tone;
  el.innerHTML = `${icon(iconName)}<p>${esc(message)}</p>`;
  region.append(el);
  if (region.matches(":popover-open")) region.hidePopover();
  region.showPopover();
  const announcer = $("#announcer");
  announcer.textContent = "";
  setTimeout(() => (announcer.textContent = message), 0);
  setTimeout(() => {
    el.classList.add("is-leaving");
    setTimeout(() => {
      el.remove();
      if (!region.children.length) region.hidePopover();
    }, 250);
  }, 4200);
}

export function confirmDialog(message, confirmLabel) {
  const dialog = $("#confirm");
  $("#confirm-message").textContent = message;
  $("#confirm-ok").textContent = confirmLabel;
  dialog.returnValue = ""; // Esc keeps the previous value otherwise
  dialog.showModal();
  return new Promise((resolve) =>
    dialog.addEventListener("close", () => resolve(dialog.returnValue === "ok"), { once: true })
  );
}

// Close buttons + click on the backdrop for a sheet dialog.
export function sheet(dialog) {
  dialog.querySelector(".sheet__close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (e) => e.target === dialog && dialog.close());
  return dialog;
}

export function countUp(el, to, suffix = "") {
  const from = Number(el.dataset.value ?? 0);
  el.dataset.value = to;
  if (reducedMotion() || from === to) return void (el.textContent = to + suffix);
  const t0 = performance.now();
  const tick = (t) => {
    const k = Math.min(1, (t - t0) / 700);
    el.textContent = Math.round(from + (to - from) * (1 - (1 - k) ** 3)) + suffix;
    if (k < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
