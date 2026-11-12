# Changelog

## v0.2.0 — Game feel overhaul

- Replaced the website layout, journal and separate frontline canvas with one full-screen pixel-art scene, thin HUD and sub-140px hand.
- Added original procedural 16x16 unit and 24x24 building sprites, faction palettes/banners, grass variation, trees, rocks and world roads. Removed Unicode/emoji icons.
- Player places the castle; each year draws five cards and allows three plays, automatically defending after the third. Expansion adds one connected plot.
- Squads scale to 4/8/14 at levels 1/2/3. Waves grow from 10 enemies to 150+ with boss years. Captured rewards are three distinct cards from the defeated faction.
- Armies enter from a seeded north/east/south/west direction and fight around the kingdom. Allies emerge at their buildings; towers fire bolts from their plots and ranged units shoot arrows.
- Added pooled units/projectiles/hits, spatial hash targeting, cached targets and batched sprite drawing for 400+ combatants.
- Added hit flashes, damage numbers, projectile trails, death puffs, support pulses, placement pop-in, tower/big-hit shake, final-kill slow motion and a year-survived banner.
- Added generated, rate-limited hit/arrow/place/tower/victory audio and reduced-motion controls in the pause menu.
- Save v3 migrates v1/v2 without losing tiles, decks, random state or progression; updates legacy rewards and retains old expanded kingdoms.
- Expanded strict/headless checks to 32 tests, including a warmed complete 300-unit battle under 100 ms, 440-unit pools and save migration. Verified actual Chromium mouse, keyboard and touch input plus a 440-unit frame benchmark.

## v0.1.0 — MVP

- Original Embercourt, Verdant Pact and Tideglass factions; thirty typed cards and six unit archetypes.
- 3×3 kingdom, expansion to 5×5, level 1–3 upgrades, cardinal adjacency, gold economy and spells.
- Seeded deck draws, enemy selection, rewards and deterministic fixed-step auto battles.
- Twenty-year runs, fifth-year bosses, card/perk/gold choices and periodic blessings.
- Canvas world/frontline, DOM hand and menus, drag/drop and tap placement, synergy previews and numeric tooltips.
- Battle speed controls, pause, damage numbers, hit flashes, particles and optional synthesized feedback.
- Versioned local saves, v1 migration, validation, run checkpoints and persistent faction/card unlocks.
- Strict TypeScript, Vitest coverage and contributor documentation for continuous updates.
