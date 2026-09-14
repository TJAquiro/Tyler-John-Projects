# September 14 fixes — initial findings

Compared the current implementation to docs/PORTFOLIO-SPEC.md: responsive public/editor templates, recoverable guided editing, preserved owner content, and explicit publishing remain required. The current Firebase account flow supersedes the brief's original single-owner authentication for hosted users.

Concrete defects recorded before edits:

1. `/studio`: leave Your name empty, press Preview portfolio, then type a name or press Continue. The old preview error remains because `update` does not clear it; only sidebar navigation clears it. Project substeps, publishing credentials/address fields, and signup corrections have similar stale error state.
2. Narrow studio layouts: 320px viewport, open Education/Experience and add an entry, or open project images. Fieldsets keep their browser min-content minimum, date buttons share narrow rows, and setup labels use three columns even where the labels do not fit. Existing tests only check document overflow at 375px and above, missing squeezed/clipped inner controls.
3. Choose a PNG/JPG/WebP over 5 MiB: ImagePicker rejects it before cropping. The crop save, local upload route, publishing route, backup parser, and aggregate quotas impose separate caps that also need reconciliation.
4. Sign in under Publish: no account deletion action or authenticated account deletion API exists; users cannot remove their hosted identity, website, and uploaded media.
5. Sign up or resend verification: inbox guidance omits the spam folder.

Initial scores use the previous final review as the baseline, not an additional critic pass: usability 8.3, user flow 8.1, aesthetics 8.3, clarity 8.2, layout 8.3, professional finish 8.0; mean 8.2. Exactly one independent final critic pass will follow implementation checks and screenshot inspection.

Owner content hashes captured in `.qa/owner-hashes-2026-09-14.json`. All mutation verification will use isolated fixtures and demo Firebase emulators.
