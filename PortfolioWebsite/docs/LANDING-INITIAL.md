# Landing page change — initial findings

2026-09-13. Reviewed against PORTFOLIO-SPEC.md and the approved landing-page plan, which supersedes the original owner-at-root routing.

- Open `/`: saved owner profile/projects render instead of introducing the service.
- Inspect the root title/description: global metadata reads owner content, including on service routes.
- Open `/about` or `/projects/<saved-slug>`: root routes expose the default owner portfolio.
- Open `/studio`: hosted account creation is only offered in Publish. There is no account-first entry route.
- No walkthrough, personalization overview, published-creator aggregate, or free-service CTA banner exists.

Initial scores for the requested service journey (self-assessment): usability 5, user flow 4, aesthetics 7, clarity 4, layout 6, professional finish 5. Mean 5.2/10. These assess the missing service journey, not the owner's work.

Preserve content and account files. Test isolated fixtures. Complete implementation checks and screenshot inspection before exactly one final independent review. No deployment.

Implementation screenshot finding before final review: at 375px and 1440px the coral preview note overlapped the last project label. Reserve bottom space in the preview frame and lower the note so example content remains legible.
