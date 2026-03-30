# Gatherly – Layout Guidelines

## General Rules

- All page content is constrained to a **maximum width of `1200px`**, centered horizontally with auto margins.
- Content should never span the full screen width on large displays.
- Responsive design and mobile breakpoints are deferred as stretch goals — see `branding.md`.

---

## Page Shell

All pages (except Login and Signup) share a **three-section shell layout**: Header, Body, and Footer. Only the Body content changes between pages.

```
┌─────────────────────────────────────┐
│              Header                 │
├─────────────────────────────────────┤
│                                     │
│               Body                  │
│                                     │
├─────────────────────────────────────┤
│              Footer                 │
└─────────────────────────────────────┘
```

---

## Header

The header is **static and shared** across all pages except Login and Signup.

### Layout
- Left-aligned: **"Gatherly"** wordmark — plain text, Inter font, bold. Clicking redirects to the Dashboard (Home).
- Right-aligned: Authentication-aware button group.
- A full-width `<Separator />` (shadcn/ui) runs below the header elements to visually close the header.

### Unauthenticated State
| Element | Variant | Icon |
|---|---|---|
| Login | Secondary | `LogIn` |
| Sign Up | Primary | `UserPlus` |

### Authenticated State
| Element | Variant | Icon |
|---|---|---|
| Profile | Secondary | `User` |
| Logout | Destructive | `LogOut` |

> **Note:** The "Gatherly" wordmark may be revisited for custom styling in a future iteration.

---

## Footer

The footer is **static, hardcoded content** and uses an **inverted color palette** — white text and icons on a black background.

### Color Override (Footer only)
| Property | Value |
|---|---|
| Background | `#000000` |
| Text | `#FFFFFF` |
| Icons | `#FFFFFF` |

### Layout
- **Line 1** — "Made by Thomas, with love ❤️" — centered
- **Line 2** — Three large icons, centered, each clickable:
  - `Github` → redirects to GitHub profile in a new tab
  - `Linkedin` → redirects to LinkedIn profile in a new tab
  - `Mail` → opens the user's email client via `mailto:`

> shadcn/ui has no attribution requirement. No additional lines are needed.

---

## Login & Signup Pages

These two pages **do not use the shared shell layout** (no header or footer).

- Form components are centered **both horizontally and vertically** on the page.
- All `branding.md` rules apply — Inter 16px, high-contrast colors, shadcn/ui components, Lucide icons on buttons, rounded corners.

---

## Profile Page

Uses the shared shell layout.

### Profile Header
- Displays the user's **avatar image** (`avatarUrl`).
  - Falls back to a generic Lucide `UserCircle` icon if `avatarUrl` is null.
- Displays the user's **name** and **email**.
- A shadcn/ui `Badge` is shown next to the user's name based on their role:
  - Regular user → no badge
  - Moderator → `outline` variant badge
  - Admin → `default` (black fill) variant badge

### Address Section
The address section is **optional** — users can use the app freely without providing an address.

- **No address on file** → display an editable form for the user to optionally fill in their address.
- **Address on file** → display the same form with all fields set to `readOnly`, accompanied by an "Edit" button (Secondary variant, `Pencil` icon) that unlocks the fields for editing.
- Edits are submitted via `PUT /profiles/me`.
- One field per line.

---

## Event Card Component

A reusable card component used wherever events are listed (Dashboard, search results, etc.). Built with shadcn/ui's `Card` component.

### Layout (top to bottom)

**Image Banner**
- Full-width banner/thumbnail image at the top of the card.
- Falls back to a placeholder with a Lucide `Image` icon if no image is provided.
- The 🔥 `Hot` badge is **overlaid** on the image using absolute positioning (top corner) — only shown when applicable. Uses a Lucide `Flame` icon.

**Card Body**
- **Event name** — bold, prominent
- **Date & time** — `Calendar` and `Clock` Lucide icons
- **Description** — capped at 2–3 lines using `line-clamp`. Truncated to keep all cards uniform in height.
- **Badge row** — left-aligned, displayed in this order:
  1. Admission: `Free` or `Paid`
  2. Event type: `Virtual`, `In-Person`, or `Hybrid`
  3. Up to **3 category badges** (e.g. `Music`, `Tech`, `Sports`)
  - All badges use shadcn/ui's `Badge` component, consistent variant.
  - Maximum of 5 badges in the row at any time.

**Card Footer**
- A `<Separator />` divides the content from the actions.
- "View Event" — Primary button

### Intentionally Excluded from Card
- ❌ Host information — only available on the dedicated event page for authenticated users (`GET /events/{id}`)
- ❌ Location / meeting link — lives on the dedicated event page, not the card

---

## Add Event Modal

Accessible from the Dashboard via a Primary "Create Event" button. Opens as a `Dialog` overlay (shadcn/ui) on top of the Dashboard.

- Fields are stacked **one per line**.
- Some fields are **conditionally rendered** based on other field values (e.g. location fields for In-Person/Hybrid events).
- Modal footer buttons:
  | Element | Variant | Icon |
  |---|---|---|
  | Cancel | Secondary | `X` |
  | Save | Primary | `Save` |

---

## Event Page

The dedicated page for a single event. Uses the shared shell layout.

### Banner & Title Row
- Full-width **event banner image** at the top.
- Directly below the image, a horizontal row:
  - **Left-aligned**: Event name — large, prominent
  - **Right-aligned**: 🚩 "Flag" button — Destructive variant, Lucide `Flag` icon
    - **Only rendered for moderators and admin** — hidden from regular users.

### Details Section
- **Badge row** — same order and rules as the event card: `Free`/`Paid`, event type, up to 3 category badges. 🔥 `Hot` badge if applicable.
- **Date & time** — `Calendar` and `Clock` Lucide icons
- **Location** — shown if event type is `In-Person` or `Hybrid`
- **Meeting link** — shown if event type is `Virtual` or `Hybrid`
- **Full description** — no truncation
- **Host information** — visible to authenticated users only

### Action Buttons
- Contextual — varies based on user role and relationship to the event (e.g. "Register", "Edit Event", "Delete Event").

---

## Flag/Report Modal

Triggered when a moderator or admin clicks the "Flag" button on the event page. Opens as a `Dialog` overlay (shadcn/ui).

- Single `Select` dropdown field: "Flag/Report event as: ..."
- No confirmation prompt after submission.
- Modal footer buttons:
  | Element | Variant | Icon |
  |---|---|---|
  | Cancel | Secondary | `X` |
  | Report | Destructive | `Flag` |

---

## Stretch Goals

- **Responsive design & mobile breakpoints** — layout adaptation for smaller screens, deferred due to time constraints.
- **Dark mode** — see `branding.md`.
- **Admin dashboard** — a dedicated page for admin-level management of the platform. Deferred due to time constraints.
