---
name: frontend-design
description: Use this skill when reshaping the Hoego / Weekly Circle static UI in this repository, especially when editing index.html, design-system.css, styles.css, or DESIGN.md-driven visual direction.
---

# Frontend Design

Use this skill for design work in this repository. The job is not to invent a new generic frontend style; it is to keep the Weekly Circle app coherent with the local design direction and make intentional changes inside that system.

## Repository Context

This repo is a static GitHub Pages app for weekly retrospectives. The UI is built from:

- `index.html`: app structure and visible copy
- `design-system.css`: tokens and base components
- `styles.css`: app-specific layout and visual composition
- `app.js`: rendered post labels and status messages
- `DESIGN.md`: source design brief

Before changing UI, read `DESIGN.md`, `design-system.css`, and the relevant section of `styles.css`.

## Local Design Rules

Use the current palette unless the user explicitly asks for a new visual direction:

- Warm cream canvas: `#f7f7f4`
- Canvas soft: `#fafaf7`
- Surface card: `#ffffff`
- Warm ink: `#26251e`
- Body text: `#5a5852`
- Muted text: `#807d72`
- Hairline: `#e6e5e0`
- Strong hairline: `#cfcdc4`
- Primary orange: `#f54e00`
- Primary active: `#d04200`

Use orange sparingly: brand mark, primary action, and a small directional accent. Do not introduce a second CTA color. Use white-on-cream contrast and 1px hairlines for depth; do not add drop shadows.

Keep the current typography direction unless instructed otherwise:

- Display and body: `Newsreader`, with Georgia fallback
- Utility, labels, status text, dates, and compact metadata: `JetBrains Mono`

Favor warm editorial calm over dashboard density. Cards should be simple, with 8px or 12px radius, clear spacing, and no decorative nesting.

## Process

First, identify the screen or workflow being changed: board, write form, storage settings, post card, empty state, or global shell. State the one job of that screen before editing if the task is broad.

Then make a compact design plan:

- Color: which existing tokens will carry emphasis
- Type: which text uses display/body/utility roles
- Layout: how the change preserves scanability on desktop and mobile
- Signature: the one detail that makes the screen feel specific to this app

Revise the plan if it drifts into generic SaaS defaults such as excessive cards, gradients, icon clutter, or decorative stats. The app should feel like a quiet shared writing surface, not a marketing page.

## Implementation Guidance

Keep edits scoped:

- Put reusable tokens and base element behavior in `design-system.css`.
- Put screen-specific composition in `styles.css`.
- Change `index.html` only for semantic structure or visible/static copy.
- Change `app.js` only for rendered text, dynamic labels, or behavior.

Be careful with CSS specificity. Prefer class selectors already used by the app. Avoid broad element selectors in `styles.css` when they could leak across tabs or forms.

Maintain responsive behavior:

- Desktop can use 2-column post content when it improves comparison.
- Mobile must collapse to one column.
- Text must not overflow buttons, labels, cards, or form controls.
- Touch targets should remain at least 40px tall for buttons and inputs.

## Copy Rules

Write interface copy in English unless the user asks otherwise. Use plain, action-oriented labels:

- "Publish" for creating a post
- "Save Changes" for editing a post
- "Reset" for clearing a fresh form
- "Cancel Edit" for leaving edit mode
- "Save Settings" and "Disconnect" for storage controls

Empty and error states should explain what happened and what the user can do next. Keep vocabulary consistent between buttons, status messages, and labels.

## Review Checklist

Before finishing:

- Search for stale Korean copy if the UI is meant to be English: `rg "[가-힣]"`
- Search for obsolete design references after font or token changes.
- Confirm local static files respond through the dev server when one is running.
- If browser tooling is available, inspect desktop and mobile screenshots for overlap, weak contrast, and broken spacing.
