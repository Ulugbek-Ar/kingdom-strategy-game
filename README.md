# Crown of the Wild

An original browser kingdom-builder roguelike. Build a kingdom, combine adjacent cards, and survive twenty years of automatic battles. TypeScript (strict), Vite, Canvas 2D and Vitest; no backend or account required.

## Develop

Requires Node.js **22.12+ or 24+** and npm (validated with Node 24.22.1 / npm 11.9.0).

```sh
npm ci
npm run dev
npm run build
npm test
npm run preview
```

Vite prints the development address. Production output is in `dist/`; it can be hosted as static files. In the managed cloud sandbox, use `npm --cache /tmp/kingdom-npm ci` if the default home cache is not writable. Dependencies are pinned in `package-lock.json`; no API keys or external services are needed.

## Play

1. Begin a chronicle, choose an unlocked faction and enter a seed for a reproducible run.
2. Click a card, then a grid tile, or drag the card onto the grid. On touch screens, tap card then tile. The castle occupies the center.
3. Identical cards stack to level 3. Buildings spawn a fresh army each battle; towers fire from the castle. Enchantments affect orthogonal neighbors only. Hover for exact numbers and use the highlighted placement preview.
4. Spell and expansion cards ask for confirmation and resolve immediately. Expand unlocks the 5×5 grid. Unplayed cards are discarded each year.
5. End the year to defend. Use 1×/2×/4× and pause. Space pauses; 1–5 select cards; Escape cancels selection. Sound is optional and defaults off.
6. Choose one enemy card, perk or gold reward. Every third completed year also grants a perk. Every fifth wave is a boss. Survive the final boss in Year 20 to win; zero castle HP ends the run.

After the first completed run Verdant Pact unlocks; after two runs or a victory Tideglass unlocks. Captured cards are permanently added to future starting decks. Progress and the current run autosave locally. Refreshing during combat restores its planning checkpoint, so no partial battle needs to be reconstructed. Corrupt/future-version saves fall back to a fresh profile; blocked browser storage shows a warning.

## Factions

| Faction | Playstyle | Passive |
| --- | --- | --- |
| Embercourt | Aggressive soldiers, archers and damage adjacency | +15% troop/tower damage |
| Verdant Pact | Sturdy defenders and additional spawns | +25% troop HP |
| Tideglass | Ranged support, tower synergy and economy | +2 yearly gold |

Each has ten original cards: two unit buildings, a tower, two adjacency enchantments, an income building, healing, a wave-damage spell, a gold edict and expansion. Thirty cards total, six unit archetypes and three stacking perks.

## Structure and design

See [AGENTS.md](AGENTS.md) for the folder map and guides for adding cards, effects, factions, perks and migrations. `Game` coordinates the systems; an EventBus notifies observers. Battle state advances at a fixed 30 Hz regardless of rendering or speed. A seeded PRNG drives deck draws, enemies, rewards and combat critical hits. Tuning lives in balance/content files.

Native Canvas 2D was selected to match the requested stack and keep simulation independent of rendering; no game engine is required. The visual direction uses forest green, aged parchment, restrained gold and original geometric pixel-style buildings. Enemy silhouettes and health bars distinguish sides without relying solely on color. All art is drawn locally and tones are synthesized; there are no third-party art/music licenses or runtime asset downloads.

The MVP uses shared effect archetypes with distinct faction troops/passives, not thirty separate bespoke mechanics. Enemy faction identity controls captured rewards; enemy waves currently share a scaling melee archetype. A battle time limit resolves surviving invaders as siege damage to avoid endless fights. Art and sound are placeholders; balance needs human playtesting.

## Verification

`npm run build` performs strict type checking and a production build. `npm test` covers trigger dispatch, adjacency, upgrades, deterministic combat, wave scaling, year flow, defeat, the Year 20 victory transition, save migrations, persistence and unlocks. See [VALIDATION.md](VALIDATION.md) for executed checks and browser evidence.

## Next five updates

1. Faction-specific enemy formations and boss abilities.
2. More effect compositions: death summons, shields and tower chains.
3. Draftable starting decks and a captured-card collection screen.
4. New map terrain and directional adjacency synergies.
5. Balance telemetry, seeded challenge runs and richer original pixel art/audio.
