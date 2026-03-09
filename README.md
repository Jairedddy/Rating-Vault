# RatingVault

A cinematic rating visualizer for movies and TV shows. Built on TMDB's free API.

## Stack
- **Vite** + **React 18**
- **React Router v6** — client-side routing
- **Recharts** — all charts
- **Framer Motion** — page transitions (optional, installed)
- **Lucide React** — icons
- **CSS Modules** — scoped styling, no Tailwind
- **TMDB API** — free, no credit card required

---

## Setup

### 1. Get a free TMDB API key
1. Create an account at [themoviedb.org](https://www.themoviedb.org)
2. Go to Settings → API → Request an API key (choose "Developer")
3. Fill in the form — it's free and instant

### 2. Install & configure
```bash
cd ratingvault
npm install

# Create your .env file
cp .env.example .env
# Then open .env and add your TMDB key:
# VITE_TMDB_API_KEY=your_key_here
```

### 3. Run
```bash
npm run dev
# → http://localhost:5173
```

### 4. Build for production
```bash
npm run build
# Output in /dist — deploy to Vercel, Netlify, Cloudflare Pages (all free)
```

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Hero + trending grid |
| `/title/:type/:id` | Full ratings analysis (line chart, heatmap, season bars) |
| `/charts` | Top rated / trending lists with 5 tabs |
| `/compare` | Side-by-side comparison with dual-line chart |

## Folder structure

```
src/
  components/
    charts/
      RatingLineChart.jsx   # Episode arc line chart
      EpisodeHeatmap.jsx    # Per-episode colour grid
      SeasonRadar.jsx       # Season averages bar chart
    layout/
      Navbar.jsx            # Fixed nav + search overlay
      Navbar.module.css
  pages/
    Home.jsx / .module.css
    TitleDetail.jsx / .module.css
    Charts.jsx / .module.css
    Compare.jsx / .module.css
  services/
    tmdb.js                 # All API calls + helpers
  hooks/
    useFetch.js             # Generic fetch + search hooks
  App.jsx
  index.css                 # Global tokens + resets
  main.jsx
```

## Deployment (free)

**Vercel (recommended):**
1. Push to GitHub
2. Import repo on vercel.com
3. Add `VITE_TMDB_API_KEY` as an environment variable
4. Deploy

**Netlify:**
Same flow — add env var in Site Settings → Environment Variables.

---

## Design tokens

All colors, spacing, and fonts are defined as CSS variables in `src/index.css`.
Swap the accent, fonts, or palette there to retheme the whole app instantly.
