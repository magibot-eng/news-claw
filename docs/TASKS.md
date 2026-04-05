# News Claw v2 — Tasks

## Phase 1: Backend (API + LLM Summaries)

### Magi
- [ ] Set up Grok API key for `newsclaw-api` on Vercel (or Cerebras as fallback)
- [ ] Update `api/news.js` to fetch articles + call LLM for summaries in parallel
- [ ] Add `/api/summarize` endpoint — takes `{title, description, url}`, returns 2-3 sentence summary
- [ ] Implement 8h in-memory cache for summaries (same pattern as current article cache)
- [ ] Fallback: if LLM fails/times out (5s), return Brave description with "AI summary unavailable" flag
- [ ] Test: verify summaries appear for Tech category
- [ ] Commit

### Mira (after backend)
- [ ] Verify API works: `curl https://newsclaw-api.vercel.app/api/news?category=1` returns articles with `summary` field

---

## Phase 2: Frontend (UI Redesign)

### Magi
- [ ] Read `SPEC.md` — full spec before touching code
- [ ] Rewrite `server/public/index.html` as News Claw v2
- [ ] Apply industrial dark aesthetic (#080808 bg, #00c8e0 accent, JetBrains Mono headings)
- [ ] Build category selection screen with 8 category cards
- [ ] Build card hand screen with 3-card layout
- [ ] Implement GSAP card animations: deal, hover, play (fly + dissolve + particles), skip (flip + fade)
- [ ] Implement dialogue/summary box with typewriter effect
- [ ] Build progress bar and depth meter
- [ ] Build run complete screen with stats
- [ ] Add localStorage: streak, total read, daily read
- [ ] Implement keyboard shortcuts (1/2/3, Space)
- [ ] Mobile: swipe-to-skip, tap-to-play
- [ ] No emoji in UI — use inline SVG icons only
- [ ] Test end-to-end flow
- [ ] Commit

### Mira
- [ ] Deploy updated API to Vercel (after Phase 1 commit)
- [ ] Push frontend to GitHub Pages
- [ ] Verify live at https://magibot-eng.github.io/news-claw/
- [ ] Test on mobile

---

## Definition of Done
- Live at https://magibot-eng.github.io/news-claw/
- LLM summaries working for all 8 categories
- Streak tracking persists across sessions
- Card animations: deal, play, skip all working
- Mobile responsive
- No emoji, no generic aesthetic
