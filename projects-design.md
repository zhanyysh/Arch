Redesign the Build Control "Stages" page to be simpler and more user-friendly. Keep all existing functionality but improve clarity and reduce visual noise.

PROBLEMS TO FIX
- The page title ("Stages: ЖК Skyline Residence") is too large and dominant — scale it down
- "Project settings" looks like a raw developer form — replace it with a compact read-only info strip showing owner, dates, and status as labeled chips
- There are two large blue "Create" and "Create task" buttons side by side with no visual hierarchy — consolidate into one primary "Add stage" button and one smaller secondary "Add task" link
- Status is shown as a raw dropdown string (in_progress) — display it as a colored pill badge instead (e.g. In progress in blue, Done in green)
- Internal IDs (stg_001, cmnp278ve...) are shown prominently — make them secondary/muted, not the same size as stage names
- The "Back to projects" and "View Photo Gallery" buttons compete equally — make "Back" a plain text link and "View Gallery" a small secondary button

LAYOUT
Keep the two-column layout: fixed sidebar (left) + main content (right). In the main content area:
1. Top: breadcrumb (Projects > ЖК Skyline Residence), then page title in 20–22px, subtitle in muted 13px
2. Below title: a horizontal info strip with chips for Owner, Start date, End date, and Status badge — no form inputs
3. Action row: one primary button "Add stage" + one secondary button "Add task"
4. Stages list: card-per-stage layout with stage number circle, stage name (bold), muted ID below it, date range, status badge, and a progress bar with percentage

VISUAL STYLE
- Use white cards with 0.5px borders for each stage row
- Status badges: in_progress = blue pill, done = green pill — sentence case labels ("In progress", "Done")
- Progress bar: thin (4px), blue fill, rounded
- No raw form inputs visible to the manager unless they click an Edit button
- Font hierarchy: 18px page title / 13px body / 11px muted metadata
- Plenty of whitespace between sections