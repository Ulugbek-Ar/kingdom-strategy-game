# Executed validation — v0.2.0 (2026-11-13, Asia/Tashkent)

## Build and headless checks

Environment: Linux cloud workspace, Node.js 24.22.1, npm 11.9.0, system Chromium 156.

- `npm run build`: passed strict TypeScript checking and production compilation.
- `npm test -- --reporter=verbose`: **32 tests passed** in 3 files, with no skipped/disabled tests.
- Warmed **complete 300-unit battle**, including battle creation: **13.48 ms** on the final recorded test run (100 ms assertion). The battle advanced 14.15 simulated seconds. An earlier run measured 19.85 ms.
- 440-unit test verifies bounded projectile/hit storage and pool identity across steps.
- Full 20-year simulation with a developed 5x5 kingdom reaches victory.
- Spatial nearest queries match brute-force results; identical seeds reproduce combat, projectiles and targeting exactly.
- Effects, adjacency, 4/8/14 squads, duplicate upgrades, castle placement, three-play auto-start, single-plot expansion, card-only rewards, wave scaling, all four entry directions, progression and migrations are covered.
- `git diff --check`: passed. No `any`, unseeded `Math.random`, emoji or Unicode art icons in source.

## Browser performance

Real headless Chromium, 1440x900 viewport, one 440-unit battle. The benchmark uses the actual headless simulation and `Scene` renderer at RAF frequency, including arrows, damage numbers and hit flashes. A durable stress fixture places all 440 units inside the viewport with delayed spawning disabled; HP is raised to keep all combatants alive throughout the measurement. Death particles are covered by combat tests and interactive scenarios. One fixed sim step is deliberately run on every rendered frame (a heavier sim cadence than the normal 30 Hz loop).

After 16 warm-up frames, 164 measured frames:

| Measurement | Result |
| --- | --- |
| Simulation + scene draw, mean | 1.08 ms |
| Simulation + scene draw, 95th percentile | 1.60 ms |
| Simulation only, mean | 0.10 ms |
| Mean RAF interval | 16.68 ms (~60 Hz) |
| Minimum living units inside viewport | 440 |

These are CPU submission timings on this cloud machine, not a guarantee for every GPU/browser/device or a subjective game-feel assessment. The visible-unit assertion checks living units inside the battlefield bounds on every frame, not just allocated simulation objects. Evidence JSON: `/workspace/scratch/kingdom-v2/performance.json`.

## Interactive browser scenarios

Playwright against the running development server; desktop 1440x900 and mobile 390x844:

- One visible scene canvas; centered menu over a live game scene; no website panels/journal.
- Player-placed off-center castle and five-card hand; cards stay under 140px tall.
- Placement, native HTML drag/drop, duplicate level-3 upgrades and automatic battle after the third play.
- Allied troop movement, noncentral castle targeting and actual frontline combat on the kingdom field.
- Speed and pause; menu-to-live-battle continuation.
- Three distinct enemy-deck cards; next year, reload and checkpoint continuation.
- Single-plot expansion, heal confirmation, keyboard plot cursor/Enter placement and actual touchscreen input.
- Sound/reduced-motion controls and zero uncaught browser errors.
- Actual old-v2 save migration preserves progression and converts mixed rewards.
- Victory/defeat transitions and permanent unlocks using prepared run fixtures.
- A late-year expanded-kingdom battle exercises hundreds of units on screen.

The first browser regression found a spell-confirmation button disappearing when the pointer left a hand card. Both pointer-leave and replacement-card hover handlers were fixed to preserve the selected spell tooltip. The full scenario then passed, including Cast, keyboard placement, v2 migration, victory/defeat and touch input.

Screenshots in `/workspace/scratch/kingdom-v2/`: `menu.png`, `planning.png`, `battle.png`, `mobile.png`, `victory.png`, `large-battle.png`. Browser tooling and logs are local validation artifacts, not runtime game dependencies.

## Limits

Bespoke boss abilities and human balance/game-feel testing remain future work. Enemy factions have distinct palette/king/unit identity and stat modifiers; boss years currently scale count/stats. The procedural art and synthesized audio are original. No external assets, accounts or secrets are required. Save migration is covered in logic and browser checks; publication and restoration of a new cloud snapshot have not been performed.
