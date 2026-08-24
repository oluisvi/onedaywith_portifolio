# Project Direction — Isabela Souza / One Day With

This file is the concise Stage Handoff for the project. `HYPER_MASTER_v3` governs execution.

## Stage 0 — Discovery

- Brand/person: Isabela Souza.
- Product: One Day With — mobile content production for professionals and businesses.
- Core value: transform the real routine/value already present in a business into edited social content.
- Primary website goals: position, demonstrate, explain, convert.
- Primary conversion: direct conversation; prices are intentionally not exposed.
- Existing identity: editorial, minimal, sophisticated, contemporary, feminine, authorial, clean.
- Existing visual language: editorial serif + condensed sans + handwritten accent; cream/off-white/brown/gray/black; photography as protagonist.
- Media available now: two portraits supplied by the user; one published Instagram Reel URL.
- Do not invent: biography, location, years of experience, metrics, client count, package details, pricing, delivery duration, travel availability, equipment, extra services.

## Stage 1 — Creative Direction Lock

**Concept:** “A day worth seeing.” The site behaves like an editorial journey through the One Day With idea: enter the day, see the work, understand the eye behind it, experience the method, end with “ONE DAY WITH… YOU.”

**Visual system:** warm editorial paper, espresso brown, near-black; large high-contrast serif; narrow uppercase utility type; handwritten/italic “with” used sparingly. Strong negative space and asymmetric magazine composition.

**Signature element:** a subtle day-orbit / scroll dial plus the recurring “ONE DAY WITH” language. This is decorative; identity survives without it.

**Imagery:** real media first. Portraits are treated editorially, not as corporate headshots. One monochrome treatment creates continuity with the existing deck; one warm image preserves human tone.

**3D:** rejected. Real photography/video communicates the brand more authentically and at far lower runtime cost.

**Anti-references:** no SaaS cards, glassmorphism, neon gradients, generic bento grids, gratuitous particles, heavy WebGL, over-animated text, fake metrics or fake client cases.

## Stage 2 — Experience Design

Journey: **Understand → Feel → Trust → Explore → Act**.

1. Hero — position Isabela + One Day With immediately.
2. Manifesto — establish the core belief.
3. Selected Work — real published Reel, with Instagram fallback.
4. Isabela — communicate the working philosophy without inventing biography.
5. One Day With — explain the experience and content categories.
6. Process — Contact → Introduction → Alignment → Plan → Action → Delivery.
7. Contact — “ONE DAY WITH… YOU.” and direct contact paths.

Mobile is re-art-directed: portrait becomes a dominant vertical composition, sections stack, the orbit is removed, the process becomes a vertical editorial list, and CTA remains accessible.

## Stage 3 — Cinematic Hero

One idea: **Isabela enters the frame while the service name enters the day.**

- Portrait anchored on the right, oversized name crosses the composition.
- “ONE DAY with” sits over the portrait as the service/product signature.
- Value proposition remains text-native and fully understandable without media/motion.
- No WebGL or loading theatre.
- Mobile uses the same art direction with a tighter portrait crop and reduced overlay complexity.

## Stage 4 — Motion Language

- Technology: CSS + IntersectionObserver + requestAnimationFrame only.
- Tempo: restrained, editorial, 700–900ms reveals, ease-out cubic-bezier.
- Motion roles: hierarchy, section arrival, subtle depth, progress through the “day.”
- Horizontal content rail is the single continuous motion motif.
- No scroll-jacking, no custom cursor, no animation dependency.
- `prefers-reduced-motion` removes reveals, parallax and marquee movement.

## Stage 5 — Engineering

- Static semantic HTML + CSS + minimal vanilla JS.
- No runtime framework/dependency required.
- Responsive WebP derivatives generated from supplied images.
- Published Reel is represented by a reliable editorial project card that opens the real Instagram Reel; no fragile third-party embed is required.
- SEO metadata, semantic landmarks, accessible focus, skip link, alt text, touch-safe links, reduced motion.

## Stage 6 — High-End Refinement

Refinement targets applied: typography scale, asymmetric rhythm, reduced component framing, authentic media, disciplined color, restrained motion, no fabricated content, and recurring editorial line/border system.

## Stage 7 — Launch QA

Verify desktop/mobile rendering, reduced-motion behavior, iframe fallback, keyboard/focus, semantic structure, responsive overflow, console errors, media loading, metadata and production paths.
