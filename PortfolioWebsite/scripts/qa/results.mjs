export function casesFrom(report) {
  const cases = [];
  function visit(suite) {
    for (const spec of suite.specs || []) for (const test of spec.tests || []) {
      cases.push({ id: spec.title.match(/\b[A-Z]+-\d{3}\b/)?.[0] || null, title: spec.title, file: spec.file, line: spec.line, status: test.status, attempts: test.results.map(r => ({ status: r.status, errors: r.errors, attachments: r.attachments, duration: r.duration })) });
    }
    for (const child of suite.suites || []) visit(child);
  }
  visit(report);
  return cases;
}

export function assess(report, exitCode, expectedIds) {
  const cases = casesFrom(report);
  const reasons = [];
  if (exitCode !== 0) reasons.push(`Runner exit code: ${exitCode}`);
  if (report.errors?.length) reasons.push("Runner reported global errors");
  if (!cases.length) reasons.push("No tests executed");
  for (const item of cases) {
    if (!item.id) reasons.push(`Missing case ID: ${item.title}`);
    if (item.status !== "expected" || item.attempts.length !== 1 || item.attempts[0].status !== "passed") reasons.push(`Required case did not pass cleanly: ${item.title}`);
  }
  const actual = cases.map(c => c.id);
  if (new Set(actual).size !== actual.length) reasons.push("Duplicate case IDs");
  for (const id of expectedIds) if (!actual.includes(id)) reasons.push(`Required case missing: ${id}`);
  for (const id of actual) if (!expectedIds.includes(id)) reasons.push(`Uncatalogued case: ${id}`);
  return { passed: reasons.length === 0, reasons, cases };
}
