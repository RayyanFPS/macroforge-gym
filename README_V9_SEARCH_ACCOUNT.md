# MacroForge V9 — Search + Account Settings Update

## Search
Global search now combines Open Food Facts Search-a-licious, USDA FoodData Central, and Open Food Facts legacy search as fallbacks. Results are filtered locally so the requested food is represented by the product/generic name, while common transformed derivatives are rejected for simple food queries (e.g. banana chips for banana).

USDA uses the public DEMO_KEY for initial exploration. For a production deployment, replace it with your own server-side data.gov key; do not expose a private production key in browser code.

## Account
Settings > Account details opens a dedicated in-app Account page. It shows username, a masked password state, and email status. Current passwords cannot be recovered because MacroForge stores password hashes; the page provides secure password change and username change controls, plus sign out.

Email is not configured because the current MacroForge authentication model is local-only and intentionally has no email verification.
