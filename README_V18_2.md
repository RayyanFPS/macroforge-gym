# MacroForge V18.2 — Stable Limited Coach Build

This is a simplified V18 build intended to run directly with Live Server.

### AI Coach change
The V18.1 free-form AI backend has been removed. The Coach is back to the original limited-question design from V17:

1. Warm-up
2. Progressive overload
3. Pre-workout food
4. Protein
5. Beginner plan

There is no custom question input, no `ai-coach.mjs`, no `package.json`, no `.env`, and no Node/npm dependency.

All other V18 features remain in the project.


## V18.3 Training Lab upgrade
- Added a themed in-app **Find an exercise** search button.
- Search supports natural exercise names such as **Seated Row**, **Lat Pulldown**, **Bench Press**, etc.
- Results provide **Watch Form** and **Use in Record** actions.
- Form videos continue to stream inside Training Lab from the exercise-video service; YouTube is used only as a fallback when no embeddable video is available.
