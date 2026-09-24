import { test } from "node:test";
import assert from "node:assert/strict";
import { assess } from "./results.mjs";
const report = (status = "passed", expected = "expected") => ({ suites: [{ specs: [{ title: "BASE-001 sample", tests: [{ status: expected, results: [{ status }] }] }] }] });
test("gate accepts only a complete clean run", () => {
  assert.equal(assess(report(), 0, ["BASE-001"]).passed, true);
  for (const status of ["failed", "skipped", "timedOut", "interrupted"]) assert.equal(assess(report(status), 0, ["BASE-001"]).passed, false);
  assert.equal(assess(report("failed", "expected"), 0, ["BASE-001"]).passed, false, "expected failures cannot pass the baseline");
  assert.equal(assess(report(), 1, ["BASE-001"]).passed, false);
  assert.equal(assess(report(), 0, ["BASE-001", "BASE-002"]).passed, false);
  assert.equal(assess({}, 0, []).passed, false);
  assert.equal(assess({ ...report(), errors: [{ message: "setup failed" }] }, 0, ["BASE-001"]).passed, false);
  const retried = report(); retried.suites[0].specs[0].tests[0].results.unshift({ status: "failed" });
  assert.equal(assess(retried, 0, ["BASE-001"]).passed, false);
  assert.equal(assess(report("passed", "unexpected"), 0, ["BASE-001"]).passed, false, "unexpected passes must not hide obsolete expected-failure markers");
  assert.equal(assess(report(), 0, []).passed, false, "uncatalogued tests must be reviewed");
  const duplicate = report(); duplicate.suites.push(duplicate.suites[0]);
  assert.equal(assess(duplicate, 0, ["BASE-001"]).passed, false);
});
