import test from "node:test";
import assert from "node:assert/strict";
import { barsHtml } from "../source/analytics.js";

test("the largest bar is emphasized and widths are relative to it", () => {
  const html = barsHtml([["Lab 1", 1], ["Lab 2", 4], ["Lab 3", 2]]);
  assert.equal((html.match(/is-top/g) ?? []).length, 1);
  assert.match(html, /<li class="is-top"><span>Lab 2<\/span>/);
  assert.match(html, /--w:0\.25;/);
  assert.match(html, /--w:1;/);
});

test("no emphasis when everything is zero", () => {
  assert.ok(!barsHtml([["Keyboard", 0], ["Mouse", 0], ["Computer", 0]]).includes("is-top"));
});

test("ties emphasize the first bar only", () => {
  const html = barsHtml([["Keyboard", 2], ["Computer", 2], ["Mouse", 1]]);
  assert.equal((html.match(/is-top/g) ?? []).length, 1);
  assert.match(html, /<li class="is-top"><span>Keyboard/);
});
