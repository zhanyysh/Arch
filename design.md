Design an admin panel for a SaaS web application focused on user management.

LAYOUT
The interface uses a two-column layout: a fixed left sidebar (240px wide) for navigation, and a main content area that takes the remaining width. The top of the main area has a persistent header bar with a search input, notification icon, and the logged-in admin's avatar.

SIDEBAR NAVIGATION
Navigation links include: Dashboard, Users (active/highlighted), Billing, Settings, and Logs. Each item has a small icon and a text label. The active item is visually distinguished with a filled background or accent color.

MAIN CONTENT — USERS PAGE
The page opens with a title "Users" in large text, a total user count badge (e.g. "2,841 users"), and a toolbar row containing:
- A search bar to filter by name or email
- Dropdown filters for: Status (Active, Inactive, Suspended), Plan (Free, Pro, Enterprise), and Date joined
- A primary button labeled "Invite user"

Below the toolbar is a data table with these columns:
User (avatar + name + email), Plan, Status, Joined date, Last active, Actions

Each row shows:
- A circular avatar with initials
- The user's full name and email below it
- A plan badge (e.g. "Pro" in blue, "Free" in gray, "Enterprise" in purple)
- A status pill: Active (green), Inactive (gray), Suspended (red)
- Human-readable dates (e.g. "Mar 12, 2024")
- An actions menu (three-dot icon) with options: View profile, Edit, Suspend, Delete

The table supports row hover highlighting and checkbox selection for bulk actions (e.g. "Export selected", "Suspend selected").

SLIDE-OUT PANEL (User Detail)
Clicking a user row opens a right-side panel (400px) without leaving the page. It shows:
- Avatar, name, email, and role at the top
- Tabs: Overview, Activity, Billing
- Overview tab includes: account status, plan type, join date, last login, and total sessions
- An "Edit user" button and a "Suspend account" button in danger style

VISUAL STYLE
Clean and minimal. White background with light gray sidebar. Neutral typography. Use color only for semantic meaning: green for active, red for errors/suspend, blue for primary actions. Table rows have a subtle bottom border. No heavy shadows or gradients.

RESPONSIVE BEHAVIOR
On smaller screens, the sidebar collapses into a hamburger menu. The table switches to a card-based list view on mobile.