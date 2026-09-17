# Cleanup inventory

## Scope and evidence

This is the read-only inventory for the cleanup request, recorded on 2026-09-17. It compares the repository with `docs/PORTFOLIO-SPEC.md` and the later approved changes in `docs/CHANGE-REQUEST.md`, `docs/LOCAL-PUBLISH-INITIAL.md`, `docs/FIREBASE-HOSTING.md`, `docs/LANDING-INITIAL.md`, `docs/LANDING-EVIDENCE.md`, and `docs/URL-DRAFT-2026-09-15-INITIAL.md`.

Baseline `HEAD` was `a8aebcf` (`Full code clean-up`). That commit already extracted the browser-studio session and upload route behavior into `components/useBrowserStudioSession.ts`, `components/BrowserStudioPanels.tsx`, and `lib/image-upload-routes.ts`. During this inventory, parallel cleanup work was present in the working tree for studio behavior/components and Firebase test organization. Those files were inspected but not modified here. No test, build, server, package-install, owner-data mutation, credential operation, or deployment was run by this inventory task.

Owner content remains protected. The tracked content set comprises the root profile/projects/studio files, the portfolio manifest, and two account portfolio directories (10 JSON files total). Their baseline SHA-256 values were captured during inspection; representative root hashes are `703ac25c...960b` (`content/profile.json`), `1933f286...3801a` (`content/projects.json`), and `a2c59ada...75f46` (`content/studio.json`). `.studio/`, `.env*`, `.qa/`, `.local-backups/`, build outputs, Firebase state, service-account files, reports, and TypeScript build metadata are excluded by `.gitignore` and/or the App Hosting archive ignore list. The Firebase web identifiers in `apphosting.yaml` are client configuration, while no service-account key is tracked.

## Route inventory

Next.js App Router files are runtime entry points even when no source file imports them. The inventory therefore treats every `page.tsx`, `route.ts`, `layout.tsx`, `error.tsx`, and `not-found.tsx` as framework-referenced.

| Surface | Evidence and supported purpose | Disposition |
| --- | --- | --- |
| `/` | `app/page.tsx` renders the service landing page. `docs/LANDING-EVIDENCE.md` explicitly supersedes the original owner-at-root route. | Retain. |
| `/login`, `/signup`, `/studio`, `/studio/preview` | Hosted Firebase account entry, browser studio, and session-keyed private preview. Linked from landing/public/studio components and covered by browser/Firebase tests. | Retain. |
| `/p/[handle]/[[...page]]` | Dynamic Firebase publication route. The optional catch-all serves home, About, and project pages; `dynamic = "force-dynamic"` is intentional because publications change without a build. | Retain. |
| `/u/[handle]/[[...page]]` | Legacy local snapshot route. `generateStaticParams`, `dynamic = "force-static"`, and `dynamicParams = false` freeze manifest-backed pages at build time as documented. | Retain for compatibility. |
| `/about`, `/projects/[slug]` | Permanent redirects to `/`, introduced by the approved landing-page change so root owner content is not exposed. Direct imports are not expected for route entries. | Retain as compatibility redirects. |
| `/admin/**` | Local-only legacy account/editor/onboarding/preview/dev routes. `app/admin/layout.tsx` redirects hosted use to `/studio`; local docs and README still support this editor and export path. | Retain. Do not collapse into the hosted studio while local workflows remain supported. |
| `/api/auth/**`, `/api/content`, `/api/studio`, `/api/upload`, `/api/dev` | Local editor authentication, JSON persistence, uploads, and operator tools. Forms/components call them dynamically by URL. | Retain. |
| `/api/firebase-config`, `/api/account`, `/api/draft`, `/api/draft/image{,/chunks}`, `/api/publish`, `/api/publish/image{,/chunks}`, `/api/public-stats` | Hosted authentication, account deletion, draft sync, image transfer, publication, and landing statistics. Calls are split across client helpers and components; route-file import counts are not usage evidence. | Retain. |
| `/api/qa-image/[file]` | Only reached through the conditional `next.config.mjs` rewrite when `PORTFOLIO_UPLOAD_DIR` is set. QA scripts set that variable, keeping fixture uploads out of `public/images`. | Retain as test infrastructure. |
| `app/layout.tsx`, `app/not-found.tsx`, `app/p/error.tsx` | Next.js special files discovered by convention. | Retain. |

No duplicate public route implementation was found: `components/PublicPages.tsx` supplies the fixed templates shared by hosted publications, legacy snapshots, and both preview modes.

## Application modules and exports

Import/reference scans covered `app`, `components`, `lib`, `scripts`, and `tests`, including relative imports and `@/` aliases.

| Finding | Evidence | Disposition |
| --- | --- | --- |
| `SiteHeader` is unused | `components/SiteHeader.tsx` had no importer; current public navigation is implemented inside `PublicPages.tsx`. | Confirmed removal candidate; deletion is already present in the parallel cleanup diff. |
| `ProjectCard` is unused | `components/ProjectCard.tsx` had no importer; current cards are rendered in `HomeView`. | Confirmed removal candidate; deletion is already present in the parallel cleanup diff. |
| `FeedbackMessage` is unused | Only its declaration existed; fields consume `useDraftFeedback` directly. | Confirmed removal candidate; removal is already present in the parallel cleanup diff. |
| Several exports are module-only | `studioSections`, `PublicHeader`, `AccountDraftResult`, `publicationDraft`, `imageHash`, `DraftContent`, `PortfolioListing`, and `defaultStudio` have no external consumer. | Make private; these changes are already present in the parallel cleanup diff. Keep genuinely cross-module functions/types exported. |
| Studio/upload extraction is real, not dead indirection | `BrowserStudio.tsx` imports the session hook and focused panels. Four upload route files construct explicit `draft` or `publish` policies from `lib/image-upload-routes.ts`; draft reads remain separate in `app/api/draft/image/route.ts`. | Retain. Policy preserves distinct collections, storage namespaces, error mapping, authentication, admission, quota/reservation, chunk lifecycle, cleanup, and responses. |
| Remaining modules have consumers | Every other component and `lib/*.ts` module had at least one static consumer, with route/config conventions considered separately. | Retain. No further module deletion is proven. |

## Styles

`app/globals.css` and `app/admin/admin.css` are both loaded by layouts. All named application selectors found in them had a consumer in JSX, including dynamically composed active states such as `.setup-step.active`, `.section-tab.active`, and `.wizard-tab.active`. `ReactCrop` is supplied by the third-party component stylesheet rather than a local JSX class. Tailwind scans both `app/**/*` and `components/**/*`; arbitrary values and responsive variants therefore cannot be assessed by a plain CSS selector search.

Disposition: retain the current styles. No unused local selector is proven. If markup is changed later, rerun a production Tailwind build before removing selectors because generated utility presence depends on source scanning.

## Assets

Assets were checked against tracked root/account content, showcase data, fixture data, application source, tests, docs, and scripts. The SVG showcase set is used by `lib/showcase.ts`, disposable fixtures, and the opt-in showcase account. The UUID JPG/WebP files referenced by the root and account JSON files are owner content and must remain intact.

Two tracked files have no current repository reference:

- `public/images/a07ab7b6-433c-450d-b9d9-285133ff639a.jpg` (unique bytes).
- `public/images/a624ef02-c277-4643-8d8c-992ffe3debea.webp` (byte-identical to the referenced `66a9fdd0-2382-4d09-9a71-b92516d2e7ee.webp`).

Disposition: retain both. UUID image names are created dynamically, and these files originated with owner-uploaded content. Absence from the current JSON snapshots does not prove that external backups or intended recovery material no longer need them. Deletion requires explicit owner provenance/approval or a repository-supported asset manifest/garbage-collection process. The browser studio's “Remove unused draft images” applies only to the active IndexedDB draft and is not evidence for deleting tracked owner files.

## Dependencies

Every direct dependency has a supported consumer:

- `next`, `react`, and `react-dom`: App Router/runtime and portal-based dialogs.
- `firebase` and `firebase-admin`: browser authentication plus server Firestore/Storage/Auth operations.
- `react-image-crop`: crop UI; `react-markdown`: biography rendering.
- `@playwright/test` and `@axe-core/playwright`: browser and accessibility suites.
- `firebase-tools`: isolated emulator launcher.
- `eslint`, `eslint-config-next`, and `typescript`: lint/type scripts.
- `tailwindcss`, `postcss`, and `autoprefixer`: Tailwind/PostCSS configuration.
- React/Node type packages: TypeScript compilation.

The `postcss` and `uuid` overrides and npm `allowScripts` entries are package-resolution/install policy rather than importable modules. Their removal cannot be justified without a clean lockfile install and dependency-tree review, which was intentionally not performed while `npm ci` was already underway. Disposition: remove no dependency in this change set.

## Configuration and scripts

| Item | Evidence | Disposition |
| --- | --- | --- |
| `next.config.mjs` | Custom build directories isolate QA builds; the upload rewrite is activated only by QA scripts; unoptimized images support local and dynamically mapped sources. | Retain. |
| `tsconfig.json` | Includes each isolated Next-generated types directory used by the scripts. The `@/*` alias is widely used. | Retain. |
| `eslint.config.mjs` | Ignores generated/test evidence and extends Next/TypeScript rules. | Retain. |
| `firebase.json`, Firestore/Storage rules, `.firebaserc`, `apphosting.yaml` | Define the deployed backend, deny direct client database/storage access, and configure isolated emulators. | Retain. Do not treat public Firebase web identifiers as credentials or alter the verified project target during cleanup. |
| `scripts/qa-server.mjs`, `qa-dev-server.mjs`, `firebase-qa-server.mjs`, `firebase-emulators.mjs` | Referenced by Playwright configs; isolate content, accounts, uploads, build folders, Firebase config, and emulator project. | Retain. The Firebase spec reorganization is owned by the parallel test task. |
| `scripts/export-portfolio.mjs` | README explicitly invokes it for migration from root/local portfolios. It dynamically reads current JSON image references and produces an importable browser backup. | Retain, but fix the stale limits below. |

## Demonstrated defects and unfinished cleanup

### 1. Export utility rejects supported content

Reproduction by source inspection:

1. Add or retain a valid PNG/JPG/WebP between 5 MiB and the supported 500 MiB maximum in a local/root portfolio.
2. Run the documented `node scripts/export-portfolio.mjs [account-id]` command.
3. The script throws `Image exceeds 5 MB`, even though the local editor, browser studio, hosted direct/chunk upload APIs, README, and Firebase hosting documentation support up to 500 MiB.

The script also rejected a backup over 100 MB while browser import supports `MAX_DRAFT_BYTES` (768 MiB). Disposition implemented: it now preflights the 500 MiB per-image limit from file metadata, refuses a base64 library that cannot fit through the 768 MiB browser import guard before reading those files, and checks the exact UTF-8 byte length of the final JSON. `tests/export-portfolio.spec.ts` exercises a greater-than-5-MiB successful round trip through `parseBackup`, the 500 MiB file boundary, and the aggregate importer boundary using isolated temporary fixtures.

### 2. Current README contradicts the approved root-route behavior

Reproduction by inspection:

1. Read README's opening: it correctly says saved owner files no longer render at `/`, `/about`, or `/projects/[slug]`.
2. Read the local editor section: it later says “The existing portfolio remains at `/`.”
3. Open `app/page.tsx`, `app/about/page.tsx`, and `app/projects/[slug]/page.tsx`: root is the service landing page and the latter two permanently redirect to it, matching `docs/LANDING-EVIDENCE.md`.

Disposition: corrected the later README sentence to describe the preserved content files and the service landing page at `/`. Historical evidence documents remain historical; old deployment claims were not rewritten as if they describe the current landing-page revision.

### 3. Obsolete active-draft pointer

At `HEAD`, `HostedAccountForm` wrote `localStorage["portfolio-active-draft"]` after Firebase authentication, and `deleteDraft` probed it. Startup selection in `useBrowserStudioSession` already waits for Firebase auth and chooses the authenticated UID directly; preview uses the separate session key `portfolio-preview-key`. No runtime read selected a draft from the local pointer.

Reproduction of the defect recorded in the cleanup request: allow IndexedDB draft installation to succeed, then make the pointer write throw. Sign-in reports failure even though durable draft state already succeeded, creating a partial-commit UX.

Disposition: remove the pointer write/probe and update tests that asserted it. The parallel studio cleanup currently contains this change. Preserve the preview session key and IndexedDB failure guidance.

### 4. Unfinished project navigation can bypass the intended decision

At `HEAD`, the bottom forward control is hidden while `projectDraft` exists. This directly prevents the reported forward-control bypass. Sidebar navigation remains intentionally non-linear so creators can move among sections; publication validation preserves unfinished work and directs the creator back to it.

Disposition: retain the existing non-linear sidebar flow and the hidden bottom forward control. No additional navigation guard is required for the reported defect; focused coverage should assert that `Continue to publishing` is absent until the project is saved or discarded.

### 5. Ambiguous preview/storage copy

At `HEAD`, preview says “Only saved on this device” even for signed-in cloud-synced drafts, while the studio's fallback status reads “Saved on this device—sync pending.” The first statement is false after account save and the second is missing spacing around the dash.

Disposition: use state-accurate copy such as “Unpublished draft” in preview and “Saved on this device — sync pending” in the studio. The parallel component cleanup has revised the meaning; final implementation should also normalize punctuation/spacing consistently.

### 6. Requested removals and test split are in progress

The concurrent working tree deletes `SiteHeader.tsx` and `ProjectCard.tsx`, removes `FeedbackMessage`, privatizes module-only declarations, adds the project-navigation guard, removes the active pointer, and reorganizes the monolithic Firebase spec into behavior files with shared helpers. These dispositions match this inventory. They require the integrated checks and the single final independent critic pass specified by the task owner; this inventory does not claim they pass.

## No-action findings

- The original brief's single password owner, flat-file-only publishing, and owner-at-root routes were intentionally superseded by later approved local multi-account, browser-draft, Firebase publication, and landing-page changes. Their newer implementations are not unfinished behavior merely because they differ from `PORTFOLIO-SPEC.md`.
- The public page templates keep fixed structure and editable content only; no drag/drop layout editor was introduced.
- Public HTTP routes, snapshot shape, backup version, storage paths, Firebase rules, and upload response shape should remain compatible during cleanup.
- Known historical limitations such as Chromium-only automated coverage, expected missing-static-route Next diagnostics, lack of full 500 MiB browser decode stress testing, and production email/IAM checks are verification boundaries, not dead code.

## Implementation handoff

After integrating the parallel changes, the remaining actionable cleanup from this inventory is:

1. Verify the implemented export-limit fix with `tests/export-portfolio.spec.ts`; it uses temporary fixtures and does not read or mutate owner content.
2. Confirm the final diff contains no removal of the two unreferenced owner-uploaded assets and no dependency/config deletion unsupported by this evidence.
3. Run the requested checks sequentially after installation completes, inspect fresh screenshots, verify the protected-file hashes, and reserve the required final scoring/review for the independent critic.
