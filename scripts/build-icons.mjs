// Builds assets/icons.svg from Phosphor (regular weight) so the app ships one small sprite.
// Run: npm run icons   (needs internet; commit the generated file)
import { writeFile } from "node:fs/promises";

const VERSION = "2.1.1";
export const ICONS = [
  "arrow-counter-clockwise", "arrow-right", "chalkboard-teacher", "chart-bar", "check", "clock",
  "copy", "desktop-tower", "hand-tap", "info", "keyboard", "list-checks", "magnifying-glass",
  "monitor", "mouse-simple", "play", "seal-check", "sign-out", "toolbox", "user-switch",
  "warning-circle", "wrench", "x",
];

if (import.meta.url === `file://${process.argv[1]}`) {
  const symbols = await Promise.all(
    ICONS.map(async (name) => {
      const res = await fetch(`https://cdn.jsdelivr.net/npm/@phosphor-icons/core@${VERSION}/assets/regular/${name}.svg`);
      if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
      const inner = (await res.text()).replace(/^<svg[^>]*>|<\/svg>\s*$/g, "");
      return `<symbol id="${name}" viewBox="0 0 256 256">${inner}</symbol>`;
    })
  );
  await writeFile(
    new URL("../assets/icons.svg", import.meta.url),
    `<svg xmlns="http://www.w3.org/2000/svg">${symbols.join("")}</svg>\n`
  );
  console.log(`assets/icons.svg: ${ICONS.length} icons`);
}
