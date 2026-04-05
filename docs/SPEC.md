# News Claw v2 — SPEC

## Concept & Vision

News Claw is a rogue-like news reader disguised as a card game. You descend through the day's news in structured "runs" — pick a category, draw cards, read summaries, clear your deck. The experience should feel like a terminal arcade machine: dense with information but effortless to navigate. Every interaction should have weight — cards don't just appear, they deal. Summaries don't just load, they type themselves out. The dark industrial aesthetic says "I'm in control of my information diet" — not "I'm doomscrolling."

The key upgrade: **LLM-generated summaries** using a new free/cheap API, replacing the useless Brave snippets. The game loop upgrade: streaks, reading stats, and a "depth meter" that tracks how deep into a category you've gone.

---

## Design Language

### Aesthetic Direction
**Terminal Arcade** — industrial dark with electric accents, monospace type, CRT-inspired overlays. Think: a Bloomberg terminal designed by someone who plays Hades. NOT mystical/magical — sharp, precise, powerful.

### Color Palette
| Role | Hex | Usage |
|------|-----|-------|
| Background | `#080808` | Page bg |
| Surface | `#0e0e0e` | Card bg, panels |
| Surface-raised | `#161616` | Hover states |
| Border | `#222222` | Structural lines |
| Text-primary | `#e8e4dc` | Warm off-white |
| Text-secondary | `#6b6b6b` | Labels, meta |
| Text-dim | `#333333` | Disabled |
| Accent | `#00c8e0` | Primary action, highlights |
| Accent-dim | `rgba(0,200,224,0.12)` | Subtle fills |
| Status-green | `#3ddc84` | Success, cleared |
| Status-amber | `#ffb020` | Warning, in-progress |
| Status-red | `#ff4757` | Error, alert |

**Category Colors (card borders + accents):**
| Category | Hex |
|----------|-----|
| Tech | `#00c8e0` (cyan) |
| World | `#ff6b6b` (coral) |
| Business | `#ffb020` (amber) |
| Sports | `#3ddc84` (green) |
| Science | `#a78bfa` (violet) |
| Entertainment | `#f472b6` (pink) |
| Health | `#34d399` (emerald) |
| I Feel Lucky | `#00c8e0` (mixed) |

### Typography
- **Headings:** JetBrains Mono — bold, technical authority
- **Card headlines:** JetBrains Mono — readable, dense
- **Body/summaries:** Inter — clean, readable at length
- **Category labels:** JetBrains Mono, 9px, uppercase, tracked

### Spatial System
- Card hand: 3 cards in a row, 280px wide each, 24px gap
- Cards have 2px top border in category color + subtle glow
- Dialogue box above cards, max-height 280px
- 8px border-radius on cards — not sharp, not fully rounded

### Motion Philosophy
Every animation communicates game state:
- **Card entrance:** Slide from bottom + fade, staggered 100ms, elastic ease
- **Card hover:** Lift 6px + scale 1.03, 180ms, subtle shadow expansion
- **Card play (click):** Card flies to center-top, shrinks, dissolves with particle burst
- **Card discard (skip):** Card flips and fades out
- **Summary typewriter:** 2ms per character, cursor blink
- **Progress bar:** Fills with smooth animation, flash on increment
- **Screen transitions:** Crossfade 300ms
- **Combo streak:** Number scales up 1.5x then settles, gold glow pulse
- **End screen:** Cards sweep out, stats count up, category color wash

---

## Layout & Structure

### Screen 1: Category Selection
```
┌─────────────────────────────────────────────────────┐
│  NEWS CLAW v2                         [streak: 0]  │
│  ─────────────────────────────────────────────────  │
│                                                      │
│  CHOOSE YOUR QUEST                                  │
│                                                      │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐              │
│  │  TECH   │  │  WORLD  │  │BUSINESS │              │
│  │  cyan   │  │  coral  │  │  amber  │              │
│  └─────────┘  └─────────┘  └─────────┘              │
│                                                      │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐              │
│  │ SPORTS  │  │ SCIENCE │  │ENTERTAIN│              │
│  │  green  │  │ violet  │  │  pink   │              │
│  └─────────┘  └─────────┘  └─────────┘              │
│                                                      │
│  ┌─────────┐  ┌─────────┐                          │
│  │ HEALTH  │  │  LUCKY  │                          │
│  │ emerald │  │  mixed  │                          │
│  └─────────┘  └─────────┘                          │
│                                                      │
│  Total articles read: [N]   [streak: N days]        │
└─────────────────────────────────────────────────────┘
```

### Screen 2: Card Hand (Active Run)
```
┌─────────────────────────────────────────────────────┐
│  ← Back                    TECH          3/15  ████░░ │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │ SUMMARY: AI Chip Wars Escalate Between US and  │  │
│  │ China — TSMC halts advanced node exports...    │  │
│  │                                                  │  │
│  │ Source: techcrunch.com · 2h ago               │  │
│  │ [Read Full Article →]                           │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ Headline │  │ Headline │  │ Headline │          │
│  │  source  │  │  source  │  │  source  │          │
│  │   time   │  │   time   │  │   time   │          │
│  └──────────┘  └──────────┘  └──────────┘          │
└─────────────────────────────────────────────────────┘
```

### Screen 3: Card Play Animation
- Clicked card flies to dialogue box area
- Particle burst in category color
- Other cards dim to 20% opacity
- Summary types out with blinking cursor
- Progress bar increments

### Screen 4: Run Complete
```
┌─────────────────────────────────────────────────────┐
│  RUN COMPLETE                                       │
│  ─────────────────────────────────────────────────  │
│                                                      │
│  Category: TECH                                      │
│  Articles read: 15/15                               │
│  Time spent: 8m 32s                                  │
│  Longest streak: 7                                   │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │  Full session stats (today / all time)         │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  [New Quest]  [Home]                                 │
└─────────────────────────────────────────────────────┘
```

---

## Features & Interactions

### Core Loop
1. Land on category screen, pick a category
2. 15 articles fetched — 3 dealt as cards at a time
3. Tap card → LLM summary appears in dialogue box, card dissolves
4. After 5 cards (15 articles) → run complete
5. Stats updated in localStorage

### Summary Generation (KEY UPGRADE)
- **Primary:** Free LLM API — target: Grok (`x.ai`), Cerebras, or HuggingFace Inference API
- **Fallback:** Brave description snippets if LLM fails
- **Prompt:** "Summarize this article in 2-3 sentences as if for a sophisticated general news reader. Focus on the key facts and why they matter. Write in active voice."
- **Timeout:** 5 seconds — if LLM doesn't respond, fall back to Brave description
- **Cache:** LLM summaries cached in Vercel (same 8h TTL as current)

### Card Interactions
- **Tap card:** Play it — fly animation, particle burst, summary types out
- **Skip button on card:** "Skip" label appears on hover → discards card without playing
- **Swipe left on mobile:** Skip card
- **Long-press on mobile:** Show article URL without playing
- **Hover (desktop):** Card lifts, shows "TAP TO READ" overlay in category color

### Reading Stats (Gamification)
- **Streak:** Consecutive days with at least 1 article read (stored in localStorage)
- **Depth meter:** Progress through current run — "3/15" in category color
- **Session stats:** Articles read today, total all time, top category
- **Per-run stats:** Time spent, longest streak in run, articles cleared

### Navigation
- **Back button:** Abandons run (confirms if >1 card played)
- **Keyboard:** 1/2/3 keys to play cards, Space to skip

### I Feel Lucky
- Fetches 2 articles from each category (14 total), randomizes, takes 15
- Card borders show original category color

### Error Handling
- **LLM timeout:** Falls back to Brave description silently, shows small "AI summary unavailable" badge
- **API failure:** Retry button, cards don't show
- **Offline:** Shows cached articles if available

---

## Technical Approach

### Frontend
- Vanilla HTML/CSS/JS — no framework needed
- GSAP for all animations (already in the codebase as `gsap.min.js`)
- No Three.js (that's the abandoned Data Oracle redesign)
- Single HTML file, deploys to GitHub Pages

### Backend (Vercel)
- `/api/news?category=N` — returns articles with summaries
- `/api/summarize` — calls LLM API for summary generation
- Summary caching: 8h TTL in-memory cache on Vercel

### LLM API Options (in priority order)
1. **Grok API** (`x.ai`) — cheap ($5 free credits), good quality
2. **Cerebras API** — free tier, fast
3. **HuggingFace Inference API** — free tier, rate limited
4. **Fallback:** Brave descriptions (current behavior)

### Data Flow
```
User picks category
  → /api/news?category=N
  → Vercel fetches from Brave Search (15 articles)
  → For each article (in parallel, max 5 at a time):
      → Check cache for summary
      → If miss: call LLM API with article title + Brave description
      → Cache result 8h
  → Return articles + summaries to client
```

### localStorage Schema
```json
{
  "nc_streak": 3,
  "nc_lastRead": "2026-04-05",
  "nc_totalRead": 142,
  "nc_topCategory": "tech",
  "nc_dailyRead": {"2026-04-05": 12, "2026-04-04": 8}
}
```

---

## File Structure
```
news-quest/
├── server/public/
│   └── index.html        # Main app (v2 redesign)
├── api/
│   ├── news.js           # News + summary fetching
│   └── summarize.js      # LLM summary endpoint
├── docs/
│   └── SPEC.md           # This spec
└── static/
    └── index.html        # GitHub Pages deploy copy
```

---

## Success Criteria
- [ ] LLM summaries load reliably (fallback working)
- [ ] Card animations feel weighty and responsive
- [ ] Streak tracking works across sessions
- [ ] Mobile: swipe to skip, tap to play
- [ ] Run complete screen shows compelling stats
- [ ] Page load < 2s (before articles fetch)
- [ ] No purple, no emoji, no generic card-game aesthetic
- [ ] Feels like an arcade machine, not a SaaS product
