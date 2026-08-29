# MacroForge V10 — Account + Global Search Fixes

## What changed
- Custom Food global lookup now searches USDA FoodData Central first, then Open Food Facts Search-a-licious and fallbacks.
- USDA `foodNutrients` are normalized correctly into MacroForge nutrition values.
- Generic foods such as banana, apple, rice and chicken can be returned even when Open Food Facts primarily returns packaged derivatives.
- Search remains relevance/food-name strict: transformed products such as banana chips are rejected for a plain `banana` query.
- Search-a-licious POST requests request the relevant product/nutrition fields.
- Account creation now has an optional email field. No email verification is performed.
- Account details shows username, masked password and email, and allows changing email, username and password.
- Sign out remains available from the Account page.

## Important
USDA FoodData Central requires an API key. This build uses DEMO_KEY for testing. USDA documents that DEMO_KEY is rate-limited (30 requests/hour and 50/day per IP). For production, use your own key behind a server-side proxy rather than exposing a production key in browser JavaScript.
