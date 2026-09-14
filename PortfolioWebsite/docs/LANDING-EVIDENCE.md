# Landing page and hosted signup — verification evidence

## Completed behavior

- `/` is a service landing page with a labeled example, four-step walkthrough, six personalization groups, real published-creator aggregate, and free-service CTAs to `/signup`.
- `/signup` and `/login` use the existing Firebase integration. Signup starts a blank UID-scoped draft; login resumes that UID's saved device draft. Guest drafts remain separate. Verification is required for publishing, and failed verification-email delivery does not discard the newly created account.
- Root metadata describes Portfolio studio. Root `/about` and `/projects/[slug]` permanently redirect to `/`; individual `/p/` and `/u/` portfolios remain available. Saved owner content is not copied into marketing content.
- Stats return only a count or unavailable status, cache successful results for five minutes, and invalidate the server cache on first publication. Republishing does not increment the count. Screenshots showing 2 creators come from two actual emulator publications, not production usage or hard-coded marketing content.

## Checks

`npm.cmd run check`: lint, TypeScript, production build, and **19 passing browser scenarios (3.2 minutes)**. Log: `.qa/landing-check-final.log`; Playwright result: `test-results/.last-run.json` reports `passed` with no failed tests.

`npm.cmd run test:firebase`: isolated `demo-portfolio` Auth, Firestore, and Storage emulators; **5 passing scenarios (1.2 minutes)**. Log: `.qa/landing-firebase-verified.log`; `.qa/firebase-test-results/.last-run.json` reports `passed` with no failed tests. Firebase CLI configuration was isolated through `XDG_CONFIG_HOME` under `.qa/firebase-config`.

Covered: CTA destinations, metadata, owner-name absence, legacy redirects, count zero/singular/plural/unavailable, signup validation, duplicate email, failed login, signup-to-builder-to-publish, email verification, verification-email failure, same-address republishing, creator-count stability, returning-account drafts, guest draft preservation, existing publishing authorization/storage restrictions, responsive layouts, keyboard access, reduced motion, and axe accessibility checks.

Initial new-test failures were assertion issues: unscoped alert locators also matched Next.js's route announcer, and immediate navigation preceded the existing 300ms draft autosave. Locators now target form alerts within main; the return-path test waits for the saved indicator. Final runs pass.

The first sandboxed runs could not cleanly terminate Windows QA servers after tests finished. Only identified QA server/emulator process trees were stopped, then the suites were rerun with normal Windows process permissions. PowerShell's stderr-redirection wrapper reports a nonzero shell result when native warning records are captured; the test logs and Playwright result manifests establish the passing results. No claim of independently captured native npm exit codes is made. Expected missing-portfolio `NoFallbackError`, Node color warnings, and emulator metadata lookup warnings remain in logs.

## Screenshot evidence

At **375, 768, and 1440 pixels**:

- `.qa/screenshots/landing-{width}.png`: complete landing page with unavailable count in the non-Firebase QA environment.
- `.qa/screenshots/landing-live-{width}.png`: complete landing page with an actual emulator aggregate of two creators.
- `.qa/screenshots/landing-fold-{width}.png`: initial viewport.
- `.qa/screenshots/signup-{width}.png` and `login-{width}.png`: connected hosted account forms.
- `.qa/screenshots/signup-unavailable-{width}.png` and `login-unavailable-{width}.png`: unavailable account service and recovery navigation.
- Existing `home`, `about`, `project`, `local-studio`, and `firebase-public` screenshots cover retained portfolio/editor behavior.

Images were visually inspected, separately from passing code checks. An early overlap between the coral preview note and project labels was corrected before the final review.

## Preservation and limitations

`.qa/landing-preservation.json` confirms all **11 baseline owner-content and credential files** are byte-identical. Tests mutate isolated QA fixtures and emulator data only. No deployment, real account creation, real email delivery, production IAM verification, or production publishing was performed. Browser testing covers Chromium and axe, not a complete assistive-technology or cross-browser audit. Drafts remain device-local as designed.

Exactly one independent final critic review is recorded separately in `LANDING-FINAL-CRITIC.md`; final scores and unresolved feedback are in `../CRITIC-REPORT.md`.
