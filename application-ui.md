# Application Detail Page UI/UX Recommendations

The application detail page has strong functionality, but its visual hierarchy could be clearer. Job metadata, AI tools, interview preparation, and cover-letter editing currently compete for attention on one long page.

The recommended direction is to redesign the page as a focused **application workspace**.

## Suggested Page Structure

### 1. Sticky application header

Include the most important context and actions:

- Back to Applications
- Position and company
- Location
- Status control
- Resume match score
- Open job posting action
- More menu containing Delete

Keeping the status and primary actions visible makes updates faster. Moving Delete into a secondary menu prevents a destructive action from competing with common actions.

### 2. Pipeline status stepper

Replace the plain status dropdown with a visual progression:

`Saved -> Applied -> Interviewing -> Offer`

Keep **Rejected** and **Withdrawn** in a secondary menu because they are exits from the main pipeline rather than forward stages.

Also show:

- Date of the latest status change
- Number of days in the current stage
- A clear follow-up prompt when the application needs attention

### 3. Summary-first overview

Place the most useful information near the top:

- Salary and currency together
- Applied date
- Source
- Location
- Last updated date
- Resume match score with a short explanation

Currency should not appear as a standalone field when no salary is available.

### 4. Tabbed content

Break the long page into focused sections:

- **Overview**
- **Job Description**
- **Interview Prep**
- **Cover Letter**

Notes can remain visible in a right-hand sidebar because users may need them throughout the hiring process. On mobile, Notes can become another tab or a collapsible section.

### 5. Editable notes

Allow notes to be edited directly on the page. Add:

- Inline editing
- Autosave or an explicit Save button
- Clear saving, saved, and error states
- A "Saved just now" confirmation
- Optional timestamped activity entries

Notes are likely to be one of the most frequently updated parts of an application.

### 6. Collapsible job description

Show the AI summary first, followed by key requirements and responsibilities. Place the complete posting behind a **View full description** control so a long description does not dominate the page.

Useful summary groups could include:

- Responsibilities
- Required skills
- Preferred skills
- Experience level
- Benefits or compensation

### 7. Unified AI tools

The job summary, interview suggestions, and cover letter should use one consistent visual system instead of separate promotional-looking panels.

Each AI-assisted section should include:

- A small **AI-assisted** label
- A short explanation of the generated output
- Generate and Regenerate actions
- Loading, success, and error states
- Last-generated timestamp
- A reminder to review generated content

Errors should be visible on the page instead of only being written to the browser console.

### 8. Safer destructive action

Move Delete into an overflow menu or a bottom **Danger zone**. The confirmation should identify the application clearly:

> Delete "Software Engineer at Acme"? This cannot be undone.

## Important UX Improvements

- Add a skeleton layout instead of displaying only "Loading...".
- Add accessible labels to icon-only buttons.
- Capitalize displayed statuses consistently.
- Show success feedback after status and currency changes.
- Disable only the control being saved instead of every editable field.
- Preserve and display errors when AI summary or interview suggestions fail.
- Warn about unsaved cover-letter changes when using internal navigation, not only when closing or reloading the browser tab.
- Correct visible character-encoding issues such as `Â·`, `â†’`, and `â€”`.
- Constrain content to a readable maximum width on large screens.
- On mobile, place status, match score, and next actions before secondary metadata.
- Ensure keyboard focus states are clearly visible.
- Use `aria-live` regions for asynchronous save and generation feedback.

## Visual Direction

Use a neutral workspace style with:

- Restrained gray surfaces
- One primary accent color
- Semantic colors reserved for statuses, success, warnings, and errors
- Consistent card borders, corner radii, spacing, and button styles

The current mix of teal, cyan, indigo, violet, green, yellow, and red makes many sections appear equally important. A quieter palette will create a stronger hierarchy and keep attention on the current application stage and next action.

## Recommended First Iteration

Prioritize the following changes for the first implementation:

1. Add a sticky application header.
2. Replace the status dropdown with a pipeline stepper.
3. Introduce Overview, Job Description, Interview Prep, and Cover Letter tabs.
4. Add an editable notes sidebar.
5. Consolidate the visual styling of AI-assisted tools.
6. Move Delete into a secondary danger action.
7. Add clear loading, saving, success, and error feedback.
8. Fix the character-encoding issues visible in the interface.

These changes will materially improve scanability and reduce the page's perceived complexity without removing or changing its underlying features.
