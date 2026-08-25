# Project Direction — Isabela Souza / One Day With

This file is the concise Stage Handoff for the project. `HYPER_MASTER.md` governs execution.

## Stage 0 — Discovery

- Brand/person: Isabela Souza.
- Positioning: criadora de conteúdo especializada em vídeos para redes sociais.
- Core capability: planejamento + direção + captação + edição, com olhar estratégico para transformar rotina e trabalho em conteúdo que representa a marca.
- Signature product: One Day With.
- Additional services: vídeos avulsos, criação de roteiros e direção de conteúdo.
- Primary audience: profissionais autônomos, empreendedores e negócios de serviços.
- Growth segments: beleza, estética, saúde, fitness, gastronomia e negócios com experiência/serviço visualmente narrável.
- Service area: Jacareí, São José dos Campos, Vale do Paraíba e região; outras cidades mediante disponibilidade e orçamento.
- Primary conversion: iniciar conversa e solicitar orçamento pelo Instagram.
- Prices are intentionally not exposed.
- Current proof: two published Instagram Reels, Rico Defumados / Festa de Paraibuna case, real behind-the-scenes production photography, portraits and official One Day With logo.
- Do not invent: performance metrics, fixed testimonials, fixed delivery SLA, client volume, years of experience or unsupported package details.

## Stage 1 — Creative Direction Lock

**Concept:** “A day worth seeing.” The portfolio behaves like an editorial journey through the One Day With idea: see the person, enter the work, understand the process and end with “ONE DAY WITH… YOU.”

**Visual system:** warm editorial paper, espresso brown, near-black; large high-contrast serif; narrow uppercase utility type; handwritten accent used sparingly. Strong negative space and asymmetric magazine composition.

**Signature element:** subtle day-orbit / scroll dial plus recurring “ONE DAY WITH” language. The official logo now acts as the product signature inside the One Day With section.

**Imagery:** real media first. Portraits establish the person; behind-the-scenes images prove process; client/project imagery demonstrates applied work. Monochrome and warm treatments are mixed intentionally.

**3D:** rejected. Real photography/video communicates the brand more authentically and at far lower runtime cost.

**Anti-references:** no SaaS cards, glassmorphism, neon gradients, generic bento grids, gratuitous particles, heavy WebGL, fake metrics, fabricated client cases or excessive effects.

## Stage 2 — Experience Design

Journey: **Understand → Feel → Trust → Explore → Act**.

1. Hero — position Isabela and One Day With immediately.
2. Manifesto — establish the creative belief.
3. Selected Work — two real published Reels; Rico Defumados receives a documented case treatment.
4. Behind the Work — planning, studio, mobile direction and field capture as visual evidence.
5. Isabela — client-provided professional definition.
6. Services — One Day With, vídeos avulsos, roteiros and direção de conteúdo.
7. One Day With — official logo, origin, audience, region, duration and what the experience includes.
8. Process — Contact → Planning → Capture → Editing → Delivery.
9. Contact — Instagram-first conversion and “ONE DAY WITH… YOU.”

Mobile remains re-art-directed rather than compressed: vertical media, simplified navigation, stacked editorial facts and touch-safe CTAs.

## Stage 3 — Cinematic Hero

One idea: **Isabela enters the frame while the service name enters the day.**

- Portrait anchored on the right; oversized name crosses the composition.
- “ONE DAY with” remains a service signature over the portrait.
- Value proposition is now more explicit: routine/work/experience become videos that represent the brand.
- No WebGL or loading theatre.

## Stage 4 — Motion Language

- Technology: CSS + IntersectionObserver + requestAnimationFrame only.
- Restrained editorial reveals and light parallax.
- Horizontal content rail remains the single continuous motion motif.
- No scroll-jacking, custom cursor or animation dependency.
- `prefers-reduced-motion` removes reveals, parallax and marquee movement.

## Stage 5 — Engineering

- Static semantic HTML + CSS + minimal vanilla JS.
- No runtime framework/dependency required.
- New client media optimized to WebP before use.
- Instagram projects use reliable outbound links rather than fragile third-party embeds.
- SEO metadata, semantic landmarks, accessible focus, skip link, alt text, touch-safe links and reduced motion.

## Stage 6 — High-End Refinement

Refinement priorities: preserve the locked typography/palette, replace generic placeholders with real work, use the official logo, vary section rhythm, keep media framing editorial rather than card-heavy, and avoid fabricated proof.

## Stage 7 — Launch QA

Verify desktop/mobile rendering, reduced-motion behavior, both Reel links, Instagram CTA, keyboard/focus, semantic structure, responsive overflow, console errors, media loading, metadata and production paths.

## Latest Delta — Project Media & Behind the Scenes

- Every selected project must ship with a real thumbnail/poster. Never use an empty placeholder.
- Project 01 uses the published aesthetics Reel cover and its related behind-the-scenes image only.
- Project 02 is the Rico Defumados / Festa de Paraibuna Reel and owns the food thumbnail, Rico stills, and both supplied vertical MP4 behind-the-scenes videos.
- General equipment imagery is project-agnostic and lives in a horizontal editorial equipment rail.
- Each project exposes two separate actions: open the published Reel on Instagram, or open its behind-the-scenes gallery without leaving the portfolio.
- Behind-the-scenes media opens in one reusable native dialog/lightbox with a horizontally scrollable, touch-friendly, scroll-snapping carousel.
- Photos and videos are first-class carousel items; videos use the native browser player and remain MP4 rather than GIFs.
- Video sources are hydrated only when the corresponding slide becomes active and are unloaded when the modal closes.
- Carousel navigation supports swipe/horizontal scroll, previous/next controls, direct thumbnail selection, keyboard arrows, media count, Escape/native dialog closing, focus return, and automatic video pause on slide changes.
- New projects should be added through `media-data.js` plus a thumbnail/card entry, reusing the same modal system rather than creating project-specific galleries.
