# Local drafts and Firebase publishing — initial findings

Source: docs/PORTFOLIO-SPEC.md, amended by the owner's September 10 request for browser-local drafts, explicit publishing, backup/import, and shareable online portfolios. Preserve fixed layouts and existing owner content.

Before implementation:
1. Visit /admin/register: a local server account is required before editing. Registration writes .studio and content files. It cannot support visitors on an ephemeral hosting filesystem.
2. Edit a portfolio: /api/content and /api/upload write to server files, not the visitor's browser. Recovery drafts do not include uploaded image bytes.
3. Complete onboarding: instructions require deploying the repository. There is no Publish action or online published snapshot.
4. Open a newly created /u/handle without rebuilding: static parameters exclude it. Visitors cannot get a working link directly after publishing.
5. Move to another browser or clear browser data: no portable backup/import or restore-from-publication workflow exists.
6. Host outside Vercel: the legacy editing guard only checks VERCEL, allowing filesystem write attempts on other ephemeral hosts.

Initial implementation-readiness scores for this new workflow: usability 4, user flow 2, clarity 4, professional finish 3. Visual scores will be recorded from available screenshot evidence; these are not a final critic pass.

Implementation direction: preserve the current typography, palette, crop tools and fixed public layouts. Add a focused guided local studio, explicit preview/publish, durable IndexedDB drafts and image data, portable backups, and authenticated Firebase snapshot publication. No cloud deployment in this change set. Test with disposable local fixtures and Firebase emulators only.
