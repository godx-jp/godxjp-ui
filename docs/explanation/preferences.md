---
$schema: https://godx-jp.github.io/schemas/doc-frontmatter-v1.json
title: User preferences (locale + timezone)
description: Why @godxjp/ui ships a PreferencesProvider, what storage policy it follows, and which standards it inherits.
diataxis: explanation
audience:
  - developer
  - ai-agent
status: published
last-updated: 2026-05-16
lang: en
---

# User preferences (locale + timezone)

> Every godx frontend ships with a `PreferencesProvider` from
> `@godxjp/ui/preferences`. It owns the user's locale + timezone,
> persists them, and emits the canonical request headers so the
> backend speaks the right language and renders dates in the right
> zone.

## Why this lives in `@godxjp/ui`

User preferences are cross-cutting: every service needs them, and
every service must shape requests identically so backends can rely on
the same headers regardless of which portal the user came from.
Building them into `@godxjp/ui` gives us:

- **One source of truth** — a module-level holder + React context.
  `usePreferences()` reads it from React; `getPreferences()` reads it
  from non-React code (axios interceptors, fetch wrappers, error
  reporters).
- **One storage policy** — localStorage by default, opt-in cookie for
  deployments that read the prefs server-side.
- **One header contract** — `Accept-Language` (BCP 47) + `X-Timezone`
  (IANA tz name). Wired into axios via `applyPreferenceHeaders()`.

Service code chooses the values via the provider's props; the shape
of the API surface is locked.

## Standards

| Concern | Standard | Notes |
|---|---|---|
| Language tag | **BCP 47** (RFC 5646) | e.g. `ja`, `en-US`, `vi`. We do NOT use ISO 639-1 alone. |
| `Accept-Language` header | **RFC 7231 §5.3.5** | We send a single tag (no q-weight list). |
| Time zone identifier | **IANA Time Zone Database** + **ECMA-402** | e.g. `Asia/Tokyo`, `America/Los_Angeles`. Resolved via `Intl.DateTimeFormat().resolvedOptions().timeZone`. |
| Timezone header name | de-facto convention: `X-Timezone` | No international standard for client tz header. Most public APIs that need it use `X-Timezone` (Twilio, Linear, others). |
| Cookie attributes | **RFC 6265bis-13** | `SameSite=Lax`, `Path=/`, optional `Domain`, `Secure` when https. |
| `<html lang>` attribute | **HTML Living Standard §3.2.6** | Mirrored on every locale change so screen readers + CSS `:lang()` selectors update. |

## Storage policy

| Mode | Persists across | Use when |
|---|---|---|
| `localStorage` (default) | Reloads, tab close, browser restart | SPA-only frontend, no server-side rendering needs the value. |
| `cookie` | Reloads, tab close, browser restart, **server-readable** | A future SSR/RSC route or an Edge Function needs to read the locale before React mounts. |
| `both` | Same as cookie | Belt-and-braces: cookie is canonical (server-readable), localStorage is the fallback when cookies are blocked. |

**Why not `sessionStorage`?** It loses on tab close. User preferences
must survive that — anything that doesn't is a bad UX. The package
intentionally does not offer `sessionStorage` as a storage mode.

## Lifecycle

```
                ┌──────────────────────────┐
                │ <PreferencesProvider …>  │
                │                          │
   user ─click──▶ setLocale("vi")          │
                │   │                      │
                │   ▼                      │
                │ writeStored(LS|cookie)   │
                │   │                      │
                │   ▼                      │
                │ holder.set({locale:"vi"})│
                │   │                      │
                │   ▼                      │
                │ subscribers fire ─────────▶  React re-render
                │                          │   (via the provider's
                │                          │    setState)
                │                          │
                │  document.lang = "vi"    │  (effect, after render)
                │                          │
                └──────────────────────────┘
                          │
                          ▼
                   axios interceptor
                   reads getPreferences()
                   on every request
                          │
                          ▼
                   request goes out with
                   Accept-Language: vi
                   X-Timezone: Asia/Ho_Chi_Minh
```

The module holder is what lets the axios interceptor work without
remounting on every preference change — it reads the holder at
request time, not at install time.

## Why a module-level holder, not "just React state"

axios instances are created when `lib/api.ts` is imported — usually
before the React tree mounts. If interceptors closed over React state,
they'd freeze at provider mount time and miss every later update.

The holder is the runtime contract:

1. Provider mounts → seeds holder with detected/stored values.
2. User toggles locale → provider writes holder → subscribers fire →
   React re-renders.
3. Next API call → interceptor calls `getPreferences()` → reads
   current values from holder → attaches headers → request goes out.

The holder is small, mutation-only-via-`setPreferences`, and lives in
the same package as the provider, so the contract stays tight.

## Backend contract

Services that consume the headers should:

1. Read `Accept-Language` once per request, validate it's a known
   BCP 47 tag, and use it to select translated strings + format dates.
2. Read `X-Timezone` once per request, validate it's in the IANA tz
   database, and use it for date arithmetic (e.g. "is this within
   business hours in the user's locale").
3. Reject unknown values silently — fall back to a safe default
   (`ja` / `Asia/Tokyo`) and continue. NEVER 400 on a malformed
   `X-Timezone` — UI changes propagate slower than backend rollouts,
   so a backend that gates on this header creates a UX outage on
   every deploy.

## References

- [BCP 47 — Tags for Identifying Languages](https://www.rfc-editor.org/rfc/bcp47.txt)
- [RFC 7231 §5.3.5 — Accept-Language](https://www.rfc-editor.org/rfc/rfc7231#section-5.3.5)
- [IANA Time Zone Database](https://www.iana.org/time-zones)
- [ECMA-402 — Internationalization API](https://tc39.es/ecma402/)
- [RFC 6265bis-13 — Cookies: draft](https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-rfc6265bis-13)
- [HTML Living Standard — `lang` attribute](https://html.spec.whatwg.org/multipage/dom.html#the-lang-and-xml:lang-attributes)
