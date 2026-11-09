---
name: ui-ux-design
description: >-
  Comprehensive guide and procedures for crafting world-class modern UI/UX design, visual hierarchy,
  color theory, dark cyberpunk, neo-brutalism, and glassmorphism aesthetics, typography systems,
  responsive layouts, and accessibility. Use whenever designing, refactoring, or polishing user interfaces,
  web components, portfolios, landing pages, or design systems.
---

# Modern UI/UX Design System Guide

This skill equips the agent with design principles, color theory, typography, spacing, and component styling rules to deliver award-winning, visually striking interfaces (Awwwards / FWA / Dribbble quality).

---

## 1. Visual Hierarchy & Spatial Layout

- **60-30-10 Color Rule:**
  - **60% Dominant Background:** Deep dark (`#050508`, `#0a0a0f`, `#0d1117`).
  - **30% Secondary Elements:** Cards, panels, sidebars (`rgba(255, 255, 255, 0.04)` to `0.08` with backdrop-filter blur).
  - **10% Accent / Brand Pop:** Electric Cyan (`#38bdf8`), Neon Emerald (`#10b981`), Glitch Crimson (`#ff0055`), Electric Indigo (`#6366f1`).
- **Whitespace & Rhythm:**
  - Use an 8pt grid system for padding/margin (`p-2`, `p-4`, `p-6`, `p-8`, `p-12`, `p-16`, `p-24`).
  - Generous section padding (`py-20` to `py-32`) gives breathing room and an editorial luxury feel.
- **Glassmorphism Spec:**
  - Background: `rgba(13, 17, 23, 0.75)` or `rgba(255, 255, 255, 0.03)`.
  - Border: `1px solid rgba(255, 255, 255, 0.08)` to `rgba(255, 255, 255, 0.15)`.
  - Backdrop Filter: `blur(16px)` to `blur(24px)`.
  - Box Shadow: Subtle diffuse ambient glow rather than harsh drop shadows.

---

## 2. Typography Strategy

- **Display & Code:** Monospace font for headers, tech badges, terminal tags, metadata (`'JetBrains Mono'`, `'Fira Code'`).
- **Body & Content:** High-legibility sans-serif for reading (`'Plus Jakarta Sans'`, `'Inter'`, `'Geist'`).
- **Contrast & Hierarchy:**
  - H1 / Hero: Bold/Black weight, tight letter-spacing (`tracking-tight`), 3.5rem - 6rem.
  - H2 / Section Titles: 2.25rem - 3.5rem with gradient text accents (`bg-clip-text text-transparent bg-gradient-to-r`).
  - Eyebrow Badges: All-caps, wide letter-spacing (`tracking-widest`), small (`text-xs` / `text-[11px]`), pill border with pulsing dot.
  - Body: Medium gray (`text-gray-300`, `text-slate-400`), 1.6 - 1.75 line-height (`leading-relaxed`).

---

## 3. Micro-interactions & Polish

- **Hover States:**
  - Elevate cards with `translate-y-[-4px]` or `scale-[1.02]`.
  - Brighten borders from `border-white/10` to `border-cyan-400/50`.
  - Accentuate shadows with colored glow: `shadow-[0_0_30px_rgba(56,189,248,0.2)]`.
- **Active / Press States:**
  - Subtle deflation: `active:scale-95`.
- **Transitions:**
  - Standard duration: `duration-200` to `duration-300` with `ease-out`.

---

## 4. Accessibility (WCAG 2.1 AA)

- Maintain a minimum contrast ratio of **4.5:1** for regular body text and **3:1** for large text.
- Always provide visible focus rings (`focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none`).
- Include `aria-label` on icon-only buttons.
- Respect `prefers-reduced-motion` for heavy 3D canvas or kinetic animations.
