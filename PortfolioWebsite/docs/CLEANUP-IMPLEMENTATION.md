# Codebase cleanup implementation

## Initial audit findings

The cleanup started from commit `a8aebcf`, after the browser-studio session and image-upload route extraction. Owner content and credentials are outside this change set; baseline hashes were captured before edits and all mutation tests use the isolated `.qa/content` fixtures.

- `components/SiteHeader.tsx` and `components/ProjectCard.tsx` had no imports or dynamic consumers. Each appeared only in its own declaration file. `FeedbackMessage` was likewise declared but never used; field feedback uses `useDraftFeedback` directly.
- Several declarations were exported even though every reference was in the declaring module: `ImagePicker`, `PublicHeader`, `studioSections`, `AccountDraftResult`, `publicationDraft`, `imageHash`, `DraftContent`, `PortfolioListing`, and `defaultStudio`. Framework route exports and genuinely shared declarations remain public.
- Reproduction from the pre-refactor finding: open `/studio`, start an unfinished project, then use the project section's bottom forward control. It could leave the editor without an explicit Save or Discard decision. Commit `a8aebcf` already hides that forward control while `projectDraft` exists, leaving Save and Discard as the two actions; the behavior had no regression coverage. Non-linear sidebar navigation remains available because publishing intentionally validates and commits a complete open project editor, while incomplete editors surface field-level publication errors.
- Reproduction: open a private preview for a signed-in draft. Its banner said “Only saved on this device” even though signed-in text drafts can be saved to the account. The copy described one storage state as universal.
- `portfolio-active-draft` was an obsolete `localStorage` pointer. Authentication already selects the account namespace in `useBrowserStudioSession`; the only production writes/reads left were the login redirect and account-deletion cleanup. The independent `sessionStorage` key `portfolio-preview-key` is still required to select the draft shown in Preview.
- Existing browser coverage restored unfinished project data after reload but then navigated directly to Publish, encoding the bypass instead of detecting it. It also did not exercise this editor error at 320 px.
- The blocked-storage regression replaced `Storage.prototype.getItem`, but the studio draft now persists through IndexedDB and preview alone reads its selection from session storage. The setup could therefore pass without reproducing a failed studio draft store.
- Reproduction from the local DevTools trace: navigate to `/admin/dev` while its JavaScript bundle is still loading, immediately type the admin token, then select “Open showcase profile.” The server-rendered input accepted and displayed the token before React attached `onChange`, leaving component state empty and the action permanently disabled after hydration.

## Disposition and verification

- Removed the three proven-unused declarations and their two empty component modules. The nine declarations with module-local usage are now private. No framework convention export or cross-module API was removed.
- Removed the obsolete active-draft pointer from account entry and account deletion. Account selection remains driven by Firebase authentication; deletion still clears the independent preview-session key.
- Preserved the complete-open-project publishing path. The project editor's forward action stays unavailable until Save or Discard, while sidebar navigation can still reach publication validation and automatically commit a complete editor. Browser coverage now locks down the Save/Discard choice and the re-enabled forward action after discard.
- Reworded the preview banner to describe both guest and account drafts accurately: “Private preview · Unpublished draft.”
- Added browser assertions for the corrected preview copy and project navigation behavior, plus a 320 px screenshot at `.qa/screenshots/local-project-save-discard-320.png`. Firebase coverage injects failures for every `portfolio-active-draft` storage method during sign-in and verifies that authentication still opens the exact account draft.
- Updated the blocked-storage regression to make `IDBFactory.open` fail for the studio and session-storage reads fail for preview, so both recovery messages are exercised against their actual storage dependencies.
- Kept local DevTools operator inputs and actions disabled until client hydration completes. This prevents pre-hydration token or reset-confirmation edits from appearing in the DOM without reaching the controlled React state.

Verification in the integrated workspace:

- `npm run lint`: passed.
- `npm run typecheck`: passed after the parallel Firebase test reorganization was integrated.
- Browser and Firebase suites: pending the coordinated final runs; they use only isolated fixtures and emulators.
