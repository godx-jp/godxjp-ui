// @godxjp/ui/preferences — locale + timezone provider for every
// GoDX service frontend. Standards-aligned:
//
//   • BCP 47 (RFC 5646) — language tags, e.g. "ja", "en-US"
//   • RFC 7231 §5.3.5  — Accept-Language header
//   • IANA Time Zone Database / ECMA-402 — IANA tz names
//                       e.g. "Asia/Tokyo", "America/New_York"
//   • RFC 6265bis-13   — cookie attributes (SameSite, Secure, …)
//
// Public surface:
//
//   <PreferencesProvider storage="localStorage|cookie|both">
//     <App />
//   </PreferencesProvider>
//
//   const { locale, timezone, setLocale, setTimezone, headers }
//     = usePreferences()
//
//   // Wire an axios instance once at module-load time:
//   applyPreferenceHeaders(meApi)
//
// The provider keeps a module-level holder in sync; axios interceptors
// read from the holder at request time so they always see the current
// values even after late re-renders.

export {
  PreferencesProvider,
  usePreferences,
  type PreferencesContextValue,
  type PreferencesProviderProps,
} from "./PreferencesProvider";

export {
  getPreferences,
  setPreferences,
  resetPreferences,
  subscribePreferences,
  type Preferences,
} from "./holder";

export {
  applyPreferenceHeaders,
  type ApplyPreferenceHeadersOptions,
} from "./applyPreferenceHeaders";

export type { CookieOptions, PreferenceStorage } from "./storage";
