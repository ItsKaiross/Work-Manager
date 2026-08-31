# Work Manager New User Guide

## Purpose

This onboarding plan helps a new user move from creating an account to managing a complete job-search workflow. Follow the sections in order the first time; afterward, use the daily and weekly routines as checklists.

## Recommended first session

Allow about 10–15 minutes for initial setup.

### 1. Create an account or sign in

1. Open Work Manager.
2. New users should select **Sign up**, enter an email address, and create a password of at least eight characters.
3. Returning users can sign in with their email and password. If Google sign-in is configured, they can also choose **Continue with Google**.
4. After authentication, Work Manager opens the **Dashboard**.

If a session expires, sign in again. Use **Log out** at the bottom of the navigation menu when using a shared device.

### 2. Learn the navigation

The sidebar is the main way to move around the site:

- **Dashboard** — view job-search totals, pipeline progress, recent activity, application sources, and items that need follow-up.
- **Applications** — search, filter, update, select, or delete tracked applications.
- **Add Application** — import a job posting and save it as an application.
- **Resume & Success Rate** — upload a resume, review extracted information, generate job-search ideas, and monitor match performance.
- **Settings** — switch between light and dark mode.
- **Admin Panel** — available only to administrators.

On a phone or narrow screen, open the sidebar with the menu button in the upper-left corner.

### 3. Upload a resume first

Uploading a resume before adding jobs gives Work Manager the information it needs for match scores and personalized AI features.

1. Open **Resume & Success Rate**.
2. Under **Upload Resume**, choose a PDF, DOC, DOCX, or TXT file.
3. Select **Upload Resume** and wait for parsing to finish.
4. Review the extracted skills, experience, and education under **Resume Details**.
5. If several resumes exist, use **View Resume History** to inspect them and note which one is marked **Active**.

After applications have been added, this page also shows success rate, average match, top skills, and recommendations. Selecting **Generate Job Suggestions** produces role keywords that can be opened on supported job sites.

### 4. Add the first application

1. Open **Add Application**.
2. Paste the public URL of a job posting and select **Extract**.
3. Review the extracted position, company, location, source, and other available details. Correct the editable fields when extraction is incomplete or inaccurate.
4. Select **Save Application**.

For better resume matching, summaries, interview preparation, and cover letters, use a posting with a complete job description. If extraction fails, check that the URL is reachable and still displays the posting, then try again.

### 5. Review and organize applications

Open **Applications** to manage the full list.

- Search by company, position, or location.
- Filter by application status: **Saved**, **Applied**, **Interviewing**, **Offer**, **Rejected**, or **Withdrawn**.
- Filter by work category and applied-date range.
- Select a card to open its full details.
- Use a card’s status menu to move to any status, or its arrow to advance through the active pipeline quickly.
- Use selection mode for bulk deletion. Review the selected cards carefully because deletion removes their tracked records.
- Select **Recalculate Matches** after uploading a newer resume to refresh all resume-to-job scores.

Match badges are a prioritization aid: green indicates 70% or higher, yellow indicates 50–69%, and red indicates below 50%. A low score does not necessarily mean a user should skip the role; review the actual requirements and transferable experience.

### 6. Use an application detail page

Select an application card to:

1. Review the job details, original posting link, description, notes, source, salary, currency, and applied date when available.
2. Change the application’s status as the hiring process progresses.
3. Generate a shorter AI job summary when a long description is present.
4. Select **Generate Suggestions** under **Interview Preparation Suggestions** for technical, company, behavioral, skills, and interviewer-question guidance.
5. Create a **Custom Cover Letter** when an active resume, job description, and AI service are available. Choose a tone, optionally add emphasis or a recipient, generate the draft, edit it, then select **Save** or copy it for use elsewhere.

Always review AI-generated text for accuracy, tone, and unsupported claims before sending it to an employer. Save cover-letter edits before leaving the page.

## Daily workflow

1. Check **Dashboard → Needs Follow-up** for applications that have remained in one stage for too long.
2. Follow up with the employer when appropriate, then update the application’s status or notes.
3. Add new jobs through **Add Application** as soon as they are found.
4. Review **Recent Applications** and advance statuses after submissions, interviews, offers, rejections, or withdrawals.
5. Open upcoming interview applications and generate or revisit preparation suggestions.

Work Manager flags active applications based on time in their current status: Saved after 5 days, Applied after 7 days, Interviewing after 3 days, and Offer after 2 days. Rejected and Withdrawn applications are treated as complete and are not flagged.

## Weekly review

Once a week:

1. Review the dashboard’s **Application Pipeline**, **Activity Heatmap**, and **Top Sources**.
2. Look for bottlenecks—for example, many applications but few interviews—and adjust the resume, target roles, or application strategy.
3. Use the resume page’s success-rate analysis and recommendations.
4. Confirm every active application has the correct status.
5. Upload a revised resume when needed, confirm the intended resume is active, and run **Recalculate Matches**.

## Feature requirements and expectations

- Resume-based matching requires an uploaded active resume.
- AI summaries, suggestions, job keywords, and cover letters depend on the AI service being enabled.
- Job summaries and interview suggestions need a useful job description.
- Cover-letter generation needs both an active resume and a job description.
- Theme preference is stored in the browser, so it may differ across devices or browser profiles.
- Dashboard and application data refresh automatically, but a manual page refresh can be used if a recent change is not yet visible.

## Troubleshooting checklist

- **Cannot sign up:** confirm the email is valid, both passwords match, and the password has at least eight characters.
- **Resume will not upload:** use PDF, DOC, DOCX, or TXT and try a smaller or uncorrupted file.
- **No match score:** upload an active resume, ensure the application has a job description, then select **Recalculate Matches**.
- **Job extraction is incomplete:** confirm the job URL is public and review all extracted details before saving.
- **AI action is unavailable:** confirm a resume and job description are present where required; the AI service may also be disabled.
- **An application needs correction:** open its detail page and update the controls that are available. If a field is not editable there, delete the record and import the corrected posting again.
- **Navigation is hidden on mobile:** use the menu button in the upper-left corner.

## New-user completion checklist

A user has completed onboarding when they can confirm all of the following:

- [ ] Account created and sign-in completed
- [ ] Sidebar navigation understood
- [ ] Resume uploaded and parsed details reviewed
- [ ] First job posting extracted, checked, and saved
- [ ] Application status changed successfully
- [ ] Search or a filter used on the Applications page
- [ ] Dashboard and follow-up area reviewed
- [ ] Match score or its prerequisites understood
- [ ] Interview suggestions or cover-letter workflow located
- [ ] Light or dark theme selected

## Help page UX review

### What works well today

- The guide covers the complete workflow from account creation through weekly review.
- Content uses the same feature and button names as the application, which helps users connect instructions to the interface.
- Troubleshooting and feature prerequisites are included on the same page.
- The persistent completion checklist gives new users a visible sense of progress.
- The layout supports light and dark themes and keeps content at a readable width.

### Recommended changes

#### High priority

1. **Add a “Start here” summary above the full guide.** Show the three essential first-session tasks—upload a resume, add an application, and review the dashboard—with an estimated completion time and direct action buttons. This gives new users a clear path without requiring them to read the whole page first.
2. **Add search and a table of contents.** Provide a guide-only search field and a sticky list of section links. On mobile, make the contents list a compact dropdown. Users arriving with a specific question should be able to reach the answer immediately.
3. **Turn headings into stable, shareable anchors.** Give every section an ID, update the URL hash as users navigate, and support links such as `/help#upload-resume` and `/help#no-match-score`. Preserve the hash after authentication redirects.
4. **Add contextual links into Work Manager.** Instructions such as “Open Resume & Success Rate” should link directly to `/resume`, while “Add Application” should link to `/applications/new`. Use descriptive link text and retain the written path so the guide remains understandable on its own.
5. **Move onboarding progress near the top.** Show a compact progress summary below “Start here,” with a button to continue from the first incomplete task. Keep the full checklist lower on the page for detailed review.
6. **Make long sections collapsible.** Keep “Start here” and the active section open by default; collapse reference-heavy sections such as feature requirements and troubleshooting. Expansion must remain keyboard accessible and should respect deep links and search results.

#### Medium priority

7. **Organize content by user intent.** Group the page into “Get started,” “Manage applications,” “Daily and weekly routines,” and “Fix a problem.” This is easier to scan than one uninterrupted sequence of cards.
8. **Improve checklist controls.** Add “Reset progress,” store completion by stable item IDs rather than array position, and announce progress changes to screen readers. Explain that progress is saved only in the current browser.
9. **Improve in-page feedback and states.** Show a small loading state while authentication is checked instead of a blank screen. When search has no results, suggest related terms or the troubleshooting section.
10. **Add a clear support escape hatch.** End troubleshooting with the next action when the guide does not solve the problem—for example, what diagnostic details to collect and where to report an issue. Do not imply that support exists until a real support channel is configured.
11. **Add lightweight visual guidance selectively.** Use small annotated screenshots only for interactions that are hard to find, such as the mobile menu, match recalculation, and cover-letter evidence. Keep text as the primary source so the guide remains maintainable and accessible.
12. **Make destructive guidance safer.** Visually distinguish warnings for bulk deletion and replacing an incorrect application. If editing is unavailable, explain exactly what data will be lost before recommending deletion.

#### Content and maintenance

13. **Use task-focused wording.** Prefer headings such as “Upload your resume” and “Fix a missing match score” over feature-oriented labels. Put prerequisites before the steps that require them.
14. **Avoid duplicating guide content in two places.** The Markdown guide and `frontend/app/help/page.tsx` currently contain substantially the same copy and can drift apart. Choose one structured content source and render both the in-app page and documentation from it, or add a review check that keeps them synchronized.
15. **Add content ownership metadata.** Record a last-reviewed date and the application version or feature set the guide describes. Review the guide whenever navigation labels, workflow steps, supported file types, or AI prerequisites change.

## Implementation plan

### Phase 1 — Navigation and quick wins

- Add stable IDs to every guide section and a desktop table of contents plus mobile section selector.
- Convert in-app destinations mentioned in the guide into accessible links.
- Add the “Start here” panel and move a compact progress summary near the top.
- Add a visible authentication-loading state.
- Add “Reset progress” and migrate checklist storage from a boolean array to a versioned object keyed by stable item IDs.
- Add warning styling to destructive actions and clarify browser-only checklist storage.

**Acceptance criteria**

- A user can reach any major topic in no more than two interactions from the top of the page.
- Opening a section URL with a hash scrolls to the correct expanded section and places the heading below any sticky navigation.
- All guide navigation and checklist controls work with a keyboard and have visible focus states.
- Existing saved checklist data is migrated or safely ignored without breaking the page.

### Phase 2 — Findability and progressive disclosure

- Add client-side search across titles, instructions, requirements, and troubleshooting entries.
- Highlight or clearly identify matching sections, automatically expand matches, and provide a useful empty state.
- Group sections by user intent and implement accessible collapsible panels using native `details`/`summary` or buttons with correct `aria-expanded` and `aria-controls` behavior.
- Add a “Continue setup” action that focuses the first incomplete onboarding task.

**Acceptance criteria**

- Common searches such as “resume,” “match score,” “mobile menu,” and “cover letter” return the relevant section.
- Collapsed content remains discoverable by browser find, guide search, keyboard navigation, and direct links.
- Search and section navigation remain usable at narrow mobile widths without covering the content.

### Phase 3 — Maintainability, support, and validation

- Move guide copy into a single structured content source shared by the page and documentation, or introduce an automated parity check.
- Add an optional support/reporting path once a real destination and ownership process are defined.
- Add only the few screenshots that materially reduce confusion, with descriptive alternative text and a documented refresh process.
- Add analytics that measure section visits, searches with no results, checklist completion, and outbound task-link usage without storing search text that may contain personal information.
- Run usability sessions with at least three first-time users and one returning user seeking a specific answer; revise the guide based on observed friction.

**Acceptance criteria**

- Navigation or workflow copy has one authoritative source and a named review owner.
- The page passes automated accessibility checks and a manual keyboard/screen-reader smoke test.
- No-results searches and task-link usage can be reviewed without collecting resume, employer, or application content.
- A first-time user can upload a resume, add an application, and locate follow-up guidance without external help.

## Suggested delivery order

1. Ship anchors, contents navigation, direct links, loading feedback, and checklist improvements.
2. Validate the revised information architecture with users before building search and collapsible behavior.
3. Add search and progressive disclosure, then test accessibility on desktop and mobile.
4. Consolidate the content source and add maintenance checks before introducing screenshots or analytics.
