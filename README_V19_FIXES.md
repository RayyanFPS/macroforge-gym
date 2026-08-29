# MacroForge V19 Fix Pack

This build keeps the existing MacroForge V18/V17/V16 architecture and adds a V19 stability layer.

## Fixed
- Exercise form button now uses the free ExerciseDB V1 endpoint as the primary form-animation source, with a YouTube fallback if the live database cannot return a match.
- Exercise History now has a cleaner table and a working **View Exercise** modal with the record details and a **Watch Form** action.
- Added a training-intensity note explaining failure, 0 RIR, and when to use failure selectively.
- BMI remains numeric, but adult BMI categories are disabled for users under 18.
- Adult Navy body-fat estimation is disabled for users under 18 so the app does not produce misleading values such as 2% for an adolescent.
- Generated workouts can be assigned and the assigned workout is saved and shown in Training Lab.
- Next Meal Coach excludes meals that would materially worsen a macro that is already over target, especially fat and carbohydrates.
- Existing logged foods can be recalculated against the current canonical food library.
- Added a Nutrition Integrity audit that checks calorie vs protein/carbohydrate/fat consistency and provides a one-click recalculation of logged library foods.
- Food quantity input accepts natural phrases such as `half plate`, `one and a half plates`, `2 pieces`, and `200 g`.

## Nutrition accuracy policy
The curated library is internally audited for calculation consistency, but homemade foods such as karahi, biryani and nihari cannot have one laboratory-exact macro value because recipe oil, meat ratio, gravy and serving size vary. Packaged products should be verified against their product label.

## Run
Open `index.html` through VS Code Live Server as before. The V19 layer does not require npm for the core website fixes.
