// Loading screen: the crest charges bottom-up, each real startup step ticks off, then the crest docks into place.
import { icon, reducedMotion, wait, words } from "./ui.js";

const seen = () => {
  try {
    return sessionStorage.getItem("booted") === "1";
  } catch {
    return false;
  }
};

export function createBoot(el, steps) {
  const t0 = performance.now();
  const minMs = reducedMotion() ? 300 : seen() ? 700 : 1700;
  const ring = el.querySelector(".boot__progress");
  const log = el.querySelector(".boot__log");
  log.innerHTML = steps.map((s) => `<li>${icon("check")}<span>${words(s)}</span></li>`).join("");
  const items = [...log.children];
  let at = 0;
  items[0].classList.add("is-active");

  return {
    advance() {
      items[at]?.classList.replace("is-active", "is-done");
      items[++at]?.classList.add("is-active");
      ring.style.strokeDashoffset = 100 - (at / steps.length) * 100;
    },

    fail(message) {
      el.classList.add("is-error");
      el.querySelector(".boot__message").textContent = message;
      el.querySelector(".boot__error").hidden = false;
      el.querySelector("[data-retry]").onclick = () => location.reload();
    },

    async finish(target) {
      await wait(Math.max(0, minMs - (performance.now() - t0)));
      try {
        sessionStorage.setItem("booted", "1");
      } catch {}
      const crest = el.querySelector(".boot__crest");
      if (target && !reducedMotion()) {
        const a = crest.getBoundingClientRect();
        const b = target.getBoundingClientRect();
        el.classList.add("is-docking");
        const dock = crest.animate(
          [
            { transform: "none" },
            {
              transform: `translate(${b.x + b.width / 2 - (a.x + a.width / 2)}px, ${b.y + b.height / 2 - (a.y + a.height / 2)}px) scale(${b.width / a.width})`,
            },
          ],
          { duration: 700, easing: "cubic-bezier(.16, 1, .3, 1)", fill: "forwards" }
        );
        await Promise.race([dock.finished, wait(900)]);
      }
      el.classList.add("is-done");
      await wait(reducedMotion() ? 0 : 300);
      el.hidden = true;
    },
  };
}