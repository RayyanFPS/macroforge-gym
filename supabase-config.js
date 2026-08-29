/* MacroForge V18 local build.
 * Supabase is intentionally disabled in this build. Authentication and app data
 * use the existing local-storage implementation. This file is kept as a harmless
 * compatibility shim so older script references do not throw errors.
 */
window.MACROFORGE_SUPABASE = Object.freeze({
  enabled: false,
  url: '',
  publishableKey: ''
});
