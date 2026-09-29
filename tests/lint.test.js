import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { ICONS } from "../scripts/build-icons.mjs";
import { EQUIPMENT_ICON, STATUS } from "../source/domain.js";
import { ROLE_ICON } from "../source/auth.js";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");
const uiFiles = async () => [
  "index.html",
  ...(await readdir(new URL("source/", root))).filter((f) => f !== "firebase-config.js").map((f) => `source/${f}`),
  ...(await readdir(new URL("drama/", root))).map((f) => `drama/${f}`),
];

test("no em/en dashes or emoji in UI files", async () => {
  for (const file of await uiFiles()) {
    const text = await read(file);
    assert.doesNotMatch(text, /[–—]/, `${file} has an em or en dash`);
    assert.doesNotMatch(text, /\p{Extended_Pictographic}/u, `${file} has an emoji`);
  }
});

test("reduced motion switches every animation off", async () => {
  assert.match(await read("drama/base.css"), /prefers-reduced-motion: reduce\)[\s\S]*animation-duration: 1ms !important/);
});

test("every icon the UI uses is in the sprite", async () => {
  const sprite = await read("assets/icons.svg");
  const used = new Set([
    ...Object.values(STATUS).map((s) => s.icon),
    ...Object.values(EQUIPMENT_ICON),
    ...Object.values(ROLE_ICON),
  ]);
  for (const file of await uiFiles()) {
    for (const m of (await read(file)).matchAll(/icons\.svg#([\w-]+)|icon\("([\w-]+)"|icon: "([\w-]+)"/g)) {
      used.add(m[1] ?? m[2] ?? m[3]);
    }
  }
  for (const name of used) {
    assert.ok(ICONS.includes(name), `${name} missing from ICONS in scripts/build-icons.mjs`);
    assert.ok(sprite.includes(`id="${name}"`), `${name} missing from assets/icons.svg (run npm run icons)`);
  }
});
