# Gatherly – Branding Guidelines

## Philosophy

Gatherly follows a **modern minimalist** design philosophy. Readability and clarity take priority over decorative elements. The UI should feel clean and purposeful — every element earns its place. Visual interest is introduced through thoughtful icon usage and strong typographic hierarchy, not embellishment.

---

## Color Scheme

| Role                  | Value                  |
|-----------------------|------------------------|
| Background            | `#FFFFFF` (White)      |
| Primary Text          | `#000000` (Black)      |
| Primary Button BG     | `#000000` (Black)      |
| Primary Button Text   | `#FFFFFF` (White)      |
| Secondary Button BG   | `#FFFFFF` (White)      |
| Secondary Button Text | `#000000` (Black)      |
| Destructive Button BG | `#DC2626` (Red-600)    |
| Destructive Button Text | `#FFFFFF` (White)    |

> The palette is intentionally high-contrast to maximize readability and accessibility. No decorative or accent colors are introduced at this stage.

---

## Typography

| Property      | Value                          |
|---------------|--------------------------------|
| Font Family   | `Inter` (sans-serif)           |
| Base Font Size | `16px`                        |
| Line Height   | `1.5–1.6`                      |
| Fallback Stack | `ui-sans-serif, system-ui, sans-serif` |

- **Inter** is the chosen typeface. It was designed for screen readability, pairs naturally with shadcn/ui (which uses it as its default), and aligns with the minimalist aesthetic.
- A minimum font size of `16px` is enforced across the UI to meet accessibility best practices.
- Generous line-height keeps text-rich pages comfortable to read without feeling dense.

---

## Component Library

All UI components should be built using **shadcn/ui** wherever possible. Custom components should only be introduced when shadcn/ui cannot meet the requirement.

- Border radius follows shadcn/ui's global `--radius` CSS variable (rounded by default).
- No page transition animations are to be implemented at this stage.

---

## Buttons

All buttons must include both a **text label** and a **Lucide icon** that is contextually appropriate to the action (e.g. a `Plus` icon for "Create Event", a `User` icon for "Profile").

### Variants

| Variant      | Background  | Text    | Use Case                                      | shadcn variant    |
|--------------|-------------|---------|-----------------------------------------------|-------------------|
| Primary      | `#000000`   | `#FFFFFF` | Main call-to-action (e.g. "Create Event")   | `default`         |
| Secondary    | `#FFFFFF`   | `#000000` | Neutral actions (e.g. "Cancel")             | `outline`         |
| Destructive  | `#DC2626`   | `#FFFFFF` | Irreversible actions (e.g. "Delete Event", "Flag Event") | `destructive` |

### Rules
- Primary and Secondary buttons are often paired together to present a clear choice (e.g. confirm vs. cancel).
- Destructive buttons must **never** be styled as Primary or Secondary — the red background is a deliberate safety signal to the user.
- All buttons use rounded corners (inherited from shadcn/ui's `--radius`).

---

## Iconography

**Library:** [Lucide](https://lucide.dev/)

Lucide is the designated icon library. It is shadcn/ui's default, ensuring visual consistency with no additional configuration.

### Usage Rules
- Icons are used to **aid accessibility** and **break up text-heavy sections** — not for decoration alone.
- Every button must have an accompanying Lucide icon that reflects its purpose.
- Icons may be used standalone (without a label) in space-constrained contexts (e.g. toolbars, mobile), but a `tooltip` or `aria-label` must always be present for accessibility.
- Icon sizing should remain consistent with the surrounding text scale.

---

## Stretch Goals

The following are identified as desirable but are deferred due to time constraints. They should be revisited if the project timeline permits.

### Dark Mode
- A dark mode variant (black background, white text) would complement the existing high-contrast palette naturally.
- Implementation would leverage shadcn/ui's built-in dark mode theming via CSS variables.

### Responsive Design & Mobile Breakpoints
- A mobile-first responsive layout is a future consideration.
- Breakpoints and layout adaptation rules will be defined separately if prioritized.

---

## Out of Scope (This Document)

- Page layout, grid systems, and spacing rhythm → see `layout.md`
