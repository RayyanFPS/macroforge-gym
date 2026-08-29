# MacroForge V23 Final Training + Bulk Planning Patch

## Changes
- Reworked bulk planning so the target-weight deadline does not generate an extreme calorie prescription.
- For users under 18, bulk planning uses a capped 300–500 kcal/day surplus and flags aggressive target deadlines instead of attempting to force them.
- For adults, the starting surplus is capped to a conservative percentage of estimated maintenance.
- Added safe-rate and recommended-timeframe feedback to the plan preview.
- Added a persistent in-app **Search training** button to Training Lab and **Search workouts** to Workouts.
- Search modal supports Exercises / Workouts / All and is mobile-friendly.
- Assigned workout is now interactive: movement completion checkboxes, session state, Start recording, and Search exercise.
- Progressive Overload UI is now injected directly into Exercise History and shows latest load/reps, estimated 1RM, change vs previous, and next target.
- Existing features are preserved; this remains a compatibility layer rather than a rewrite of the app core.

## Evidence basis
The planning logic is intentionally conservative. The American Academy of Pediatrics recommends gradual weight gain for young athletes and notes that rapid gain can increase unwanted fat. The 2026 ACSM resistance-training position stand supports progressive resistance training and higher weekly volume for hypertrophy.

## Run
This build remains a static browser application and does not require Node/npm for the training/nutrition UI changes.
