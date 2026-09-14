# September 14 verification evidence

All account/content mutations use the QA fixture directories and Firebase project `demo-portfolio`. Owner preservation evidence: `.qa/fixes-owner-preservation.json` records all 10 content files unchanged against `.qa/owner-hashes-2026-09-14.json`. No deployment or production account changes were performed.

The initial findings and reproduction steps were recorded before implementation in `docs/FIXES-2026-09-14-INITIAL.md`.

Implementation coverage:

- Responsive setup navigation; shrinkable fieldsets/grid children; date buttons and image cards wrap; mobile input text is 16px to avoid focus zoom. Coverage includes 320, 375, 390, 640, 768, 1024, 1440, and 1920px, all nine setup sections, project substeps, galleries, and previews.
- The same 500 MiB image constant applies to selection, crop save, local upload, and hosted upload. Large hosted images transfer in 8 MiB authenticated chunks and stream into Storage. Tests verify 9 MiB bytes end to end, 500 MiB session acceptance, and 500 MiB + 1 byte rejection. A full 500 MiB decoded photo was not stress-tested. Canvas, device-memory, browser string, and storage limits still apply.
- Account deletion includes password confirmation, cancellation, wrong-password recovery, recent authentication, token-derived ownership, upload/deletion coordination, deletion of published documents and the entire account media prefix, recursive publisher cleanup, Auth removal, and device draft deletion. A local tombstone prevents stale tab saves; open tabs receive a deletion event. The recovery test simulates an interrupted deletion request, then retries cleanup. A completed-deletion/lost-response retry was also attempted, but the Firebase emulator always checks user existence even when verifyIdToken is called without revocation checking; this differs from production SDK behavior. That post-completion retry is not established by the emulator test. Other accounts remain available.
- Preview/project/account errors clear after input edits and section changes; persistent save failures retain their recovery guidance until saving succeeds.
- Signup and resend-verification notices mention the spam folder. Actual production mail delivery was not exercised.

Initial test-run issues (retained rather than hidden):

- Chromium was already installed at the expected revision. `npx playwright install chromium` could not create the per-user directory lock under restricted filesystem permissions; the existing installation successfully ran the browser tests.
- The initial Firebase CLI attempted to access the machine's configstore. The emulator launcher now uses `.qa/firebase-config` instead, preserving actual credentials.
- A stale development build cache returned an unexpected JSON parse error during warmup; only the verified workspace `.next-qa-dev` cache was cleared, and the account scenarios passed on the next run.
- New tests initially selected Next.js's route announcer along with form alerts. Selectors now scope to main/dialog content.
- Storage's deny-all rules produce 403 rather than 404 for a removed download token. Deletion verification now checks that the URL is unavailable AND the actual account Storage prefix is empty.
- Restricted Windows process permissions prevented Playwright from terminating QA server trees during initial teardown. Only the identified QA process trees were stopped. Later test runs use Windows process permissions for clean teardown.

Final command results and screenshot inspection will be recorded in CRITIC-REPORT.md after checks finish. Screenshots are under `.qa/screenshots/fixes-*`, plus the existing suite's public/editor and Firebase screenshots. The final critic must inspect the actual images; code checks alone are insufficient.

No Safari/Firefox, real-device memory stress, live runtime IAM, or production email verification was performed. Existing expected-404 Next.js NoFallbackError messages and Firebase emulator metadata warnings occur in otherwise passing scenarios.
