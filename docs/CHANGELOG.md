# Changelog

All notable changes to News Claw are documented here.

## 2026-04-05

### v2.1 — Game Logic Fixes
- **Fixed card pool logic:** `poolIndex` now advances by 1 per card (was advancing by 3, skipping 2/3 of articles)
- **Fixed typewriter premature clear:** dialogue no longer wiped when new hand deals — article stays readable while cards animate in
- **Fixed GSAP animation:** reverted `gsap.from` back to `gsap.to` for card entrance (was causing cards to stay invisible)
- **Card visibility CSS:** hardcoded dark bg/border/text colors for card visibility on all screen brightness levels
- **Removed GSAP entrance stagger:** cards now appear simultaneously instead of with 0.5s sequential delay

### v2.0 — Complete Rewrite
- Dark industrial UI with dot grid texture
- 4-column responsive category grid
- GSAP card animations (deal, hover, play, skip)
- Typewriter summary effect
- Progress bar with per-category color
- Streak tracking in localStorage
- Keyboard shortcuts (1/2/3, Space, Esc)
- Run complete screen with stats
- Particle burst on card play

---

## Pre-v2 (archived)
See git history for earlier versions.
