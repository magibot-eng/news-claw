# News Claw — Product Design Document

**Version:** 1.0.0
**Last Updated:** 2026-03-19
**Live URL:** https://magibot-eng.github.io/news-claw/
**API:** https://newsclaw-api.vercel.app/api/news

---

## Concept & Vision

News Claw is a Slay the Spire-inspired news reader that transforms passive news consumption into an interactive ritual. Instead of scrolling an infinite feed, users pick from a hand of cards, read summaries, and "clear" a category of 15 articles. The dark aesthetic and card metaphors make news feel like a curated game rather than an anxiety-inducing firehose.

---

## Design Language

### Aesthetic Direction
Dark, mystical card game — like a fortune teller's table meets a cyberpunk terminal. Deep space backgrounds, glowing card borders, typewriter-text reveals.

### Color Palette
```
Background:     #0f0f1a (deep navy black)
Card BG:       #1a1a2e (dark purple-navy)
Text Primary: #e0e0e0
Text Dim:     #888888
Accent Gold:  #ffd700
Category Colors (card borders):
  Tech:         #00d4ff (cyan)
  World:        #ff6b6b (coral red)
  Business:     #ffd700 (gold)
  Sports:       #2ecc71 (emerald)
  Science:      #9b59b6 (purple)
  Entertainment:#e91e63 (hot pink)
  Health:       #00bfa5 (teal)
  I Feel Lucky: #ffd700 (gold)
```

### Typography
- **Headlines:** Cinzel (Google Fonts) — ornate serif, feels ancient/mystical
- **Body:** System sans-serif — readable, no frills
- **Card meta:** Uppercase, tracked out, dim — doesn't compete with headline

### Spatial System
- Card hand: 3 cards in a row, slight overlap with z-index stacking
- Card size: 170px wide, portrait orientation
- Dialogue box: Above cards, max-height 220px, scrollable
- Responsive: Cards stack vertically on mobile (<500px)

### Motion Philosophy
- **Card entrance:** Slide in from right + fade, staggered 130ms apart
- **Card hover:** Lift up 7px + scale 1.06, snappy 220ms
- **Card click:** Scale down + fade to center (dissolve effect with ring burst)
- **Dialogue:** Fade out/in transitions between articles, typewriter text effect
- **End screen:** Fade in with gold glow

### Visual Assets
- No images — pure typographic cards with colored borders
- Category emoji in category selection grid
- No external images or icons needed

---

## Layout & Structure

### Screen 1: Category Selection
- 8 category cards in a 3-column grid (+ 1 "I Feel Lucky" row or bottom slot)
- Title: "— NEWS CLAW —" with gold glow
- Subtitle: "Choose your quest"
- Each category card: emoji + name + one-line description
- Cards animate in on page load with staggered entrance

### Screen 2: Card Hand
- Category header with colored name + article counter ("0/15")
- Dialogue box (empty initially): "Pick a card to read the latest news..."
- 3 article cards dealt face-up
- Each card: headline (Cinzel) + source + time
- Back button: "← Browse Another Category" (top-left)
- Cards have left border in category color + subtle glow

### Screen 3: Reading State
- Clicked card flies to center and dissolves
- Dissolve ring burst effect in category color
- Other cards dim to 15% opacity
- Dialogue box populates with article source + summary text
- Counter increments

### Screen 4: End Screen
- Appears after all 15 articles read
- "Quest Complete" title with gold styling
- Personalized subtitle: "You've read all articles in [Category]"
- Article count: "📰 Total articles read: 15"
- "Browse Another Category" button

---

## Features & Interactions

### Core Flow
1. User lands on category selection
2. Taps a category → 15 articles fetched from Brave Search API
3. 3 cards dealt at a time (from the pool of 15)
4. User taps a card → summary appears in dialogue box, card dissolves
5. After 5 rounds (15 cards), end screen appears
6. User can browse another category or go back to selection

### Category Selection
- **Click:** Enter category, fetch news, deal 3 cards
- **Hover:** Card lifts with shadow

### Card Interaction
- **Click:** Card flies to center, dissolves with ring effect, summary fades in
- **Hover:** Card lifts slightly
- **Dimming:** Non-selected cards dim to 15% opacity during reading

### Dialogue Box
- **Empty state:** "Pick a card to read the latest news..." placeholder
- **Article loaded:** Source + time + "Read Full Article →" link + summary text
- **Typewriter effect:** Text types out character by character (3ms/char)
- **Scrollable:** If summary exceeds max-height

### Navigation
- **Back button:** Returns to category selection (top-left, only on card screen)
- **End screen button:** "Browse Another Category" → category selection

### I Feel Lucky (Category 8)
- Fetches 3 articles each from all 7 other categories (21 total)
- Randomizes and takes 15
- Each article tagged with its source category color
- Card border shows the original category color

### Error Handling
- **API failure:** Console error logged, cards not shown, no crash
- **Empty category:** No cards dealt (graceful)
- **Network offline:** Brave API returns error → no articles shown

---

## Technical Approach

### Architecture
```
Browser (GitHub Pages)
  └── HTML/CSS/JS (static, served by GitHub CDN)
       │
       └── Fetch → Vercel API (serverless)
                      │
                      └── Brave Search API (news data)
                      └── Gemini API (summaries) [QUOTA EXHAUSTED]
```

### Hosting
- **Frontend:** GitHub Pages (`magibot-eng.github.io/news-claw/`)
  - Repository: `github.com/magibot-eng/news-claw`
  - Deploys from `server/public/` on `main` branch push
- **API:** Vercel Serverless Functions
  - Project: `ted-3192s-projects/newsclaw-api`
  - URL: `https://newsclaw-api.vercel.app/api/`

### API Design

**GET `/api/categories`**
```json
[{
  "id": 1,
  "name": "Tech",
  "emoji": "💻",
  "color": "#00d4ff",
  "desc": "AI breakthroughs, gadgets, and the future of tech"
}]
```

**GET `/api/news?category=1`**
```json
[{
  "id": "b11",
  "headline": "Article title",
  "teaser": "First 120 chars...",
  "source": "sourcename.com",
  "time": "24h",
  "url": "https://...",
  "description": "Full Brave snippet",
  "summary": "Article summary (Gemini-generated or Brave fallback)",
  "sourceCategoryId": 1,
  "sourceCategoryColor": "#00d4ff"
}]
```

**GET `/api/news?category=8`** (I Feel Lucky)
- Returns randomized articles from all 7 categories

### Data Model
- **Article:** id, headline, teaser, source, time, url, description, summary, sourceCategoryId, sourceCategoryColor
- **Category:** id, name, emoji, color, desc
- **State:** articlesRead, currentCategoryId, currentCategoryName, newsPool[], poolIndex, allReadTriggered

### Caching
- Vercel function has in-memory cache: **8 hour TTL**
- Cache key: `news_{category}`
- Reduces Brave Search API calls (rate limited)

### Environment Variables (Vercel)
- `BRAVE_API_KEY` — Brave Search subscription token
- `GEMINI_API_KEY` — Google Gemini for summarization [currently exhausted]

### Known Limitations (v1.0.0)
- **Gemini quota exhausted:** Summaries fall back to raw Brave descriptions (short snippets)
- **No offline support:** PWA service worker not yet implemented
- **No article read tracking:** Refresh resets progress
- **Single category at a time:** Can't switch categories without going back

### File Structure
```
news-quest/
├── server/
│   └── public/
│       └── index.html        # Main app (HTML + CSS + JS inline)
├── api/
│   ├── news.js              # Vercel serverless: news + summaries
│   └── categories.js        # Vercel serverless: category list
├── docs/
│   └── PRODUCT.md           # This document
├── static/
│   └── index.html           # Copy for GitHub Pages deploy
├── index.html               # Copy for GitHub Pages deploy
├── vercel.json              # Vercel routing config
├── package.json
└── .env.local               # Local API keys (not committed)
```

---

## Development

### Local Dev
```bash
cd ~/Developer/Magi_Workspace/src/news-quest/server
node server.js
# Opens at http://localhost:3457
```

### Deploy Frontend (GitHub Pages)
```bash
git add -A && git commit -m "message" && git push origin main
# GitHub Actions auto-deploys from server/public/
```

### Deploy API (Vercel)
```bash
cd /tmp/news-api
# Edit api/news.js then:
vercel --prod
```

### Rollback
```bash
git checkout v1.0.0 -- server/public/index.html
git commit -m "rollback to v1.0.0"
git push origin main
```

---

## Future Improvements (Backlog)

- [ ] PWA: Add manifest.json + service worker for mobile install
- [ ] LLM summarization: Integrate Cerebras or other free LLM API
- [ ] Article persistence: localStorage to track read articles across sessions
- [ ] Share article: Native share button on dialogue box
- [ ] Dark/light theme toggle
- [ ] Custom category: User can enter a custom search query
- [ ] Bookmark articles: Save for later
- [ ] Solo Vibing integration: Agent Dev Playbook documentation of this build
