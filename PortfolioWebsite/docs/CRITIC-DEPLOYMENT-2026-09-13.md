# Independent final critic — Firebase deployment, September 13, 2026

## Method and scope

This is exactly one independent final review for the deployment request, performed after implementation checks. No second critic iteration, application changes, cloud mutations, or test reruns were performed by this reviewer. Initial scores are **N/A**: there was no deployed site at the outset.

Reviewed AGENTS.md, the original portfolio brief, deployment notes, firebase.json, apphosting.yaml, .firebaserc, recorded rollout/live browser evidence, completed test logs, and the screenshots listed below. The original brief's Vercel/local-file architecture predates the existing Firebase publishing implementation; this request deploys the existing product and preserves the owner's content rather than reverting that architecture. Git HEAD is corrupt, so a reliable Git diff was unavailable. Configuration review concerns the actual files and documented deployment changes, not an independently reconstructed pre-change diff.

## Final scores

Scale: 10 is exceptional agency quality; 8 is strong professional work. Scores assess the rendered product and available deployment evidence, not a fabricated before/after improvement.

| Criterion | Initial | Final / 10 | Rationale |
| --- | --- | ---: | --- |
| Usability | N/A | 8.0 | Public navigation is simple; forms have clear labels and large primary actions. Mobile studio navigation consumes substantial space before the first field. |
| User flow | N/A | 7.8 | Guided steps, preview, publish, and restore form a coherent sequence; the long homepage biography delays access to the actual project work. |
| Aesthetics | N/A | 8.3 | Restrained cream/green palette, expressive serif headings, consistent rules and typography create a considered visual identity. |
| Clarity | N/A | 8.0 | Device-local draft and publish-copy messaging is explicit, with clear published-state controls in emulator evidence. Fresh hosted studio starts blank and does not itself explain how the owner's root snapshot relates to the draft. |
| Layout | N/A | 8.1 | Reviewed mobile, tablet and desktop layouts remain contained, readable, and consistently spaced. The single project leaves substantial unused grid space on wider screens. |
| Professional finish | N/A | 7.8 | Successful rollout and tests support readiness; the singular-project label and incomplete settled live-publish screenshot are remaining polish/evidence gaps. |
| **Overall** | **N/A** | **8.0** | Arithmetic mean: 48.0 / 6 = 8.0. |

## Resolved deployment findings and evidence

- The previously absent backend target is now explicitly configured for local-source App Hosting deployment. Upload exclusions cover local environment files, credential-shaped JSON names, browser drafts, tests/build caches, backups and Git history; archive preservation/preflight is documented by the deploying agent.
- Firebase runtime identifiers select the confirmed project, with local server editing disabled and runtime instance limits explicit. Provisioned Auth, Firestore and Storage are documented; direct client database/storage access denial and unauthenticated publish access are recorded.
- `.qa/deployment-evidence.json` records build READY and rollout SUCCEEDED for `build-2026-09-13-001` in `portfolio-website-6b3a5`.
- `/tmp/portfolio-deploy-check.log` confirms **15 passed (8.2m)** for the isolated Chromium suite; deployment notes record lint, TypeScript and production build success. `/tmp/portfolio-firebase-check.log` confirms **2 passed (3.0m)**, covering identity/verification/ownership/revisions/rules and image publish/update/restore/account isolation.
- `.qa/live-verification.json` records HTTP 200, no horizontal overflow, no broken images, and no automated WCAG A/AA violations for home/about/studio at 375, 768 and 1440 pixels; no captured runtime errors. It records `/admin` redirecting to `/studio` and publish sign-in becoming visible.

## Unresolved feedback and verification limits

1. **Project discovery is slow on the homepage.** Open `/` at 375 pixels: three full biography paragraphs precede Selected Work, pushing the sole project well below the initial viewport. At 1440 pixels it also sits below a substantial introductory section. In a separately requested design change, move Selected Work earlier or use an owner-approved homepage summary while retaining the full biography on About. No owner content was shortened for deployment.
2. **Mobile studio has substantial navigation overhead.** Open `/studio` at 375 pixels: the header, storage explanation, nine-step grid and backup disclosure precede the first field. A later compact step selector could bring the current task higher while keeping all steps accessible.
3. **Minor copy polish remains.** Open `/` with its current one project: the count reads “01 projects.” A later pluralization fix should display “01 project.”
4. **Hosted draft/root snapshot relationship is not explained in the initial screen.** Open `/studio` in a fresh browser: an empty Your name field appears despite the populated root portfolio. This is consistent with a device-local draft architecture, but returning owners may expect an editor of their already deployed root content. Future onboarding/help should explain the import/restore path and distinguish the root snapshot from `/p/` publication, without automatically copying or replacing owner data.
5. **Live publish screenshot is transitional.** `live-publish-1440.png` shows “Connecting to publishing...” and “Saving on this device...” rather than settled sign-in. Recorded DOM evidence says sign-in became visible, so this is a visual evidence limitation, not proof of a persistent connection failure. Authenticated published-state screenshots come from emulators, not the live owner account.
6. **Production mutation and delivery are intentionally unverified.** Real-account signup/email verification/password recovery delivery, owner publishing, and owner restore were not exercised on the live project. Emulator success cannot prove production email delivery or every runtime IAM path. No production test account or fixture content was created.
7. **Other limits:** Chromium coverage does not establish Safari/Firefox behavior or a manual screen-reader audit. No cold-start/load benchmark or long-term operational monitoring was reviewed. The isolated suite still logs Next.js `NoFallbackError` on an intentionally unpublished project while its expected 404 test passes. Git history corruption remains unresolved and prevents a conventional diff/commit audit.

## Screenshots inspected

All paths are under `.qa/screenshots/`:

- `live-home-375.png`, `live-home-768.png`, `live-home-1440.png`.
- `live-studio-375.png`, `live-studio-768.png`, `live-studio-1440.png`.
- `live-about-375.png`, `live-about-1440.png`.
- `live-publish-1440.png`.
- `firebase-public-375.png`, `firebase-public-1440.png`.
- `firebase-published-375.png`, `firebase-published-1440.png`.

The emulator public screenshots intentionally contain fixture content and a solid-color test image. The visible skip link in the published screenshots is consistent with keyboard-focus evidence, not a production branding defect. No extra critic pass is requested or implied by the unresolved feedback.
