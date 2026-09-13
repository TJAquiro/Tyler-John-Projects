# Design portfolio studio

Live on Firebase: [Portfolio Website](https://portfolio-website--portfolio-website-6b3a5.us-central1.hosted.app/) · [Online studio](https://portfolio-website--portfolio-website-6b3a5.us-central1.hosted.app/studio). See [deployment evidence and limitations](docs/DEPLOYMENT-2026-09-13.md).

## Browser drafts and online publishing

Open **/studio** for the new workflow: create without signing in, save drafts and cropped images on your device, preview privately, download/import backups, then sign in and Publish for a shareable `/p/your-address` link. Further edits stay private until **Publish updates**. Restore your last published version on a new device.

Firebase App Hosting, Authentication, Firestore, and Storage support publishing. Without Firebase configuration the local studio and backups work; the Publish section explains that online publishing is not connected. See [Firebase setup, limits, and verification](docs/FIREBASE-HOSTING.md). Nothing is deployed by installing or running this project.

Your earlier local editor and content remain available at `/admin` on this computer. Export the existing root portfolio with `node scripts/export-portfolio.mjs`, or pass a local account ID to export that account, then import the resulting backup at `/studio`. This copies content/images and never moves credentials or changes the original files. Existing ambiguous dates may need completing before publication.

Run `npm run check` for local regressions and `npm run test:firebase` for the isolated Firebase emulator suite (Java 21+ required).

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

On a fresh copy, copy `.env.example` to `.env.local` and set a long random `SESSION_SECRET`. This computer already has one. `ADMIN_PASSWORD` is no longer used: create an account and choose your own password.

## Accounts and first setup

Visit http://localhost:3000/admin/register. Choose your name, email, portfolio address, and password. Account creation signs you in and opens onboarding immediately. New accounts have no sample projects, tools, jobs, or education.

Each account owns separate content and browser recovery drafts. Use the email and password you chose at `/admin/login`. Passwords are salted and hashed with scrypt; they are never stored as plaintext. These are local accounts on this computer, with no email delivery or hosted password-recovery service.

The first account may optionally copy the existing portfolio on this computer. This preserves the original files and is unchecked by default. Your existing Tyler Aquiro profile and Campaign Website project have been preserved.

Onboarding covers name, headshot, biography, education, tools, experience, first project, and preview. Valid changes save after a short pause and before advancing. Incomplete edits have a browser recovery copy; old drafts cannot silently overwrite a newer saved version. Finish setup to use the dashboard on subsequent sign-ins.

## Editing

- **Profile:** change your name, biography, headshot, education, tools, and experience. Education includes an optional description.
- **Tools:** search a large catalog of common software, filter by category, and add each tool individually. Type a custom name and press Enter to add your own.
- **Photos:** selecting an upload opens a crop editor. Drag or resize the frame, choose an aspect ratio, or set the exact left/top/width/height in pixels. Click **Use this crop** to save. Existing images have a Crop button. PNG/JPG/WebP uploads up to 5 MB are supported; crops are saved as WebP. The original file is not overwritten.
- **Projects:** Add, Edit, or Delete projects. Each needs a title, date, description, unique slug, thumbnail, and 1–6 supporting images. Each supporting photo has an optional description displayed beneath it. Gallery images retain the crop's aspect ratio.
- **Preview:** inspect saved content across the full site. Unsaved recovery drafts do not appear in Preview. Save profile changes explicitly from the dashboard.

Your public portfolio address is `/u/your-handle`, with About and individual project pages underneath it. Private Preview works before deployment. The existing portfolio remains at `/`.

## Dev tools

Run the development server, sign in, and choose **Dev tools** in the studio navigation (`/admin/dev`). These tools are unavailable in production or on Vercel.

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
