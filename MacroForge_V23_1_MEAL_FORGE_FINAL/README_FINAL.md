# MacroForge Final Functional Build

This build prioritizes correctness and dynamic behavior over visual redesign.

## 1. Food calculation engine

The final engine separates the nutrition basis from the UI portion unit.
Every calculation converts the selected portion to the food's basis before
scaling calories/macros.

Supported input units:
- grams
- millilitres
- plate
- bowl
- piece
- cup
- tablespoon
- teaspoon
- wrap
- serving

Examples:
- 100 g of a 242.42 kcal/100 g food = 242.42 kcal
- 1 plate at 300 g = 727.26 kcal
- 2 plates at 300 g = 1454.52 kcal

The previous 24,000 kcal plate bug is covered by an automatic self-test.
Open the browser console and run `MacroForgeFinal.selfTest()` to inspect it.

## 2. Pakistani foods

The curated database includes the Pakistani dishes from the requested list,
plus explicit ingredient-level records for:
- Aloo
- Gosht / mutton
- Aloo Gosht combined

This means the user can log the potato component, the meat component, or the
combined curry independently.

For homemade foods, a single universal "exact" value does not exist. The app
labels the source and portion basis rather than pretending every household
recipe has identical nutrition.

## 3. Gym nutrition

Included references for:
- Whey protein powder
- Whey protein isolate
- Creatine monohydrate
- Creatine HCl
- Protein shake
- Mass gainer

Product-specific supplements should ultimately be entered from the actual
nutrition label because brands and serving sizes vary.

## 4. Global search

The search pipeline is:

1. Local MacroForge database renders immediately.
2. Query is normalized.
3. Previous request is aborted.
4. Search-a-licious full-text Open Food Facts search is attempted.
5. Legacy Open Food Facts full-text search is used as a fallback.
6. Products without useful nutrition are rejected.
7. Product names, generic names and brands are relevance-scored.
8. Exact/strong matches are ranked above related matches.
9. Category-only matches are penalized.
10. English name fields are preferred.
11. Duplicate products are removed.
12. The selected product's own nutrition data are retained when logged.

Open Food Facts' current documentation states that v2 structured search is
not a full-text search endpoint; the project directs plain-text search toward
Search-a-licious, while the legacy v1 endpoint remains a compatibility option.

## 5. Account system

The project keeps the simple local username/password account approach that
was requested. No email verification and no Google login are included.

This is local-browser authentication, not multi-device cloud authentication.

## 6. Workouts

The workout model is not limited to four exercises. Each workout contains an
array of exercises, and each exercise contains its own arbitrary sets array.
The final core provides helpers for adding/removing exercises and sets and
calculating training volume.

## 7. Hydration

Hydration supports ml, litres, cups and glasses, with a single canonical ml
value used for totals.

## 8. Testing

Open the browser developer console:

`MacroForgeFinal.selfTest()`

Expected result:
- 100 g basis test passes
- 1 plate conversion passes
- 2 plate conversion passes
- high-calorie regression guard passes
- protein proportionality test passes

You can also run:

`MacroForgeFinal.diagnostics()`

## 9. Data sources

Open Food Facts Search-a-licious documentation:
https://openfoodfacts.github.io/search-a-licious/users/ref-openapi/

Open Food Facts API documentation:
https://openfoodfacts.github.io/documentation/docs/Product-Opener/api/

USDA FoodData Central API guide:
https://fdc.nal.usda.gov/api-guide/

Pakistani standardized-recipe nutrition values used for selected dishes are
identified in the food source field. These values should be treated as the
reference recipe values, not a guarantee for every restaurant or household.

## 10. Live testing

Run through VS Code Live Server rather than opening index.html directly.
Global search requires internet access.

Do not put private API keys or service-role keys into browser JavaScript.
