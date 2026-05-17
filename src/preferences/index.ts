// @godxjp/ui/preferences — locale + timezone + currency provider for
// every GoDX service frontend. Standards-aligned:
//
//   • BCP 47 (RFC 5646) — language tags, e.g. "ja", "en-US"
//   • RFC 7231 §5.3.5  — Accept-Language header
//   • IANA Time Zone Database / ECMA-402 — IANA tz names
//                       e.g. "Asia/Tokyo", "America/New_York"
//   • RFC 6265bis-13   — cookie attributes (SameSite, Secure, …)
//   • ISO 4217         — currency codes
//
// Public surface:
//
//   <GodxConfigProvider storage="localStorage|cookie|both">
//     <App />
//   </GodxConfigProvider>
//
//   const { locale, timezone, currency, setLocale, setTimezone,
//           setCurrency, headers } = useGodxConfig()
//
//   // Wire an axios instance once at module-load time:
//   applyGodxConfigHeaders(meApi)
//
// The provider keeps a module-level holder in sync; axios interceptors
// read from the holder at request time so they always see the current
// values even after late re-renders.

export {
  GodxConfigProvider,
  useGodxConfig,
  type GodxConfigContextValue,
  type GodxConfigProviderProps,
} from "./GodxConfigProvider";

export {
  getGodxConfig,
  setGodxConfig,
  resetGodxConfig,
  subscribeGodxConfig,
  type GodxConfig,
} from "./holder";

export {
  applyGodxConfigHeaders,
  type ApplyGodxConfigHeadersOptions,
} from "./applyGodxConfigHeaders";

export type { CookieOptions, GodxConfigStorage } from "./storage";
