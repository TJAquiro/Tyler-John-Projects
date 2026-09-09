# Portfolio quality review

The source brief is in docs/PORTFOLIO-SPEC.md. Preserve the owner's content and credentials. Test mutations against the isolated fixtures, never the owner's content files.

For changes affecting behavior or layout, use the critic loop before declaring the work finished:

1. Compare the implementation with the source brief. Record concrete defects and their reproduction steps before revising.
2. Run `npm run check`. The browser suite builds a production copy in .next-qa and writes only to .qa/content; it checks auth, persistence, validation, CRUD, frozen public pages, responsiveness, and accessibility. Install Chromium once with `npx playwright install chromium`.
3. Inspect the rendered screenshots in .qa/screenshots at mobile, tablet, and desktop widths. Passing code checks does not establish visual quality.
4. Perform exactly ONE final critic/review pass per requested change set, unless the user explicitly changes this limit. Use an independent critic agent if available; if unavailable, perform an honest self-review and identify it as such. Review the actual changes and screenshot evidence. Score usability, user flow, aesthetics, clarity, layout, and professional finish out of 10. A 10 means exceptional agency quality; 8 means strong professional work. Overall is the arithmetic mean, rounded to one decimal.
5. Do not run another critic iteration after the single final review. Return its final scores and unresolved feedback, even if the target was not met. Normal implementation checks before the review should be completed, but never raise scores or hide failures to manufacture a passing result.
6. Update CRITIC-REPORT.md with initial/final scores, resolved findings, test evidence, screenshot paths, and remaining limitations. State any verification that could not be performed. Include the final scores in the user-facing result.

A critique is a review workflow, not a runtime feature in the portfolio. Do not add a decorative critic panel or a fabricated score to the website.

Do not deploy or claim to have verified a Vercel account without authorization and actual evidence. Public builds are static snapshots; private preview renders saved local content. Hosted Vercel writes are disabled because its deployment filesystem is not persistent storage.
