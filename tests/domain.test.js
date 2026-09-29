import test from "node:test";
import assert from "node:assert/strict";
import * as d from "../source/domain.js";

const r = (over = {}) => ({
  id: "abc123xyz",
  labRoom: "Lab 2",
  computerNumber: "Computer 14",
  equipmentType: "Keyboard",
  issueDescription: "Keys E, R and T don't respond.",
  priority: "Medium",
  status: "Reported",
  instructorName: "Ms. Rhea Tampus",
  ...over,
});

test("seatCode pads the PC number", () => {
  assert.equal(d.seatCode("Lab 2", "Computer 3"), "LAB2-PC03");
  assert.equal(d.seatCode("Lab 1", 14), "LAB1-PC14");
});

test("shortId keeps the original 6-character ticket id", () => {
  assert.equal(d.shortId("a7f3c2Zz"), "#A7F3C2");
});

test("normalizeStatus maps legacy Fixed to Resolved", () => {
  assert.equal(d.normalizeStatus("Fixed"), "Resolved");
  assert.equal(d.normalizeStatus("Reported"), "Reported");
});

test("findDuplicate keeps the original rule: exact same issue on an open ticket", () => {
  const open = r();
  assert.equal(d.findDuplicate(r({ id: undefined }), [open]), open);
  assert.equal(d.findDuplicate(r({ issueDescription: "Keys stuck" }), [open]), null);
  assert.equal(d.findDuplicate(r(), [r({ status: "Resolved" })]), null);
  assert.equal(d.findDuplicate(r(), [r({ status: "In Progress" })])?.status, "In Progress");
});

test("buildReport trims input and flags duplicates", () => {
  const fields = {
    instructorName: "  Engr. Dennis Cabahug ",
    reportedBy: "",
    labRoom: "Lab 2",
    computerNumber: "Computer 14",
    equipmentType: "Keyboard",
    issueDescription: "Keys E, R and T don't respond. ",
    priority: "Medium",
  };
  const { report, dup } = d.buildReport(fields, [r()]);
  assert.equal(report.status, "Duplicate");
  assert.equal(report.isDuplicate, true);
  assert.equal(dup.id, "abc123xyz");
  assert.equal(report.instructorName, "Engr. Dennis Cabahug");
  assert.equal(report.reportedBy, "N/A");
  assert.equal(d.buildReport(fields, []).report.status, "Reported");
});

test("reportCount adds the duplicates filed against a ticket", () => {
  const t = r();
  const others = [r({ id: "dup1", status: "Duplicate" }), r({ id: "x", computerNumber: "Computer 2", status: "Duplicate" })];
  assert.equal(d.reportCount(t, [t, ...others]), 2);
});

test("seatStates: Reported outranks In Progress and High flags the seat", () => {
  const seats = d.seatStates("Lab 2", [
    r({ status: "In Progress" }),
    r({ id: "b", priority: "High" }),
    r({ id: "c", status: "Resolved", computerNumber: "Computer 1" }),
    r({ id: "e", labRoom: "Lab 1" }),
  ]);
  assert.equal(seats.length, 50);
  assert.equal(seats[13].status, "Reported");
  assert.equal(seats[13].open.length, 2);
  assert.equal(seats[13].high, true);
  assert.equal(seats[0].status, null);
});

test("summarize keeps the original analytics metrics", () => {
  const m = d.summarize([
    r(),
    r({ id: "b", status: "Resolved", labRoom: "Lab 1", equipmentType: "Mouse" }),
    r({ id: "c", status: "Duplicate" }),
    r({ id: "e", status: "In Progress", equipmentType: "Computer" }),
  ]);
  assert.equal(m.total, 4);
  assert.equal(m.open, 2);
  assert.equal(m.resolutionRate, 25);
  assert.equal(m.duplicateRate, 25);
  assert.deepEqual(m.byLab, [["Lab 1", 1], ["Lab 2", 3], ["Lab 3", 0]]);
  assert.deepEqual(m.byEquipment[0], ["Keyboard", 2]);
});

test("filterReports matches status and search text, including seat codes", () => {
  const list = [r(), r({ id: "b", status: "Resolved", computerNumber: "Computer 3", equipmentType: "Mouse" })];
  assert.equal(d.filterReports(list, { status: "Resolved" }).length, 1);
  assert.equal(d.filterReports(list, { query: "lab2-pc03" })[0].id, "b");
  assert.equal(d.filterReports(list, { query: "tampus" }).length, 2);
});

test("nextActions mirrors the original technician buttons", () => {
  assert.deepEqual(d.nextActions("Reported"), ["In Progress", "Resolved"]);
  assert.deepEqual(d.nextActions("In Progress"), ["Resolved"]);
  assert.deepEqual(d.nextActions("Duplicate"), []);
});

test("timeline marks done, current and todo steps", () => {
  assert.deepEqual(d.timeline("In Progress").map((s) => s.state), ["done", "current", "todo"]);
});

test("timeAgo buckets", () => {
  const now = new Date("2026-09-29T10:00:00Z");
  assert.equal(d.timeAgo(new Date("2026-09-29T09:59:30Z"), now), "just now");
  assert.equal(d.timeAgo(new Date("2026-09-29T09:15:00Z"), now), "45m ago");
  assert.equal(d.timeAgo(new Date("2026-09-29T07:00:00Z"), now), "3h ago");
  assert.equal(d.timeAgo(new Date("2026-09-27T10:00:00Z"), now), "2d ago");
  assert.equal(d.timeAgo(null, now), "just now");
});

test("barcode is stable per id and differs across ids", () => {
  assert.deepEqual(d.barcode("abc"), d.barcode("abc"));
  assert.notEqual(d.barcode("abc").image, d.barcode("abd").image);
  assert.ok(d.barcode("abc").width > 0);
});
