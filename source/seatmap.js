// Lab floor plan: one tile per PC, lit by its open tickets. Arrow keys move between seats.
import { LABS, SEATS_PER_LAB, STATUS, openCount, seatCode, seatStates } from "./domain.js";
import { $, icon } from "./ui.js";

export function seatLabel(lab, seat) {
  const code = seatCode(lab, seat.n);
  if (!seat.status) return `${code}, no open reports`;
  const n = seat.open.length;
  return `${code}, ${n} open report${n > 1 ? "s" : ""}, ${seat.status}${seat.high ? ", high priority" : ""}`;
}

export function mountSeatMap(root, state, { onSeat }) {
  const labs = $(".seatmap__labs", root);
  const grid = $(".seatmap__grid", root);
  const meta = $(".seatmap__meta", root);
  let last = {};

  labs.innerHTML = LABS.map((l) => `<button type="button" class="seg" data-lab="${l}">${l}</button>`).join("");
  grid.innerHTML = Array.from(
    { length: SEATS_PER_LAB },
    (_, i) =>
      `<button type="button" class="seat" data-n="${i + 1}" style="--i:${i}" tabindex="${i ? -1 : 0}">` +
      `${icon("warning-circle", "seat__icon")}<span>${String(i + 1).padStart(2, "0")}</span><span class="seat__led"></span></button>`
  ).join("");
  const seats = [...grid.children];

  const powerOn = () => {
    grid.classList.remove("is-booting");
    void grid.offsetWidth; // restart the stagger
    grid.classList.add("is-booting");
    setTimeout(() => grid.classList.remove("is-booting"), 1400);
  };

  function paint(s) {
    if (s.lab === last.lab && s.reports === last.reports) return;
    if (s.lab !== last.lab) powerOn();
    last = s;
    const states = seatStates(s.lab, s.reports);
    labs.querySelectorAll("[data-lab]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.lab === s.lab));
    meta.innerHTML = `<span><b>${SEATS_PER_LAB}</b> PCs</span><span><b>${openCount(s.lab, s.reports)}</b> open</span>`;
    seats.forEach((btn, i) => {
      const seat = states[i];
      const tone = seat.status ? STATUS[seat.status].tone : "";
      if (btn.dataset.tone !== tone) {
        btn.dataset.tone = tone;
        if (tone) btn.querySelector("use").setAttribute("href", `assets/icons.svg#${STATUS[seat.status].icon}`);
      }
      btn.toggleAttribute("data-high", seat.high);
      btn.setAttribute("aria-label", seatLabel(s.lab, seat));
    });
  }

  labs.addEventListener("click", (e) => {
    const b = e.target.closest("[data-lab]");
    if (b) state.set({ lab: b.dataset.lab });
  });

  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".seat");
    if (!btn) return;
    seats.forEach((s) => (s.tabIndex = s === btn ? 0 : -1));
    onSeat(state.get().lab, Number(btn.dataset.n));
  });

  grid.addEventListener("keydown", (e) => {
    const i = seats.indexOf(document.activeElement);
    const cols = getComputedStyle(grid).gridTemplateColumns.split(" ").length;
    const j = { ArrowRight: i + 1, ArrowLeft: i - 1, ArrowDown: i + cols, ArrowUp: i - cols, Home: 0, End: seats.length - 1 }[e.key];
    if (i < 0 || j === undefined || !seats[j]) return;
    e.preventDefault();
    seats[i].tabIndex = -1;
    seats[j].tabIndex = 0;
    seats[j].focus();
  });

  state.subscribe(paint);
  paint(state.get());
}
