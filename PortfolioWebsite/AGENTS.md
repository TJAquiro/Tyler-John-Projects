# Portfolio quality review

The source brief is in docs/PORTFOLIO-SPEC.md. Preserve the owner's content and credentials. Test mutations against the isolated fixtures, never the owner's content files.

For changes affecting behavior or layout, use the critic loop before declaring the work finished:

1. Compare the implementation with the source brief. Record concrete defects and their reproduction steps before revising.
2. Run `npm run check` as the mandatory functionality/code baseline. It includes harness checks, ESLint, TypeScript, isolated production builds, local Chromium tests, and Firebase emulator tests. Install Chromium once with `npx playwright install chromium`; emulator tests need Java 21+. All mutable fixtures belong under `.qa` or the `demo-portfolio` emulators. `docs/TEST-CASES.md` and `tests/case-catalog.json` define stable mandatory case IDs. Extend them for new behavior; filtered tests are diagnostic runs, not the acceptance gate. Missing prerequisites, skips, retries, incomplete results, changed owner files, or failed cleanup cannot be reported as a passing baseline.
3. Read `.qa/baseline/latest.json` and the referenced run's `CRITIC-HANDOFF.md` and `summary.json`. Confirm results are from the current implementation; use its archived screenshots at 375, 768, and 1440px, not historical files left in `.qa/screenshots`. The critic uses this evidence to establish baseline functionality without repeating routine checks, then focuses on task fulfillment, usability, flow and visual quality. Passing code checks does not establish visual quality. Disclose any failed baseline or missing evidence.
4. Perform exactly ONE final critic/review pass per requested change set, unless the user explicitly changes this limit. Use an independent critic agent if available; if unavailable, perform an honest self-review and identify it as such. Review the actual changes and screenshot evidence. Score usability, user flow, aesthetics, clarity, layout, and professional finish out of 10. A 10 means exceptional agency quality; 8 means strong professional work. Overall is the arithmetic mean, rounded to one decimal.
5. Do not run another critic iteration after the single final review. Return its final scores and unresolved feedback, even if the target was not met. Normal implementation checks before the review should be completed, but never raise scores or hide failures to manufacture a passing result.
6. Update CRITIC-REPORT.md with initial/final scores, resolved findings, test evidence, screenshot paths, and remaining limitations. State any verification that could not be performed. Include the final scores in the user-facing result.

A critique is a review workflow, not a runtime feature in the portfolio. Do not add a decorative critic panel or a fabricated score to the website.

Do not deploy or claim to have verified a Vercel account without authorization and actual evidence. Public builds are static snapshots; private preview renders saved local content. Hosted Vercel writes are disabled because its deployment filesystem is not persistent storage.
