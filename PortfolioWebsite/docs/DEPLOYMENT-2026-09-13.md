# Firebase deployment — September 13, 2026

Target confirmed by owner: Portfolio Website (`portfolio-website-6b3a5`). Blaze usage accepted; billing verified enabled. No redesign or content migration requested.

## Initial findings

- `firebase projects:list` confirmed the target; `apps:list` and `apphosting:backends:list` returned no resources. There was no online app to review or score initially (all initial visual scores: N/A).
- `firebase.json` had emulator/rules configuration only: deploying App Hosting had no backend target. Added an explicit local-source backend and upload exclusions.
- Auth configuration returned CONFIGURATION_NOT_FOUND, Firestore was disabled, and no Storage bucket existed. Provisioned these services in us-central1 and configured email/password auth, a 10-character password policy, enumeration protection and the hosting domain.
- Git status failed with an empty Git object and bad HEAD. Local-source deployment avoids relying on Git history; Git history has not been repaired or replaced.

## Configuration and preservation

Backend: `portfolio-website`, runtime `nodejs24`, region `us-central1`. Existing zero-minimum/two-maximum instance settings retained. Default Firestore and Storage use the same region. Existing Firebase-managed backend IAM grants include the required Auth read, Firestore, and Storage object permissions; no extra project-wide grants added manually.

Runtime Firebase web identifiers are in apphosting.yaml. Backend uses Application Default Credentials. An archive preflight verified no .env, local credential store, test data, build cache, node_modules, Git history or backup directory was included. Root public profile and projects are included. Original content and credentials are not edited.

Rules deny direct Firestore/Storage client access. Storage CORS permits GET/HEAD from the hosted origin. Actual owner emails, verification links, and password resets are not sent during automated checks; mutation testing uses isolated fixtures/emulators.

## Verified rollout

Live: https://portfolio-website--portfolio-website-6b3a5.us-central1.hosted.app/

Studio: https://portfolio-website--portfolio-website-6b3a5.us-central1.hosted.app/studio

Build `build-2026-09-13-001` is READY; matching rollout is SUCCEEDED. Cloud build completed successfully. Runtime limits verified: 1 CPU, 512 MiB, concurrency 40, maximum 2 instances, minimum 0 (default/omitted in API response).

`npm run check`: lint, TypeScript, isolated production build and all 15 Chromium scenarios passed in 8.2 minutes. The existing NoFallbackError diagnostic appeared for an intentionally unpublished project route; its test passed.

Live GET checks: root/about/studio and `/projects/campaign-website` return 200; nonexistent `/p/` address returns 404; unauthenticated publish read returns 401; direct Firestore/Storage listing returns 403. `/admin` redirects to `/studio`; publish sign-in is visible; `/api/firebase-config` reports enabled with the correct project.

Live browser evidence: `.qa/live-verification.json`, `.qa/deployment-evidence.json`, and `.qa/screenshots/live-{home,about,studio}-{375,768,1440}.png`, plus `live-publish-1440.png`. All nine page/viewport combinations have no horizontal overflow, no broken images, and no WCAG A/AA axe violations. No captured page runtime errors.

The Firebase emulator suite passed both scenarios, including image publication, republishing, cross-device restore, identity/ownership checks and direct database denial. The single independent final review is complete: **8.0/10** overall. See [the full scores and unresolved findings](CRITIC-DEPLOYMENT-2026-09-13.md) and the current section of CRITIC-REPORT.md. No second review iteration was performed. Owner email delivery and a real-account publish/restore are not claimed as verified. No test account or fixture content is created in the production project.
