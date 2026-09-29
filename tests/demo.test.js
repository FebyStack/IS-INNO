import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { DEMO_REPORTS, WALKTHROUGH, seedDemo } from "../source/demo.js";
import { memoryStore } from "../source/store.js";

test("the 5 fictional reports produce exactly one duplicate: report 5 repeats report 2", async () => {
  const store = memoryStore();
  let reports = [];
  store.subscribe((list) => (reports = list));
  await seedDemo(store, () => reports);
  assert.equal(DEMO_REPORTS.length, 5);
  assert.deepEqual(
    reports.map((r) => r.status),
    ["Reported", "Reported", "Reported", "Reported", "Duplicate"]
  );
  assert.equal(reports[4].computerNumber, reports[1].computerNumber);
});

test("walkthrough ids exist in index.html", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  for (const { target } of WALKTHROUGH) {
    const id = target.match(/^#([\w-]+)/)?.[1];
    assert.ok(html.includes(`id="${id}"`), `missing #${id}`);
  }
});
