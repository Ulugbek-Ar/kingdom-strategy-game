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

1. Start a kingdom, choose an unlocked faction and enter a seed. Place the castle on any of the nine starting plots.
2. Each year draws five cards. Click a card then a plot, or drag it onto the battlefield. Touch input supports tap-card, tap-plot. Play at most three; the third starts combat automatically. **Defend now** starts earlier.
3. Unit buildings spawn squads at their own plots: level 1 = **4**, level 2 = **8**, level 3 = **14**. Place identical cards on a building to upgrade. Support buildings buff four orthogonal neighbors; towers fire from their own tiles.
4. Spells resolve after confirmation. Expand adds **one connected plot** within the 5x5 kingdom boundary. Unplayed cards are discarded next year.
5. The approaching king's banner and arrow mark a seeded north/east/south/west entry. Enemies march toward the placed castle and allies move out to intercept. Use 1x/2x/4x, pause and the thin HP/gold HUD.
6. Choose **one of three distinct cards from the defeated faction's deck**. Every third cleared year also grants a blessing. Every fifth year is a boss. Survive Year 20 to win; zero castle HP ends the run.

Keys: **1-5** select cards, **Space** pauses combat, **Escape** cancels selection or opens settings. Focus the battlefield, use arrow keys to move the plot cursor, then Enter to place. Settings contain controls, sound and reduced motion. Sound defaults off. There are no runtime font/image/CDN downloads.

After one completed run Verdant Pact unlocks; after two runs or a victory Tideglass unlocks. Captured cards enter future decks. Progress autosaves locally. Refresh during combat restores its last planning checkpoint. Version-1/2 saves migrate to v3: the old center castle, existing tiles (including fully expanded grids), decks, RNG and progression are retained. Old mixed rewards convert to three enemy cards. Invalid/future saves start a fresh profile; storage denial is reported.

## Factions

| Faction | Playstyle | Passive |
| --- | --- | --- |
| Embercourt | Aggressive soldiers, archers and damage adjacency | +15% troop/tower damage |
| Verdant Pact | Sturdy defenders and additional spawns | +25% troop HP |
| Tideglass | Ranged support, tower synergy and economy | +2 yearly gold |

Each has ten original cards: two unit buildings, a tower, two adjacency enchantments, an income building, healing, a wave-damage spell, a gold edict and expansion. Thirty cards total, six unit archetypes and three stacking perks.

## Structure and design

See [AGENTS.md](AGENTS.md) for folder maps, extension guides and performance/save contracts. The architecture remains data-driven TypeScript + effects + headless simulation + seeded RNG + versioned local saves. No engine or backend is required.

`Game` coordinates systems and emits typed EventBus notifications. The headless battle advances at 30 fixed steps per simulated second; presentation draws at browser RAF frequency. `SpatialHash` replaces per-unit sorting; reusable unit objects and bounded projectile/feedback pools avoid per-frame effect allocation. Sprite variants, shadow paths and health bars are batched.

A single canvas uses a 480x270 logical viewport at 16:9 with responsive low-resolution extensions/cropping at other aspect ratios, disabled smoothing and crisp CSS scaling. Original procedural sprites are 16x16 for units and 24x24 for buildings, with faction palettes and banners. Ground and decorations are seeded. Small DOM cards/HUD and pause/reward overlays sit above the scene. Audio is locally synthesized with WebAudio.

Faction troops, palettes, king wave modifiers and passives differ. Bosses currently increase army size/stats; bespoke boss abilities and human balance tuning remain future work. Combat has a deterministic siege timeout. Art/audio are original procedural assets, with no external asset licenses required.

## Verification

`npm run build` performs strict TypeScript checking and production compilation. `npm test` covers effect timing, adjacency, 4/8/14 squads, leveling, placement limits, card-only rewards, seeded battle/directions, scaling, pools, full-run transitions and v1/v2/v3 saves. A warmed **complete 300-unit battle** must finish under **100 ms**. See [VALIDATION.md](VALIDATION.md) for executed checks, browser scenarios and the 440-unit frame benchmark; benchmark results describe the measured environment.

## Next five updates

1. Faction-specific enemy formations and boss abilities.
2. More effect compositions: death summons, shields and tower chains.
3. Draftable starting decks and a captured-card collection screen.
4. New map terrain and directional adjacency synergies.
5. Balance telemetry, seeded challenge runs and richer original pixel art/audio.
