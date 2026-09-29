import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { ICONS } from "../scripts/build-icons.mjs";

const read = (path, enc) => readFile(new URL(`../${path}`, import.meta.url), enc);

test("the icon sprite has every icon in the build list", async () => {
  const sprite = await read("assets/icons.svg", "utf8");
  for (const name of ICONS) assert.ok(sprite.includes(`<symbol id="${name}"`), `missing ${name}`);
});

test("fonts are real woff2 files", async () => {
  for (const f of ["Geist-Variable.woff2", "GeistMono-Variable.woff2"]) {
    assert.equal((await read(`assets/fonts/${f}`)).subarray(0, 4).toString(), "wOF2", f);
  }
});

test("the logo is a PNG with transparency", async () => {
  const png = await read("assets/brand/iss-logo.png");
  assert.equal(png.subarray(1, 4).toString(), "PNG");
  assert.equal(png[25], 6, "color type 6 = RGBA");
});
