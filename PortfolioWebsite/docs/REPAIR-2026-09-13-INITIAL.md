# Firebase post-launch repair: initial findings

The source brief and later changes in `docs/CHANGE-REQUEST.md` require preserving the full biography on both Home and About, all nine setup steps, owner content, and separate public snapshots/device drafts. Firebase publishing is the deployed architecture and is retained.

Initial scores use the deployment review's observed baseline: usability 8.0, user flow 7.8, aesthetics 8.3, clarity 8.0, layout 8.1, professional finish 7.8; mean 8.0. These are the previous independent review's scores, not a new final review.

Concrete defects recorded before revision:

1. **Work discovery:** open the root homepage at 375px. The entire biography precedes projects. Preserve its text but place the biography after the work; correct the `01 projects` singular label. Existing evidence: deployment critic and `HomeView`.
2. **Mobile studio overhead:** open `/studio` at 375px. Tall header, storage notice, vertically stacked step numbers/labels, and backup controls precede the current field. Keep all nine steps visible, compact their spacing, and move optional help/backups below the editing surface on smaller screens.
3. **Root versus published content:** open `/studio` in a fresh browser. A blank draft appears with no explanation of why the populated homepage is not loaded. Explain the separate homepage and `/p/` publishing paths and existing restore/import controls without changing owner data.
4. **Blocked storage crash:** deny `localStorage.getItem` access, then load `/studio` or deny `sessionStorage.getItem` and load `/studio/preview`. The synchronous access occurs outside error handling, leaving a loading screen and uncaught exception. Catch access failures and expose recovery guidance.
5. **Cancelled account replacement claims success:** with an account draft already present, choose Use this device draft and cancel replacement. `switchDraft` returns successfully and the publish panel claims the draft was connected. Restore also confirms twice for an existing draft and can report success after the second confirmation is cancelled. Propagate cancellation and use one restore confirmation.
6. **Draft save races on account switch:** the autosave closure reads the mutable current account key at execution time. A queued old-draft save can target a newly selected account. Capture the namespace when scheduling and serialize the switch after pending saves; regression test account separation.
7. **Cancelled restore / failed storage:** switching the active namespace precedes persistence and can expose unsaved replacement data as the active draft. Persist the replacement before activating it, retaining the current draft on failure.

Verification underway: `npm.cmd run check` (PowerShell blocks npm.ps1, so the equivalent Windows npm.cmd entry point is used). Live browser network access requires sandbox escalation. Production mutations will not be used as test fixtures. Exactly one independent final critic will follow implementation checks and screenshot inspection.
