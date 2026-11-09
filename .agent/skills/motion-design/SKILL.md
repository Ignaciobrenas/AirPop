---
name: motion-design
description: >-
  Choreography, physics springs, CSS keyframes, and Framer Motion patterns for modern web animation.
  Covers scroll reveals, entrance stagger, glitch and cyber distortion effects, typewriter terminals,
  micro-interactions, and smooth layout transitions. Use whenever implementing or refining web animations.
---

# Motion & Animation Design Skill

This skill guides the agent in animating web interfaces with natural physics, cinematic choreography, and cyberpunk/retro effects.

---

## 1. Animation Choreography Principles

- **Staggered Entrances:**
  - Never animate every card at the same instant. Use `delay: index * 0.1` to create an organic wave.
- **Scroll Triggers (`whileInView`):**
  - Always set `viewport: { once: true, margin: '-50px' }` so elements trigger slightly before entering the center of the viewport, avoiding visual popping.
- **Easing & Physics:**
  - Prefer ease-out curves (`[0.25, 0.1, 0.25, 1]`) for entrances (fast start, gentle deceleration).
  - Spring physics for floating badges: `type: "spring", stiffness: 260, damping: 20`.

---

## 2. Cyber & Glitch Animations

- **CSS Glitch Effect (RGB Aberration):**
  - Use `::before` (red shadow) and `::after` (cyan/green shadow) pseudo-elements with `attr(data-text)`.
  - Animate `clip-path: rect(...)` or `clip-path: inset(...)` with `alternate-reverse` at alternating frequencies (e.g. 2s and 2.5s) to avoid predictable loops.
  - Skew subtly on keyframes (`transform: skew(0.5deg)` to `skew(-0.8deg)`).
- **Typewriter Terminals:**
  - Increment string slice `slice(0, index + 1)` on an interval (20ms - 35ms per character).
  - Add a blinking block cursor `█` with `opacity: [1, 0]` toggle every 500ms.
- **Scanlines:**
  - Repeating linear gradient `100% 4px` overlaid on dark elements with `mix-blend-mode: overlay` and low opacity (`0.4 - 0.7`).

---

## 3. Micro-interactions

- **Button Hover Glow:**
  - Transition box shadow from 0 to `0 0 30px rgba(56, 189, 248, 0.6)` and subtle scale `scale-105`.
- **Active Click Feedback:**
  - Scale down on click (`active:scale-95`).
- **Sound Synthesis (Web Audio API):**
  - Generate short sawtooth/sine cyber clicks (frequencies 440Hz -> 880Hz, 150ms decay) for tactile retro immersion without loading external MP3 files.
