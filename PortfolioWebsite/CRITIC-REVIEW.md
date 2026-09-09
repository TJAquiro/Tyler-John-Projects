# Independent critic — revision review

Reviewed 2026-09-08. This is the second review checkpoint, after the main implementation revision and before the additional fixes below. The critic inspected source and the generated browser screenshots independently; it did not implement the changes.

## Scores at this checkpoint

| Criterion | Initial | Second review | Evidence |
| --- | ---: | ---: | --- |
| Usability | 4 | 7 | Guided project forms, upload controls, repeatable education/job editors, and a concise project list are substantial improvements; invalid gallery input can still crash editing. |
| User flow | 2 | 7 | First entry, durable steps, finish, dashboard CRUD, and private preview are implemented; stale recovery can overwrite newer edits. |
| Aesthetics | 6, provisional | 7.5 | Screenshots show a consistent restrained palette, typographic hierarchy and composed cards; the desktop hero strands its final period on a separate line. |
| Clarity | 4 | 7.5 | Save errors and local-edit/redeploy instructions are clearer; a rapid jump to Preview can show stale saved content beside a newer local summary. |
| Layout | 6, provisional | 7 | Mobile navigation and forms fit; desktop headline wrapping needs correction. |
| Professional finish | 3 | 6.5 | Auth and validation are much stronger, but data-recovery and invalid-input defects remain sign-off blockers. |
| **Overall** | **4.2** | **7.1** | Mean of the six second-review scores, rounded to one decimal. Further revision required. |

## Confirmed improvements

- `/admin` selects onboarding or dashboard using persistent completion state. Eight wizard sections cover all requested content, with skip/back controls and separate draft-project persistence.
- Education and job entry add/edit/remove controls, project creation/editing/deletion with cancellation, and image gallery counts/previews are present.
- API payloads are validated before a single JSON document is written; atomic rename avoids truncated files. Duplicate slugs, invalid URLs and 0/>6 gallery images are rejected.
- Authentication requires both configured secrets, verifies signed expiring cookies, guards admin pages and content APIs, and uses 303 redirects after form posts.
- Public pages explicitly use static generation; unknown project slugs cannot be generated dynamically. Authenticated private preview uses the same templates with current saved content.
- User identity is reflected in metadata, biography supports safe Markdown, empty optional sections are handled, and the existing owner content is preserved.
- Rendered screenshots reviewed: home desktop/mobile, About tablet, project mobile, dashboard desktop/mobile, onboarding mobile, and project creation tablet. These show a coherent visual system rather than a collection of unstyled forms.

## Changes required before final sign-off

1. **Prevent stale recovery from overwriting newer content.** `useLocalDraft` restores a screen-specific browser copy without comparing it to current server content, while `Onboarding` autosaves on mount. Reproduction: save name A during onboarding, save name B from the dashboard, revisit onboarding; stored A can silently replace B. Track the recovery copy's server baseline/version or invalidate/synchronize recovery after successful saves. Add a regression check across these two editors.
2. **Validate supporting-image paths before rendering them.** In the reviewed `ProjectFields`, typing `abc` then clicking “Add image path” inserts it into the gallery, where Next/Image rejects the relative URL. The invalid path is persisted in recovery and can crash the editor again on reload. Reject it inline before insertion and guard restored malformed entries so the user can correct them.
3. **Merge pending uploads safely.** ImagePicker success callbacks capture the entire older profile/project object. Other tabs and input fields remain usable while a request is pending, so a successful upload can replace more recent edits with the captured snapshot. Merge only the uploaded path into latest state or temporarily disable relevant editing/navigation, including simultaneous upload controls.
4. **Flush valid edits when opening the full preview.** Sidebar Preview uses the skip transition, which omits the profile save and cancels its pending debounce. Step 7 performs no write but can label progress saved. The local summary can then disagree with the full-site preview. Save valid changes before preview navigation, or make the unsaved state explicit and avoid success language.
5. **Fix the desktop headline's orphan punctuation.** `.qa/screenshots/home-1440.png` shows the period after “experiences” stranded on a fourth line. Keep the word and punctuation together and adjust responsive type size/grid width to fit the available column.
6. **Capture screenshots after lazy images load.** The first mobile-home capture contains blank lower thumbnails. This may be a capture-timing issue; scroll through the page and wait for image readiness before recapturing. Do not mark these as broken assets without testing after scroll.

## Verification limits at this checkpoint

The automated suite source covers authenticated CRUD, onboarding persistence/errors, home-page production freeze, unpublished slug 404, three viewport widths and axe checks. The latest full run had not been reviewed as passing at the time of this checkpoint. Missing-configuration/tampered-cookie behavior, existing About/detail freeze, actual image upload success, populated editor states and rebuilt publication deserve explicit checks or a clearly recorded source-only verification limit. A passing default screenshot route is not proof of every wizard state.

Final acceptance should record the further fixes, test results and fresh visual evidence. This checkpoint does not grant an 8+ score.
