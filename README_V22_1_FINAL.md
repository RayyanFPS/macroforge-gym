# MacroForge V22.1 — Final Training/UI Stability Patch

This build is a non-destructive patch on top of MacroForge V22 Publish Ready.

## What changed
- Restored a mobile-first, in-app **Search workouts & exercises** modal.
- Search supports exercise names, muscle groups, common aliases such as `seated row`, and the workout/split cards already rendered by MacroForge.
- Selecting an exercise sends it directly into the existing Exercise Record selector.
- Workout assignment is now visible in both **Workouts** and **Training Lab**.
- Assigned split cards are marked **ACTIVE THIS WEEK** and their button changes to **✓ Assigned**.
- Training Lab shows today's assigned day, weekly day number, status, and the movements MacroForge can map to that split.
- Assignment remains visible after page navigation/reload because it reads the existing `state.trainingPlan`.
- Exercise history remains app-native with **View details**, estimated 1RM, best performance, and progression guidance.
- Failure/RIR guidance remains visible in Training Lab.
- Broken form-video controls remain removed rather than presenting dead buttons.
- Obsolete `PAKISTAN-FIRST / Desi foods + global food search in one tracker` promo remains removed.
- Legacy meal suggestion UI remains suppressed until the food/nutrition data layer is authoritative.

## Existing functionality preserved
The patch does not replace the existing core, nutrition engine, authentication, food search, profile, hydration, workout builder, or split system. It layers the fixes in `macroforge-v22-publish.js`.

## Validation
- All JavaScript files pass `node --check` syntax validation.
- `index.html` still loads the existing script stack and the V22.1 layer last.
