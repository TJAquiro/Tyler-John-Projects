# Initial findings — September 15, 2026

Owner content and credentials are excluded from mutations. Baseline content hashes: `.qa/url-draft-owner-before.json`.

## Reproduced before application revisions

`npm.cmd run test:firebase -- --grep 'baseline investigation|publishing enforces identity'`: both emulator scenarios passed. Log: `.qa/url-draft-baseline.log`.

- Publish a portfolio, delete only its `publishers/{uid}` index in the isolated emulator, then publish a different handle with revision zero. The second request returned **200** and the UID owned **two published documents**. This violates the approved one-website rule.
- Two different accounts publishing the same handle concurrently returned **200 and 409**. Normal collision ownership is protected.
- Delete the first account using the account API, recreate the same email (different UID), and publish the freed name: **200**, with new ownership. No normal deleted-name reuse failure reproduced.

## Source inspection reproductions

- Open a case study with technologies: Scope & tools renders after the entire gallery rather than under the title.
- Publish once and open Publish: no URL-edit control; POST rejects changed handles.
- Open Add project, leave it unfinished, then publish: a generic finish/discard message without field links or navigation indicators. Even a complete unsaved editor is blocked.
- Focus and leave required fields blank: no section-level missing-field indicators.
- Current publication validation allows empty biography and zero projects, contrary to the newly approved requirements.

Initial numeric baseline is inherited from the preceding report, not an additional critic pass: usability 8.3, user flow 8.1, aesthetics 8.3, clarity 8.2, layout 8.3, professional finish 8.0; mean 8.2. Exactly one independent final review will assess this change set after checks.
