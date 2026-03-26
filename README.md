# RatingVault

> A cinematic rating explorer for movies and TV shows, powered by TMDB's free API.
> • Stunning episode arc visualizations with multi-season breakdowns.
> • Colour-coded heatmaps that reveal quality patterns at a glance.
> • Head-to-head comparison mode with dual-line chart overlays.
> • Curated top-rated and trending lists across five discovery tabs.
> • Glassmorphism UI with ink-bleed transitions and animated typography.
> • Zero cost — no backend, no paid APIs, no credit card required.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Tech Stack

| Layer      | Library              |
|------------|----------------------|
| Framework  | React 18 + Vite 5    |
| Routing    | React Router v6      |
| Charts     | Recharts             |
| Animation  | Framer Motion        |
| Icons      | Lucide React         |
| Styling    | CSS Modules          |
| Data       | TMDB API             |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A free [TMDB API key](https://www.themoviedb.org/settings/api) — no credit card required

### Installation

```bash
git clone https://github.com/your-username/rating-vault.git
cd rating-vault
npm install
```

### Environment

```bash
cp .env.example .env
```

Open `.env` and fill in your key:

```env
VITE_TMDB_API_KEY=your_tmdb_api_key_here
```

### Development

```bash
npm run dev
# → http://localhost:5173
```

### Production Build

```bash
npm run build
# Output in /dist
```

---

## Routes

| Route | Description |
|-------|-------------|
| `/` | Hero landing page with trending grid |
| `/title/:type/:id` | Full ratings analysis — line chart, heatmap, season bars |
| `/charts` | Top rated / trending lists across 5 tabs |
| `/compare` | Side-by-side comparison with dual-line chart |

---

## Project Structure

```
src/
├── components/
│   ├── ambient/
│   │   └── ParticleField.jsx       # Animated backdrop
│   ├── charts/
│   │   ├── RatingLineChart.jsx     # Episode arc line chart
│   │   ├── EpisodeHeatmap.jsx      # Per-episode colour grid
│   │   └── SeasonRadar.jsx         # Season averages bar chart
│   ├── layout/
│   │   └── Navbar.jsx              # Fixed nav + search overlay
│   ├── transitions/
│   │   ├── AnimatedRoutes.jsx
│   │   ├── InkBleed.jsx            # Page transition effect
│   │   └── PageTransition.jsx
│   └── ui/
│       ├── AnimatedText.jsx        # Cinematic text effects
│       ├── GlassCard.jsx           # Glassmorphism card
│       └── RatingPulse.jsx         # Pulsing score badge
├── hooks/
│   └── useFetch.js                 # Generic fetch + search hooks
├── pages/
│   ├── Home.jsx
│   ├── TitleDetail.jsx
│   ├── Charts.jsx
│   └── Compare.jsx
├── services/
│   └── tmdb.js                     # All TMDB API calls
├── App.jsx
├── index.css                       # Global design tokens + resets
└── main.jsx
```

---

## Deployment

RatingVault is a fully static site — deploy it anywhere for free.

**Vercel (recommended)**

1. Push to GitHub
2. Import the repo at [vercel.com](https://vercel.com)
3. Add `VITE_TMDB_API_KEY` under Project → Settings → Environment Variables
4. Deploy

**Netlify / Cloudflare Pages**

Same flow — add the env var under the project's environment settings, then trigger a deploy.

---

## Customization

All design tokens — colors, spacing, typography, and the accent palette — live as CSS custom properties in [src/index.css](src/index.css). Changing the accent color or font there rethemes the entire app instantly.

---

## License

MIT
