# Independent critic — initial review

Reviewed 2026-09-08 against the original portfolio specification supplied by the owner. This review was performed by a separate critic agent that did not edit the implementation. Evidence at this stage is source inspection; visual scores are provisional until browser screenshots and interaction checks are available.

## Initial scores

| Criterion | Score / 10 | Reason |
| --- | ---: | --- |
| Usability | 4 | Basic editors exist, but key content cannot be edited and save failures are poorly explained. |
| User flow | 2 | First entry bypasses onboarding; onboarding cannot reliably save, resume, or finish. |
| Aesthetics | 6, provisional | A consistent serif/sans palette and sample artwork establish a direction; screenshots are still required to judge polish. |
| Clarity | 4 | False save confirmations, developer-facing image paths, stale identity metadata, and ambiguous publishing language undermine confidence. |
| Layout | 6, provisional | Public templates contain responsive classes, but a long dashboard and unverified narrow-screen navigation need improvement. |
| Professional finish | 3 | Missing CRUD, weak validation, missing authentication configuration fail-open paths, and incomplete preview/publish handling prevent sign-off. |
| **Overall** | **4.2** | Arithmetic mean of the six criteria, rounded to one decimal. **Not ready to ship.** |

A score of 8 or above requires direct evidence that the core workflows work and that the rendered site is coherent at mobile, tablet, and desktop widths. Strong visuals cannot compensate for a data-loss or authentication blocker.

## Blocking findings and required changes

1. **Onboarding reports saves that failed.** `app/admin/onboarding/page.tsx` sends both an incomplete profile and a blank project on each step. `app/api/content/route.ts` rejects these with 400, but the client always displays “Saved” and advances. Save each step using validation appropriate to a draft, check the response, show actionable errors, and preserve progress across reloads. A failed save must never be labeled successful.
2. **The required first-time journey is incomplete.** `/admin` always redirects to the dashboard. The wizard omits separate headshot upload, education and jobs, never persists its current step, starts from blank values instead of existing user content, and has no completion state. Add the missing sections, genuine skip/resume behavior, a final complete preview, and explicit finishing. Preserve the owner's existing Tyler Aquiro profile and biography.
3. **Ongoing editing lacks core CRUD.** The dashboard can only edit existing projects. There is no Add Project or Delete Project action, and no add/edit/delete controls for education or jobs. Add guided project creation, a compact project list with clear actions, and repeatable education/job entry editors.
4. **Comma-separated editing breaks normal typing.** Tools, technologies and supporting image inputs split, trim, and rejoin on every keystroke. A comma entered at the end is immediately removed, preventing natural list entry. Keep raw input text until commit or use removable tags with a separate entry field.
5. **Validation is incomplete and can leave partial writes.** The API trusts a TypeScript cast of arbitrary JSON, permits duplicate/invalid slugs, omits several required checks, can throw on wrong types, and can write the profile before discovering an invalid project. Validate request shape and all fields before writing anything; enforce unique safe IDs/slugs, required project fields and 1–6 supporting images in the UI and API. Return field-specific errors and handle malformed JSON.
6. **Authentication does not fail closed with missing configuration.** Middleware derives a token from the public fallback `unconfigured-session-secret`; API authentication derives one from an empty secret. Login validation is stricter, but forged cookies can bypass the missing-config lock. Refuse authentication unless both configured values exist. Use a 303 redirect after login/logout POST, and verify all editor, preview and write endpoints enforce authentication.
7. **Draft preview and public publishing need an explicit contract.** The current preview is a link to `/`, with no isolated draft preview. Prove that a production build remains unchanged after local JSON writes and that newly created slugs cannot appear without a rebuild. Give owners an authenticated preview of their latest content. Hosted Vercel functions cannot persist edits to the Git repository: make local editing/commit/redeploy instructions explicit and prevent hosted writes from falsely promising persistence.

## Polish findings

- The document title and description hardcode “Mara Ellison”; the home page hardcodes a 2024 designer descriptor. Derive identity and editable copy from content and remove stale hardcoded dates.
- Biography content is rendered in a plain paragraph, collapsing the owner's line breaks; the specification calls for rich text or Markdown. Render a safe Markdown subset or provide equivalent formatting.
- Supporting image management requires typing filesystem paths. Provide upload, preview, remove and count controls with clear 1–6 limits. Handle network/upload errors and disable duplicate submission while pending.
- Give forms programmatic labels, visible keyboard focus, accessible status/error announcements, and route-specific navigation cues. Verify disabled controls, empty collections, missing optional external links and long content.
- Review actual screenshots at approximately 390, 768 and 1440 pixels, including home, About, project detail, wizard and dashboard. Check overflow, navigation wrapping, card geometry, heading hierarchy, dense forms and image loading. Source-level responsive classes alone are not verification.

## Acceptance checks for the second review

1. Logged-out requests cannot read draft content or write JSON/uploads; missing configuration cannot authenticate a forged cookie. Correct login persists; incorrect login stays on a clear error state; logout clears access.
2. First entry opens onboarding. All requested sections are present, Skip works, changes and current step survive reload, and rejected saves remain visible without advancing. Finish records completion and subsequent `/admin` visits reach the dashboard.
3. Add/edit/delete one project and one education/job entry. Reload and inspect JSON to confirm each operation. Canceling deletion keeps the item; confirmed deletion removes only the intended item.
4. Upload an image and verify its preview, saved file and JSON reference. Reject non-image/oversize input. Enforce 1–6 supporting images and preserve unrelated images when replacing the thumbnail.
5. Validate malformed JSON, wrong field types, whitespace-only required text, unsafe/duplicate slugs, unsafe links and invalid gallery counts. Failed updates do not modify any content files.
6. Save draft edits, inspect the authenticated preview, and verify the existing production home/About/detail pages and slug set remain unchanged until rebuild. Rebuild and verify publication.
7. Confirm the existing owner's content remains intact, formatted biography renders, current identity appears in titles, and optional/empty content produces a composed page.
8. Run type checking, lint and a production build. Perform actual browser flow checks and inspect screenshot evidence across three widths. Record what was tested and any limitations honestly.

No final score or claim of 8+ is justified until these fixes and checks have been reviewed.
