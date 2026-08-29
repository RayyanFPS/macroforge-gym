# MacroForge V18 — AI + Dynamic Training/Body Composition Update

## Major fixes
- AI Coach upgraded from keyword-only replies to a real backend-backed conversational coach.
- AI Coach receives live MacroForge context: targets, today's food/water, training plan, exercise records, cardio and creatine settings.
- OpenAI key is kept server-side in `server/.env`.
- Cardio now shows today's sessions directly under the live timer area.
- Cardio performance keeps fastest, second-fastest and slowest records per activity.
- Separate streaks: calories, protein, carbs, fat, water, workouts and cardio.
- Suggested next meal recalculates after every log and avoids immediately repeating the meal just logged.
- Suggested meal components are required to exist in the Food Log library before they can be suggested.
- Food can be unlogged from the dashboard and Food Log history.
- BMI now reads the latest logged weight instead of a stale profile value.
- Weight logging triggers a body-composition follow-up.
- Optional body-fat estimate uses the U.S. Navy circumference equation for adults only.
- No scientifically unsupported ectomorph/mesomorph/endomorph detector is claimed.
- Old Workouts tab removed; Training Lab is the main workout-entry surface.
- Training Lab expanded to 300+ curated exercises with machine/cable/free-weight/Smith/bodyweight/band filters.
- Training generator uses the expanded exercise library.
- In-app exercise video player loads streamed demonstrations when the live exercise-video service returns a video.

## AI
See `AI_COACH_SETUP.md`.

Start the local backend with `server/START_AI_COACH.bat` after adding `OPENAI_API_KEY` to `server/.env`.
