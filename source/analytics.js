// Technician insights: the original metrics, drawn as stat tiles and emphasis bars (top value in violet).
import { summarize } from "./domain.js";
import { $, countUp, esc } from "./ui.js";

export function barsHtml(pairs) {
  const max = Math.max(1, ...pairs.map(([, n]) => n));
  const top = pairs.reduce((a, b) => (b[1] > a[1] ? b : a));
  return pairs
    .map(
      ([label, n], i) =>
        `<li${n && label === top[0] ? ' class="is-top"' : ""}><span>${esc(label)}</span>` +
        `<span class="bars__bar" style="--w:${n / max};--i:${i}"></span><span class="bars__value">${n}</span></li>`
    )
    .join("");
}

export function mountInsights(root, state) {
  let last;
  const paint = (s) => {
    if (s.role !== "technician" || s.reports === last) return;
    last = s.reports;
    const m = summarize(s.reports);
    countUp($("[data-stat=open]", root), m.open);
    countUp($("[data-stat=resolved]", root), m.resolutionRate, "%");
    countUp($("[data-stat=dup]", root), m.duplicateRate, "%");
    $("[data-bars=lab]", root).innerHTML = barsHtml(m.byLab);
    $("[data-bars=equipment]", root).innerHTML = barsHtml(m.byEquipment);
  };
  state.subscribe(paint);
  paint(state.get());
}