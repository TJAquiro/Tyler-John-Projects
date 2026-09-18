# Firebase cleanup audit

## Test-suite organization

The Firebase Playwright suite remains a single serial run because every scenario uses the same Auth, Firestore, and Storage emulator processes. `playwright.firebase.config.ts` keeps one worker, disables full parallelism explicitly, and limits discovery to `tests/firebase/**/*.spec.ts`. The spec also declares serial mode so a future config change cannot silently parallelize stateful scenarios.

The 24 scenarios (23 preserved plus the active-draft storage regression) are defined directly in five focused behavior specs:

- publication ownership and server validation;
- publishing studio workflow;
- hosted authentication and account lifecycle;
- image uploads and draft API behavior;
- cloud draft recovery and conflicts.

Each spec configures serial mode explicitly and owns its tests, imports, and behavior-group description. The former `tests/firebase/scenarios.ts` registration monolith was removed; test bodies, assertions, and ordering within every group remain unchanged.

`tests/firebase/fixtures.ts` owns emulator setup, per-test Auth and Firestore clearing, account creation, sign-in, publication payloads, completed-project setup, and draft payloads. Moving the reset into an automatic Playwright fixture makes isolation apply before every scenario without relying on a hook declared midway through the old monolith. Storage is intentionally not globally cleared, matching the prior harness; generated Auth UIDs keep objects isolated, while deletion scenarios verify their own cleanup.

All original tests and their assertions remain present. Direct negative checks remain direct HTTP or emulator calls, including invalid and unverified authentication, conflicting ownership and revisions, inaccessible Firestore, stolen image mappings, malformed and oversized uploads, chunk ownership and replay, quota/admission limits, private draft-image access, invalid draft versions and links, account-deletion races, ambiguous publication recovery, and failed cloud lookups. The only obsolete expectation changed is the removed `portfolio-active-draft` value: signup now asserts that key stays absent. A new regression makes all reads and writes of that key throw and proves the authenticated cloud draft still opens.

## Shared image-upload extraction audit

The extracted implementation in `lib/image-upload-routes.ts` was compared with the four route implementations in the parent of `a8aebcf` (publish direct/chunked and draft direct/chunked). No contract divergence was found, so no upload source change was made during this audit.

| Contract | Before extraction | Shared implementation |
| --- | --- | --- |
| Authentication | `publishUser(request)` for direct and chunked writes | Same call in both generated handlers |
| Error policy | `publishFailure` for published assets; `draftFailure` for private assets | Explicit policy selected by `createImageUploadPolicy` |
| Firestore namespace | `assets` or `draftAssets` below the authenticated publisher | Explicit `assetCollection` policy |
| Storage namespace | `portfolios/{uid}/` or `portfolios/{uid}/draft/` | Explicit `storageRoot` policy, including chunk and final paths |
| Direct upload | 8 MiB streamed limit, signature detection, SHA-256 ID, reservation, generation precondition, cleanup | Preserved in `createDirectImageUploadHandler` |
| Chunk start | JSON body limit, integer size validation, 500 MB cap, random upload ID, reservation | Preserved in generated `POST` |
| Chunk write | Ownership/session transaction, expiry and lease checks, part bounds, replay rejection, exact byte length, first-part signature validation | Preserved in generated `PUT` |
| Chunk finish | Complete-part checks in Firestore and Storage metadata, signature recheck, sequential streaming, chunk deletion, reservation completion | Preserved in generated `PATCH` |
| Cancellation | Expired-session allowance, chunk/final object cleanup, reservation release | Preserved in generated `DELETE` |
| Failure cleanup | Clears `writingUntil`; direct failures delete objects and release reservations | Preserved in `finally` and direct-upload catch paths |
| Response shapes | `{ id }`, `{ uploaded: index }`, and `{ cancelled: true }` | Unchanged |
| Draft image reads | Separate authenticated GET with private cache headers and no download token | Remains in `app/api/draft/image/route.ts`, outside the shared write handlers |

The route modules retain `runtime = "nodejs"` and `maxDuration = 300`. The extraction therefore changes ownership of duplicated implementation only; public endpoints, status mapping, messages, stored metadata, and private-read behavior remain compatible.
