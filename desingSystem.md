🚀 KINVEST Design System v1.0

Design Identity: Futuristic Fintech + Warm Metallic Human Touch
Primary Goals: Trust, clarity, cultural warmth, modernity, accessibility, scalability.

🎨 1. Color System

I’m giving you a structured color token system instead of random hex values — this is how real design systems scale.

Core Palette
Primary Dark Layer (Tech Foundation)
Token	Hex	Usage
--color-bg-0	#0A0A0A	Full app background
--color-bg-1	#121212	Panels, sidebars
--color-bg-2	#1B1B1B	Cards, modals
--color-line	#2A2A2A	Dividers, outlines

Rationale:
These matte layers avoid glare, keep focus on content, and support neon accents without looking “gaming UI.”

Tech Accent Layer (Futuristic)
Token	Hex	Usage
--color-accent-tech	#00F5A0	Active states, highlights, form focus
--color-accent-tech-dim	#00C97C	Secondary neon (accessible alternative)
--color-accent-tech-soft	#00F5A022	Glow, shadows, overlays

Risk check:
Neons easily overpower the UI → we’re using a dim and soft variant for balance.

Warm Accent Layer (Human/Community)
Token	Hex	Usage
--color-warm-1	#C46F3B	Primary CTA & key user elements
--color-warm-2	#A96534	Secondary buttons, borders
--color-warm-soft	#B1744933	Hover glows, soft shadows
--color-warm-light	#DFCCB4	Supporting text, empty states

Reasoning:
Warmth appears only in places tied to people, not system-level UI.
This keeps your experience emotionally zoned.

Neutrals & Text
Token	Hex	Usage
--color-text-primary	#F3F3F3	Main text
--color-text-secondary	#C8C8C8	Subtext, labels
--color-text-muted	#888888	Inactive tabs, placeholders
--color-text-warm	#E0C0AA	Community-facing titles
🔠 2. Typography System

We avoid “cold coding fonts.”
We pick a modern geometric sans with soft curvature to bring warmth.

Primary Font Family

Space Grotesk
Backup stack: Inter, Helvetica, Arial, sans-serif

Space Grotesk hits the balance between futuristic and human.

Type Scale (Modular 1.25)

This scale supports hierarchy without clutter.

Token	Weight	Size	Line height	Use
--font-display	600	36px	44px	Page titles
--font-h1	600	28px	34px	Section titles
--font-h2	500	22px	28px	Card titles
--font-body	400	16px	24px	Paragraphs
--font-body-sm	400	14px	20px	Labels, captions
--font-mono	400	14px	20px	Numbers & financial values (optional)

Assumption Check:
Using monospace for money?
→ Good idea for precision.
→ Bad idea for warmth.
Balanced solution: Use Space Grotesk but letterspace numeric values slightly.

📏 3. Spacing System

Use a 4px grid (industry standard).

Token	Value	Usage
--space-1	4px	Small gaps
--space-2	8px	Default gap
--space-3	12px	Text blocks
--space-4	16px	Buttons, card padding
--space-5	24px	Section padding
--space-6	32px	Page padding
--space-8	48px	Large layouts

This prevents visual messiness.

🟩 4. Radii, Shadows, and Depth
Border Radius System

You need subtle curvature to avoid “cold corporate banking UI.”

Token	Value	Usage
--radius-sm	4px	Inputs
--radius-md	8px	Buttons, cards
--radius-lg	12px	Hero components, modals
--radius-circle	50%	Avatars

Reasoning:
Tech UI = sharp
Warm UI = soft
→ Your system blends them.

Shadow System

No harsh shadows. Use glow + depth:

Tech Glow
0px 0px 12px #00F5A033

Warm Glow
0px 0px 10px #B1744933

Depth Shadow
0px 4px 20px rgba(0,0,0,0.3)

🧩 5. Components

Now the important part: actual UI building blocks.

🔹 Buttons
Primary (Warm)

Background: --color-warm-1

Text: --color-text-primary

Radius: --radius-md

Hover: warm glow
Active: darker copper
Disabled: warm-light at 30% opacity

Secondary (Tech)

Border: --color-accent-tech-dim

Text: neon dim

Hover: inner glow

Ghost Button

Just text

Copper on hover

🔹 Navigation
Sidebar Nav

Background: --color-bg-1

Active Item: neon border left + soft teal glow

Hover: subtle warm ripple

Reasoning:
Cold = system navigation
Warmth shows only on hover = human presence

🔹 Cards

Background: --color-bg-2

Radius: --radius-md

Title color: warm-light

Values: tech-accent

Dividers: low opacity lines

Card Sections

Title

Core content

Footers for actions

🔹 Inputs

Background: #111

Border: #333

Focus border: neon

Error border: copper (warm but firm)

Risk: neon borders can overwhelm → use subtle dim neon for focus.

🔹 Avatars / Member Tokens

Circular (50% radius)

Copper rim

Dark fill

Initials in warm-light

This is community warmth without gradients.

🔹 Tabs

Inactive text: muted

Active: neon underline

Hover: warm-light underline

Cognitive cue:
System decision = cool color
Human hover = warm color

🔹 Modals

Background: --color-bg-2

Radius: --radius-lg

Shadow: depth shadow

CTA = primary warm button

🧠 6. Accessibility & Usability Rules

Following best UX practices:

Minimum contrast 4.5:1 for all text

Neon only used against very dark backgrounds

Copper never used for body text (too low contrast)

Hit target sizes = 40px minimum

Avoid relying solely on color to convey state

This prevents your UI from becoming pretty-but-fragile.

🔥 7. Summary of the UX/UI Identity

This system creates a UI that is:

Futuristic (neon visuals, dark foundation)

Warmly human (copper accents only on user-facing elements)

Professional (no gradients, no gimmicks)

Culturally grounded (warmth shows where community exists)

Accessible (controlled color contrast)

Scalable (tokenized system)

This is a legitimate design system capable of supporting web + mobile.