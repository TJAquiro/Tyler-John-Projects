# Post-launch repair evidence

Scope: repair the existing Firebase-backed portfolio while preserving owner content, credentials, and the later requirement to show the complete biography on both Home and About. The owner declined Firebase login on this computer and asked to continue testing. **No repair has been deployed.** No production account, email, publication, or restore mutation was performed.

## Findings and changes

Initial defects and their reproduction steps were recorded in `REPAIR-2026-09-13-INITIAL.md` before revision. The previous independent deployment review provides the initial score baseline, 8.0 overall; a single new final independent review will assess this change set after testing.

- Projects now precede the full biography, and the singular count is `01 project`.
- All nine setup buttons remain directly available. Compact mobile buttons and secondary backup controls after the editor keep the current field visible. The draft notice explains that `/p/` portfolios and the root homepage are separate; backup help explains import and restore.
- Studio and preview handle unavailable browser storage with actionable error messages. Failed initialization does not permit autosaving an empty replacement or claiming the draft was saved.
- Cancelled account-draft replacement propagates cancellation instead of reporting success. Restore confirms once and reports success only after completing the replacement.
- Autosaves capture their account namespace. Account switching cancels pending timers, drains queued saves, checks the destination revision, saves before activating, and advances the revision timestamp. Failed persistence retains the currently active draft.

## Live read-only baseline

Origin: https://portfolio-website--portfolio-website-6b3a5.us-central1.hosted.app

`.qa/repair-before-live.json` records home, About, Campaign Website, and studio at **375, 768, and 1440px**. All twelve route/viewport combinations returned 200 with no image failures, horizontal overflow, captured page exceptions, or settled WCAG A/AA axe violations. The harness waited for fonts, images, and entry animations. An initial scan during the fade-in reported transient contrast violations; the settled scan has none, so no unsupported color defect/fix is claimed.

Publishing reached the actual sign-in form, captured in `.qa/screenshots/repair-before-publish-1440.png`. `/api/firebase-config` returned 200, unauthenticated `/api/publish` returned 401, a nonexistent `/p/` portfolio returned 404, and `/admin` redirected to `/studio`.

## Repaired owner-content preview

Only `profile.json` and `projects.json` were copied into `.qa/repair-owner-content` for a read-only development preview with local editing disabled. `.qa/repair-after-live.json` records the same public pages and studio at all three widths: HTTP 200, no broken images, no overflow, no axe violations, no captured page errors. Owner-preview screenshots include the Next.js development indicator; that indicator is absent from production.

The project grid begins at approximately **428px versus 1574px** on mobile, **402px versus 1221px** on tablet, and **528px versus 1123px** on desktop. These are positions of the Projects section at the top of the page, measured using the same owner content. The `inputTop` entries in the audit JSON select the first DOM input, which is the hidden backup picker, and must not be used as field-position evidence. The browser regression separately asserts that the actual name field and all nine navigation buttons are within the mobile viewport.

Screenshots: `.qa/screenshots/repair-{before,after}-{home,about,project,studio}-{375,768,1440}.png`; settled publishing: `repair-before-publish-1440.png`; isolated production studio: `local-studio-{375,768,1440}.png`; Firebase emulator states: `firebase-{public,published}-{375,768,1440}.png`.

## Preservation and limits

All **10 owner content files** match the SHA-256 hashes taken at the beginning of this repair (`.qa/repair-owner-hashes.json`). Credentials have not been changed. Test mutations use `.qa` and `demo-portfolio` emulators.

Production email delivery, real-account publish/restore, cloud runtime IAM, and deployment of these repairs remain unverified. The existing isolated test for a deliberately unpublished legacy project still logs Next.js `NoFallbackError` while returning the required 404. Chromium and automated accessibility checks do not establish Safari/Firefox compatibility or a complete manual assistive-technology audit.

## Test results

`npm.cmd run check`: lint, TypeScript, isolated production build, and **17 browser scenarios passed (2.7m)**. Log: `.qa/repair-final-check.log`. This includes blocked-storage handling and viewport/work-order regressions in addition to the original 15 scenarios.

`npm.cmd run test:firebase`: isolated production build and **3 scenarios passed (55.7s)**. Log: `.qa/repair-final-firebase.log`. Verified identity/email-verification enforcement, address ownership and revisions, closed direct-access rules, image publication and updates, cross-device restoration, cancelled replacement preserving account and guest drafts, and exactly one successful restore confirmation. Firebase Admin emitted a metadata lookup warning in the emulator environment; requests and assertions passed. No production login was required or used.

Both commands returned exit code 0. The required single independent final critic is documented separately in `REPAIR-2026-09-13-CRITIC.md` and summarized in `../CRITIC-REPORT.md`.

Early expanded runs exposed two test locator mistakes (Next's route-announcer also has role alert; required-field label text includes an asterisk). The test locators were corrected to scope to the main region and select the email textbox by accessible name. These were test-harness failures, not hidden application regressions.
