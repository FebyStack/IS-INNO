import test from "node:test";
import assert from "node:assert/strict";
import { esc, icon, words } from "../source/ui.js";

test("esc escapes html", () => {
  assert.equal(esc(`<a href="x">'&`), "&lt;a href=&quot;x&quot;&gt;&#39;&amp;");
  assert.equal(esc(undefined), "");
});

test("icon points at the sprite and hides from assistive tech", () => {
  const svg = icon("wrench");
  assert.match(svg, /href="assets\/icons\.svg#wrench"/);
  assert.match(svg, /aria-hidden="true"/);
});

test("words wraps each word with a stagger index", () => {
  assert.equal(
    words("Syncing tickets"),
    '<span class="w" style="--i:0">Syncing</span> <span class="w" style="--i:1">tickets</span>'
  );
});
