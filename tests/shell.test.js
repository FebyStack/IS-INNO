import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { checkLogin, getRole } from "../source/auth.js";

test("checkLogin keeps the original demo passwords", () => {
  assert.ok(checkLogin("instructor", "instructor123"));
  assert.ok(checkLogin("technician", "tech123"));
  assert.ok(!checkLogin("technician", "instructor123"));
});

test("getRole is null when nobody is signed in", () => {
  assert.equal(getRole(), null);
});

test("index.html has every region the app mounts into", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  for (const id of ["boot", "login", "login-form", "app", "role-chip", "sign-out", "seatmap", "insights", "tracker", "report-sheet", "ticket-drawer", "confirm", "toasts"]) {
    assert.ok(html.includes(`id="${id}"`), `missing #${id}`);
  }
});
