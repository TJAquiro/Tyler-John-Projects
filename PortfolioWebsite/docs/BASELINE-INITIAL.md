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

## Continuation — September 25, 2026

The tracked suite survives at `4ae0d25`: 37 local and 27 Firebase cases. Installation state and evidence from an interrupted continuation are absent, so they do not establish acceptance. Initial visual scores remain unassigned.

Reproduced harness defect before revision: on Linux, start a wrapper with `startNode`, then have that wrapper start a listening server with `startNode` using the same process registry. Call `stopTree` on the wrapper. The server still accepts connections because each `startNode` owns a separate detached process group, while POSIX cleanup kills only the wrapper's group. This is also the hierarchy used by baseline → suite → servers, so a baseline timeout can orphan its servers. The diagnostic under `.qa/nested-process-*` reported `ownedDetachedDescendantStillListening: true`; its server was explicitly cleaned up afterward. Extend the existing process-registry cleanup to POSIX and cover both explicit cleanup and runner timeout with isolated regression tests.

Host setup: limited workspace disk capacity requires disposable dependencies and build output on `/tmp`; portable Java remains under `.qa/java`. Temporary build directories must share a dependency ancestor so their generated files resolve React. These paths are local accommodations, not committed installation requirements. Owner content and credentials are never cleanup targets.

Fresh gate `2026-09-25T16-08-28-225Z` exposed a readiness-file race in the new cleanup regression: existence was observed before JSON writing completed. Parsing the empty file also interrupted the regression's fallback cleanup. The owned test server was explicitly stopped and the gate exited failed. Publish readiness files atomically and ensure fallback parsing cannot bypass sibling cleanup before rerunning the gate.
