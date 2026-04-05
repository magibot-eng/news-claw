# Status: News Claw v2

## Current Phase
Spec written — awaiting Arie to spawn Magi

## Problems with v1
- Brave descriptions are short/useless as summaries
- Mystical gold aesthetic feels dated
- No gamification beyond card mechanic
- No streak/progress tracking

## What We're Building
- LLM-generated 2-3 sentence summaries (Grok API)
- Industrial dark aesthetic (#080808, #00c8e0, JetBrains Mono)
- GSAP-powered card animations (deal, fly, dissolve, particles)
- Streak tracking, depth meter, run stats
- Keyboard shortcuts, mobile swipe
- Arcady "terminal machine" feel

## Blockers
- LLM API key needed (Grok or Cerebras)

## Notes
- Working from `~/Developer/Magi_Workspace/src/news-quest/`
- Frontend: `server/public/index.html`
- API: `api/news.js` + new `api/summarize.js`
- Deploy: GitHub Pages (frontend) + Vercel (API)
