---
$schema: https://godx-jp.github.io/schemas/doc-frontmatter-v1.json
title: Wire user preferences in a service frontend
description: Step-by-step — install PreferencesProvider, hook usePreferences, and tell axios to send Accept-Language + X-Timezone on every request.
diataxis: how-to
audience:
  - developer
  - ai-agent
status: published
last-updated: 2026-05-17
lang: en
---

# Wire user preferences in a service frontend

> Goal: when the user changes their locale or timezone in your service,
> the backend sees the new `Accept-Language` and `X-Timezone` headers
> on the very next request — without re-installing the axios
> interceptor.

## 1. Wrap the app

In `src/main.tsx` (above `<RouterProvider>`):

```tsx
import { PreferencesProvider } from "@godxjp/ui/preferences"

createRoot(root).render(
  <PreferencesProvider
    storage="localStorage"   // default; use "cookie" or "both" for SSR
    defaultLocale="ja"
    defaultTimezone="Asia/Tokyo"
  >
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>
  </PreferencesProvider>
)
```

`PreferencesProvider` will:

- Read from `localStorage` (or cookie, or both).
- Fall back to `navigator.language` + `Intl.DateTimeFormat().resolvedOptions().timeZone`.
- Mirror the locale onto `<html lang>` for screen readers + `:lang()`.

## 2. Wire axios

In `src/lib/api.ts`, **after** you create the axios instance:

```ts
import axios from "axios"
import { applyPreferenceHeaders } from "@godxjp/ui/preferences"

export const meApi = axios.create({
  baseURL: …,
  withCredentials: true,
})

// Run once at module load. The interceptor reads the current
// preferences at REQUEST time, so it stays fresh as the user
// changes them — no remount, no re-install.
applyPreferenceHeaders(meApi)
```

`applyPreferenceHeaders` accepts an options object if you need to
rename the headers (rare):

```ts
applyPreferenceHeaders(meApi, {
  acceptLanguageHeader: "Accept-Language", // default
  timezoneHeader: "X-Timezone",            // default
  sendLocale: true,                        // default
  sendTimezone: true,                      // default
})
```

It returns an `eject()` function. You rarely need it — typically
you install at module load and never remove.

## 3. Read from React

Inside any component:

```tsx
import { usePreferences } from "@godxjp/ui/preferences"

function LocalePicker() {
  const { locale, setLocale } = usePreferences()
  return (
    <select value={locale} onChange={(e) => setLocale(e.target.value)}>
      <option value="ja">日本語</option>
      <option value="en">English</option>
      <option value="vi">Tiếng Việt</option>
      <option value="fil">Filipino</option>
    </select>
  )
}
```

The next API call after `setLocale("vi")` will carry
`Accept-Language: vi`. No remount, no manual cache invalidation.

## 4. Read from non-React code

If you have a fetch wrapper or a worker that needs the values without
a React component above it:

```ts
import { getPreferences, subscribePreferences } from "@godxjp/ui/preferences"

const prefs = getPreferences() // current snapshot

// Or stay in sync:
const unsubscribe = subscribePreferences((next) => {
  console.log("prefs changed:", next)
})
```

## 5. Verify

In dev tools → Network, inspect any request to your gateway. You
should see:

```
Accept-Language: ja
X-Timezone: Asia/Tokyo
```

Change the locale via your UI, send another request, and confirm the
header updated.

## Storage modes — when to flip

| Today | Future | Action |
|---|---|---|
| SPA-only, no SSR | — | Keep `storage="localStorage"`. |
| SPA-only | Adding SSR / Edge Function that needs locale | Flip to `storage="cookie"` (or `"both"`). |
| SPA + occasional cookie-blocked clients | — | Use `storage="both"` — cookie is canonical, LS is fallback. |

## Cookie domain

If your portals share a parent domain (`me.godx.jp`, `forge.godx.jp`,
`admin.godx.jp`), set `cookieOptions.domain = ".godx.jp"` so a locale
change on one portal propagates to siblings.

```tsx
<PreferencesProvider
  storage="cookie"
  cookieOptions={{ domain: ".godx.jp" }}
>
  …
</PreferencesProvider>
```

## Common mistakes

- **Calling `applyPreferenceHeaders` inside a React component.**
  Causes the interceptor to re-install on every render. Install at
  module load, in `lib/api.ts`.
- **Reading `locale` from `navigator.language` directly inside
  components.** It doesn't change at runtime; the user never sees
  their selection reflected. Always go through `usePreferences()`.
- **Sending `Accept-Language` as a q-weight list (`ja;q=0.9,en;q=0.5`).**
  We send a single tag. Backends that need a fallback list can derive
  it from the single tag (`ja` → `ja, en;q=0.9`) but the SOURCE is
  always one user-chosen value.
- **Treating `X-Timezone` as required.** Backends MUST tolerate the
  header being missing (curl, server-to-server M2M calls, etc.) and
  fall back to `Asia/Tokyo` (or your service default).

## Related

- [User preferences (explanation)](../explanation/preferences.md) — design rationale + standards.
- new-docs/12 Clause 6 — i18n layer (mandatory).
- new-docs/12 Clause 4 — service-layer pattern (where this hooks in).
