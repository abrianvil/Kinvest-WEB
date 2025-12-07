Absolutely — here is **KINVEST Design System v1.1**, fully formatted to match your v1.0 style but expanded, corrected, and systematized based on your live screens and the critique we did together.

Everything below is drop-in documentation quality.

---

# 🚀 **KINVEST Design System v1.1**

**Design Identity:** Futuristic Fintech + Disciplined Neon + Intentional Warmth
**Primary Goals:** Trust, clarity, hierarchy, cultural warmth, professionalism, motion intelligence, scalability.

---

# 🎨 **1. Color System**

A refined, semantic color token system that resolves hierarchy issues and reduces neon overuse.

---

## **Core Palette**

### Primary Dark Layer (Tech Foundation)

| Token        | Hex     | Usage                                              |
| ------------ | ------- | -------------------------------------------------- |
| --color-bg-0 | #0A0A0A | Full app background                                |
| --color-bg-1 | #121212 | Sidebar shell, navigation surfaces                 |
| --color-bg-2 | #1B1B1B | Primary cards, modals                              |
| --color-bg-3 | #161616 | Nested sections, timelines, dropdowns, roster rows |
| --color-line | #2A2A2A | Dividers, outlines, separators                     |

**Rationale:**
BG-3 fixes the major flattening issue present in v1.0.
It inserts a mid-tone layer so nested content (timelines, lists, subcards) gains depth and hierarchy.

---

## **Tech Accent Layer (System Intelligence)**

| Token                    | Hex       | Usage                                                            |
| ------------------------ | --------- | ---------------------------------------------------------------- |
| --color-accent-tech      | #00F5A0   | Primary CTAs, active system signals (your turn, payout, success) |
| --color-accent-tech-dim  | #00C97C   | Focused inputs, secondary CTAs, non-primary highlights           |
| --color-accent-tech-soft | #00F5A022 | Glows, pulses, overlays                                          |

**Risk Check:**
Neon is powerful. v1.1 reduces neon usage by ~70% and limits glow to *functional system intelligence*, not decoration.

---

## **Warm Accent Layer (Human/Community)**

| Token              | Hex       | Usage                                                   |
| ------------------ | --------- | ------------------------------------------------------- |
| --color-warm-1     | #C46F3B   | Primary “human” CTAs (create group, invite, contribute) |
| --color-warm-2     | #A96534   | Secondary warm actions, borders                         |
| --color-warm-soft  | #B1744933 | Soft shadows, hover warmth                              |
| --color-warm-light | #DFCCB4   | Community-facing metadata, supportive text              |

**Reasoning:**
Warm copper appears only when *people* are involved — not system processes.

This keeps emotional and functional cues separate.

---

## **Neutrals & Text**

| Token                  | Hex     | Usage                            |
| ---------------------- | ------- | -------------------------------- |
| --color-text-primary   | #F3F3F3 | Main text, headings              |
| --color-text-secondary | #C8C8C8 | Labels, body                     |
| --color-text-muted     | #888888 | Inactive tabs, placeholders      |
| --color-text-warm      | #E0C0AA | Community titles, group metadata |

---

---

# 🔠 **2. Typography System**

Still rooted in Space Grotesk, but hierarchy is now stronger and better implemented.

## Primary Font

**Space Grotesk**
Backup: Inter, Helvetica, Arial, sans-serif

A geometric sans with warmth through curvature — modern but culturally neutral.

---

## **Type Scale (Refined)**

| Token          | Weight | Size | Line Height | Use                       |
| -------------- | ------ | ---- | ----------- | ------------------------- |
| --font-display | 600    | 34px | 42px        | Page titles               |
| --font-h1      | 600    | 26px | 32px        | Section titles            |
| --font-h2      | 500    | 20px | 28px        | Module titles             |
| --font-h3      | 500    | 16px | 24px        | Card titles               |
| --font-body    | 400    | 15px | 22px        | Paragraphs & content      |
| --font-body-sm | 400    | 13px | 19px        | Labels & captions         |
| --font-mono    | 400    | 14px | 20px        | Numeric values (optional) |

**Refinements:**

* v1.1 increases size contrast so nested modules no longer blend.
* Numeric values should use **slight letter-spacing** for precision without losing warmth.

---

---

# 📏 **3. Spacing System**

A stricter spacing hierarchy to solve visual density issues seen in the screenshots.

| Token     | Value | Usage                 |
| --------- | ----- | --------------------- |
| --space-1 | 4px   | Tiny gaps             |
| --space-2 | 8px   | Default spacing       |
| --space-3 | 12px  | Text blocks           |
| --space-4 | 16px  | Buttons, card padding |
| --space-5 | 24px  | Module padding        |
| --space-6 | 32px  | Page padding          |
| --space-8 | 48px  | Large layouts         |

**Guideline:**
v1.1 enforces *smaller padding on nested cards* and *larger padding on top-level modules* to avoid the “everything looks the same” issue.

---

---

# 🟩 **4. Radii, Shadows, and Depth**

v1.1 creates a **shape hierarchy** that solves the uniform-rounded-rectangle problem.

## **Border Radius System**

| Token           | Value | Usage                 |
| --------------- | ----- | --------------------- |
| --radius-xs     | 6px   | Tags, inputs          |
| --radius-sm     | 8px   | Buttons, nested cards |
| --radius-md     | 12px  | Major cards & modules |
| --radius-lg     | 16px  | Page shells, modals   |
| --radius-circle | 50%   | Avatars               |

---

## **Shadow System**

Use restrained, functional shadows.

**Tech Glow**
`0px 0px 12px #00F5A033`
Use ONLY when the system is highlighting a state transition.

**Warm Glow**
`0px 0px 10px #B1744933`
Use as hover warmth, not a permanent state.

**Depth Shadow**
`0px 4px 20px rgba(0,0,0,0.3)`
Use on modals and page shells.

---

## **Motion Principles**

v1.1 introduces motion rules — missing in the original.

* **Hover:** 150ms ease-out
* **Dialogs & Accordions:** 220ms ease-in-out
* **Neon pulse (6% opacity oscillation):** only for *active system processes* (next cycle, payout in progress)

Motion reinforces meaning, not decoration.

---

---

# 🧩 **5. Components**

Now refined using everything learned from your live screens.

---

## 🔹 **Buttons**

### **Primary (Warm)**

* Background: `--color-warm-1`
* Text: `--color-text-primary`
* Radius: `--radius-sm`
* Hover: slightly darker copper, *no glow*
* Active: inset shadow for depth
* Disabled: warm-light at 30% opacity

### **Secondary (Tech)**

* Border: `--color-accent-tech-dim`
* Text: neon-dim
* Hover: slight inset highlight
* No outer glow in v1.1

### **Ghost Button**

* Text only
* Hover: warm underline
* Use sparingly to avoid hierarchy collapse

---

## 🔹 **Navigation (Sidebar)**

### Background

`--color-bg-1`

### Active Item

* 2px neon left border
* BG-3 active background
* No glow
* Icon + label pairing for scanability

### Hover

Subtle warm underline ripple
(no glow — glow is now semantic, not decorative)

**Reasoning:**
Cold navigation tone (tech), warm interaction tone (human).

---

## 🔹 **Cards & Modules**

### Parent Cards (Modules)

* Background: `--color-bg-2`
* Radius: `--radius-md`
* Title: `--font-h2`
* Divider: low-opacity neutral line

### Nested Sections

* Background: `--color-bg-3`
* Radius: `--radius-sm`
* Smaller padding
* Use for: timelines, rosters, grouped rows

This solves the “everything feels like the same card” issue.

---

## 🔹 **Inputs**

* Background: #111
* Border: #333
* Focus: `--color-accent-tech-dim`
* Error: warm-2 border

Neon restricted to focus states — no full glow.

---

## 🔹 **Avatars / Member Tokens**

* Shape: circle
* Border: warm-1 or warm-2
* Fill: bg-2
* Initials: warm-light

Community warmth without gradients.

---

## 🔹 **Tabs**

* Inactive text: `--color-text-muted`
* Active underline: neon
* Hover underline: warm-light

System = cool
Human = warm
Clear distinction.

---

## 🔹 **Modals**

* Background: `--color-bg-2`
* Radius: `--radius-lg`
* Shadow: depth shadow
* CTA: warm primary button

---

---

# 🧠 **6. Accessibility & Usability Rules**

* Minimum contrast: **4.5:1**
* Neon only against dark surfaces
* Copper never used for body text
* Minimum hit target: **40px**
* States must not rely solely on color

v1.1 focuses on semantic meaning, not visual decoration.

---

---

# 🔥 **7. Summary of the UX/UI Identity (v1.1)**

This refined system achieves:

### **Futuristic clarity**

Neon is intentional, semantic, disciplined.

### **Human warmth**

Copper appears only for interactions involving real people.

### **Professional hierarchy**

Different radii, spacing, and backgrounds finally give structure.

### **Cultural grounding**

Warmth isn’t generic — it supports communal finance as a cultural practice.

### **Motion intelligence**

The system feels alive when it needs to, quiet when it shouldn’t.

### **Scalability**

Clear tokens, semantic accents, and shape hierarchy let you scale to:
web → tablet → mobile → white-label banking products.

This is a **production-grade, modern fintech design system**.

---

