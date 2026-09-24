# Website test-case catalog

This catalog defines the minimum functional/code baseline handed to the critic. It does not certify design quality. Each ID is present in the executable test title and machine-readable catalog; never renumber an existing ID. Execution status comes from the current run, not this document.

## Running and interpreting the baseline

- Install locked dependencies with `npm ci`, Chromium with `npx playwright install chromium`, and Java 21+ (PATH or `.qa/java/<jdk>/bin/java`). Node 22+ is required.
- Run `npm run check` for harness policy tests, ESLint, TypeScript, isolated production builds and both complete Chromium suites. It exits nonzero for failures, skips, retries, missing catalog cases/evidence, unfinished runs or failed cleanup.
- Use `npm run test:e2e -- --grep ROUTE-002` or `npm run test:firebase -- --grep API-002` for diagnosis. These filtered runs are not the complete acceptance gate. `npm run test:harness` checks the result policy independently.
- Read `.qa/baseline/latest.json`, then that run's `CRITIC-HANDOFF.md` and `summary.json`. The summary includes executed cases, attempts, skips/errors, attachment paths and fresh screenshots. Suite HTML reports, build/server logs and traces stay in the same run directory.
- The complete gate runs serially and exclusively. Do not run two suites/gates against the shared fixtures. Occupied ports are reported, never reused or killed. Required test-server ports: 3100?3103; emulator ports: 8080, 9099, 9199, 4400, 4500, 9150.

## Prerequisites and common procedure

| Code | Prerequisites / setup |
| --- | --- |
| L | Isolated production server at 3100; seeded QA account qa@example.com / qa-password-only; fixtures copied from tests/fixtures. Fresh browser context per test. |
| D | Local development server at 3101, blank disposable accounts and QA admin token. Account/media scenarios run in file order; the owner-reset case also works standalone. |
| F | Production server at 3102; demo-portfolio Auth/Firestore/Storage emulators. Each case clears all three emulator stores, creates its own users and uses fresh browser state. |
| U | Pure validation/data transformation functions and synthetic objects; no owner files or cloud services. |
| E | Export CLI against temporary .qa fixtures; never pass owner content as a mutation target. |

For each case: start through its suite command, establish the listed prerequisite, perform the exercise in order, and assert the expected outcome. The linked test and its stable title provide exact field values, API requests and selectors for reproduction. All rows below are **automated and mandatory**; compound cases deliberately keep a complete user journey together. Browser diagnostics fail on uncaught exceptions and unexpected console errors in the default and additional device contexts (including popups); expected network rejection/offline messages are retained as attachments and checked by the scenario. Uncaught stylesheet errors are failures as well; original fonts are served locally and checked with third-party network access blocked.

## Required automated cases

### tests/accounts-and-media.spec.ts

| ID | Setup | Exercise | Expected result | Automation |
| --- | --- | --- | --- | --- |
| ACCT-001 | D | accounts start empty, onboard immediately, sign in, and isolate content | New accounts contain no inherited projects; session resumes onboarding; another account cannot read/delete their content. | [Test](../tests/accounts-and-media.spec.ts) |
| ACCT-002 | D | software, education descriptions, exact crop, photo caption, and responsive crop dialog | Saved tools and education render in preview; uploaded crop is exactly 50 by 40 pixels; caption persists; crop dialog fits mobile. | [Test](../tests/accounts-and-media.spec.ts) |
| ACCT-003 | D | dev showcase is opt-in and reset clears accounts, projects, and sessions | Only an authorized local owner can open showcase/reset; reset clears disposable accounts, content and invalidates sessions. | [Test](../tests/accounts-and-media.spec.ts) |

### tests/baseline-boundaries.spec.ts

| ID | Setup | Exercise | Expected result | Automation |
| --- | --- | --- | --- | --- |
| BOUND-001 | U | real dates preserve leap years, historical display and timezone-independent values | Valid leap dates normalize consistently; impossible dates fail; historical partial dates and Present remain readable. | [Test](../tests/baseline-boundaries.spec.ts) |
| BOUND-002 | U | project and profile boundaries reject unsafe paths, links, duplicates and invalid ranges | Six unique images and 100-character names pass; excess, duplicates, unsafe URLs/paths and reversed dates fail without mutation. | [Test](../tests/baseline-boundaries.spec.ts) |
| BOUND-003 | U | publication limits, unique identities and image caption mapping preserve their contracts | 3?40-character valid handles and 20 unique projects pass; excess, duplicate identity and multiple featured projects fail; mapping preserves captions and source. | [Test](../tests/baseline-boundaries.spec.ts) |
| BOUND-004 | U | backups reject corruption and missing images while stripping account ownership | Backups remain importable, strip owner/publication identity, and reject malformed JSON, unsupported versions, unsafe links and missing images. | [Test](../tests/baseline-boundaries.spec.ts) |

### tests/baseline-routes.spec.ts

| ID | Setup | Exercise | Expected result | Automation |
| --- | --- | --- | --- | --- |
| ROUTE-001 | L | missing routes and missing portfolios show an accessible recovery path | Unknown routes return 404, explain recovery and link home; automated accessibility checks pass. | [Test](../tests/baseline-routes.spec.ts) |
| ROUTE-002 | L | forged and expired sessions fail while valid sessions use protected cookies | Forged/expired tokens return 401 or login redirect; valid login uses HttpOnly, SameSite=Strict, root-scoped cookie. | [Test](../tests/baseline-routes.spec.ts) |
| ROUTE-003 | L | rejected setup updates preserve all saved content | Invalid step, completion, fields, image counts and foreign origins fail; profile, projects and studio bytes are unchanged. | [Test](../tests/baseline-routes.spec.ts) |
| ROUTE-004 | L | private preview has a usable empty state and accessible responsive saved content | Empty preview offers recovery; saved biography appears privately and passes accessibility/overflow checks at all required widths; keyboard About navigation works. | [Test](../tests/baseline-routes.spec.ts) |
| ROUTE-005 | L | Load the landing page with third-party requests blocked; load each original font style. | All seven font styles load locally without any external request. | [Test](../tests/baseline-routes.spec.ts) |

### tests/browser-studio.spec.ts

| ID | Setup | Exercise | Expected result | Automation |
| --- | --- | --- | --- | --- |
| LOCAL-001 | L | a stale tab cannot overwrite a newer device draft | Stale-tab save warns instead of overwriting a newer device version. | [Test](../tests/browser-studio.spec.ts) |
| LOCAL-002 | L | device draft persists offline, crops locally, previews, and backs up without server writes | Offline changes survive reload, crops appear in preview and downloaded backups; no server mutation is made. | [Test](../tests/browser-studio.spec.ts) |
| LOCAL-003 | L | backup imports preserve unfinished work, reject unsafe data, and studio fits all widths | Incomplete backups restore, unsafe imports fail, project save/discard and all nine sections remain usable at narrow and wide widths. | [Test](../tests/browser-studio.spec.ts) |

### tests/export-portfolio.spec.ts

| ID | Setup | Exercise | Expected result | Automation |
| --- | --- | --- | --- | --- |
| EXPORT-001 | E | export accepts a supported image above the obsolete 5 MB limit and produces an importable backup | A valid image above 5 MiB exports and reimports successfully. | [Test](../tests/export-portfolio.spec.ts) |
| EXPORT-002 | E | export rejects files above 500 MiB and libraries that cannot fit the 768 MiB importer guard before reading them | Oversized files/libraries are rejected before reading their contents; exporter fails with useful guidance. | [Test](../tests/export-portfolio.spec.ts) |

### tests/firebase/account-lifecycle.spec.ts

| ID | Setup | Exercise | Expected result | Automation |
| --- | --- | --- | --- | --- |
| AUTH-001 | F | landing signup starts blank, verifies, publishes, counts creators, and resumes the correct draft | Signup starts blank, preserves guest draft, requires verification to publish, increments real creator count once and resumes the account draft. | [Test](../tests/firebase/account-lifecycle.spec.ts) |
| AUTH-002 | F | hosted auth screenshots, keyboard access, duplicate signup, and verification-email recovery | Auth pages pass accessibility/keyboard/layout checks; duplicate email and failed verification-email sending provide recoverable errors. | [Test](../tests/firebase/account-lifecycle.spec.ts) |
| AUTH-003 | F | cancelled account replacement preserves both drafts and restore asks only once | Cancelling draft replacement preserves both versions; restore confirms exactly once. | [Test](../tests/firebase/account-lifecycle.spec.ts) |
| AUTH-004 | F | account deletion confirms identity, removes all hosted data and this device draft, and isolates others | Wrong password/cancel preserve data; confirmed deletion removes own Auth/Firestore/Storage/device data; retry works and other accounts remain intact. | [Test](../tests/firebase/account-lifecycle.spec.ts) |

### tests/firebase/draft-recovery.spec.ts

| ID | Setup | Exercise | Expected result | Automation |
| --- | --- | --- | --- | --- |
| CLOUD-001 | F | account drafts open when the obsolete active-draft localStorage key throws | Unavailable obsolete storage key cannot prevent opening the account draft. | [Test](../tests/firebase/draft-recovery.spec.ts) |
| CLOUD-002 | F | account autosave resumes unpublished work and images on a new browser and after local storage is cleared | Autosaved unpublished text/images resume on another browser and after clearing local storage. | [Test](../tests/firebase/draft-recovery.spec.ts) |
| CLOUD-003 | F | offline edits retry and divergent devices preserve both versions with an explicit choice | Offline writes retry; divergent devices require a choice and preserve both versions. | [Test](../tests/firebase/draft-recovery.spec.ts) |
| CLOUD-004 | F | published-only accounts recover automatically and failed lookups never create a blank cloud draft | Published-only accounts recover; failed cloud lookup never replaces real data with a blank draft. | [Test](../tests/firebase/draft-recovery.spec.ts) |
| CLOUD-005 | F | legacy device edits migrate and image failure leaves restore untouched | Legacy edits migrate; failed image retrieval leaves the previous draft unchanged. | [Test](../tests/firebase/draft-recovery.spec.ts) |
| CLOUD-006 | F | a replacement production server reads existing cloud drafts without seeding or resetting them | A replacement production process reads the existing draft and revision without reseeding. | [Test](../tests/firebase/draft-recovery.spec.ts) |
| CLOUD-007 | F | opening an old account draft does not silently adopt a newer publication revision | Older private content keeps its own publication revision and never silently adopts newer published content. | [Test](../tests/firebase/draft-recovery.spec.ts) |

### tests/firebase/images-and-drafts.spec.ts

| ID | Setup | Exercise | Expected result | Automation |
| --- | --- | --- | --- | --- |
| MEDIA-001 | F | chunked images cross the old limit, preserve bytes, and enforce ownership and 500 MB boundary | 500 MiB admission boundary is enforced; 9 MiB chunk upload preserves bytes; wrong owner, duplicate chunks and obsolete direct-upload limit fail. | [Test](../tests/firebase/images-and-drafts.spec.ts) |
| MEDIA-002 | F | global image quotas and admission leases bound cross-account resource use | Service storage/daily/admission quotas reject excess requests and reclaim abandoned reservations. | [Test](../tests/firebase/images-and-drafts.spec.ts) |
| MEDIA-003 | F | an upload started before deletion cannot recreate the account's image library | An upload overlapping account deletion cannot recreate deleted image records. | [Test](../tests/firebase/images-and-drafts.spec.ts) |
| MEDIA-004 | F | drafts save incomplete content while cloud images require verification and remain private | Incomplete text drafts save without verification; cloud images need verification and private images are owner-only. | [Test](../tests/firebase/images-and-drafts.spec.ts) |
| MEDIA-005 | F | restore repairs missing and foreign mappings using UID and rejects ambiguous or dangling records | Restore repairs unambiguous ownership mappings; foreign/ambiguous/dangling assets are rejected. | [Test](../tests/firebase/images-and-drafts.spec.ts) |

### tests/firebase/publication-server.spec.ts

| ID | Setup | Exercise | Expected result | Automation |
| --- | --- | --- | --- | --- |
| SERVER-001 | F | URL ownership regression: missing indexes, atomic rename, retries, and released names | Rename and retry preserve URL ownership; missing indexes recover and released names become available. | [Test](../tests/firebase/publication-server.spec.ts) |
| SERVER-002 | F | URL races and deletion retries never take another account's reused name | Concurrent claims and deletion retries never take another account?s reused URL. | [Test](../tests/firebase/publication-server.spec.ts) |
| SERVER-003 | F | simultaneous first publishes keep one website per account | Simultaneous first publications yield one website per account. | [Test](../tests/firebase/publication-server.spec.ts) |
| SERVER-004 | F | partial account deletion cleanup is UID-scoped after another account claims its name | Partial cleanup stays scoped to the deleting UID after a different account reuses its URL. | [Test](../tests/firebase/publication-server.spec.ts) |
| SERVER-005 | F | publication requirements reject missing biography and projects on the server | Server rejects publication without required biography or projects. | [Test](../tests/firebase/publication-server.spec.ts) |

### tests/firebase/publishing-studio.spec.ts

| ID | Setup | Exercise | Expected result | Automation |
| --- | --- | --- | --- | --- |
| PUBLISH-001 | F | draft indicators, actionable publishing errors, automatic project commit, and URL editor | Draft status and actionable errors track edits; publishing commits the open valid project; URL-only rename preserves private content. | [Test](../tests/firebase/publishing-studio.spec.ts) |
| PUBLISH-002 | F | publishing enforces identity, verification, address ownership, revision checks, and database rules | Identity, verification, handle ownership, optimistic revision and database rules prevent unauthorized publishing. | [Test](../tests/firebase/publishing-studio.spec.ts) |
| PUBLISH-003 | F | create locally, publish images, update the same link, restore on another device, and isolate accounts | Images publish and load publicly; private edits remain private until update; same link updates; another device restores without crossing accounts. | [Test](../tests/firebase/publishing-studio.spec.ts) |

### tests/homepage-and-dates.spec.ts

| ID | Setup | Exercise | Expected result | Automation |
| --- | --- | --- | --- | --- |
| HOME-001 | L | biography and homepage content persist, preview together, and can be removed | Biography, tagline and banner save and render in preview; removals persist. | [Test](../tests/homepage-and-dates.spec.ts) |
| HOME-002 | L | shared calendars validate dates, default to today, preserve legacy records, and format every view | Calendar controls choose real dates, use today for new entries, retain historical records and format dates consistently. | [Test](../tests/homepage-and-dates.spec.ts) |
| HOME-003 | L | featured selection replaces, removes, survives edits and deletion; responsive editing and public evidence | Only one project is featured; replacement, deselection, edit and deletion preserve the intended featured state and responsive layouts. | [Test](../tests/homepage-and-dates.spec.ts) |

### tests/landing.spec.ts

| ID | Setup | Exercise | Expected result | Automation |
| --- | --- | --- | --- | --- |
| LAND-001 | L | service homepage, real-count states, redirects, and signup entry | Landing links enter signup; creator counts display zero/singular/plural/unavailable honestly; legacy root routes redirect. | [Test](../tests/landing.spec.ts) |
| LAND-002 | L | landing and unavailable auth remain accessible at all widths | Landing and unavailable-auth screens pass accessibility, image loading, overflow, reduced-motion and keyboard skip-link checks at all widths. | [Test](../tests/landing.spec.ts) |

### tests/portfolio.spec.ts

| ID | Setup | Exercise | Expected result | Automation |
| --- | --- | --- | --- | --- |
| ADMIN-001 | L | authentication protects every editor and API; invalid requests never write | All private editors/APIs reject anonymous access; invalid payloads/origins do not write; logout removes access. | [Test](../tests/portfolio.spec.ts) |
| ADMIN-002 | L | onboarding saves, survives reload, reports failures, skips, and finishes | Wizard autosaves each step, survives reload, allows skipping, finishes to dashboard and retains recovery data after a save failure. | [Test](../tests/portfolio.spec.ts) |
| ADMIN-003 | L | dashboard profile CRUD and project create/edit/delete work; production stays frozen | Education/experience and project CRUD persist; cancelled deletion preserves projects; preview updates while the built public snapshot stays frozen. | [Test](../tests/portfolio.spec.ts) |
| ADMIN-004 | L | responsive pages, navigation, image loading, and accessibility | Public and admin pages have working navigation/images, no overflow, no runtime errors and no automated accessibility violations at required widths. | [Test](../tests/portfolio.spec.ts) |
| ADMIN-005 | L | recovery drafts cannot overwrite newer saved profile content | Old recovery data never overwrites newer saved content; immediate preview flushes valid edits. | [Test](../tests/portfolio.spec.ts) |
| ADMIN-006 | L | image picker rejects bad paths, uploads files, and enforces gallery capacity | Bad image paths fail; valid crop uploads; gallery caps at six and removing an image reopens a slot. | [Test](../tests/portfolio.spec.ts) |

### tests/post-launch.spec.ts

| ID | Setup | Exercise | Expected result | Automation |
| --- | --- | --- | --- | --- |
| RECOVER-001 | L | blocked storage shows recovery guidance instead of crashing studio and preview | Blocked browser storage shows actionable recovery guidance in editor/preview without crashing. | [Test](../tests/post-launch.spec.ts) |
| RECOVER-002 | L | projects precede the complete biography and mobile studio keeps the first field in view | Projects precede the complete biography; the first studio field remains visible on mobile. | [Test](../tests/post-launch.spec.ts) |

### tests/publication-validation.spec.ts

| ID | Setup | Exercise | Expected result | Automation |
| --- | --- | --- | --- | --- |
| VALID-001 | U | publishing issues include all mandatory blanks while empty optional fields stay valid | Required publication blanks all produce issues; empty optional fields remain valid. | [Test](../tests/publication-validation.spec.ts) |
| VALID-002 | U | optional supplied formats and date ranges remain validated; open editor replaces its saved project | Supplied optional values/ranges are validated and the open editor replaces its matching saved project. | [Test](../tests/publication-validation.spec.ts) |
| VALID-003 | U | private feedback survives backups/cloud validation and old backups default to untouched | Feedback metadata survives backup/cloud validation; old backups default to untouched feedback. | [Test](../tests/publication-validation.spec.ts) |
| VALID-004 | U | URL-only revision reconciliation preserves private edits without adopting newer public content | URL revision reconciliation changes publication metadata without replacing private content. | [Test](../tests/publication-validation.spec.ts) |

### tests/requested-fixes.spec.ts

| ID | Setup | Exercise | Expected result | Automation |
| --- | --- | --- | --- | --- |
| STUDIO-001 | L | preview and project errors clear on edits and every navigation path | Correcting fields or changing sections clears transient validation errors on every navigation path. | [Test](../tests/requested-fixes.spec.ts) |
| STUDIO-002 | L | all studio sections and populated controls fit narrow phones through desktop | Populated controls and all nine sections fit 320?1920px; preview and key sections pass accessibility checks. | [Test](../tests/requested-fixes.spec.ts) |
| STUDIO-003 | L | an image above 5 MB opens the cropper and oversized source gets the 500 MB message | Images above 5 MiB open cropping; files above 500 MiB receive the current limit message. | [Test](../tests/requested-fixes.spec.ts) |

### tests/firebase/baseline-api.spec.ts

| ID | Setup | Exercise | Expected result | Automation |
| --- | --- | --- | --- | --- |
| API-001 | F | hosted private endpoints reject anonymous requests without creating records | Every supported private cloud method rejects anonymous access with 401 and creates no publisher or publication records. | [Test](../tests/firebase/baseline-api.spec.ts) |
| API-002 | F | invalid cloud updates preserve the previous draft and its revision | Invalid format/revision/content/JSON fails with 400; stale saves fail with 409; the saved draft and revision remain identical. | [Test](../tests/firebase/baseline-api.spec.ts) |
| API-003 | F | hosted configuration is public-only and legacy file editing stays disabled | Config exposes only browser Firebase fields, uses no-store and demo project; hosted local-file editing is disabled; unpublished URLs recover through 404. | [Test](../tests/firebase/baseline-api.spec.ts) |

## Requirement traceability and evidence

| Product requirement | Required cases |
| --- | --- |
| Original brief: public cards/detail/About/navigation | ADMIN-003?004, HOME-001?003, ROUTE-001, PUBLISH-003 |
| Original brief: protected wizard and immediate saves | ADMIN-001?002, ADMIN-005, ACCT-001, ROUTE-002?003 |
| Original brief: guided CRUD and images | ADMIN-003, ADMIN-006, ACCT-002, BOUND-002 |
| Original brief: local preview and frozen public build | ADMIN-003, LOCAL-002, ROUTE-004 |
| Current service landing and auth | LAND-001?002, AUTH-001?002, API-003 |
| Current device/cloud persistence and recovery | LOCAL-001?003, RECOVER-001, CLOUD-001?007, AUTH-003 |
| Current publication, ownership and deletion | PUBLISH-001?003, SERVER-001?005, AUTH-004, API-001?002 |
| Current media budgets/privacy and backups | MEDIA-001?005, EXPORT-001?002, BOUND-004 |
| Validation, dates, feedback and private/public revisions | BOUND-001?003, VALID-001?004, HOME-002, STUDIO-001, ROUTE-003 |
| Responsive layout, accessibility and keyboard | ADMIN-004, LAND-002, AUTH-002, ROUTE-004, STUDIO-002, RECOVER-002 |

Required fresh screenshots at **375, 768 and 1440px**: landing, public home/About/project, dashboard, hosted signup/login, private preview, published studio and hosted public page. Additional screenshots cover onboarding, project editing, crop dialog and errors. Automated checks assert loading, containment and accessibility; the critic still inspects appearance, interaction quality and task-specific acceptance criteria. No pixel snapshots are auto-approved and no automated aesthetic score is generated.

## Manual and external checks (not claimed by the gate)

| ID | Procedure | Expected outcome | Status |
| --- | --- | --- | --- |
| MANUAL-001 | Inspect representative fresh screenshots and the requested change against its brief. | Clear hierarchy, intentional spacing, readable content and coherent responsive behavior; report six quality scores separately. | Required critic review, once per change set. |
| MANUAL-002 | With a screen reader, navigate landing/auth/editor/public pages and announce validation, dialogs and save status. | Logical reading/focus order and understandable announcements. | Manual; axe is not a complete assistive-technology audit. |
| EXTERNAL-001 | With explicit production authorization, test real verification mail, sign-in, publication and recovery using a disposable account. | Delivery, IAM and deployed persistence work end to end. | Not run by this suite; emulators do not establish production behavior. |
| EXTERNAL-002 | Run core journeys on Firefox, WebKit and physical touch devices. | Equivalent usable behavior. | Outside the mandatory Chromium baseline. |

Coverage means the stated cases and assertions, not proof of every possible input or failure. New features/bug fixes must add or extend a stable case, update both catalogs, and include task-specific assertions before the final critic.
