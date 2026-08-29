# MacroForge Final Functional Build — What changed

## Priority 1: Portion math
The previous implementation mixed nutrition basis and UI portion units.
The final core uses a canonical basis conversion engine.

Examples:
- Mutton Karahi: 242.42 kcal / 100 g
- 1 plate = 300 g by the default portion definition
- 1 plate = 727.26 kcal, not 24,000 kcal
- 2 plates = 1454.52 kcal
- 100 g = 242.42 kcal

Every preview and every logged entry uses the same calculation function.

## Priority 2: Full food catalog
The requested Pakistani/common food list is retained in the build, plus:
- Aloo
- Gosht / cooked mutton
- Aloo Gosht combined
- Whey protein
- Whey isolate
- Creatine monohydrate
- Creatine HCl
- Protein shake
- Mass gainer

## Priority 3: Global search
The final search service:
- tries Open Food Facts Search-a-licious full-text search
- falls back to the legacy Open Food Facts full-text endpoint
- aborts stale requests
- ranks exact product/name/brand matches first
- rejects products that only match through unrelated categories
- prefers English product fields
- retains the selected product's own nutrition payload
- converts kJ to kcal if a kcal field is missing
- supports generic foods and branded packaged foods

## Priority 4: Nutrition details
The model supports:
- calories
- protein
- carbohydrates
- fat
- fiber
- sugar
- sodium
- calcium
- iron
- potassium
- vitamin A
- vitamin C
- vitamin D

Global products use the data supplied by the food database. Curated Pakistani
recipes are source-labelled and are not falsely presented as universal exact
values for every household recipe.

## Priority 5: Dynamic behavior
- live amount calculation
- live unit conversion
- unlimited workout exercises
- unlimited workout sets
- hydration conversions
- local food search
- global food search
- custom foods
- local account login/create account
- persistent local state
- export snapshot
- diagnostics/self-test

## Testing
The portion engine self-test passes:
- 100 g basis
- 1 plate conversion
- 2 plate conversion
- regression guard against thousands-of-kcal portion errors
- proportional protein test

Run in browser console:
`MacroForgeFinal.selfTest()`

## Run
Use VS Code Live Server. Global search needs an internet connection.
