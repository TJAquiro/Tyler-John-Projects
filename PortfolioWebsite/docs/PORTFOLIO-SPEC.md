# Prompt for Codex: Customizable Design Portfolio Website

## Overview
Build a fully customizable, responsive design portfolio website using **Next.js (App Router) + TypeScript + Tailwind CSS**. The site has two modes:

1. **Admin/Builder Mode** — a protected editing interface where the owner adds and edits all content (profile, jobs, projects) through guided forms.
2. **Public Mode** — the live, deployed site that renders content read-only. Changes made in Admin Mode are only reflected publicly after a redeploy (content lives in version-controlled data files, not a live database).

Do not build a drag-and-drop or layout editor. Page structure and layout are fixed templates — only the *content* within them is editable.

---

## Tech Stack
- Next.js 14+ (App Router), TypeScript
- Tailwind CSS for styling
- Data storage: local JSON files under `/content` (e.g. `content/profile.json`, `content/projects.json`) as the single source of truth. Treat this like a lightweight flat-file CMS — no external database needed.
- Images: store uploaded images in `/public/images/`, referenced by path in the JSON data.
- Simple password-based auth (single owner account, no multi-user system) gating all `/admin` routes, via a session cookie set after login with a password stored in an environment variable.
- Deployable to Vercel with zero extra config.

---

## Data Models

### Profile (`content/profile.json`)
```ts
{
  name: string;
  headshotImage: string;
  biography: string; // rich text or markdown
  education: { institution: string; degree: string; field: string; startYear: string; endYear: string }[];
  tools: string[]; // e.g. ["Figma", "React", "Adobe XD"]
  jobs: {
    company: string;
    position: string;
    description: string;
    startDate: string;
    endDate: string; // or "Present"
  }[];
}
```

### Project (`content/projects.json`)
```ts
{
  id: string;
  title: string;
  thumbnail: string;
  images: string[]; // 1–6 supporting images, enforce this range in the admin form
  date: string;
  description: string;
  technologies: string[];
  link: string; // external project link
  slug: string; // for the dedicated project page URL
}[]
```

---

## Public Site Pages

### Home Page (`/`)
- Responsive grid of project cards, each showing thumbnail + title.
- Clicking a card navigates to that project's dedicated page (`/projects/[slug]`).
- Include simple nav to About page.

### Project Detail Page (`/projects/[slug]`)
- Displays: title, date, full description, technologies used (as tags/chips), image gallery of the 1–6 supporting images, and external link (opens in new tab).
- Include a "back to home" or breadcrumb navigation.

### About Page (`/about`)
- Headshot, biography, education list, tools/software list (e.g. icon or tag grid), and job history (company, position, description, timeframe) in a clean timeline or stacked-card layout.

### Global
- Fully responsive: mobile, tablet, and desktop breakpoints. Test grid/nav collapse behavior at each.
- Clean, minimal, accessible typography and spacing. Consistent design system (color palette, spacing scale, font pairing) applied across all pages.

---

## Admin / Builder Mode

### Onboarding Flow (`/admin/onboarding`)
Model this after a dating-app-style profile creator (like Hinge): a **guided, one-question/section-at-a-time wizard** rather than one long form.

- Step-by-step screens: basic profile info → headshot upload → biography → education (add one or more entries) → tools/software → jobs (add one or more entries) → first project(s).
- Progress indicator showing steps completed.
- Ability to skip a step and fill it in later.
- Each step saves immediately (no losing data if the user leaves mid-flow).
- At the end, show a summary/preview of the full site before "finishing" onboarding.

### Ongoing Editing (`/admin/dashboard`)
Once onboarding is complete, provide a dashboard for ongoing edits:
- List of all projects with quick edit/delete actions, and an "Add Project" button that opens the same style of guided form used in onboarding.
- A profile/about editor section for updating bio, headshot, education, tools, and jobs at any time (add/edit/delete entries).
- Form validation (e.g. enforce 1–6 images per project, required fields).
- Changes write directly to the JSON content files.
- Simple image upload handling (drag-and-drop or file picker) that saves files to `/public/images/` and updates the relevant JSON references.

### Auth
- `/admin/*` routes require login (password set via environment variable).
- Simple login page; session persists via cookie.

---

## User Flow Summary (build to match exactly)
1. Owner visits `/admin` for the first time → guided onboarding wizard (Hinge-style) collects profile + job + education + tools + first project(s).
2. Owner can preview the full site at any point.
3. Owner deploys the site (standard Vercel deploy from the repo).
4. To make further changes, owner logs into `/admin/dashboard`, edits/adds any content, then redeploys to push changes live.
5. Layout/position of page elements is fixed and NOT editable — only content is editable.

---

## Critic Agent / Self-Review Loop
After building the initial version of the site, act as a **critic agent** and evaluate your own output before presenting it as done:

- Review the built site against these criteria: **usability, user flow, aesthetics, clarity, layout, and professional finish.**
- Score each criterion out of 10, then give an overall score out of 10. Anchor the scale like this: a 10 is senior-level, AAA-studio/agency quality — polished, intentional, and portfolio-worthy in its own right. An 8+ is strong, professional, and ready to ship. Below 8 means it has noticeable rough edges, generic/templated feel, weak hierarchy, inconsistent spacing, poor responsiveness, or unclear navigation.
- For any criterion scoring below 8, give specific, actionable feedback — exactly what to change (e.g. "hero section lacks visual hierarchy," "project grid spacing is inconsistent on mobile," "about page timeline is hard to scan").
- Apply the fixes, then re-run the critique.
- Repeat this build → critique → revise loop until the **overall score is 8 or above**.
- Show the final critique summary (scores + resolved feedback) at the end so the outcome is transparent.

---

## Deliverables Expected from Codex
- Full Next.js project scaffold with the structure above.
- Seed/sample data in the JSON content files so the site renders meaningfully out of the box.
- README with setup instructions: installing dependencies, setting the admin password env variable, running locally, and deploying to Vercel.
- Responsive design verified across breakpoints.
- A final critic agent report showing the build → critique → revise loop, ending with an overall score of 8 or above.
