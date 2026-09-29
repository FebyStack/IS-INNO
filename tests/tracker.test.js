import test from "node:test";
import assert from "node:assert/strict";
import { chip, rowHtml, tag } from "../source/tracker.js";

const r = (over = {}) => ({
  id: "a7f3c2e9",
  labRoom: "Lab 2",
  computerNumber: "Computer 14",
  equipmentType: "Keyboard",
  issueDescription: "Keys E, R and T don't respond.",
  priority: "Medium",
  status: "Reported",
  instructorName: "Ms. Rhea Tampus",
  reportedAt: new Date("2026-09-29T09:00:00Z"),
  ...over,
});

test("rows escape instructor input", () => {
  const html = rowHtml(r({ issueDescription: `<img src=x onerror="alert(1)">` }), "instructor");
  assert.ok(!html.includes("<img"));
  assert.ok(html.includes("&lt;img"));
});

test("rowHtml and tag sanitize a hostile labRoom", () => {
  const hostile = r({ labRoom: `<img src=x onerror="alert(1)">` });
  assert.ok(!rowHtml(hostile, "instructor").includes("<img"));
  assert.ok(!tag(hostile, [hostile]).includes("<img"));
});

test("technicians get the original actions; instructors get none", () => {
  assert.equal((rowHtml(r(), "technician").match(/data-act=/g) ?? []).length, 2);
  assert.equal((rowHtml(r({ status: "In Progress" }), "technician").match(/data-act=/g) ?? []).length, 1);
  assert.ok(rowHtml(r({ status: "Resolved" }), "technician").includes("Done"));
  assert.ok(!rowHtml(r(), "instructor").includes('data-col="actions"'));
});

test("rows carry the seat code and short ticket id", () => {
  const html = rowHtml(r(), "instructor");
  assert.ok(html.includes('data-seat="LAB2-PC14"'));
  assert.ok(html.includes("#A7F3C2"));
});

test("the asset tag counts duplicates filed against the ticket", () => {
  const t = r();
  assert.ok(tag(t, [t, r({ id: "d1", status: "Duplicate" })]).includes("2 reports"));
  assert.ok(!tag(t, [t]).includes("reports"));
});

test("status chips carry their tone", () => {
  assert.ok(chip("Resolved").includes('data-tone="resolved"'));
  assert.ok(chip("In Progress").includes('data-tone="progress"'));
});
