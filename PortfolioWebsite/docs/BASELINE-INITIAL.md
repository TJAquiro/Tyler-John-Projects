# Baseline suite findings — September 24, 2026

Compared `docs/PORTFOLIO-SPEC.md` with the current README, routes, test suites, and existing critic report before implementation. The original brief describes the legacy single-owner editor; the current product additionally supports a service landing page, guest drafts, Firebase accounts, cloud recovery, and publishing. Tests must preserve both supported modes and their different publication behavior.

Initial defects and reproduction:

1. `npm run check` runs lint, types, and 28 local tests but omits every Firebase scenario. A successful check therefore cannot establish the hosted baseline.
2. The initial local run reported all 28 tests passing, then remained open without a completion footer. Reproduced with `npm.cmd run check`; log: `.qa/baseline-initial.log`. Interrupted only after all individual test results appeared. This is not a successful full command exit.
3. Existing reports/screenshots share paths across runs, and no coverage inventory binds tests to critic evidence. A critic could mistake historical screenshots for fresh evidence.
4. The two Playwright configurations do not reject focused tests and offer no aggregate policy rejecting skipped, incomplete, or unexpectedly passing expected-failure cases.
5. Server startup seeds some files without clearing all disposable fixture state; Firebase fixtures reset Auth/Firestore but not Storage. Residual files can make results depend on previous runs.
6. Browser exceptions are checked only in selected scenarios. Date, handle, project-count, snapshot mapping, expired-session, missing-route, and setup-update preservation boundaries need explicit cases.

Implementation is limited to tests, the harness, workflow documentation, and any reproduced application defects. No new website feature, deployment, or owner-data mutation is intended. The final critic will run exactly once after checks and screenshot inspection; this inventory is an implementation baseline, not a scored critic pass. Initial visual scores are not assigned because this task has no initial visual redesign assessment.

Additional reproduced defect: with Google Fonts blocked, navigating from hosted 404 to home rejects a stylesheet-loading promise (unhandled Event); the same import fails in the development editor. Reproduced through browser unhandledrejection inspection: the target is the layout stylesheet and the failing child request is fonts.googleapis.com. Serve the original font subsets locally under their SIL OFL licenses; remove the external CSS import and keep all uncaught errors fatal.
