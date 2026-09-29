import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { seatLabel } from "../source/seatmap.js";

test("seat labels read well for screen readers", () => {
  assert.equal(seatLabel("Lab 2", { n: 3, open: [], status: null, high: false }), "LAB2-PC03, no open reports");
  assert.equal(
    seatLabel("Lab 2", { n: 14, open: [{}, {}], status: "Reported", high: true }),
    "LAB2-PC14, 2 open reports, Reported, high priority"
  );
  assert.equal(seatLabel("Lab 1", { n: 7, open: [{}], status: "In Progress", high: false }), "LAB1-PC07, 1 open report, In Progress");
});

test("the report sheet posts the same field names the original form saved", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const sheet = html.slice(html.indexOf('id="report-sheet"'), html.indexOf("</dialog>", html.indexOf('id="report-sheet"')));
  for (const name of ["instructorName", "labRoom", "computerNumber", "equipmentType", "issueDescription", "reportedBy", "priority"]) {
    assert.ok(sheet.includes(`name="${name}"`), `missing ${name}`);
  }
});
