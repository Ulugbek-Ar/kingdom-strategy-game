# Crown of the Wild — contributor guide

## Architecture contracts
- Strict TypeScript, no `any`. Keep files under roughly 300 lines.
- Content lives in `src/content/`. Do not put card-ID checks in gameplay systems.
- Abilities compose typed `Effect` data through `EffectRegistry`. Validate unknown effects loudly.
- `src/sim/` is headless and deterministic: no DOM, storage, wall-clock time or unseeded randomness.
- All random choices use `RNG`. Persist its state as well as the original run seed.
- Gameplay tuning belongs in `src/config/balance.ts` or typed content definitions. Feature switches belong in `src/config/features.ts`.
- `Game` is the composition root. It coordinates effects, content and simulation; other systems must not import UI or each other to send notifications. Use the typed EventBus (`changed`, `battle`, `trigger`, `notice`, `finished`) for observers.
- Rendering only reads state. Input calls the game API, never edits combat state. localStorage access belongs to `src/save/`.
- Saves have a version and explicit migrations. Never silently interpret a future save version.
- Use the existing checkout in each isolated cloud task; do not create worktrees unless requested.

## Folder map
- `core/`: typed state, seeded RNG, EventBus and year/reward orchestration.
- `effects/`: registry, contexts, adjacency helper and reusable handlers.
- `sim/`: army construction and fixed-step nearest-target combat.
- `content/factions/`: faction identity and ten-card decks.
- `content/cards/`: typed card factory and shared effect compositions.
- `content/units/`, `perks.ts`, `waves.ts`: unit stats, blessings, enemy scaling.
- `render/`: Canvas grid and battle rendering; no simulation decisions.
- `ui/`: DOM screens, cards, input and accessibility controls.
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
Run `npm ci`, `npm run build`, `npm test`, then `npm run dev`. Smoke-test placement, stacking, spells, rewards, pause/speeds, refresh/continue and narrow layouts. Record failures honestly. Original procedural geometric placeholder art and synthesized tones are produced by this project; no downloaded assets or runtime CDN requests are required.
