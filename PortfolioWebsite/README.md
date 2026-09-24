# Portfolio studio

The homepage at `/` introduces the free portfolio service. `/signup` and `/login` use Firebase Authentication and open an account-scoped device draft at `/studio`. New accounts start blank; returning accounts resume their saved draft. Email verification is required to sync images to cloud storage and publish, not to edit or save text-only drafts. Direct guest editing at `/studio` remains available.

The landing page uses clearly labeled showcase content. Saved owner files and credentials are preserved but no longer render at `/`, `/about`, or `/projects/[slug]`. Individual portfolios remain under `/p/[handle]` (hosted) and `/u/[handle]` (legacy snapshots).

`GET /api/public-stats` exposes only the published-creator count, cached for five minutes and invalidated on a first publication. Missing Firebase configuration or a failed query returns an unavailable state, never a fabricated count. The current publishing rules allow one portfolio per creator.

# Design portfolio studio

Live on Firebase: [Portfolio Website](https://portfolio-website--portfolio-website-6b3a5.us-central1.hosted.app/) · [Online studio](https://portfolio-website--portfolio-website-6b3a5.us-central1.hosted.app/studio). See [deployment evidence and limitations](docs/DEPLOYMENT-2026-09-13.md).

## Account drafts and online publishing

Open **/studio** to create a portfolio, preview privately, and Publish a shareable `/p/your-address` link. Signed-in text drafts and unfinished edits save automatically to your account; images join cloud sync after email verification and otherwise remain in the device draft. Further edits stay private until **Publish updates**. Guest drafts and offline changes remain on the device until synced; wait for **Saved to your account** before clearing browser data. Conflicting device versions are preserved for an explicit choice. Backups and manual restore remain available.

Firebase App Hosting, Authentication, Firestore, and Storage support publishing. Without Firebase configuration the local studio and backups work; the Publish section explains that online publishing is not connected. See [Firebase setup, limits, and verification](docs/FIREBASE-HOSTING.md). Nothing is deployed by installing or running this project.

Your earlier local editor and content remain available at `/admin` on this computer. Export the existing root portfolio with `node scripts/export-portfolio.mjs`, or pass a local account ID to export that account, then import the resulting backup at `/studio`. This copies content/images and never moves credentials or changes the original files. Existing ambiguous dates may need completing before publication.

Run `npm run check` for the complete acceptance baseline: harness checks, lint, TypeScript, isolated production builds, local Chromium regressions, and the Firebase emulator suite (Java 21+ required). Use `npm run test:e2e` and `npm run test:firebase` for individual suites, or append `-- --grep CASE-ID` to diagnose one case. Do not run suites concurrently: they share disposable fixture locations.

The [test-case catalog](docs/TEST-CASES.md) maps the website requirements to stable automated case IDs and separate manual/external checks. Each complete run writes `.qa/baseline/latest.json`, pointing to an immutable run directory with `summary.json`, `CRITIC-HANDOFF.md`, fresh screenshots, suite HTML/JSON reports, failure traces, and build/server logs. The gate exits nonzero for missing, skipped, retried, failed or unfinished required cases, missing screenshot evidence, failed process cleanup, or changed owner files. It never deploys or contacts production Firebase for mutations. Local servers use `.qa` data and Firebase uses the `demo-portfolio` emulators.

The original DM Sans, DM Mono, and Playfair Display fonts are served from `public/fonts`, with their SIL Open Font Licenses and source manifest included. Rendering no longer depends on Google Fonts being reachable.

The critic reads that handoff to establish basic functionality and code acceptability, then independently judges how well the task was completed. Automation does not assign visual-quality scores. Exactly one final critic pass follows implementation checks and screenshot inspection. Occupied QA ports are reported instead of reused or killed; a stale `.qa/baseline/running.lock` may be removed only after verifying the prior run stopped.

The sections below document the preserved **legacy local editor**. Its repository-deployment publishing instructions do not apply to the new browser studio.

Next.js 15, React, TypeScript, and Tailwind CSS. Each local account has its own portfolio and guided content editor. Public portfolio pages are static snapshots generated when you deploy.

## Required software (Linux, macOS and Windows)

Use Node.js 24 LTS (Node 22+ is supported) and its bundled npm. Install the locked dependencies with `npm ci`, then install the test browser with `npx playwright install chromium`. Next.js, React, TypeScript, Tailwind, the Firebase SDKs and Firebase CLI are project dependencies; separate global installations are unnecessary. The package manifest explicitly permits the four reviewed dependency setup scripts used by npm 12, including the Firebase CLI’s native `re2` module. No browser extensions, database drivers or special GPU drivers are required. Editor extensions are optional.

Firebase emulator tests also need Java 21+. Install a JDK on your PATH, or extract a portable JDK into `.qa/java/<jdk-folder>/` so its `bin/java` (Linux/macOS) or `bin/java.exe` (Windows) is present. The test launcher detects it automatically. This Linux workspace has a portable Temurin 21 runtime there. On Linux, if Chromium reports missing system libraries, use `npx playwright install-deps chromium` with your system administrator's privileges.

```sh
npm ci
npx playwright install chromium
npm run check
npm run test:firebase
npm run dev -- --hostname 127.0.0.1
```

Open http://localhost:3000/studio. The Firebase launch steps and required project settings are in [FIREBASE-HOSTING.md](docs/FIREBASE-HOSTING.md). Java and Chromium are development/test requirements; App Hosting supplies the hosted Node runtime.

## Run on Windows

Node.js 22+ is required; Node.js 24 LTS is recommended.

```powershell
cd "C:\Users\tjaqu\Desktop\PortfolioWebsite"
npm.cmd install
npm.cmd run dev -- --hostname 127.0.0.1
```

Open http://localhost:3000. Leave the terminal open; press Ctrl+C to stop. Use `npm` instead of `npm.cmd` on macOS/Linux.

On a fresh copy, copy `.env.example` to `.env.local` and set separate long random values for `SESSION_SECRET` and `PORTFOLIO_ADMIN_TOKEN`. The admin token is required for local account creation and installation-wide development actions; it must not be reused as an account password or committed. `ADMIN_PASSWORD` is no longer used.

## Accounts and first setup

Visit http://localhost:3000/admin/register. Choose your name, email, portfolio address, password, and enter the configured local admin token. Account creation signs you in and opens onboarding immediately. New accounts have no sample projects, tools, jobs, or education.

Each account owns separate content and browser recovery drafts. Use the email and password you chose at `/admin/login`. Passwords are salted and hashed with scrypt; they are never stored as plaintext. These are local accounts on this computer, with no email delivery or hosted password-recovery service.

The first account may optionally copy the existing portfolio on this computer. This preserves the original files and is unchecked by default. Your existing Tyler Aquiro profile and Campaign Website project have been preserved.

Onboarding covers name, headshot, biography, education, tools, experience, first project, and preview. Valid changes save after a short pause and before advancing. Incomplete edits have a browser recovery copy; old drafts cannot silently overwrite a newer saved version. Finish setup to use the dashboard on subsequent sign-ins.

## Editing

- **Profile:** change your name, biography, headshot, education, tools, and experience. Education includes an optional description.
- **Tools:** search a large catalog of common software, filter by category, and add each tool individually. Type a custom name and press Enter to add your own.
- **Photos:** selecting an upload opens a crop editor. Drag or resize the frame, choose an aspect ratio, or set the exact left/top/width/height in pixels. Click **Use this crop** to save. Existing images have a Crop button. PNG/JPG/WebP uploads up to 500 MB are supported; crops are saved as WebP. The original file is not overwritten.
- **Projects:** Add, Edit, or Delete projects. Each needs a title, date, description, unique slug, thumbnail, and 1–6 supporting images. Each supporting photo has an optional description displayed beneath it. Gallery images retain the crop's aspect ratio.
- **Preview:** inspect saved content across the full site. Unsaved recovery drafts do not appear in Preview. Save profile changes explicitly from the dashboard.

Your public portfolio address is `/u/your-handle`, with About and individual project pages underneath it. Private Preview works before deployment. The original root content remains preserved in `content/profile.json` and `content/projects.json`; the service landing page now owns `/`.

## Dev tools

Run the development server on loopback, sign in as the installation owner, and choose **Dev tools** in the studio navigation (`/admin/dev`). Enter `PORTFOLIO_ADMIN_TOKEN` before an action. These tools reject missing origins, non-owner accounts, and non-local requests, and are unavailable in production or on Vercel.

- **Open showcase profile:** opens a separate fictional Alex Morgan account with a complete profile, education, experience, software, and three illustrated projects with photo captions. It does not overwrite your own account and never loads automatically.
- **Reset all accounts and projects:** type `RESET ALL` to clear every local account, profile, project, and setup record, including the original portfolio. All sessions become invalid. Uploaded image files are retained. The tool creates a data backup under `.local-backups/` first.

## Storage and publishing

- `.studio/accounts.json`: private login records, excluded from Git.
- `content/portfolios/<account-id>/`: each account's profile.json, projects.json, and studio.json.
- `content/portfolios/index.json`: public handle-to-portfolio mapping, without emails or password hashes.
- `content/profile.json` and `content/projects.json`: original root portfolio.
- `public/images/`: image assets.

Commit content and images, push to GitHub, and import into Vercel. It detects Next.js automatically. Editing and account creation happen locally: Vercel's deployment filesystem is not persistent storage. Public content changes and newly created portfolio addresses appear after a new build/deployment. Never commit `.env.local`, `.studio/`, or backup folders.

To test a production build locally, stop the dev server and run:

```powershell
npm.cmd run build
npm.cmd start -- --hostname 127.0.0.1
```

## Editing your homepage and dates

- **Dashboard → Biography:** save the biography shared in full by Home and About. Open **Preview** to see saved local edits. Your public portfolio URL remains a snapshot until you rebuild/deploy.
- **Dashboard → Homepage:** edit the headline, upload/crop a banner, or remove it. Clearing the tagline uses your name as the page heading.
- **Your projects → Set as featured project:** choose one prominent homepage project with its description. Choosing another replaces it; **Remove featured project** returns it to the regular grid. Deleting the featured project clears the feature automatically.
- **Dates:** project, education, and experience dates share a calendar and MM/DD/YYYY input. New entries default to today. Exact dates display as **Jan 12, 2026**, including the year on project cards. Use **Ongoing (Present)** for an unfinished course or current role. Invalid dates and reversed ranges cannot be saved.
- Existing partial or ambiguous dates are preserved so unrelated edits do not corrupt your records. The editor identifies these entries; select a complete date to standardize them. A stored year alone cannot supply an accurate month/day.
- Profile and project tools use the same searchable catalog, categories, custom entries, and removable chips.

## Verification

```powershell
npx.cmd playwright install chromium
npm.cmd run check
```

Checks include lint, TypeScript, a production build, and Chromium browser scenarios for account isolation, empty signup, onboarding, editing, validation, crops, captions, dev reset, responsive layout, accessibility, and hydration console errors. Tests use disposable accounts/content under `.qa/` on ports 3100/3101 and do not modify the owner's content. Screenshots are in `.qa/screenshots/`.

`AGENTS.md` specifies exactly one final critic/review pass for this change set. `CRITIC-REPORT.md` records the actual evidence, scores, and remaining feedback.

### Account deletion and upload limits

Hosted accounts can permanently delete themselves from **Studio → Publish → Delete account**. The confirmation identifies the signed-in email, requires the current password, and offers **Keep my account**. The server derives ownership from the verified token and requires authentication within the last five minutes. It removes the published pages, the account's complete Storage prefix (including unused/partial images), publisher subcollections, and Firebase Auth identity. Other accounts and the repository owner's content are untouched. Active image writes delay deletion; a deletion marker blocks publishing while cleanup is pending. Partial failures tell the user to retry, rather than claiming success.

The device draft is removed from IndexedDB after server deletion; a local tombstone prevents another open tab from saving it again. Downloaded backups and offline copies on other devices cannot be erased remotely. Published images now use `private, no-store` caching; copies cached before this change may survive until their original cache expiry.

PNG/JPG/WebP source images and saved crops accept up to **500 MiB** (shown as 500 MB in the UI). Publishing uses 8 MiB chunks above that size, with authenticated, account-scoped staging and streamed assembly, so large images do not require a single large hosting request. The hosted library/published-image budget is 1 GiB; the local serialized draft budget is 768 MiB to allow base64 overhead. Device memory, canvas decoding limits, and available browser storage still apply. Large JSON backups also depend on the browser's string/JSON limits.

Validation/action feedback clears when the user edits a form or changes sections/steps. Unsaved-storage warnings remain until a save succeeds. Verification-email guidance includes checking spam.
