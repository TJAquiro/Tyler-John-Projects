# Landing page and signup: final independent critic review

2026-09-13. This is the **one final independent review** required by AGENTS.md. I reviewed the actual implementation, initial findings, approved landing-page plan, source brief, final test evidence, and rendered screenshots. I made no implementation changes and performed no second critique. The approved service-at-root plan supersedes the original owner's homepage routing.

## Final scores

| Criterion | Score / 10 | Assessment |
| --- | ---: | --- |
| Usability | 8.3 | Clear primary actions, legible forms, accessible tested states; mobile navigation and stalled connection recovery have room to improve. |
| User flow | 8.4 | Signup reaches blank setup, returning accounts resume the correct draft, and verification failures preserve the created account. |
| Aesthetics | 8.7 | Editorial type, cream and green surfaces, coral accents, and restrained artwork form a coherent continuation of the site. |
| Clarity | 8.6 | Free pricing, editable content, fixed layout, device-local saves, and verification are explained without fabricated social proof. |
| Layout | 8.3 | Responsive composition and forms remain orderly at all three widths; the mobile marketing journey is long. |
| Professional finish | 8.2 | Consistent details and strong test evidence, with small routing/metadata inconsistencies and an unbounded account connection state remaining. |
| **Overall** | **8.4** | Arithmetic mean: 50.5 / 6 = 8.4167, rounded to one decimal. |

The initial self-assessment in `LANDING-INITIAL.md` was usability 5, user flow 4, aesthetics 7, clarity 4, layout 6, professional finish 5; overall 5.2. Final scores above are this independent reviewer's assessment, not an automated measurement or a production feature.

## Resolved findings and observed quality

- The service homepage replaces owner content and leads all three landing CTAs to signup. The root title and description now describe Portfolio studio; legacy root about/project routes permanently redirect home.
- The page contains a clearly labeled example portfolio, four ordered steps, all requested personalization groups, actual aggregate usage states, and the free-service closing banner. Artwork comes from the showcase data.
- The preview's coral note no longer covers the project labels in desktop, tablet, or mobile evidence. Typography, spacing, image proportions, and CTA contrast remain coherent through the responsive changes.
- The connected account screens use visible labels and consistent styling. Unavailable account screens provide retry and device-builder navigation. The emulator tests establish account creation, verification-required publishing, failed verification-email recovery, draft isolation, returning-account restoration, and stable creator counts after republishing.

## Unresolved feedback

1. **Medium, source-level recovery edge case:** the shared `publishingAuth()` fetch has no timeout or abort signal. If `/api/firebase-config` stays pending, `/signup` and `/login` remain on "Connecting to accounts..." with neither retry nor builder fallback available. A future change should bound connection time and reveal the existing retry state. Reproduction: hold that request open when loading either route. This was identified from source, not exercised in the supplied browser tests; the unbounded helper predates this landing change, but the new routes expose it as their only entry state.
2. **Low, mobile navigation/pacing:** below 1024px the two section navigation links disappear without a replacement. At 375px the page is about 6,155px tall, with no signup CTA between the hero and closing banner. The existing hero walkthrough link helps, but visitors reading the middle have a long path back to conversion or directly to personalization. A future refinement should retain compact section links and add a CTA after the walkthrough. This is a polish issue, not clipping or an inaccessible primary action.
3. **Low, legacy portfolio metadata:** `/u/[handle]` sets its own title but no description, so it now inherits the service marketing description from the root layout. `/p/[handle]` correctly provides the individual's biography/project description. A future change should supply equivalent per-portfolio descriptions for `/u/` pages. Reproduction: inspect a generated `/u/<existing-handle>` description meta tag. This is an inherited-description inconsistency exposed by the new global metadata, rather than lost portfolio content.
4. **Low, public CTA consistency:** the empty `HomeView` branch still sends "Create your portfolio" directly to `/signup`, whereas the approved plan says public create links should lead to the service homepage. Normal public footer links are correct. A future change should make the empty-state link match `/`. The main landing signup journey is unaffected.

No blocking defect was observed in the tested landing-to-publish journey. The findings above remain unresolved; no product revision or further critic iteration was performed after this review.

## Evidence and verification limits

- Read `.qa/landing-check-final.log`: lint and TypeScript stages complete, followed by **19 passed browser tests (3.2m)**. `test-results/.last-run.json` reports `passed` with no failed tests.
- Read `.qa/landing-firebase-verified.log`: **5 passed emulator tests (1.2m)**. `.qa/firebase-test-results/.last-run.json` reports `passed` with no failed tests. The screenshots' count of 2 represents two emulator publications, not production customers.
- The tests cover redirects, metadata, count zero/singular/plural/unavailable states, account failures, verification, publishing, republishing, guest preservation, account drafts, keyboard entry, reduced motion, overflow, and axe checks. Existing CRUD/auth/frozen-public-page tests also pass. No additional test run was performed by this critic.
- Viewed actual full-page images using `view_image`: `landing-live-{375,768,1440}.png`, `signup-{375,768,1440}.png`, `login-{375,768,1440}.png`, `landing-1440.png`, `signup-unavailable-375.png`, `signup-unavailable-1440.png`, and `login-unavailable-768.png`, all under `.qa/screenshots/`. These establish visual review at mobile, tablet, and desktop widths separately from test assertions.
- `.qa/landing-preservation.json` reports 11 checked owner/credential files with no changes. The critic did not access real accounts or modify owner content.
- The PowerShell wrapper returned a nonzero shell result while redirecting native stderr warning records; passing test manifests and test output are the evidence here. This review does not claim an independently captured native npm exit code. Logs retain Node color warnings, emulator metadata lookup warnings, and an expected missing-static-portfolio `NoFallbackError`.
- Production Firebase configuration/IAM, real email delivery, production traffic/counts, and Vercel deployment were not verified. Drafts remain device-local by design; a different device restores the last published snapshot through Publish. These are existing architectural/deployment limits, not regressions introduced by the landing page.
- Browser evidence is Chromium plus axe, not a full assistive-technology or cross-browser audit. Initial failed assertions and QA process teardown issues are transparently recorded in `LANDING-EVIDENCE.md`; the final supplied results pass.
