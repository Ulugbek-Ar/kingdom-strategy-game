# Crown of the Wild — contributor guide

## Architecture contracts
- Strict TypeScript, no `any`. Keep files under roughly 300 lines.
- Content lives in `src/content/`. Do not put card-ID checks in gameplay systems.
- Abilities compose typed `Effect` data through `EffectRegistry`. Validate unknown effects loudly.
- `src/sim/` is headless and deterministic: no DOM, storage, wall-clock time or unseeded randomness.
- All random choices use `RNG`. Persist its state as well as the original run seed.
- Gameplay tuning belongs in `src/config/balance.ts` or typed content definitions. Feature switches belong in `src/config/features.ts`.
- `Game` is the composition root. It coordinates effects, content and simulation; other systems must not import UI or each other to send notifications. Use the typed EventBus (`changed`, `battle`, `placed`, `trigger`, `notice`, `finished`) for observers.
- Rendering only reads state. Input calls the game API, never edits combat state. localStorage access belongs to `src/save/`.
- Saves have a version and explicit migrations. Never silently interpret a future save version.
- Use the existing checkout in each isolated cloud task; do not create worktrees unless requested.

## Folder map
- `core/`: typed state, seeded RNG, EventBus and year/reward orchestration.
- `effects/`: registry, contexts, adjacency helper and reusable handlers.
- `sim/`: pooled armies/projectiles/hits, fixed-step combat and spatial hash targeting.
- `audio/`: optional, rate-limited synthesized WebAudio feedback.
- `content/factions/`: faction identity and ten-card decks.
- `content/cards/`: typed card factory and shared effect compositions.
- `content/units/`, `perks.ts`, `waves.ts`: unit stats, blessings, enemy scaling.
- `render/`: one low-resolution scene, procedural sprite cache, terrain and batched armies; no simulation decisions.
- `ui/`: compact HUD/hand, scene overlays, keyboard/pointer/touch input and accessibility controls. No website panels.
- `save/migrations/`: schema validation and version transformations.
- `config/`: balance knobs and feature flags.
- `tests/`: Vitest logic and persistence checks.

## How to add a new card
1. Add one typed `CardSpec` entry to its faction file. Use an original unique slug and existing effect compositions, or inline typed effects. The factory creates the ID and faction deck automatically; no logic edits are needed.
2. Include its type, name, rules description and trigger/effect parameters. Costs default by type in the factory; extend the typed schema if per-card costs are needed.
3. For spawning, use a valid unit ID. Playtest cost, spawn count and adjacent combinations.
4. Verify `npm run build` and `npm test`. The content integrity test checks every deck and handler. Update the expected deck count when intentionally expanding beyond ten.

## How to add a new effect/trigger
1. Register a unique kind in `createEffects()`. Read only the explicit context; keep deterministic behavior.
2. For a new context parameter, extend `EffectContext`. For a new trigger, extend the `Trigger` union and dispatch at its lifecycle boundary in `Game`.
3. Trigger order: place/upgrade immediately; year start before draw; battle start before army construction; unit spawn after construction; unit death after simulation step; year end before reward/finish.
4. Battle-start enchantments fill a shared bonus map; army assembly happens after all cards contribute. This makes card placement order irrelevant.
5. Add rule text in `effectText`, plus tests for timing, stacking and empty/invalid targets. Unit spawn/death hooks currently receive run/card context, not individual combat-unit targeting; extend the context for mechanics that require it.

## How to add a new faction
1. Create a faction file modeled on `ember.ts`: identity, color, passive description and typed deck.
2. Add its ID to `FactionId` and register faction/cards in `content/index.ts`.
3. Add its unit definitions and implement any new passive through effects or the composition root. Existing passives are applied during army construction/year income.
4. Decide its unlock condition in `recordRun`, update save validation and migrate existing saves if necessary.
5. Verify selection, opponent waves and reward cards in the browser.

## How to add a perk
1. Add a typed entry in `content/perks.ts`; current stats are damage, income and castle HP.
2. For a new stat extend `Perk`, apply it at the relevant orchestration point, and update save validation.
3. Perks can stack. HP perks raise both current and maximum HP immediately. Test the intended stacking behavior.

## How to add a save migration
1. Increment `SAVE_VERSION`; transform exactly the preceding schema before validation in `migrate`.
2. Preserve user progress and clone inputs. Never mutate the source object or change random state.
3. Add tests with a real old-schema fixture, malformed input, future-version rejection and a current-schema round trip.
4. Battles checkpoint at the last planning state; transient simulation state is intentionally not serialized.

## Validation and assets
Run `npm ci`, `npm run build`, `npm test`, then `npm run dev`. Smoke-test placement, stacking, spells, rewards, pause/speeds, refresh/continue and narrow layouts. Record failures honestly. Original procedural pixel sprites and synthesized tones are produced by this project; no downloaded assets or runtime CDN requests are required.


## v0.2 game flow and geometry
- New runs begin in `castle` phase. Call `placeCastle(x,y)` on an empty starting plot; never assume the castle is at (0,0).
- Five cards are drawn each year. Successful plays increment `playsThisYear`; the third play automatically starts battle. Early defense is allowed. Failed plays must not spend gold or consume a play.
- `Expand` adds exactly one empty, cardinally connected plot inside the configured 5x5 boundary. `size` is the bounding extent, not a guarantee of a filled square. Use `tiles` as the source of truth.
- Rewards are three distinct card entries from the defeated enemy faction's deck. Keep mixing captured cards into the run deck; periodic perks remain separate.
- `direction` is selected through the run RNG before planning and persists in saves. Four entry directions use the same deterministic mechanics.
- `tilePosition` maps logical plots into world pixels; use this for castle, spawn and tower origins. Shared game geometry is in balance config. Rendering translates the same world into the responsive canvas viewport; input reverses that transform.

## Pixel scene and feedback
- `Scene` owns the single visible canvas. Its logical viewport is 480x270 at 16:9, adapting the low-resolution viewport for other aspect ratios without stretching sprites. Disable canvas smoothing and keep CSS image rendering pixelated.
- `sprites.ts` draws original 16x16 units / 24x24 structures into a reusable sprite cache. `Card.icon` is a sprite archetype key, never emoji or a Unicode glyph. Factions supply their own palettes and procedural banner patterns.
- To add art, implement a sprite archetype and assign that key in typed content. Unit `icon` maps to its combat sprite; `faction` controls palette even when the card was captured.
- `ArmyRenderer` groups cached sprite variants and batches shadows and health bars. Do not sort units or create DOM nodes on each frame.
- Camera shake, pop-in and pulses are presentation-only. Simulation emits pooled hits, deaths and projectiles. Final-kill slow motion runs deterministically inside the sim. Honor the reduced-motion setting; sound is optional.

## Performance and save contracts
- Squad sizes are exactly 4 / 8 / 14 before spawn buffs. Keep this table in balance config, not in effect handlers or tooltips.
- `SpatialHash` uses reusable integer head/next arrays and deterministic distance/ID tie breaking. Cached targets avoid global per-unit sorts. Test nearest queries against brute-force results after changes.
- `UnitPool` retains units across years. `Pool` uses bounded ring buffers for hit feedback and arrows/bolts. Do not retain a previous battle's mutable unit references across `startBattle` calls.
- Pool overflow recycles the oldest transient slot; default capacity exceeds normal late-game armies. Increase capacity and repeat benchmarks before adding reinforcements beyond it.
- Save version 3 migrates v1/v2, preserves existing decks/tiles/RNG/progression, assumes the legacy center castle, and initializes direction without consuming gameplay RNG. Legacy mixed rewards convert to three enemy cards. Existing fully expanded 5x5 kingdoms stay expanded.
- Tests include a complete 300-unit battle under 100 ms (warmed), 440-unit pool integrity, four attack directions and a full 20-year developed-kingdom run. Browser performance must measure simulation plus rendering separately from RAF scheduling. Record hardware/browser scope and actual results, not a universal FPS guarantee.
