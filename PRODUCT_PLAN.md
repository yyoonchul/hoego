# Weekly Circle Product Plan

## Source Screens

The requested UI is based on four reference images:

- `회고1.png`: common top navigation
- `회고2.png`: current week home
- `회고3.png`: past retrospective archive
- `회고4.png`: retrospective detail

## Product Goal

Weekly Circle is a shared weekly retrospective space for a small fixed group. The first screen should help the group edit any member's retrospective, then quickly scan everyone's reflections and plans. Past weeks are preserved as archive rows and can be opened into a detail view.

## Information Architecture

### Global Navigation

- Brand: `우리의 회고`
- Primary tabs:
  - `이번 주`: current week writing and board
  - `지난 회고`: archive list
- Editor selector:
  - Shows the member currently being edited, for example `편집: 미소`
  - Lets anyone switch editing focus to any member

### Current Week

The home screen contains:

- Breadcrumb: `1 · 이번 주 회고 (홈)`
- Page title: `{weekNumber}주차 · 이주의 회고`
- Date range: `YYYY.MM.DD - MM.DD`
- Participant status chips:
  - completed: green, check icon
  - drafting: yellow, pencil icon
  - pending: neutral
- Carry-over panel:
  - label: `{memberName}의 지난주 계획`
  - content from the selected member's previous week plan
- Retrospective editor:
  - textarea for `이번 주 회고`
  - textarea for `다음 주 계획`
  - autosave status
  - save button
- Current week collection:
  - each card shows avatar initial, name, this week's review, next week's plan
  - each card has an edit action that switches the editor to that member
- Down floating affordance near the lower viewport

### Archive

The archive screen contains:

- Breadcrumb: `2 · 지난 회고 (아카이브)`
- One card per past week
- Each row shows week number, date range, participation count, summarized member entries, and a right arrow
- Clicking a row opens the detail view

### Detail

The detail screen contains:

- Breadcrumb: `3 · 회고 상세`
- Back button
- Title: `{weekNumber}주차 · 이주의 회고`
- Date range
- Two-column member cards on desktop, one-column on mobile
- Each member card shows avatar initial, name, review, and plan

## Functional Requirements

- Switch between current week, archive, and detail without page reloads.
- Switch editing target and update the selected member's editor, carry-over plan, and status.
- Autosave draft text locally while typing.
- Save any selected member's retrospective locally and update participant status.
- Render archive detail from structured week/member data.
- Keep the UI usable at mobile widths by collapsing cards and controls.

## Implementation Notes

- This remains a static GitHub Pages app with no build step.
- State is stored in browser `localStorage`.
- Seed data is embedded in `app.js` to match the reference screens.
- Existing warm cream, white surface, hairline, and orange token system is retained, with green/yellow/blue status colors added only where the reference requires state emphasis.
