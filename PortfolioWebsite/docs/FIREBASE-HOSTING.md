# Local drafts and Firebase publishing

The new studio is at `/studio`. Anyone can build a portfolio without an account. Drafts, unfinished project edits, and cropped images save in IndexedDB on that browser/device. No draft content is sent to Firebase while editing. Download/import backups include image bytes. Closing an unsaved page triggers the browser's leave warning; a storage failure is shown rather than claiming a save succeeded.

Preview shows the saved draft. Publish requires a Firebase email/password account and verified email. Each account owns one permanent address at `/p/<handle>`. Later edits remain private until Publish updates. Restore downloads the last published snapshot and all its images before replacing a device draft. Separate local namespaces keep signed-in accounts' drafts apart; browser-local storage is not encrypted and should not be treated as private from other people using that same browser profile.

The original root portfolio, legacy `/u/<handle>` build snapshots, local accounts, content files and credentials remain intact. On this PC, `/admin` still opens the legacy editor. Hosted `/admin` redirects to the new studio, and legacy filesystem writes are disabled. No automatic migration of local passwords is attempted. Use a new Firebase publishing account.

## Connect Firebase when ready to host

This change prepares the app; it does not create a Firebase project, enable billing, or deploy.

1. Create a Firebase project on the Blaze plan and register a Web App. Enable Email/Password in Authentication. Configure the password policy to require at least 10 characters, enable email enumeration protection, and customize verification and password-reset emails. Add the final hosting hostname to Authentication's authorized domains.
2. Create the default Cloud Firestore database and a Cloud Storage bucket in compatible nearby regions. Copy the Web App's project ID, API key, app ID, auth domain, and actual bucket name into the environment settings below. Firebase web app identifiers are public; service-account keys are private.
3. Create a Firebase **App Hosting** backend for this existing Next.js repository. Use Node 22+ and the existing npm build. Basic Firebase Hosting's static-only deployment cannot run these API routes or render newly published portfolios. App Hosting runs this server code without rewriting the app as a static SPA.
4. Set these backend runtime environment variables (see `.env.example`): `FIREBASE_PROJECT_ID`, `FIREBASE_STORAGE_BUCKET`, `FIREBASE_WEB_API_KEY`, `FIREBASE_WEB_APP_ID`, `FIREBASE_AUTH_DOMAIN`. `apphosting.yaml` disables the legacy editor and defaults to zero minimum instances and two maximum instances. Browser Firebase configuration comes from `/api/firebase-config`, so it does not need a build-time secret.
5. The App Hosting backend service account uses Application Default Credentials. Give it the permissions required for Firebase Authentication user reads/token verification, Cloud Datastore User for Firestore transactions, and Storage Object Admin restricted to this portfolio bucket. Confirm existing App Hosting grants before adding permissions. Do not place a service-account key in the repository or the browser.
6. Deploy the included closed client rules with `npx firebase deploy --only firestore:rules,storage --project YOUR_PROJECT_ID`. All writes and private account reads go through authenticated Next.js API routes; these rules deliberately deny direct client access. Public images are delivered through unguessable download-token URLs, while public text is server-rendered. Configure Storage CORS for GET from the hosting domain if the bucket configuration does not already allow it, then verify restore and canvas cropping from the live origin.
7. After deployment, test a new signup, verification email, password reset, image publication, shared link in a signed-out browser, republishing, and restoring from another device. Check direct Firestore/Storage client access remains denied. Existing local fixture tests do not establish live IAM, email delivery, DNS, or billing configuration.

Official references: [App Hosting configuration](https://firebase.google.com/docs/app-hosting/configure), [Admin SDK setup](https://firebase.google.com/docs/admin/setup), [Storage billing requirements](https://firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024).

## Costs and capacity

App Hosting and Cloud Storage require Blaze and a linked billing account. No-cost allowances may cover a small beta; this is not a promise of zero cost. Set billing alerts and supported service spending controls in Firebase/Google Cloud. Maximum instances is a scaling limit, not a spending cap.

Application limits: 20 projects per portfolio; 1–6 supporting images per project; 5 MB per image; 40 MB of referenced images in one publication; 100 MB per account's online image library; 200 new/retried image uploads per account per day; at least 10 seconds between successful publications. Text snapshots are bounded to stay below the Firestore document limit. Browser backups/image libraries are capped at approximately 100 MB of encoded data, additionally subject to browser quotas.

Uploads use content hashes to avoid duplicating the same image for the same account. Old or interrupted-publication uploads count toward the online library limit; they are retained so a failed update cannot break the live portfolio. An operator can remove unreferenced Storage objects and their `publishers/<uid>/assets` records and correct `storageBytes`, using a backup and checking the current published `assets` first. Automated online garbage collection is not included. The editor can remove unused device draft images. Budget for total traffic and image delivery across all users, not per user alone.

## Verification and local development

- `npm run check`: lint, types, production build, existing local-account regression tests and browser-draft tests. All content/credential mutations use `.qa`; uploads use `.qa/uploads`.
- `npm run test:firebase`: starts Auth, Firestore and Storage emulators using only `demo-portfolio`, runs the app at port 3102, then tests publication, ownership, concurrency, validation, image delivery and cross-device recovery. Requires Java 21+, the Firebase CLI dev dependency and an initial emulator download. The launcher also recognizes a portable Java runtime under `.qa/java/*/bin`. No production project or credentials are used.
- Test ports: 3100, 3101, 3102, 8080, 9099, 9199. Close a previous test run before starting another. New screenshots use `.qa/screenshots/local-*` and `.qa/screenshots/firebase-*`.
- For local use against an actual development Firebase project, configure `.env.local` and Application Default Credentials or `GOOGLE_APPLICATION_CREDENTIALS` pointing to a file outside this repo. Never use your live project for mutation tests.

Firestore documents: `publishers/<uid>` stores address, quota counters and last publication time; its `assets/<sha256>` records track owned uploads. `publishedPortfolios/<handle>` contains the current snapshot, resolved asset URLs, owner UID, revision and publication timestamp. API responses and public HTML omit the owner UID and account email. Address reservation and revision checks occur in a single transaction. Failed uploads or transactions leave the existing published snapshot intact. Private drafts, recovery data and passwords are never stored in these documents.

The editor remains usable offline after it has loaded. Cold-loading the application while offline is not supported; this is not an installable/offline-cached PWA.
