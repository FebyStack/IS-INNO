import test from "node:test";
import assert from "node:assert/strict";
import { createState, memoryStore } from "../source/store.js";

test("createState merges patches and notifies subscribers", () => {
  const state = createState({ a: 1, b: 1 });
  const seen = [];
  const off = state.subscribe((s) => seen.push(s.a));
  state.set({ a: 2 });
  off();
  state.set({ a: 3 });
  assert.deepEqual(seen, [2]);
  assert.deepEqual(state.get(), { a: 3, b: 1 });
});

test("memoryStore adds, updates and streams copies", async () => {
  const store = memoryStore(() => new Date("2026-09-29T10:00:00Z"));
  let latest = [];
  store.subscribe((list) => (latest = list));
  const id = await store.add({ status: "Reported" });
  assert.equal(latest.length, 1);
  assert.equal(latest[0].id, id);
  assert.ok(latest[0].reportedAt instanceof Date);
  await store.update(id, { status: "Resolved" });
  assert.equal(latest[0].status, "Resolved");
  latest[0].status = "tampered";
  await store.update(id, {});
  assert.equal(latest[0].status, "Resolved");
});
