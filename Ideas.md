# RatingVault — Feature & Design Ideas

## 🎨 Aesthetic Improvements

### 1. Cinematic Page Transitions (ink-bleed + poster morph + parallax)

- **Description:** Replace standard route changes with immersive, film-inspired transitions that make navigating the app feel like moving between scenes in a movie.
- **Instructions:** You are implementing cinematic page transitions for a movie rating application (RatingVault) using React + Vite, React Router, and Framer Motion (already installed). Create `src/components/transitions/InkBleed.jsx` component that renders a full-screen ink-bleed animation on route change — the screen fills with the accent gold (#c8a96e) like ink spreading on paper using CSS clip-path animations, then reveals the next page. Create `src/components/transitions/PosterMorph.jsx` that implements shared layout animations — when clicking a movie card on Home or Charts, the poster smoothly morphs/expands from its grid position into its final position on the TitleDetail page using Framer Motion's `layoutId`. Add parallax depth layers to the hero section on Home.jsx — the backdrop image shifts at a slower speed than the overlay text as the user scrolls, creating a movie-poster depth illusion. Wrap all routes in `App.jsx` with `AnimatePresence` from Framer Motion. Each transition should feel smooth, cinematic, and last no longer than 600ms. Ensure transitions work with React Router v6's route structure.
- **Implementation Guide:**
  - Create `InkBleed.jsx` with CSS clip-path keyframe animation (circle expand from click point)
  - Create `PosterMorph.jsx` using Framer Motion `layoutId` on poster images
  - Add parallax scrolling to Home hero using `transform: translateY()` on scroll event
  - Wrap routes in `AnimatePresence` with `mode="wait"` in `App.jsx`
  - Add exit animations (fade + slide down) to each page component
  - Ensure transitions respect `prefers-reduced-motion` media query
- **Dependencies:** `framer-motion` (already installed)
- **Files to Create:** `src/components/transitions/InkBleed.jsx`, `src/components/transitions/PosterMorph.jsx`
- **Files to Modify:** `src/App.jsx`, `src/pages/Home.jsx`, `src/pages/TitleDetail.jsx`, `src/pages/Charts.jsx`

### 3. Rating Heartbeat Visualizer (animated pulse ring)

- **Description:** Replace the static rating number with an animated heartbeat/pulse ring that conveys quality at a glance — beating faster for masterpieces, slower for mediocre titles.
- **Instructions:** You are creating an animated rating heartbeat visualizer for a movie rating application (RatingVault) using React + Vite and CSS animations. Create `src/components/ui/RatingPulse.jsx` component that accepts a `rating` prop (0-10) and renders: (1) An SVG circle ring whose stroke color matches the existing rating tier system (--rating-great for 8.5+, --rating-good for 7.5+, etc.), (2) A CSS pulse animation where the ring scales outward like a sonar ping — the animation duration is mapped to rating (rating 9+ = 0.8s fast pulse, rating 7 = 1.5s moderate, rating 5 = 2.5s slow, below 5 = no pulse/flatline), (3) On hover, the pulse stops and the ring morphs into a clean circle displaying the exact numeric score with a counting-up animation (0.0 to final score over 600ms using requestAnimationFrame), (4) The sonar ping radiates outward with decreasing opacity (3 concentric rings). Style in `src/components/ui/RatingPulse.module.css`. Use the existing rating color functions from `src/services/tmdb.js`. Integrate into TitleDetail.jsx replacing the current static rating display. Ensure the animation is performant using `transform` and `opacity` only (GPU-composited properties).
- **Implementation Guide:**
  - Create SVG-based ring with stroke colored by rating tier
  - Animate pulse speed mapped to rating value (higher = faster)
  - Add 3 concentric sonar-ping rings with staggered opacity fadeout
  - Implement hover state: stop pulse, morph to numeric display
  - Add counting-up animation for score reveal (requestAnimationFrame)
  - Use only GPU-composited properties (transform, opacity) for performance
  - Respect `prefers-reduced-motion` — show static ring if enabled
- **Dependencies:** none
- **Files to Create:** `src/components/ui/RatingPulse.jsx`, `src/components/ui/RatingPulse.module.css`
- **Files to Modify:** `src/pages/TitleDetail.jsx`

### 4. Cinematic Loading Sequences (film-themed loaders)

- **Description:** Replace generic skeleton shimmer loaders with bespoke film-themed loading animations that reinforce the cinematic brand identity on every page.
- **Instructions:** You are creating cinematic loading animations for a movie rating application (RatingVault) using React + Vite and CSS animations. Create `src/components/ui/CinematicLoader.jsx` component that accepts a `variant` prop with options: (1) `"countdown"` — classic film countdown (3… 2… 1…) with the vintage circle leader graphic, rotating numbers, and a projector flicker effect, (2) `"reel"` — an animated film reel with sprocket holes scrolling vertically, (3) `"clapperboard"` — a clapperboard that snaps shut with a satisfying CSS animation, (4) `"projector"` — a cone of light flickering from top-right corner, with dust particles floating in the beam, before content "projects" onto the screen with a fade-in. Each variant should last 1-2 seconds. Style in `src/components/ui/CinematicLoader.module.css`. Use pure CSS animations (keyframes) — no external animation libraries needed. Use the app's existing color tokens (#0e0e0f background, #c8a96e gold accent, Cormorant Garamond for countdown numbers). Replace the skeleton loaders in Home.jsx (use "projector"), TitleDetail.jsx (use "countdown"), Charts.jsx (use "reel"), and Compare.jsx (use "clapperboard"). Add a brief delay (200ms) before showing loaders to avoid flash on fast connections.
- **Implementation Guide:**
  - Create 4 loader variants: countdown, reel, clapperboard, projector
  - Countdown: rotating numbers in vintage circle with flicker
  - Reel: scrolling film strip with sprocket holes
  - Clapperboard: CSS transform animation (rotate top half)
  - Projector: light cone with floating dust particles
  - Add 200ms delay to avoid flash on fast loads
  - Replace skeleton loaders in all 4 pages
  - Use only CSS keyframes and existing color tokens
- **Dependencies:** none
- **Files to Create:** `src/components/ui/CinematicLoader.jsx`, `src/components/ui/CinematicLoader.module.css`
- **Files to Modify:** `src/pages/Home.jsx`, `src/pages/TitleDetail.jsx`, `src/pages/Charts.jsx`, `src/pages/Compare.jsx`

### 5. Ambient Particle Systems (interactive golden dust)

- **Description:** Add floating golden dust motes throughout the app that react to mouse movement, creating the feeling of light streaming through a projector beam in a dark theater.
- **Instructions:** You are implementing an ambient particle system for a movie rating application (RatingVault) using React + Vite and HTML5 Canvas. Create `src/components/ambient/ParticleField.jsx` component that renders a fixed-position canvas overlay (pointer-events: none, z-index: 1). Initialize 80-120 particles as small circles (1-3px radius) in gold (#c8a96e) with varying opacity (0.1-0.4). Particles drift slowly downward and sideways with Perlin-noise-like movement (use simplex noise or sine wave approximation). On mouse move, particles within 150px of the cursor gently push away (repulsion force) and then drift back. On click, particles within 200px scatter outward rapidly and slowly reform. Create `src/components/ambient/ParticleField.module.css` for canvas positioning. The canvas should be fullscreen, behind all content. Use `requestAnimationFrame` for the render loop with delta-time calculation for consistent speed. Cap at 30fps to save battery. Add a `variant` prop: `"gold"` (default, golden dust), `"adaptive"` (uses the mood-adaptive extracted color from idea #2 if available). Destroy the animation loop and canvas on unmount. Add to `App.jsx` as a persistent background layer. Respect `prefers-reduced-motion` — disable particles entirely.
- **Implementation Guide:**
  - Create fullscreen canvas overlay (fixed, pointer-events: none)
  - Initialize 80-120 particles with random positions, sizes, and opacities
  - Animate with sine-wave drift (no external noise library needed)
  - Add mouse repulsion (150px radius) and click scatter (200px radius)
  - Cap render loop at 30fps for performance
  - Support "gold" and "adaptive" color variants
  - Clean up animation loop on unmount
  - Disable entirely when `prefers-reduced-motion` is active
- **Dependencies:** none
- **Files to Create:** `src/components/ambient/ParticleField.jsx`, `src/components/ambient/ParticleField.module.css`
- **Files to Modify:** `src/App.jsx`

### 6. Cinematic Typography Effects (animated text treatments)

- **Description:** Elevate typography across the app with animated gradient fills, liquid metal effects on rating numbers, typewriter reveals for genre tags, and a signature vault-door animation for the brand name.
- **Instructions:** You are implementing cinematic typography effects for a movie rating application (RatingVault) using React + Vite and CSS. Create `src/components/ui/AnimatedText.jsx` component with variants: (1) `"gradient"` — text with a slowly shifting animated gradient fill using `background-clip: text` and `background-size: 200%` with a 6-second linear keyframe cycling through gold (#c8a96e) to warm white (#f0ead6) to amber (#d4a853) and back, (2) `"chrome"` — large rating numbers with a liquid metal/chrome effect using layered CSS gradients, `background-clip: text`, and a subtle reflection line that scrolls across the text on a 3-second loop, (3) `"typewriter"` — text that types out character by character with a blinking cursor (using CSS steps() timing and width animation), (4) `"vault"` — the word "RatingVault" splits between "Rating" and "Vault" and the "Vault" portion swings open like a door (rotateY transform) on first visit, revealing the full title. Style in `src/components/ui/AnimatedText.module.css`. Apply gradient effect to title text on TitleDetail pages. Apply chrome effect to the large rating number. Apply typewriter to genre tags on TitleDetail. Apply vault animation to the Navbar logo on initial page load (once per session, tracked via sessionStorage). Use the existing fonts (Cormorant Garamond for display, Outfit for body).
- **Implementation Guide:**
  - Create 4 text animation variants: gradient, chrome, typewriter, vault
  - Gradient: `background-clip: text` with 200% size keyframe animation
  - Chrome: layered gradients with scrolling reflection highlight
  - Typewriter: CSS `steps()` timing on width + blinking cursor
  - Vault: `rotateY` transform on "Vault" portion with perspective
  - Track vault animation per session (sessionStorage flag)
  - Apply appropriate variants to TitleDetail and Navbar
  - All animations use CSS only — no JS animation libraries needed
- **Dependencies:** none
- **Files to Create:** `src/components/ui/AnimatedText.jsx`, `src/components/ui/AnimatedText.module.css`
- **Files to Modify:** `src/pages/TitleDetail.jsx`, `src/components/layout/Navbar.jsx`

### 7. Glassmorphism Dashboard Cards (frosted glass + holographic tilt)

- **Description:** Redesign stat blocks and info cards as frosted glass panels with holographic rainbow reflections that shift with mouse position, creating a premium, tactile feel.
- **Instructions:** You are implementing glassmorphism dashboard cards for a movie rating application (RatingVault) using React + Vite. Create `src/components/ui/GlassCard.jsx` component that renders a card with: (1) Frosted glass effect: `backdrop-filter: blur(16px) saturate(180%)`, semi-transparent background `rgba(28, 28, 30, 0.6)`, subtle 1px border `rgba(200, 169, 110, 0.15)`, (2) Holographic tilt: track mouse position relative to card using `onMouseMove`, calculate tilt angles (max ±8 degrees) using `transform: perspective(800px) rotateX() rotateY()`, add a pseudo-element overlay with a `linear-gradient` that shifts based on mouse position to create a rainbow/holographic reflection (subtle, 5-10% opacity), (3) Depth shadows: `box-shadow` that shifts based on tilt direction (light source simulation), (4) A `pulse` prop that adds a gentle scale pulse animation (1.0 to 1.02) on critical stats. Style in `src/components/ui/GlassCard.module.css`. Reset tilt to flat on mouse leave with a smooth 300ms transition. Replace stat blocks in TitleDetail.jsx (`StatBlock` elements for TMDB Score, Votes, Popularity, etc.) with GlassCard wrappers. Ensure the effect degrades gracefully (no tilt on touch devices, no backdrop-filter on unsupported browsers).
- **Implementation Guide:**
  - Create GlassCard with `backdrop-filter: blur(16px) saturate(180%)`
  - Add mouse-tracking tilt (max ±8deg, perspective 800px)
  - Overlay holographic gradient that follows mouse position
  - Dynamic box-shadow based on tilt angle for depth illusion
  - Optional `pulse` prop for gentle scale animation on key stats
  - Smooth reset on mouse leave (300ms transition)
  - Graceful degradation for touch devices and older browsers
  - Replace StatBlock wrappers in TitleDetail
- **Dependencies:** none
- **Files to Create:** `src/components/ui/GlassCard.jsx`, `src/components/ui/GlassCard.module.css`
- **Files to Modify:** `src/pages/TitleDetail.jsx`, `src/pages/TitleDetail.module.css`

### 8. Seasonal / Time-Based Themes (auto-shifting app aesthetic)

- **Description:** The app automatically shifts its visual theme based on time of day and calendar season, making each visit feel uniquely atmospheric.
- **Instructions:** You are implementing seasonal and time-based theming for a movie rating application (RatingVault) using React + Vite. Create `src/hooks/useSeasonalTheme.js` hook that determines the current theme based on: (1) Time of day — late night (10pm-5am): deeper blacks (#090909), dimmer gold accent (#a08850), starfield CSS background on body; morning (5am-12pm): warm golden tones, sunrise gradient on hero; afternoon/evening (12pm-10pm): default theme. (2) Calendar season — October: orange accent (#c89050), subtle grain increase, bat emoji cursor via CSS; December: snow particle overlay (CSS-only, 30 small white dots animating downward), frosted glass card borders; February-March (Oscar season): red carpet accent (#c8505a), gold shimmer on headings. The hook returns a theme object with CSS custom property overrides. Create `src/components/SeasonalThemeProvider.jsx` that applies the theme variables to a wrapper div. Create `src/components/ambient/SnowOverlay.jsx` for the December snow effect (pure CSS animation with 30 pseudo-elements). Add the provider in `App.jsx` wrapping all routes. Override only accent and atmosphere variables — don't break the core dark theme. Store user's theme preference override in localStorage (allow disabling seasonal themes). Add a small seasonal indicator icon in the Navbar that shows current theme.
- **Implementation Guide:**
  - Create `useSeasonalTheme.js` hook checking time of day + calendar month
  - Define theme overrides for: late night, morning, Halloween, holiday, Oscar season
  - Create `SeasonalThemeProvider.jsx` applying CSS variable overrides
  - Create `SnowOverlay.jsx` for December (pure CSS, 30 animated snowflakes)
  - Add localStorage toggle for users to disable seasonal themes
  - Show small seasonal indicator icon in Navbar
  - Only override accent/atmosphere — preserve core dark theme
- **Dependencies:** none
- **Files to Create:** `src/hooks/useSeasonalTheme.js`, `src/components/SeasonalThemeProvider.jsx`, `src/components/ambient/SnowOverlay.jsx`
- **Files to Modify:** `src/App.jsx`, `src/components/layout/Navbar.jsx`

### 9. Responsive Poster Tilt Cards (3D holographic trading cards)

- **Description:** Movie cards respond to mouse position with a 3D tilt effect and a holographic shine layer that sweeps across the poster like a premium trading card.
- **Instructions:** You are implementing 3D tilt poster cards for a movie rating application (RatingVault) using React + Vite. Create `src/components/ui/TiltCard.jsx` component that wraps existing movie poster cards with: (1) 3D perspective tilt: on mouse move over the card, calculate x/y offset from center, apply `transform: perspective(600px) rotateX(Ydeg) rotateY(Xdeg)` with max ±12 degrees, (2) Holographic shine overlay: a positioned `<div>` overlay with `background: linear-gradient(var(--shine-angle), transparent 0%, rgba(255,255,255,0.15) 45%, rgba(200,169,110,0.2) 50%, rgba(255,255,255,0.15) 55%, transparent 100%)` where `--shine-angle` updates based on mouse position, (3) Edge glow: `box-shadow` in the title's rating tier color (use getRatingColor from tmdb.js) that intensifies on hover, (4) On mobile/touch devices, use `DeviceOrientationEvent` for gyroscope-based tilt (request permission on iOS). Style in `src/components/ui/TiltCard.module.css`. Apply `will-change: transform` for performance. Reset to flat with a spring-like easing on mouse leave. Integrate into the poster grid on Home.jsx and the search results in Navbar.jsx. Preserve existing click navigation to TitleDetail.
- **Implementation Guide:**
  - Create TiltCard wrapper with mouse-position-based 3D transform
  - Max tilt: ±12 degrees with perspective(600px)
  - Add holographic shine gradient overlay (angle follows mouse)
  - Edge glow using rating tier color from `getRatingColor()`
  - Mobile: gyroscope-based tilt via `DeviceOrientationEvent`
  - `will-change: transform` for GPU acceleration
  - Spring-like easing on mouse leave reset
  - Wrap poster cards on Home and Navbar search results
- **Dependencies:** none
- **Files to Create:** `src/components/ui/TiltCard.jsx`, `src/components/ui/TiltCard.module.css`
- **Files to Modify:** `src/pages/Home.jsx`, `src/components/layout/Navbar.jsx`

### 10. Custom Cursor & Scroll Experiences (spotlight + film strip progress)

- **Description:** Replace the default cursor with a subtle spotlight effect and add a film-strip-styled scroll progress bar, making every interaction feel intentionally designed.
- **Instructions:** You are implementing custom cursor and scroll experiences for a movie rating application (RatingVault) using React + Vite and CSS. Create `src/components/ui/SpotlightCursor.jsx` component that: (1) Renders a fixed-position div (pointer-events: none, z-index: 9999) that follows the cursor with a slight lag (using requestAnimationFrame with lerp interpolation, factor 0.15), (2) The div is a 200px radial gradient circle (`radial-gradient(circle, rgba(200,169,110,0.06) 0%, transparent 70%)`) creating a subtle spotlight illumination effect, (3) On click, briefly flash brighter (0.06 to 0.12 opacity, 150ms). Create `src/components/ui/ScrollFilmStrip.jsx` component that renders a thin (4px) fixed progress bar at the very top of the viewport: (1) The bar is styled as a film strip with tiny sprocket-hole marks every 20px (repeating CSS background), (2) Width represents scroll progress (0% to 100%), (3) Color is gold (#c8a96e), (4) Only visible on TitleDetail pages (accept a `visible` prop). Style both in their respective `.module.css` files. Add SpotlightCursor to `App.jsx` (persistent). Add ScrollFilmStrip to `TitleDetail.jsx`. Hide spotlight cursor on mobile (use matchMedia for pointer: fine). Add smooth scroll snapping on Home.jsx between hero section and grid section using CSS `scroll-snap-type`.
- **Implementation Guide:**
  - SpotlightCursor: fixed div following mouse with lerp lag (factor 0.15)
  - 200px radial gradient in gold at 6% opacity
  - Click flash effect (briefly brighten to 12%)
  - ScrollFilmStrip: 4px fixed bar at top with sprocket-hole pattern
  - Width = scroll percentage, gold color
  - Show only on TitleDetail pages
  - Hide spotlight on touch devices (pointer: fine media query)
  - Add CSS scroll-snap on Home page (hero + grid sections)
- **Dependencies:** none
- **Files to Create:** `src/components/ui/SpotlightCursor.jsx`, `src/components/ui/SpotlightCursor.module.css`, `src/components/ui/ScrollFilmStrip.jsx`, `src/components/ui/ScrollFilmStrip.module.css`
- **Files to Modify:** `src/App.jsx`, `src/pages/TitleDetail.jsx`, `src/pages/Home.jsx`, `src/pages/Home.module.css`

### 11. Immersive Detail Page Redesign (theater curtain + cast carousel)

- **Description:** Transform the title detail page into a cinematic experience — a full-bleed backdrop that scrolls up like a rising theater curtain, a depth-of-field cast carousel, and animated infographics.
- **Instructions:** You are redesigning the title detail page for a movie rating application (RatingVault) using React + Vite, Framer Motion, and Recharts. Update `TitleDetail.jsx` with: (1) Theater curtain effect: the backdrop image takes up 100vh on load, then on scroll the backdrop slides up (using CSS `position: sticky` + `transform: translateY` based on scroll) to reveal the content beneath — like a curtain rising in a theater, (2) Cast carousel: create `src/components/ui/CastCarousel.jsx` that displays cast member photos (from TMDB credits data already fetched with `append_to_response=credits`) in a horizontally scrollable row. The center member is sharp and enlarged (scale 1.1), members further from center are progressively blurred (filter: blur) and scaled down — creating a depth-of-field effect. Scroll snaps to center the nearest member, (3) "Behind the Numbers" section: an expandable panel (click to toggle) containing an animated infographic with: vote count visualized as a bar filling up, a position indicator showing where this title sits among its genre average (dot on a line), and a popularity percentile. Use Framer Motion for curtain entrance, carousel snap, and infographic number animations (animate from 0 to final value). Update `TitleDetail.module.css` with new styles.
- **Implementation Guide:**
  - Backdrop: 100vh sticky image that translates up on scroll (curtain rise)
  - Cast carousel: horizontal scroll with center-focused depth-of-field blur
  - Scroll-snap on carousel for clean member centering
  - "Behind the Numbers" expandable section with toggle
  - Animated infographic: vote bar fill, genre position dot, popularity percentile
  - Use Framer Motion for entrance/number animations
  - Use existing TMDB credits data (already in API response)
- **Dependencies:** `framer-motion` (already installed)
- **Files to Create:** `src/components/ui/CastCarousel.jsx`, `src/components/ui/CastCarousel.module.css`
- **Files to Modify:** `src/pages/TitleDetail.jsx`, `src/pages/TitleDetail.module.css`

## 🧭 UI/UX Improvements

### 12. Micro-Interactions & Easter Eggs (delight details)

- **Description:** Sprinkle delightful micro-interactions and hidden Easter eggs throughout the app to reward exploration and create memorable moments.
- **Instructions:** You are adding micro-interactions and Easter eggs to a movie rating application (RatingVault) using React + Vite. Create `src/hooks/useMicroInteractions.js` hook and `src/components/easter-eggs/` directory. Implement: (1) Double-tap favorite: in Home.jsx and Charts.jsx, detect double-click on a poster card, trigger a heart burst animation (6-8 small heart shapes exploding outward from center, each rotating and fading, using CSS keyframes) and save to localStorage favorites list, (2) Random recommendation shake: create `src/components/easter-eggs/ShakeRecommend.jsx` — on desktop, listen for a keyboard shortcut (Shift+R), on mobile listen for devicemotion shake event. Show a slot-machine style spinner overlay (3 reels scrolling vertically with poster images, decelerating to reveal a random trending title), then navigate to that title, (3) Konami code VHS mode: create `src/components/easter-eggs/VHSMode.jsx` — detect the Konami code sequence (up up down down left right left right B A), toggle a CSS class on `<body>` that applies: scanline overlay (repeating-linear-gradient, 2px transparent/rgba lines), slight CRT curvature (border-radius on body), VHS tracking distortion (CSS animation with horizontal offset glitch every 3s), neon green text override. Store VHS mode state in sessionStorage, (4) Perfect 10 shimmer: when any rating of exactly 10.0 appears on screen, trigger a golden shimmer wave across the entire viewport (a full-width gradient band that scrolls horizontally once, 1s duration).
- **Implementation Guide:**
  - Double-tap heart burst: CSS keyframe explosion of 6-8 heart shapes
  - Store favorites in localStorage
  - Shake/shortcut random recommendation with slot machine UI
  - Konami code detection (keydown sequence tracking)
  - VHS mode: scanlines, CRT curvature, tracking glitch CSS
  - Perfect 10 shimmer: viewport-wide golden gradient sweep
  - All animations use CSS keyframes — no heavy libraries
- **Dependencies:** none
- **Files to Create:** `src/hooks/useMicroInteractions.js`, `src/components/easter-eggs/ShakeRecommend.jsx`, `src/components/easter-eggs/VHSMode.jsx`
- **Files to Modify:** `src/pages/Home.jsx`, `src/pages/Charts.jsx`, `src/App.jsx`

### 13. Poster Wall / Mosaic View (alternative home layout)

- **Description:** An alternative home page layout displaying a full-screen mosaic wall of hundreds of tiny posters that breathe, enlarge on hover, and can be filtered by genre, decade, or rating tier.
- **Instructions:** You are implementing a poster wall mosaic view for a movie rating application (RatingVault) using React + Vite. Create `src/pages/Mosaic.jsx` page component that: (1) Fetches multiple pages of trending + popular + top-rated titles from TMDB (use existing `tmdb` service functions, fetch 3-4 pages to get ~80 titles), (2) Renders all poster images in a dense CSS grid (auto-fill, minmax) that fills the viewport, (3) Each poster has a subtle "breathing" animation (scale 1.0 to 1.015, staggered timing so they don't sync), (4) On hover, the poster smoothly enlarges (scale 1.3, z-index bump) and shows an overlay with title, year, and rating in a frosted glass tooltip, (5) Click navigates to TitleDetail page, (6) A floating control bar at bottom with: a density slider (controls grid column minmax from 60px to 200px), filter chips for genre (Action, Drama, Comedy, etc.), decade (1990s, 2000s, 2010s, 2020s), and rating tier (Exceptional, Great, Good, Mixed). When filters change, non-matching posters fade to 20% opacity and shrink slightly — matching ones remain vivid. Add a route `/mosaic` in App.jsx and a nav link in Navbar. Style in `src/pages/Mosaic.module.css`. Use CSS `transition` for all filter/density changes (300ms ease). Virtualize the grid if performance suffers (intersection observer to only render visible posters).
- **Implementation Guide:**
  - Fetch ~80 titles from multiple TMDB endpoints
  - CSS grid with auto-fill and configurable minmax (density slider)
  - Breathing animation: staggered scale pulse per poster
  - Hover: scale 1.3 + frosted glass tooltip overlay
  - Floating control bar: density slider + genre/decade/rating filter chips
  - Filtered-out posters fade to 20% opacity (CSS transition 300ms)
  - Click navigates to TitleDetail
  - Add `/mosaic` route and Navbar link
- **Dependencies:** none
- **Files to Create:** `src/pages/Mosaic.jsx`, `src/pages/Mosaic.module.css`
- **Files to Modify:** `src/App.jsx`, `src/components/layout/Navbar.jsx`

### 14. Heatmap Evolution Playback (animated timeline replay)

- **Description:** Add a play button to the episode heatmap that replays the show's rating history chronologically — cells light up one by one like a timelapse, letting you watch quality rise and fall over time.
- **Instructions:** You are implementing heatmap evolution playback for a movie rating application (RatingVault) using React + Vite. Update `src/components/charts/EpisodeHeatmap.jsx` to add: (1) A "Play" button (play icon from Lucide React) positioned above the heatmap grid, (2) When clicked, all heatmap cells reset to a dark/empty state (opacity 0.1, no color), then cells illuminate one by one in chronological order (Season 1 Episode 1 first, through to the final episode), each cell fading in over 150ms with its rating color. The interval between cells is calculated so a full series replays in ~5-10 seconds (interval = 8000ms / totalEpisodes), (3) A progress bar below the heatmap showing current position (styled as a thin gold line), (4) Speed controls: 1x (default), 2x, 5x buttons that adjust the interval, (5) A "Pause" button replaces "Play" during playback, clicking pauses at current position. Use `useRef` for the interval timer and `useState` for the currently revealed episode index. Style controls in `EpisodeHeatmap.module.css` to match existing dark theme. The playback should feel dramatic — like watching a show's legacy unfold in fast-forward. Clear the interval on component unmount.
- **Implementation Guide:**
  - Add Play/Pause button above heatmap (Lucide icons)
  - On play: reset all cells to dim, reveal one-by-one chronologically
  - Each cell fades in (150ms) with its rating color
  - Interval = 8000ms / totalEpisodes (full replay in ~5-10s)
  - Speed controls: 1x, 2x, 5x buttons
  - Progress bar: thin gold line below heatmap
  - useRef for interval timer, useState for revealed index
  - Clean up interval on unmount
- **Dependencies:** none (uses existing `lucide-react`)
- **Files to Create:** none
- **Files to Modify:** `src/components/charts/EpisodeHeatmap.jsx`, `src/components/charts/EpisodeHeatmap.module.css`

### 15. Data Storytelling Mode (auto-generated scrollytelling)

- **Description:** A "Story" button on any TV show that generates an auto-narrated scrollytelling experience — walking through the show's rating journey with scroll-triggered chart animations at each narrative beat.
- **Instructions:** You are implementing a data storytelling mode for a movie rating application (RatingVault) using React + Vite and Framer Motion. Create `src/components/storytelling/RatingStory.jsx` component that accepts episode rating data (seasons array with episodes) and generates a vertical scrollytelling narrative. The component: (1) Analyzes the data to identify key story beats: series premiere rating, best episode (highest rated), worst episode (lowest rated), biggest season-over-season change, finale rating, overall trend (improving/declining/stable), (2) Renders each beat as a full-viewport-height scroll section with: a narrative text block on the left ("This show debuted strong at 8.2 in Season 1..."), a chart visualization on the right that animates into view when scrolled into the viewport (use Framer Motion `whileInView`), (3) Charts include: a line chart that draws itself progressively (stroke-dashoffset animation) up to the current story beat's episode, a highlighted point for the featured episode, (4) Transitions between beats use fade + slide animations triggered by Intersection Observer. Create `src/components/storytelling/RatingStory.module.css`. Add a "Story Mode" button (BookOpen icon from Lucide) on TitleDetail.jsx for TV shows (only when season data exists). Clicking opens the story as a full-screen overlay with a close button. The narrative text should be generated dynamically from the data — no hardcoded strings.
- **Implementation Guide:**
  - Analyze episode data for key story beats (premiere, best, worst, trends)
  - Generate dynamic narrative text from data analysis
  - Render each beat as a viewport-height scroll section
  - Left: narrative text, Right: animated chart visualization
  - Charts draw progressively using stroke-dashoffset animation
  - Intersection Observer triggers animations on scroll
  - Full-screen overlay with close button
  - "Story Mode" button on TitleDetail (TV shows only)
- **Dependencies:** `framer-motion` (already installed)
- **Files to Create:** `src/components/storytelling/RatingStory.jsx`, `src/components/storytelling/RatingStory.module.css`
- **Files to Modify:** `src/pages/TitleDetail.jsx`

## 🧩 Interactive Features

### 16. Versus Arena Mode (tournament bracket)

- **Description:** Upgrade the Compare page into a full tournament bracket experience where users seed 8 or 16 titles and watch them battle through elimination rounds with dramatic animations.
- **Instructions:** You are implementing a versus arena tournament mode for a movie rating application (RatingVault) using React + Vite and Framer Motion. Create `src/pages/Arena.jsx` page with: (1) Title selection phase: a search bar (reuse tmdb.search) where users add 8 or 16 titles to a roster. Show selected titles as draggable cards that can be reordered for seeding, (2) Bracket generation: auto-generate a single-elimination bracket (8 titles = 3 rounds, 16 = 4 rounds). Display as a classic tournament bracket SVG/CSS layout with connecting lines between matchups, (3) Battle phase: each matchup shows a dramatic split-screen — left title vs right title with a lightning bolt "VS" divider (animated with CSS glow pulse). Titles "fight" based on a composite score: (rating × 0.5) + (log10(vote_count) × 0.3) + (popularity_normalized × 0.2). After 2 seconds, the winner slides to center with a gold border flash, the loser fades and shrinks. Winner advances to next round bracket position with a path-drawing animation along the connecting line, (4) Final: the champion gets a full-screen reveal with confetti burst (CSS confetti: 50 small rectangles with random rotation, color, and fall animation) and a gold crown icon. Create `src/pages/Arena.module.css`. Add route `/arena` in App.jsx and navigation link in Navbar. Include a "New Tournament" reset button.
- **Implementation Guide:**
  - Search and select 8 or 16 titles for the roster
  - Generate single-elimination bracket layout (SVG connecting lines)
  - Split-screen VS matchups with lightning bolt divider
  - Composite scoring: rating × 0.5 + log10(votes) × 0.3 + popularity × 0.2
  - Winner animation: gold flash + slide to center, loser fades
  - Path-drawing animation along bracket lines for advancing
  - Champion reveal: confetti burst (CSS) + crown icon
  - Add `/arena` route and Navbar link
- **Dependencies:** `framer-motion` (already installed)
- **Files to Create:** `src/pages/Arena.jsx`, `src/pages/Arena.module.css`
- **Files to Modify:** `src/App.jsx`, `src/components/layout/Navbar.jsx`

### 17. Rating Roulette (genre spin wheel)

- **Description:** A fun, tactile spinning wheel divided by genre segments — spin to get a random highly-rated title from that genre with satisfying physics and a dramatic reveal.
- **Instructions:** You are implementing a rating roulette feature for a movie rating application (RatingVault) using React + Vite and CSS transforms. Create `src/pages/Roulette.jsx` page with: (1) A large SVG wheel (400px diameter) divided into 8-10 colored segments, each labeled with a genre (Action, Comedy, Drama, Horror, Sci-Fi, Romance, Animation, Thriller, Documentary, Fantasy). Each segment uses a distinct color from a curated palette that complements the dark theme, (2) A "SPIN" button at center of the wheel. On click, apply a CSS `transform: rotate()` animation with cubic-bezier easing that simulates real physics — fast initial spin (2000-3000 degrees over 4 seconds), gradual deceleration, slight bounce at the stop position. The final rotation is randomized, (3) A fixed pointer/arrow at the top of the wheel indicating the selected segment, (4) After the wheel stops, determine the genre under the pointer. Fetch top-rated titles from TMDB for that genre (use `discover/movie` endpoint with `with_genres` parameter — add this to tmdb.js service). Pick a random title from the results, (5) Reveal: the wheel fades back and a full-screen card flip animation (rotateY 0 to 180deg) reveals the chosen title's poster, name, year, and rating. A "View Details" button navigates to TitleDetail, (6) A "Spin Again" button resets the wheel. Style in `src/pages/Roulette.module.css`. Add a route `/roulette` and nav link. Add genre discovery endpoint to tmdb.js.
- **Implementation Guide:**
  - SVG wheel with 8-10 genre segments (distinct colors)
  - Center "SPIN" button triggers rotation animation
  - Physics: cubic-bezier for fast start, gradual deceleration, slight bounce
  - Random final rotation (2000-3000 deg over 4s)
  - Fixed pointer arrow at top to indicate selection
  - Fetch top-rated titles for selected genre (add discover endpoint to tmdb.js)
  - Card flip reveal: poster + title + rating (rotateY animation)
  - Add `/roulette` route and Navbar link
- **Dependencies:** none
- **Files to Create:** `src/pages/Roulette.jsx`, `src/pages/Roulette.module.css`
- **Files to Modify:** `src/App.jsx`, `src/components/layout/Navbar.jsx`, `src/services/tmdb.js`

### 18. Watchlist with Ritual Mode (movie night planner)

- **Description:** A saved watchlist where users can plan movie nights — complete with a curated viewing order, intermission cards, a shareable movie night poster, and an atmospheric countdown timer.
- **Instructions:** You are implementing a watchlist with ritual mode for a movie rating application (RatingVault) using React + Vite. Create `src/pages/Watchlist.jsx` page with: (1) Watchlist management: display saved titles from localStorage (add "Add to Watchlist" button on TitleDetail and poster cards throughout the app). Show watchlist as a draggable reorderable list (use HTML5 drag and drop API) with poster thumbnails, title, rating, and runtime, (2) "Ritual Mode" button: when clicked, transforms the watchlist into a movie night plan — calculates total runtime, adds 15-minute intermission cards between titles (styled as vintage "Intermission" theater cards with retro typography), shows estimated start and end times based on current time, (3) Shareable poster: a "Generate Poster" button that uses `html2canvas` to render a canvas element styled as a movie night poster — dark background, all selected title posters arranged in a 2x2 or 3x2 collage, date of the movie night, total runtime, and "RatingVault Movie Night" branding. Allow downloading as PNG, (4) Countdown mode: if user sets a future date/time for their movie night, show a full-screen atmospheric countdown timer with the first movie's backdrop as background, large countdown numbers in Cormorant Garamond, and a pulsing "Starting Soon" text. Style in `src/pages/Watchlist.module.css`. Add route `/watchlist`, nav link, and "Add to Watchlist" buttons across the app. Persist watchlist in localStorage.
- **Implementation Guide:**
  - localStorage-backed watchlist with add/remove/reorder
  - "Add to Watchlist" button on TitleDetail and poster cards
  - Draggable reorder using HTML5 drag and drop
  - Ritual Mode: total runtime, intermission cards, start/end time estimates
  - Shareable poster via `html2canvas` (collage layout, branding, download as PNG)
  - Countdown timer with backdrop, large countdown numbers, pulsing text
  - Add `/watchlist` route and Navbar link
- **Dependencies:** `html2canvas`
- **Files to Create:** `src/pages/Watchlist.jsx`, `src/pages/Watchlist.module.css`
- **Files to Modify:** `src/App.jsx`, `src/components/layout/Navbar.jsx`, `src/pages/TitleDetail.jsx`, `src/pages/Home.jsx`

### 19. 3D Globe of World Cinema (interactive geography)

- **Description:** A dedicated page with a slowly rotating 3D globe where countries light up based on their top-rated titles, with glowing arcs connecting co-production countries.
- **Instructions:** You are implementing a 3D world cinema globe for a movie rating application (RatingVault) using React + Vite. Install `globe.gl` (lightweight WebGL globe) or `three` + `three-globe`. Create `src/pages/WorldMap.jsx` page with: (1) A 3D globe (fills 80% viewport) with dark theme styling — dark ocean (#0e0e0f), subtle country borders in gold (#c8a96e at 20% opacity), atmosphere glow in warm amber, (2) Slowly auto-rotates. On mouse drag, user can freely rotate/zoom, (3) Countries are shaded by cinema output — use TMDB's region-based data or pre-defined mapping of top cinema countries (USA, India, UK, South Korea, Japan, France, etc.) with color intensity from dim amber to bright gold, (4) Click a country: the globe smoothly zooms in, a panel slides out from the right showing that country's highest-rated titles (fetch from TMDB discover endpoint with `region` parameter — add to tmdb.js), (5) Glowing arcs connect countries that frequently co-produce films (pre-defined data for major co-production corridors: USA-UK, USA-Canada, France-Belgium, India-UK, etc.), arcs are animated with a traveling dot, (6) A search bar above the globe to jump to a country. Create `src/pages/WorldMap.module.css`. Add route `/world` and nav link. Ensure WebGL fallback message for unsupported browsers.
- **Implementation Guide:**
  - Install `globe.gl` for lightweight WebGL globe rendering
  - Dark-themed globe: dark ocean, gold borders, amber atmosphere
  - Auto-rotation with user drag/zoom interaction
  - Country shading by cinema output (predefined top cinema nations)
  - Click country: zoom in + slide-out panel with top titles
  - Add TMDB discover-by-region endpoint to tmdb.js
  - Animated arcs for co-production corridors (traveling dot effect)
  - Country search bar for quick navigation
  - WebGL fallback for unsupported browsers
- **Dependencies:** `globe.gl`
- **Files to Create:** `src/pages/WorldMap.jsx`, `src/pages/WorldMap.module.css`
- **Files to Modify:** `src/App.jsx`, `src/components/layout/Navbar.jsx`, `src/services/tmdb.js`

### 20. Timeline Voyager (decade-by-decade cinema history)

- **Description:** A horizontally scrollable decade-by-decade timeline showing the evolution of cinema ratings, where each era has its own visual style and landmark film markers.
- **Instructions:** You are implementing a timeline voyager for a movie rating application (RatingVault) using React + Vite and CSS. Create `src/pages/Timeline.jsx` page with: (1) A full-width horizontally scrollable timeline spanning 1950s through 2020s. Each decade is a "chapter" occupying ~100vw width, (2) Each decade has its own visual style applied via CSS variables scoped to that section — 1950s-60s: sepia tones and vintage grain; 1970s: warm browns and gritty texture; 1980s: neon accents (#ff6ec7, #00ffff) and grid background; 1990s: muted earth tones; 2000s: cool blues; 2010s: clean minimal; 2020s: default app theme, (3) Within each decade: a curated list of 5-8 landmark titles (hardcoded data with TMDB IDs) displayed as floating poster cards, average rating for the era shown as a large number, a one-line "era summary" text, (4) A draggable playhead/scrubber at the bottom — dragging it scrubs horizontally through the decades with smooth parallax (background moves at 0.5x speed, posters at 1x, text at 1.2x), (5) Clicking any poster navigates to TitleDetail, (6) Decade transition: a brief visual "flash" effect (white overlay, 100ms) when crossing from one decade to the next, like a camera flash between eras. Style in `src/pages/Timeline.module.css`. Use CSS `scroll-snap-type: x mandatory` for clean decade stops. Add route `/timeline` and nav link.
- **Implementation Guide:**
  - Horizontal scroll layout with CSS scroll-snap (x mandatory)
  - Each decade = ~100vw section with scoped CSS variables for era style
  - Era styles: sepia (50s-60s), gritty (70s), neon (80s), earthy (90s), cool (2000s), minimal (2010s)
  - 5-8 hardcoded landmark titles per decade (poster cards with TMDB IDs)
  - Draggable scrubber with parallax (background 0.5x, posters 1x, text 1.2x)
  - Decade transition flash effect (white overlay, 100ms)
  - Click poster to navigate to TitleDetail
  - Add `/timeline` route and Navbar link
- **Dependencies:** none
- **Files to Create:** `src/pages/Timeline.jsx`, `src/pages/Timeline.module.css`
- **Files to Modify:** `src/App.jsx`, `src/components/layout/Navbar.jsx`

### 21. Constellation View / Rating Galaxy (starfield visualization)

- **Description:** A starfield visualization where every title is a star whose brightness corresponds to its rating, clustering into genre constellations that users can zoom in and out of.
- **Instructions:** You are implementing a constellation/rating galaxy view for a movie rating application (RatingVault) using React + Vite and HTML5 Canvas. Create `src/pages/Galaxy.jsx` page with: (1) A fullscreen dark canvas (#0a0a0b) rendering 200+ titles as "stars" (small circles, 2-6px radius based on popularity). Star brightness (opacity 0.2-1.0) maps to rating (low rating = dim, high rating = bright), color maps to genre (Action: red, Comedy: yellow, Drama: blue, Horror: purple, Sci-Fi: cyan, Romance: pink, etc.), (2) Stars are positioned using a force-directed layout or simple genre-based clustering — titles of the same genre group into loose clusters ("constellations"). Draw faint connecting lines between nearby same-genre stars to form constellation shapes, (3) Camera controls: mouse wheel zooms in/out, click and drag pans. When zoomed out, see the full galaxy with genre labels floating at cluster centers. When zoomed in close, individual stars show title name on hover (canvas hitbox detection), (4) Click a star to open a small popup card (positioned on canvas) with poster thumbnail, title, rating, and "View Details" link, (5) A genre legend panel in the corner mapping colors to genres, (6) Slow ambient drift animation — all stars gently move in a circular orbit (0.1px/frame) creating a living, breathing galaxy. Use `requestAnimationFrame` for render loop, canvas transforms for zoom/pan. Create `src/pages/Galaxy.module.css`. Add route `/galaxy` and nav link.
- **Implementation Guide:**
  - Fullscreen canvas with 200+ title "stars"
  - Star size = popularity, brightness = rating, color = genre
  - Genre-based clustering with faint connecting lines (constellations)
  - Zoom (mouse wheel) and pan (drag) controls via canvas transforms
  - Hover detection: show title name near star
  - Click: popup card with poster, title, rating, "View Details" link
  - Genre color legend panel
  - Ambient circular drift animation (0.1px/frame)
  - requestAnimationFrame render loop
  - Add `/galaxy` route and Navbar link
- **Dependencies:** none
- **Files to Create:** `src/pages/Galaxy.jsx`, `src/pages/Galaxy.module.css`
- **Files to Modify:** `src/App.jsx`, `src/components/layout/Navbar.jsx`, `src/services/tmdb.js`

### 22. Soundtrack / Trailer Theater Mode (immersive media playback)

- **Description:** A dedicated trailer viewing experience that dims the lights, draws curtains, and shows cinema seat silhouettes — making trailer watching feel like a real theater experience.
- **Instructions:** You are implementing a trailer theater mode for a movie rating application (RatingVault) using React + Vite and CSS animations. Create `src/components/ui/TrailerTheater.jsx` component that accepts a YouTube video key (from TMDB's videos data, already fetched via `append_to_response=videos` in tmdb.js). When the "Watch Trailer" button is clicked on TitleDetail: (1) The page dims: a full-screen overlay fades in (background: rgba(0,0,0,0.95), z-index: 100) over 600ms, (2) Curtain animation: two CSS-animated panels (dark red, #3a0a0a) slide in from left and right edges, pause for 500ms, then slide apart to reveal the video embed area, (3) YouTube iframe (16:9, max-width 900px) fades in at center, (4) Cinema seat silhouettes: a decorative row of dark seat shapes at the bottom of the viewport (CSS clip-path or SVG, subtle and non-distracting), (5) A vinyl record icon in the top-right corner with a "Now Playing" label and the movie title, slowly spinning (CSS rotate animation), (6) Close button (X icon) in top-right. On close: video stops, curtains close, overlay fades out. Also create a small waveform visualizer: 5 thin bars next to the vinyl icon that animate at different heights (random CSS keyframes) to simulate audio visualization — purely decorative, not connected to actual audio. Style in `src/components/ui/TrailerTheater.module.css`. Add "Watch Trailer" button to TitleDetail.jsx (only show when video data exists).
- **Implementation Guide:**
  - Full-screen dimming overlay (rgba(0,0,0,0.95), 600ms fade)
  - Curtain animation: two panels slide apart from center (dark red)
  - YouTube iframe embed (16:9, 900px max, from TMDB videos data)
  - Cinema seat silhouettes at viewport bottom (CSS/SVG)
  - Spinning vinyl icon with "Now Playing" label
  - Decorative waveform bars (5 bars, random height keyframes)
  - Close: stop video, close curtains, fade out overlay
  - "Watch Trailer" button on TitleDetail (conditional on video data)
- **Dependencies:** none
- **Files to Create:** `src/components/ui/TrailerTheater.jsx`, `src/components/ui/TrailerTheater.module.css`
- **Files to Modify:** `src/pages/TitleDetail.jsx`

### 23. Director & Actor Constellation Map (relationship web)

- **Description:** An interactive force-directed graph showing the relationship web of cast and crew for any title — lines connect actors who've worked together before, revealing hidden Hollywood connections.
- **Instructions:** You are implementing a director and actor constellation map for a movie rating application (RatingVault) using React + Vite and HTML5 Canvas (or SVG). Create `src/components/ui/CrewConstellation.jsx` component that accepts cast/crew data (from TMDB credits, already fetched). The component: (1) Renders a force-directed graph where each node is a cast/crew member (circular node with their profile photo if available, or initials). The central node is the title itself (poster thumbnail), (2) Edges connect the title to all cast/crew. Edge thickness represents the member's billing order (lead actors = thicker lines), (3) For the top 5-8 cast members, fetch their other known credits (add a `personCredits(personId)` endpoint to tmdb.js using `/person/{id}/combined_credits`). Draw secondary edges connecting actors who share other titles — line label shows the shared title name, (4) Force simulation: nodes repel each other, edges pull connected nodes together, central title node is fixed. Use a simple Verlet integration loop (no external physics library needed), (5) Hover a node: highlight all its connections, dim others. Click a node: expand to show that person's filmography as a radial sunburst of small poster thumbnails, (6) Zoom and pan support. Container is 100% width, 500px height. Style in `src/components/ui/CrewConstellation.module.css`. Add as a collapsible section on TitleDetail.jsx below the cast list.
- **Implementation Guide:**
  - Force-directed graph with cast/crew as nodes (photos or initials)
  - Central node = title poster, edges = cast connections
  - Edge thickness = billing order (lead actors thicker)
  - Add `personCredits()` endpoint to tmdb.js
  - Secondary edges between actors sharing other titles
  - Simple Verlet integration physics (no external library)
  - Hover: highlight connections, dim others
  - Click: radial sunburst of person's filmography
  - Zoom/pan support, 500px height container
  - Collapsible section on TitleDetail
- **Dependencies:** none
- **Files to Create:** `src/components/ui/CrewConstellation.jsx`, `src/components/ui/CrewConstellation.module.css`
- **Files to Modify:** `src/pages/TitleDetail.jsx`, `src/services/tmdb.js`

### 24. Genre Fingerprint Visualization (unique radial identity)

- **Description:** Every title gets a unique radial fingerprint generated from its metadata — a circular barcode-like ring where no two titles look the same, enabling visual similarity discovery.
- **Instructions:** You are implementing genre fingerprint visualization for a movie rating application (RatingVault) using React + Vite and SVG. Create `src/components/ui/GenreFingerprint.jsx` component that accepts title metadata (genres, runtime, rating, popularity, vote_count, release_year) and renders a unique radial fingerprint: (1) An SVG circle (200px diameter) with multiple concentric rings, each representing a data dimension: innermost ring segments = genres (each genre gets an arc, colored by genre palette), next ring = runtime mapped to ring thickness (short film = thin, 3hr epic = thick), next ring = rating mapped to brightness/saturation, next ring = popularity as a waveform (sine wave with amplitude = popularity, frequency = vote_count), outermost ring = release decade as a subtle color tint, (2) The combined effect creates a unique visual identity for each title — like a DNA strand or vinyl record groove, (3) Render as inline SVG for crispness. Add a subtle rotate animation (360deg over 30s, paused on hover), (4) On the Compare page, show fingerprints side-by-side with a "Similarity Score" percentage calculated from the Euclidean distance between normalized metadata vectors. Create `src/components/ui/GenreFingerprint.module.css`. Add fingerprint to TitleDetail.jsx (in the stats area) and Compare.jsx (in each comparison panel). The fingerprint should be visually striking and feel like a premium data-art element.
- **Implementation Guide:**
  - SVG circle with concentric rings per data dimension
  - Inner: genre arcs (colored), then runtime (thickness), rating (brightness), popularity (waveform), decade (tint)
  - Each title produces a visually unique fingerprint
  - Slow rotation animation (30s, pauses on hover)
  - Similarity score on Compare: Euclidean distance of normalized metadata
  - Inline SVG rendering for crisp display
  - Add to TitleDetail (stats area) and Compare (both panels)
- **Dependencies:** none
- **Files to Create:** `src/components/ui/GenreFingerprint.jsx`, `src/components/ui/GenreFingerprint.module.css`
- **Files to Modify:** `src/pages/TitleDetail.jsx`, `src/pages/Compare.jsx`

### 25. Achievement System (gamified exploration badges)

- **Description:** A badge/achievement system that rewards users for exploring the app — earning animated metallic coin badges for milestones like viewing titles from 10+ countries or finding obscure titles.
- **Instructions:** You are implementing an achievement system for a movie rating application (RatingVault) using React + Vite. Create `src/hooks/useAchievements.js` hook that tracks user activity in localStorage and checks against achievement criteria. Create `src/components/ui/AchievementBadge.jsx` component for displaying badges. Create `src/pages/Achievements.jsx` page. Achievements to implement: (1) "First Impression" — viewed your first title detail page (track in localStorage on TitleDetail mount), (2) "Binge Analyst" — viewed episode ratings for 5+ different TV shows, (3) "Versus Victor" — completed 10+ comparisons on the Compare page, (4) "Deep Cut" — viewed a title with fewer than 500 votes, (5) "Perfect Score" — found a title rated 9.0 or above, (6) "Marathon Runner" — added 5+ titles to watchlist, (7) "Genre Explorer" — viewed titles from 5+ different genres, (8) "Night Owl" — used the app between midnight and 4am. Each badge renders as an animated metallic coin: a CSS 3D coin flip animation (rotateY) on unlock, with embossed icon and title text. Locked badges show as dark/grayed silhouettes. The achievement page shows all badges in a grid. When a new achievement unlocks, show a toast notification (slide in from top-right, auto-dismiss after 4s) with the coin flip animation. Create `src/components/ui/AchievementToast.jsx` for the notification. Track all progress in localStorage under a `rv-achievements` key. Add route `/achievements` and a small badge counter in Navbar.
- **Implementation Guide:**
  - `useAchievements.js` hook: track activity in localStorage, check criteria
  - 8 achievements with distinct criteria tracking
  - `AchievementBadge.jsx`: metallic coin with 3D flip animation on unlock
  - Locked badges: grayed silhouettes
  - `AchievementToast.jsx`: slide-in notification on new unlock (4s auto-dismiss)
  - `Achievements.jsx` page: grid of all badges with progress indicators
  - Track progress under `rv-achievements` localStorage key
  - Badge counter indicator in Navbar
  - Add `/achievements` route
- **Dependencies:** none
- **Files to Create:** `src/hooks/useAchievements.js`, `src/components/ui/AchievementBadge.jsx`, `src/components/ui/AchievementToast.jsx`, `src/pages/Achievements.jsx`, `src/pages/Achievements.module.css`
- **Files to Modify:** `src/App.jsx`, `src/components/layout/Navbar.jsx`, `src/pages/TitleDetail.jsx`, `src/pages/Compare.jsx`

### 26. AI-Powered "Rate My Taste" Feature (cinema personality profiler)

- **Description:** Users paste a list of their favorite movies, and the app generates a taste profile radar chart, a cinema personality label, and curated recommendations — revealed with a dramatic envelope-opening animation.
- **Instructions:** You are implementing a "Rate My Taste" feature for a movie rating application (RatingVault) using React + Vite and Recharts. Create `src/pages/TasteProfile.jsx` page with: (1) Input phase: a text area where users type or paste movie titles (one per line, up to 10). As they type each line, debounced search against TMDB to auto-match and show the matched title with poster thumbnail. A "Generate Profile" button becomes active when 5+ titles are matched, (2) Analysis: for each matched title, fetch full details (genres, rating, release year, popularity) using existing tmdb.movie/tmdb.tv. Calculate: genre distribution (% of each genre across all picks), average rating preference, decade distribution, popularity preference (mainstream vs. niche based on vote_count), (3) Radar chart: render a Recharts RadarChart with 6 axes: Action/Adventure, Drama, Comedy, Horror/Thriller, Sci-Fi/Fantasy, Romance. Each axis value = percentage of user's picks in that genre family. Style with gold fill (#c8a96e at 30% opacity) and gold stroke, (4) Cinema personality: generate a label based on analysis — e.g., average rating > 8 + niche picks = "Arthouse Connoisseur", high action + mainstream = "Blockbuster Enthusiast", wide genre spread = "Eclectic Cinephile", heavy drama = "Emotional Depth Seeker". Display as a large typographic headline, (5) Recommendations: find genres the user hasn't explored and suggest top-rated titles from those genres (use TMDB discover), (6) Reveal animation: the entire profile (radar + personality + recs) is hidden behind an "envelope" — a CSS animation where a envelope flap opens (rotateX) and the content slides up from inside. Style in `src/pages/TasteProfile.module.css`. Add route `/taste` and nav link.
- **Implementation Guide:**
  - Text area input with debounced TMDB search matching (5-10 titles)
  - Fetch full details for all matched titles
  - Calculate: genre distribution, avg rating, decade spread, popularity preference
  - Recharts RadarChart with 6 genre-family axes (gold styled)
  - Cinema personality label generated from analysis patterns
  - Recommendations from unexplored genres (TMDB discover)
  - Envelope-opening reveal animation (CSS rotateX + slide up)
  - Add `/taste` route and Navbar link
- **Dependencies:** none (uses existing `recharts`)
- **Files to Create:** `src/pages/TasteProfile.jsx`, `src/pages/TasteProfile.module.css`
- **Files to Modify:** `src/App.jsx`, `src/components/layout/Navbar.jsx`, `src/services/tmdb.js`

### 27. Export & Share as Art (social cards + wallpapers)

- **Description:** Generate beautifully designed shareable rating cards for social media, downloadable desktop/phone wallpapers from backdrops, and side-by-side battle card images from comparisons.
- **Instructions:** You are implementing export and share features for a movie rating application (RatingVault) using React + Vite. Install `html2canvas`. Create `src/components/ui/ShareCard.jsx` component and `src/utils/exportUtils.js` utility. Implement: (1) Rating card: on TitleDetail, add a "Share" button (Share2 icon from Lucide). Clicking opens a modal showing a preview of a beautifully styled card (fixed 1080x1350px for Instagram, or 1200x630px for Twitter — offer both). The card contains: movie poster (left 40%), dark background (#0e0e0f) with title in Cormorant Garamond, rating with color tier ring, genre tags, year, and "RatingVault" watermark in bottom-right. Use html2canvas to render the modal content to a canvas, then offer "Download PNG" and "Copy to Clipboard" buttons, (2) Wallpaper: on TitleDetail, add a "Download Wallpaper" button. Renders the backdrop image with a dark gradient overlay, the title text centered, and the rating — in phone (1080x1920) and desktop (2560x1440) aspect ratios. User selects format before download, (3) Battle card: on Compare page, add "Share Comparison" button. Renders a VS-style card with both titles' posters, ratings, and a winner crown on the higher-rated one. Create `src/components/ui/ShareCard.module.css`. The exported images should maintain the app's premium dark aesthetic and feel like curated art pieces.
- **Implementation Guide:**
  - Install `html2canvas` for client-side rendering
  - Rating card: 1080x1350 (Instagram) or 1200x630 (Twitter) with poster + stats
  - Render card in modal preview, then export via html2canvas
  - "Download PNG" and "Copy to Clipboard" buttons
  - Wallpaper: backdrop + overlay + title + rating in phone/desktop sizes
  - Battle card: VS layout with both titles and winner crown
  - "RatingVault" watermark on all exports
  - Premium dark aesthetic on all generated images
- **Dependencies:** `html2canvas`
- **Files to Create:** `src/components/ui/ShareCard.jsx`, `src/components/ui/ShareCard.module.css`, `src/utils/exportUtils.js`
- **Files to Modify:** `src/pages/TitleDetail.jsx`, `src/pages/Compare.jsx`

### 28. Social Proof & Community Layer (live ticker + quote cards)

- **Description:** Add a simulated "Watching Now" live ticker of trending titles, a Critics vs. Audience toggle, and rotating famous movie quote cards with Ken Burns backdrop zoom.
- **Instructions:** You are implementing a social proof and community layer for a movie rating application (RatingVault) using React + Vite and CSS animations. Create `src/components/ui/LiveTicker.jsx` component: a horizontal scrolling ticker bar (positioned below Navbar or at bottom of Home page) showing simulated "live" activity — "Someone viewed Breaking Bad", "Oppenheimer trending now", "The Godfather compared with Goodfellas". Generate messages from trending data (already fetched). Use CSS `@keyframes` marquee animation (translate X from 100% to -100%, 30s linear infinite). Create `src/components/ui/QuoteCard.jsx` component: display famous movie quotes on the Home page hero area. Maintain an array of 15-20 hardcoded iconic quotes with attribution (e.g., "Here's looking at you, kid." — Casablanca). Rotate quotes every 8 seconds with a fade transition. The backdrop behind the quote uses a Ken Burns effect (slow CSS scale from 1.0 to 1.1 over 8s, synchronized with quote rotation). Create `src/components/ui/CriticsToggle.jsx` for TitleDetail: a toggle switch (TMDB / Audience) that, when switched, shows TMDB rating normally and a simulated "audience score" (TMDB rating ± random 0.3-0.7 offset, stored per title in sessionStorage for consistency). Style each component in its own `.module.css`. Integrate LiveTicker into Home.jsx (below hero), QuoteCard into Home.jsx (hero overlay), CriticsToggle into TitleDetail.jsx (near rating display).
- **Implementation Guide:**
  - LiveTicker: CSS marquee of simulated activity messages from trending data
  - 30s linear infinite translateX animation
  - QuoteCard: 15-20 hardcoded iconic quotes, 8s rotation with fade
  - Ken Burns backdrop zoom (scale 1.0 to 1.1, 8s, synced with quotes)
  - CriticsToggle: TMDB vs simulated audience score (±0.3-0.7 offset)
  - Store simulated scores in sessionStorage for consistency
  - Integrate: LiveTicker on Home, QuoteCard on hero, CriticsToggle on TitleDetail
- **Dependencies:** none
- **Files to Create:** `src/components/ui/LiveTicker.jsx`, `src/components/ui/LiveTicker.module.css`, `src/components/ui/QuoteCard.jsx`, `src/components/ui/QuoteCard.module.css`, `src/components/ui/CriticsToggle.jsx`, `src/components/ui/CriticsToggle.module.css`
- **Files to Modify:** `src/pages/Home.jsx`, `src/pages/TitleDetail.jsx`

### 29. Rating Decay / Aging Chart (timeless vs. hype indicator)

- **Description:** Visualize how a title's perceived quality ages over time — classics get a "Timeless" badge while overhyped new releases get a "Hype Alert," with a wine bottle metaphor for aging.
- **Instructions:** You are implementing a rating decay/aging visualization for a movie rating application (RatingVault) using React + Vite, Recharts, and CSS. Create `src/components/ui/AgingIndicator.jsx` component that accepts title metadata (release_date, vote_average, vote_count, popularity). The component: (1) Calculates an "aging score" based on: years since release × vote_count growth factor. Titles older than 20 years with rating > 7.5 and > 1000 votes = "Timeless" (they've stood the test of time). Titles less than 2 years old with rating > 8.0 and high popularity but < 5000 votes = "Hype Alert" (rating may be inflated by recency), (2) Displays a visual metaphor: an SVG wine bottle that fills proportionally — Timeless titles fill to 90-100% (deep amber color), recent titles fill to 20-30% (light gold). A subtle cork-pop animation (translateY bounce on the cork element) plays for Timeless titles on page load, (3) A badge overlay: "Timeless Classic" (green, --rating-great) or "Hype Alert" (amber, --rating-mid) or "Maturing" (neutral) for titles in between, (4) An optional expandable Recharts AreaChart showing a theoretical aging curve — a projected line from release date to present based on the aging model (exponential decay for hype, logarithmic growth for classics). Style in `src/components/ui/AgingIndicator.module.css`. Add to TitleDetail.jsx in the stats area.
- **Implementation Guide:**
  - Calculate aging score from release date, votes, rating, popularity
  - Classify: "Timeless" (old + high rated + many votes), "Hype Alert" (new + high rated + few votes), "Maturing" (in between)
  - SVG wine bottle with fill level mapped to aging score
  - Cork-pop animation for Timeless titles (translateY bounce)
  - Badge overlay with tier color
  - Optional AreaChart with projected aging curve
  - Add to TitleDetail stats area
- **Dependencies:** none (uses existing `recharts`)
- **Files to Create:** `src/components/ui/AgingIndicator.jsx`, `src/components/ui/AgingIndicator.module.css`
- **Files to Modify:** `src/pages/TitleDetail.jsx`

### 30. Immersive Search Redesign (full-screen cinematic search)

- **Description:** Transform the search overlay into a full-screen cinematic experience with large poster results, backdrop previews, and keyboard-navigable results that feel like browsing a film catalog.
- **Instructions:** You are redesigning the search experience for a movie rating application (RatingVault) using React + Vite and Framer Motion. Update `src/components/layout/Navbar.jsx` search overlay: (1) When search opens, animate to a true full-screen overlay (100vw × 100vh, background #0e0e0f at 98% opacity) with the search input centered at the top (large, 48px font in Cormorant Garamond, minimal underline styling instead of a box), (2) Results display as large cards (3 per row on desktop, 1 on mobile) instead of the current compact list. Each card shows: poster (w342 size), title, year, rating with tier color dot, and media type badge (Film/Series), (3) The top result's backdrop image loads as a subtle full-screen background behind all results (20% opacity, blur 20px), changing as the user arrows through results, (4) Full keyboard navigation: arrow keys move between results (highlighted with a gold border), Enter navigates to the selected title, Escape closes search, (5) Recent searches: below the input, show last 5 searches from localStorage with a clock icon, clickable to re-search, (6) Entrance animation: results stagger in from below (Framer Motion, 50ms delay between each). Exit animation: results fade out simultaneously, overlay shrinks to the search icon position. Update `Navbar.module.css` with new styles. The search should feel like a premium, full-screen film catalog browser.
- **Implementation Guide:**
  - Full-screen overlay (100vw × 100vh) with large centered search input
  - Large result cards (3/row desktop, 1/row mobile) with poster + metadata
  - Top result's backdrop as subtle full-screen background (20% opacity, blur)
  - Backdrop updates on arrow key navigation through results
  - Full keyboard nav: arrows, Enter to select, Escape to close
  - Recent searches from localStorage (last 5, with clock icon)
  - Framer Motion stagger entrance (50ms delay) and exit animations
  - Gold border highlight on focused result
- **Dependencies:** `framer-motion` (already installed)
- **Files to Create:** none
- **Files to Modify:** `src/components/layout/Navbar.jsx`, `src/components/layout/Navbar.module.css`

## ⚡ Performance & Polish

### 31. Image Optimization & Smart Loading (responsive + LQIP)

- **Description:** Modernize image handling with responsive image sets, low-quality image placeholders for instant perceived loading, and preloading for critical above-the-fold images.
- **Instructions:** You are optimizing image loading for a movie rating application (RatingVault) using React + Vite. Create `src/components/ui/SmartImage.jsx` component that wraps all TMDB image usage with: (1) Responsive loading: use TMDB's multiple image sizes (w92, w154, w185, w342, w500, w780, original) in `srcSet` attribute, with `sizes` attribute for responsive selection based on viewport, (2) LQIP (Low Quality Image Placeholder): load the w92 thumbnail first as a blurred placeholder (CSS `filter: blur(12px)`, scaled up to fill container), then swap to full-size image on load with a smooth 300ms opacity crossfade, (3) Lazy loading: use native `loading="lazy"` and `decoding="async"` for all images below the fold. For critical above-the-fold images (hero backdrop, first 4 poster cards), add `<link rel="preload" as="image">` in the document head using a React portal or useEffect, (4) Error handling: on image load failure, show a styled fallback (dark gradient background with a Film icon from Lucide and the title text), (5) Aspect ratio containers: wrap images in containers with `aspect-ratio` CSS to prevent layout shift (CLS). Create `src/components/ui/SmartImage.module.css`. Replace all `<img>` tags across the app (Home.jsx posters, TitleDetail.jsx poster/backdrop, Charts.jsx thumbnails, Compare.jsx posters, Navbar.jsx search results) with `<SmartImage>`. Update tmdb.js to export a helper that generates srcSet strings from a TMDB image path.
- **Implementation Guide:**
  - Create SmartImage component with srcSet from TMDB image sizes
  - LQIP: load w92 blurred placeholder, crossfade to full image (300ms)
  - Native lazy loading + decoding async for below-fold images
  - Preload critical images (hero, first 4 posters) via `<link rel="preload">`
  - Error fallback: gradient + Film icon + title text
  - Aspect ratio containers to prevent CLS
  - Replace all `<img>` tags across the app
  - Add srcSet helper to tmdb.js
- **Dependencies:** none
- **Files to Create:** `src/components/ui/SmartImage.jsx`, `src/components/ui/SmartImage.module.css`
- **Files to Modify:** `src/services/tmdb.js`, `src/pages/Home.jsx`, `src/pages/TitleDetail.jsx`, `src/pages/Charts.jsx`, `src/pages/Compare.jsx`, `src/components/layout/Navbar.jsx`

### 32. SEO & Social Sharing (meta tags + structured data)

- **Description:** Make every title page discoverable with dynamic meta tags, Open Graph cards, Twitter cards, and JSON-LD structured data for rich search results.
- **Instructions:** You are implementing SEO optimization for a movie rating application (RatingVault) using React + Vite. Install `react-helmet-async`. Create `src/components/SEO.jsx` component that accepts props (title, description, image, url, type) and renders via Helmet: (1) Basic meta tags: `<title>`, `<meta name="description">`, (2) Open Graph tags: `og:title`, `og:description`, `og:image` (use TMDB backdrop w780), `og:url`, `og:type` ("video.movie" or "video.tv_show"), (3) Twitter Card tags: `twitter:card` ("summary_large_image"), `twitter:title`, `twitter:description`, `twitter:image`, (4) JSON-LD structured data: Movie schema (`@type: "Movie"`, name, datePublished, aggregateRating from TMDB, image, director, genre) or TVSeries schema for shows, (5) Canonical URL for each page. Wrap `App.jsx` with `HelmetProvider`. Add SEO component to every page: Home (generic RatingVault branding), TitleDetail (dynamic per title), Charts (chart listing description), Compare (comparison tool description). Create `public/robots.txt` allowing all crawlers and referencing sitemap. Create basic `public/sitemap.xml` with static routes. Default meta tags in `index.html` for pages that haven't loaded yet.
- **Implementation Guide:**
  - Install `react-helmet-async`, wrap App with HelmetProvider
  - SEO component with OG, Twitter Card, and JSON-LD support
  - Dynamic meta per TitleDetail (title, description, backdrop image)
  - Movie/TVSeries JSON-LD schema with aggregateRating
  - Static meta for Home, Charts, Compare pages
  - robots.txt and sitemap.xml for static routes
  - Default meta in index.html as fallback
- **Dependencies:** `react-helmet-async`
- **Files to Create:** `src/components/SEO.jsx`, `public/robots.txt`, `public/sitemap.xml`
- **Files to Modify:** `src/App.jsx`, `src/pages/Home.jsx`, `src/pages/TitleDetail.jsx`, `src/pages/Charts.jsx`, `src/pages/Compare.jsx`, `index.html`

### 33. Offline Support & PWA (service worker + install prompt)

- **Description:** Turn RatingVault into a Progressive Web App with offline caching, an install prompt, and the ability to browse previously viewed titles without an internet connection.
- **Instructions:** You are implementing PWA support for a movie rating application (RatingVault) using React + Vite. Install `vite-plugin-pwa`. Configure in `vite.config.js`: (1) Generate a service worker using Workbox with these caching strategies: network-first for TMDB API calls (cache responses for 24 hours, serve stale on network failure), cache-first for TMDB images (cache for 7 days), precache the app shell (HTML, CSS, JS bundles), (2) Create `public/manifest.json` with: name "RatingVault", short_name "RV", theme_color "#c8a96e", background_color "#0e0e0f", display "standalone", icons (generate 192px and 512px icons matching the gold-on-dark brand), start_url "/", (3) Add manifest link and theme-color meta tag to `index.html`, (4) Create `src/components/ui/InstallPrompt.jsx` component that detects the `beforeinstallprompt` event and shows a branded install banner (gold accent, "Install RatingVault" text, app icon, dismiss button). Show once per session (sessionStorage flag), (5) Create `src/components/ui/OfflineIndicator.jsx` that detects offline status (navigator.onLine + online/offline events) and shows a subtle banner: "You're offline — showing cached content". Update `App.jsx` to include InstallPrompt and OfflineIndicator. The app should gracefully degrade offline, showing cached pages and a friendly message for uncached content.
- **Implementation Guide:**
  - Install `vite-plugin-pwa`, configure Workbox caching strategies
  - Network-first for API (24h cache), cache-first for images (7 days)
  - Precache app shell (HTML, CSS, JS)
  - Create manifest.json with brand colors and icons
  - InstallPrompt component: detect beforeinstallprompt, show branded banner
  - OfflineIndicator: detect offline status, show subtle banner
  - Add to index.html: manifest link, theme-color, apple-touch-icon
  - Graceful offline degradation with cached content
- **Dependencies:** `vite-plugin-pwa`
- **Files to Create:** `public/manifest.json`, `src/components/ui/InstallPrompt.jsx`, `src/components/ui/OfflineIndicator.jsx`
- **Files to Modify:** `vite.config.js`, `index.html`, `src/App.jsx`

### 34. Accessibility & Contrast Safety (WCAG compliance)

- **Description:** Ensure all text remains readable across cinematic backgrounds, with proper focus indicators, screen reader support, and keyboard navigation throughout the app.
- **Instructions:** You are implementing accessibility improvements for a movie rating application (RatingVault) using React + Vite. Audit and fix: (1) Color contrast: check all text-on-background combinations against WCAG AA (4.5:1 normal text, 3:1 large text). The current gold (#c8a96e) on dark (#0e0e0f) may pass for large text but fail for small — add a lighter gold variant (#d4bb82) for body text. Update `index.css` CSS variables with accessible token pairs, (2) Focus indicators: add visible focus rings (2px solid #c8a96e, 2px offset) on all interactive elements (links, buttons, cards). Use `:focus-visible` to only show on keyboard navigation (not mouse clicks). Update global styles in `index.css`, (3) Screen reader support: add `aria-label` to icon-only buttons (search, close, navigation icons) in Navbar.jsx. Add `role="img"` and `aria-label` to chart components (describe what the chart shows). Add `aria-live="polite"` to loading states and search results for dynamic content announcements, (4) Skip navigation: add a visually hidden "Skip to main content" link at the top of the page that becomes visible on focus, (5) Reduced motion: wrap all CSS animations and Framer Motion animations in `prefers-reduced-motion` checks — disable or simplify animations when the user prefers reduced motion. Add `useReducedMotion()` hook from Framer Motion in animated components.
- **Implementation Guide:**
  - Audit all color contrast ratios (WCAG AA compliance)
  - Add lighter gold variant (#d4bb82) for small body text
  - Visible focus rings with `:focus-visible` (2px solid gold, 2px offset)
  - aria-labels on icon buttons, charts, and dynamic content
  - aria-live regions for search results and loading states
  - "Skip to main content" hidden link
  - `prefers-reduced-motion` checks on all animations
  - `useReducedMotion()` hook for Framer Motion components
- **Dependencies:** none
- **Files to Create:** none
- **Files to Modify:** `src/index.css`, `src/components/layout/Navbar.jsx`, `src/components/charts/RatingLineChart.jsx`, `src/components/charts/EpisodeHeatmap.jsx`, `src/components/charts/SeasonRadar.jsx`, `src/App.jsx`

## 🧰 New Pages & Experiences

### 35. "Discover" Page (smart browsing with infinite scroll)

- **Description:** A dedicated discovery page with filterable, infinitely scrolling content — browse by genre, year, rating range, and sort order, with smooth card entrance animations.
- **Instructions:** You are implementing a Discover page for a movie rating application (RatingVault) using React + Vite. Create `src/pages/Discover.jsx` page with: (1) Filter bar at top: genre dropdown (fetch genre list from TMDB `/genre/movie/list` and `/genre/tv/list` — add endpoints to tmdb.js), year range selector (two number inputs for min/max year), minimum rating slider (0-10, step 0.5), media type toggle (Movies / TV / Both), sort dropdown (Popularity, Rating, Release Date, Vote Count), (2) Results grid: responsive CSS grid (auto-fill, minmax 200px) showing poster cards with title, year, rating badge. Cards animate in with the existing `cardIn` animation (staggered 40ms), (3) Infinite scroll: use Intersection Observer on a sentinel div at the bottom of the grid. When it enters the viewport, fetch the next page from TMDB discover endpoint (`/discover/movie` or `/discover/tv` with the active filters as query params — add discover endpoints to tmdb.js). Append results to existing list, (4) Empty state: when no results match filters, show a styled message with a Film icon and "No titles match your criteria — try adjusting your filters", (5) URL sync: persist active filters in URL query params (using React Router's useSearchParams) so filtered views are shareable/bookmarkable. Create `src/pages/Discover.module.css`. Add route `/discover` and prominent nav link in Navbar. This becomes the primary browsing experience beyond trending.
- **Implementation Guide:**
  - Filter bar: genre dropdown, year range, min rating slider, media type, sort
  - Add TMDB genre list and discover endpoints to tmdb.js
  - Responsive poster card grid with staggered entrance animation
  - Infinite scroll via Intersection Observer + TMDB pagination
  - Empty state with styled message
  - URL query param sync (useSearchParams) for shareable filter states
  - Add `/discover` route and Navbar link
- **Dependencies:** none
- **Files to Create:** `src/pages/Discover.jsx`, `src/pages/Discover.module.css`
- **Files to Modify:** `src/App.jsx`, `src/components/layout/Navbar.jsx`, `src/services/tmdb.js`

### 36. "Surprise Me" Quick Pick (one-tap random recommendation)

- **Description:** A single prominent button that instantly recommends a random highly-rated title with a satisfying reveal animation — zero friction discovery for indecisive viewers.
- **Instructions:** You are implementing a "Surprise Me" quick pick feature for a movie rating application (RatingVault) using React + Vite and CSS animations. Create `src/components/ui/SurpriseMe.jsx` component: (1) A prominent floating action button (FAB) in the bottom-right corner of every page — circular, 56px, gold (#c8a96e) background, dice icon (Dices from Lucide React), subtle shadow and pulse animation to draw attention, (2) On click: the button expands into a full-screen overlay. Show a slot-machine style animation: 3 poster images rapidly cycling vertically (CSS translateY keyframes, 100ms per frame) for 2 seconds, then decelerate and stop on the chosen title. The title is selected by: fetching a random page (1-20) from TMDB top-rated movies or TV (random choice), picking a random title from results with rating > 7.0, (3) Reveal: the cycling stops, the winning poster scales up to center with a golden glow border. Below it: title, year, rating, genre tags, and a "View Details" button that navigates to TitleDetail, plus a "Try Again" button that re-spins, (4) Add a satisfying "click" sound effect on spin (optional, use Web Audio API to generate a short click tone — no audio files needed). Create `src/components/ui/SurpriseMe.module.css`. Add the FAB to `App.jsx` so it appears on every page. Add `discoverRandom()` function to tmdb.js that fetches a random page of top-rated content.
- **Implementation Guide:**
  - Floating action button (56px, gold, bottom-right, dice icon)
  - Subtle pulse animation to attract attention
  - Click: expand to full-screen overlay
  - Slot machine: 3 posters cycling vertically, 2s spin, decelerate to stop
  - Random selection: TMDB top-rated random page, rating > 7.0
  - Reveal: poster scales up with golden glow, title + rating + "View Details"
  - "Try Again" button for re-spin
  - Add `discoverRandom()` to tmdb.js
  - FAB persistent on all pages via App.jsx
- **Dependencies:** none
- **Files to Create:** `src/components/ui/SurpriseMe.jsx`, `src/components/ui/SurpriseMe.module.css`
- **Files to Modify:** `src/App.jsx`, `src/services/tmdb.js`

### 37. "Collections" Hub (franchise & series grouping)

- **Description:** A page that groups movies by franchise/collection (TMDB's built-in collections data) — view the entire MCU, Lord of the Rings, or Fast & Furious saga with ratings charted across the franchise.
- **Instructions:** You are implementing a Collections hub for a movie rating application (RatingVault) using React + Vite and Recharts. Add a `collection(id)` endpoint to tmdb.js that fetches `/collection/{id}` from TMDB (returns collection name, overview, backdrop, poster, and all parts/movies). Create `src/pages/Collections.jsx` page with: (1) A curated grid of popular collections (hardcode 15-20 collection IDs for: MCU, Star Wars, Lord of the Rings, Harry Potter, Fast & Furious, James Bond, Batman, Spider-Man, Jurassic Park, The Godfather, Indiana Jones, Toy Story, Pirates of the Caribbean, Mission Impossible, John Wick). Display as large cards with collection backdrop, name, and movie count, (2) Click a collection to navigate to `src/pages/CollectionDetail.jsx` (route: `/collection/:id`). This page shows: collection backdrop header, all movies listed chronologically with poster, title, year, rating, (3) A Recharts LineChart showing how ratings evolved across the franchise (X = movie release year, Y = rating), with dots colored by rating tier, (4) Stats: average franchise rating, best and worst entries, total franchise runtime, (5) Search bar to find collections by name (use TMDB `/search/collection` — add endpoint to tmdb.js). Create module CSS files for both pages. Add `/collections` route and nav link.
- **Implementation Guide:**
  - Add `collection(id)` and `searchCollections(query)` endpoints to tmdb.js
  - Collections page: curated grid of 15-20 popular franchise collection IDs
  - Large cards with backdrop, name, movie count
  - CollectionDetail: chronological movie list with posters and ratings
  - LineChart: franchise rating evolution over release years
  - Stats: avg rating, best/worst entry, total runtime
  - Collection search functionality
  - Add `/collections` and `/collection/:id` routes, nav link
- **Dependencies:** none (uses existing `recharts`)
- **Files to Create:** `src/pages/Collections.jsx`, `src/pages/Collections.module.css`, `src/pages/CollectionDetail.jsx`, `src/pages/CollectionDetail.module.css`
- **Files to Modify:** `src/App.jsx`, `src/components/layout/Navbar.jsx`, `src/services/tmdb.js`

### 38. Person Profile Page (actor/director filmography)

- **Description:** A dedicated profile page for any actor or director showing their complete filmography, career rating trajectory, genre breakdown, and frequent collaborators.
- **Instructions:** You are implementing person profile pages for a movie rating application (RatingVault) using React + Vite, Recharts, and existing TMDB service. Add endpoints to tmdb.js: `person(id)` fetching `/person/{id}`, `personCredits(id)` fetching `/person/{id}/combined_credits`. Create `src/pages/Person.jsx` page (route: `/person/:id`) with: (1) Header: profile photo (TMDB profile_path, w342), name in Cormorant Garamond, known_for_department badge (Acting/Directing), birthday and place of birth, biography (truncated with "Read more" expand), (2) Filmography grid: all credits sorted by release date (newest first), displayed as poster cards with title, year, role/character name, rating. Toggle between grid and list view, (3) Career trajectory: a Recharts LineChart plotting the rating of every title they've been in over time (X = year, Y = rating). Identify career peaks and valleys, (4) Genre breakdown: a Recharts PieChart or horizontal bar chart showing what percentage of their filmography falls into each genre, (5) Stats: total titles, average rating across filmography, highest-rated title, most common genre, career span (first to latest title year), (6) Frequent collaborators: list people who appear in 3+ of the same titles (cross-reference cast lists). Link cast member names throughout the app (TitleDetail credits, CrewConstellation) to this Person page. Update search in Navbar to optionally include person results (TMDB multi-search already returns people). Create `src/pages/Person.module.css`.
- **Implementation Guide:**
  - Add `person(id)` and `personCredits(id)` endpoints to tmdb.js
  - Profile header: photo, name, department, bio, birth info
  - Filmography grid/list with poster, title, role, rating
  - Career trajectory LineChart (year vs rating)
  - Genre breakdown PieChart
  - Stats: total titles, avg rating, highest rated, career span
  - Frequent collaborators list
  - Link actor names across the app to Person page
  - Add `/person/:id` route
- **Dependencies:** none (uses existing `recharts`)
- **Files to Create:** `src/pages/Person.jsx`, `src/pages/Person.module.css`
- **Files to Modify:** `src/App.jsx`, `src/services/tmdb.js`, `src/pages/TitleDetail.jsx`, `src/components/layout/Navbar.jsx`

### 39. "Mood Queue" (emotion-based discovery)

- **Description:** Instead of browsing by genre, users select their current mood (happy, sad, thrilled, thoughtful, nostalgic, scared) and get a curated queue of titles that match — with atmospheric UI that adapts to the selected mood.
- **Instructions:** You are implementing a mood-based discovery feature for a movie rating application (RatingVault) using React + Vite. Create `src/pages/MoodQueue.jsx` page with: (1) Mood selection: 6 large interactive cards arranged in a 2x3 grid, each representing a mood — Happy (yellow accent, comedy/animation genres), Sad (blue accent, drama genres), Thrilled (red accent, action/thriller genres), Thoughtful (purple accent, drama/documentary genres), Nostalgic (sepia accent, pre-2005 releases), Scared (green accent, horror genres). Each card has an emoji, mood label, and a subtle background animation matching the mood (e.g., Happy = floating confetti dots, Scared = flickering shadow), (2) On mood selection: the background transitions to the mood's color palette (CSS variable override on the page container, 500ms transition), the selected card expands and the others fade out, then a curated queue of 10-15 titles loads. Map moods to TMDB discover params: genre IDs, sort_by, vote_average.gte, primary_release_date ranges. Add a `discoverByMood(moodKey)` function to tmdb.js, (3) Queue display: titles shown as a vertical scrollable list with large poster, title, year, rating, and a one-line tagline/overview. Each card has "Add to Watchlist" and "View Details" buttons, (4) A "Shuffle" button that re-fetches with a different random page for variety. Create `src/pages/MoodQueue.module.css`. Add route `/mood` and nav link.
- **Implementation Guide:**
  - 6 mood cards: Happy, Sad, Thrilled, Thoughtful, Nostalgic, Scared
  - Each mood has unique color accent and subtle background animation
  - Map moods to TMDB discover params (genres, sort, date ranges, min rating)
  - Add `discoverByMood()` to tmdb.js
  - Background transitions to mood palette on selection (500ms)
  - Queue: 10-15 titles as vertical list with poster, tagline, actions
  - "Shuffle" button for re-fetch with different page
  - Add `/mood` route and Navbar link
- **Dependencies:** none
- **Files to Create:** `src/pages/MoodQueue.jsx`, `src/pages/MoodQueue.module.css`
- **Files to Modify:** `src/App.jsx`, `src/components/layout/Navbar.jsx`, `src/services/tmdb.js`

### 40. Dark Room / Focus Mode (distraction-free viewing)

- **Description:** A toggle that strips the app down to pure content — hiding navigation, particles, and decorations — for users who want a clean, distraction-free experience while analyzing ratings.
- **Instructions:** You are implementing a focus mode for a movie rating application (RatingVault) using React + Vite. Create `src/hooks/useFocusMode.js` hook that manages a boolean state persisted in localStorage. Create `src/components/ui/FocusModeToggle.jsx` component: a small toggle button in the Navbar (Eye/EyeOff icon from Lucide). When focus mode is active: (1) Hide the Navbar (slide up and hide with CSS transform), replace with a minimal floating bar (fixed, top-right) containing only: the focus mode toggle, a home link, and a back button, (2) Remove all decorative elements: disable particle system, grain overlay, seasonal themes, pulse animations, and hover tilt effects by adding a `data-focus-mode` attribute to `<body>` and using CSS `[data-focus-mode] .particle-field { display: none }` etc., (3) Increase content area to full width (remove any side padding), (4) Simplify card styles: remove hover animations, reduce shadows, increase text contrast slightly, (5) Charts remain fully interactive (they're content, not decoration). Create a `FocusMode.css` global stylesheet with all the overrides, imported in `App.jsx`. The transition into focus mode should be a smooth 400ms animation — decorations fade out, content expands. Store preference in localStorage so it persists across sessions. Add keyboard shortcut: `Ctrl+Shift+F` toggles focus mode.
- **Implementation Guide:**
  - `useFocusMode.js` hook: boolean state in localStorage
  - Toggle button in Navbar (Eye/EyeOff icon)
  - Active: hide Navbar, show minimal floating bar (toggle + home + back)
  - Disable: particles, grain, seasonal themes, hover animations
  - Expand content to full width, simplify card styles
  - Keep charts fully interactive
  - Global `FocusMode.css` with `[data-focus-mode]` overrides
  - Smooth 400ms transition animation
  - Keyboard shortcut: Ctrl+Shift+F
  - Persist preference in localStorage
- **Dependencies:** none
- **Files to Create:** `src/hooks/useFocusMode.js`, `src/components/ui/FocusModeToggle.jsx`, `src/styles/FocusMode.css`
- **Files to Modify:** `src/App.jsx`, `src/components/layout/Navbar.jsx`
