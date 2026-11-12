# Executed validation — 2026-11-12

## Current machine

- Node.js 24.22.1, npm 11.9.0, Chromium from `/usr/bin/chromium`.
- `npm --cache /tmp/kingdom-npm ci --no-audit --no-fund`: passed; verified repeatable installation using the lockfile.
- `npm run build`: passed strict TypeScript checking and Vite production compilation. Output: `dist/`.
- `npm test`: **17 tests passed**, 2 files; no skipped/disabled tests.
- `git diff --check`: passed. No `any` or `Math.random` in source/tests.
- `npm run dev -- --port 5173`: started successfully; functional browser requests passed.

## Real Chromium checks

Automated Playwright against the running development server at desktop 1440×1100 and mobile 390×844:

- Main menu, seeded faction selection and original card display.
- Click placement, native HTML drag/drop and actual touchscreen tap placement.
- Adjacency card placement, healing confirmation, 5×5 expansion and level-3 upgrades.
- One live opening battle through reward selection and Year 2.
- 4× speed, pause/resume and menu-to-live-battle continuation.
- Refresh and continue from the persisted planning state.
- Responsive page has no horizontal overflow; hand scrolls in its own region.
- Canvas aspect-ratio check confirms pointer coordinates match rendered tile positions.
- Year-20 victory screen using a prepared save fixture, plus permanent unlock persistence.
- Live undefended defeat with a 1-HP save fixture, plus Verdant Pact unlock.
- **Zero uncaught browser exceptions** across both scenarios.

The full twenty-year established-kingdom playthrough runs headlessly in Vitest. It was not played through manually in the browser. Balance and long-session usability still need human playtesting. Browser evidence uses temporary Playwright tooling, not a required game dependency.

Screenshots on this machine:

- `/workspace/scratch/kingdom-evidence/menu.png`
- `/workspace/scratch/kingdom-evidence/kingdom.png`
- `/workspace/scratch/kingdom-evidence/mobile.png`
- `/workspace/scratch/kingdom-evidence/victory.png`
- `/workspace/scratch/kingdom-evidence/defeat.png`

## Reusable cloud configuration

Saved `install_script` (frozen dependency install, build and tests) and `start_skill` (working directory, service startup and functional readiness checks). No new secrets, environment variables or network domains were necessary. Draft persistence is confirmed; publication and restoration in a fresh task have not been performed. Review/save the draft in environment settings and publish to make the prepared snapshot available to later tasks.

## MVP limits

Original geometric placeholder art and optional synthesized tones. Factions share card-effect archetypes and a common scaling enemy melee AI; enemy identity changes reward decks, while troop/passive differences distinguish playable factions. Bosses increase wave stats rather than introducing bespoke boss behavior. Combat has a deterministic siege timeout. Battle checkpoints replay from planning after refresh. Further design/balance work is listed in README.md.
