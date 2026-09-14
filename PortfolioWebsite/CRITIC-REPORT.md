# Current review — Firebase post-launch repairs, September 13, 2026

**Repairs are local, not deployed.** The owner declined Firebase login on this computer and asked to continue the remaining tests. No production account, email, publication, or restore mutations were performed.

Exactly **one independent final critic pass** followed implementation checks and screenshot inspection. No further implementation or critic iteration followed it. [Full independent review](docs/REPAIR-2026-09-13-CRITIC.md) · [Initial defects and reproduction steps](docs/REPAIR-2026-09-13-INITIAL.md) · [Verification evidence](docs/REPAIR-2026-09-13-EVIDENCE.md).

| Criterion | Initial baseline | Final / 10 |
| --- | ---: | ---: |
| Usability | 8.0 | 8.3 |
| User flow | 7.8 | 8.1 |
| Aesthetics | 8.3 | 8.3 |
| Clarity | 8.0 | 8.2 |
| Layout | 8.1 | 8.3 |
| Professional finish | 7.8 | 8.0 |
| **Overall arithmetic mean** | **8.0** | **8.2** |

Initial scores are the preceding deployment review's baseline, not a second initial critique. Final mean: 49.2 / 6 = 8.2. An 8 denotes strong professional work; 10 denotes exceptional agency quality.

Resolved: work now precedes the complete biography; singular project count is correct; mobile setup retains all nine buttons with less overhead and moves backup help below the editor; root-homepage versus `/p/` publishing is explained; blocked storage shows recovery guidance without silently saving an empty replacement; cancelled account replacement does not claim success; restore confirms once; autosaves capture their account namespace, and account switching saves with revision checks before activation.

Verification: `npm.cmd run check` passed lint, TypeScript, an isolated production build, and **17 browser scenarios (2.7m)**. `npm.cmd run test:firebase` passed **3 scenarios (55.7s)** against `demo-portfolio`. Both exited 0. Logs: `.qa/repair-final-check.log` and `.qa/repair-final-firebase.log`. Early test-selector mistakes were corrected and are disclosed in the evidence document. All **10 owner content files are byte-identical** to the starting hashes; credentials were not modified.

Rendered owner-content preview and live read-only baseline: home, About, project, and studio at 375/768/1440px had no settled axe violations, broken images, overflow, or captured page exceptions. Screenshots: `.qa/screenshots/repair-{before,after}-{home,about,project,studio}-{375,768,1440}.png`; isolated production studio: `local-studio-{375,768,1440}.png`; emulator publishing: `firebase-{public,published}-{375,768,1440}.png`. Owner preview screenshots include a development-only Next.js indicator. The critic lists the exact screenshots inspected.

Remaining feedback, with no further iteration:

- **Partial storage commit:** if `localStorage.setItem` alone fails after the destination IndexedDB save, the account draft has been saved/replaced but the previous draft stays active in the UI and an error is shown. This inspection finding was not runtime reproduced; the two-store activation edge needs a future regression and recovery treatment.
- Unfinished project navigation can reach Publish before the completion error; mobile publishing repeats headings and places the share link below the first viewport.
- A single project leaves an empty second grid column, and tablet About columns remain narrow.
- Production email delivery, real-account publishing/restoration, runtime IAM, and deployment of these repairs remain unverified. Existing expected-404 `NoFallbackError` and emulator metadata warnings remain in passing logs. Chromium/axe coverage is not a Safari/Firefox or complete assistive-technology audit.

---

# Repository recovery — September 13, 2026

The subsequent Git synchronization request restored local Git metadata from the matching GitHub main commit (`1409742`). The damaged metadata is preserved outside the repository at `/home/tjaquiro/Desktop/Tyler-John-Projects-recovery-20260913-161614/`. Working files and owner content were preserved. Git integrity and change inspection now work; corruption limitations below describe the earlier deployment review. No application behavior/layout changes or additional critic pass were performed for this recovery. Existing final scores remain unchanged.

---

# Current review — Firebase deployment, September 13, 2026

Exactly one independent final critic pass was completed after verification. [Full findings and screenshot evidence](docs/CRITIC-DEPLOYMENT-2026-09-13.md) · [Deployment evidence](docs/DEPLOYMENT-2026-09-13.md).

Initial scores: N/A (no deployed site before this request). Final scores: usability **8.0**, user flow **7.8**, aesthetics **8.3**, clarity **8.0**, layout **8.1**, professional finish **7.8**. Arithmetic mean: **8.0/10**.

Resolved: missing App Hosting target, Firebase runtime configuration, Auth/database/bucket provisioning, client access rules, and deployment archive exclusions. Owner content and credentials preserved. Build READY and rollout SUCCEEDED.

Verification: `npm run check` **15 passed**; `npm run test:firebase` **2 passed**. Live home/about/studio at 375/768/1440 pixels: no overflow, broken images, axe WCAG A/AA violations, or captured page runtime errors. Screenshots: `.qa/screenshots/live-{home,about,studio}-{375,768,1440}.png`; emulator screenshots: `firebase-{public,published}-{375,768,1440}.png`. Full paths and test evidence are in the linked report.

Remaining: long homepage biography delays projects, mobile studio navigation overhead, “01 projects” copy, and unclear root-snapshot versus device-draft relationship. Live publish screenshot is transitional despite successful sign-in DOM evidence. Production email delivery and real-account publish/restore were not tested; mutation tests used isolated fixtures/emulators. Git HEAD corruption remains. No second critic iteration or design revisions were performed.

---

## Historical report (previous change request)

# Final critic report — accounts and media update

## Review count and method

Exactly **one critic/review cycle** was performed for this change request, followed by one small presentation correction batch. No second critic pass was run.

This is a **self-review**, not an independent sign-off: the separate critic agent was unavailable because its usage limit was reached. Earlier CRITIC-INITIAL.md and CRITIC-REVIEW.md belong to the previous request and are retained as history; they are not extra passes for this update.

## Scores

The scale follows the original brief: 10 means exceptional agency quality, 8 means strong professional work. Overall is the arithmetic mean, rounded to one decimal.

| Criterion | Score / 10 | Evidence |
| --- | ---: | --- |
| Usability | 8.5 | Account signup, clear form errors, searchable software choices, custom tools, draggable crops and exact pixel controls work in the browser. |
| User flow | 8.5 | Signup immediately opens onboarding; progress survives reload; sign-in resumes; accounts and recovery drafts are isolated; showcase is separate and opt-in. |
| Aesthetics | 8.0 | Consistent typography, restrained palette, rounded studio panels, and clean public layouts. Showcase artwork is intentionally illustrative. |
| Clarity | 8.0 | Local accounts, separate portfolio addresses, deployment timing, photo captions, crop confirmation, and destructive reset wording are explicit. |
| Layout | 8.0 | Public pages and studio layouts checked at 375, 768, and 1440 pixels; mobile crop dialog and account screens also inspected. |
| Professional finish | 7.5 | Functional and accessibility checks pass. The exact user-reported hydration mismatch was not reproduced, and a production-only framework log remains for intentionally unpublished project routes. |
| **Overall** | **8.1** | Strong tested local functionality; remaining diagnostic limitations are listed below. |

## Delivered behavior

- New accounts start without mock projects or profile entries. The owner's existing profile, Campaign Website project, and setup record were preserved byte-for-byte.
- Email/password account creation and sign-in use salted scrypt password hashes. Each account has its own content and browser-draft namespace.
- The first account can optionally copy the existing portfolio; the checkbox is off by default.
- Account creation signs in and immediately opens guided onboarding.
- The Tools section offers a categorized software catalog and custom entries, selected individually.
- Education supports a description.
- Uploads and existing photos offer a crop editor with free/fixed ratios and exact pixel positioning/sizing. A 50 × 40 pixel crop was verified as a saved 50 × 40 image.
- Project photos support optional descriptions; the saved text appears below the corresponding image.
- Local development tools provide a separate complete showcase account and a typed-confirmation reset. Reset invalidates accounts/sessions, clears portfolio content, retains image files, and creates a backup.
- Public account portfolios use /u/<handle>; production pages stay at the build snapshot until redeployment.

## Findings and the one correction batch

1. A long owner biography pushed the homepage headline too low. The homepage now uses its first paragraph; About retains the complete biography. No content file was shortened.
2. Stray question marks appeared in the dashboard's portfolio-address notice. Replaced them with plain punctuation and accessible new-tab wording.

The correction batch passed lint and TypeScript. Homepage checks at 375 and 1440 pixels found no horizontal overflow. No second scoring/critic pass was performed.

## Verification

Before the presentation-only correction batch, `npm run check` passed:
- ESLint.
- TypeScript.
- Isolated Next.js production build.
- **9 Chromium browser scenarios**, covering:
  1. Empty account signup, immediate onboarding, sign-in, and account separation.
  2. Standard/custom software, education descriptions, exact crop dimensions, saved photo captions, and crop-dialog accessibility.
  3. Opt-in showcase and reset, including invalidation of a prior session.
  4. Authentication, unauthorized requests, malformed payloads, origin checks, duplicate slugs, and image limits.
  5. Onboarding persistence, skip/finish, failed saves, and recovery.
  6. Profile/project CRUD and the frozen production view.
  7. Responsive layouts, loaded images, public account navigation, keyboard entry, accessibility, and hydration/runtime console monitoring.
  8. Protection against stale browser drafts overwriting newer saves.
  9. Invalid gallery paths, actual uploads, and the six-image capacity.

Automated accessibility scans found no violations in the tested WCAG A/AA checks. This is not a substitute for a full manual assistive-technology audit.

Fresh read-only checks against the running owner site, signup page, and sign-in page produced **zero captured hydration/runtime browser errors** and no horizontal overflow.

Production dependency audit: **0 reported vulnerabilities**.

Tests used disposable data under .qa on ports 3100/3101. The real installation was neither reset nor replaced with a showcase. Owner content/profile.json, projects.json, and studio.json match the backups made before this change request.

## Remaining feedback — no further iteration

- **Hydration report:** the original mismatch's +/− attribute diff was not supplied and the warning did not recur in the tested clean browser. The client-side onboarding year is now supplied by the server, and the local server was restarted. This does not establish the cause of the original warning. If it recurs, capture the exact attributes and page before applying a targeted fix; no blanket suppression was added.
- **Production log:** requesting a deliberately unpublished project slug returns the required 404, but Next.js also prints an internal NoFallbackError to its server log. Browser flows pass; cleaning up that framework log remains future work.
- **Hosting boundary:** account creation/editing are local features. Hosted Vercel pages are read-only static snapshots; no hosted signup, email verification, or password-recovery service was deployed.
- **Broader coverage:** this run used Chromium. Safari/Firefox and a real Vercel deployment were not tested.

## Visual evidence

Inspected screenshots under .qa/screenshots include:
- register-desktop.png and login-mobile.png.
- crop-mobile.png.
- showcase-about-desktop.png.
- dashboard-375.png.
- owner-final-desktop.png. The correction batch additionally recorded owner-final-375.png and owner-final-1440.png and verified their overflow dimensions.
- The automated suite also captures public/editor pages at 375, 768, and 1440 pixels.

The requested single review cycle is complete. No further critic iteration is running.


## Account autosave and recovery — September 14, 2026 (in progress)

Initial code-based assessment: usability 4, user flow 3, aesthetics 8, clarity 4, layout 8, professional finish 4; mean 5.2/10. Final review pending.

Concrete defects recorded before implementation:
- Sign in through /login in a clean browser after publishing: HostedAccountForm creates an empty IndexedDB draft rather than loading server content; the user starts setup again.
- Edit an unpublished biography or unfinished project, then sign in on another device: only IndexedDB holds the edits, so the account cannot recover them.
- Remove the publishers/{uid}.handle mapping in an isolated fixture while retaining its publishedPortfolios record: /api/publish GET returns null although /p/{handle} remains live. This is a reproducible failure path, not a confirmed diagnosis of the reported live account.
- Open /studio directly with an outdated active-draft pointer: draft selection occurs before Firebase authentication resolves.

The source brief’s original local-file workflow is superseded for /studio by the user’s explicit cloud-autosave request. Legacy owner files and credentials must remain untouched. Login error privacy remains unchanged.
