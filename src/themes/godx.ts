import { createElement } from "react";

import type { AppPreset } from "../app/preset";
import { Logo } from "../components/general/logo";

/**
 * The GoDX PRESET (v32, gh#1220): the product defaults GoDX surfaces shipped with in 31.x, now
 * opt-in so the package's own defaults stay neutral. Pair it with the stylesheet that restores the
 * GoDX identity colour (emerald-teal #008066 since 33.6.0, gh#1345):
 *
 *     import "@godxjp/ui/themes/godx.css";
 *     import { godxPreset } from "@godxjp/ui/themes/godx";
 *     <AppProvider preset={godxPreset}>…</AppProvider>
 *
 * A shadow root that embeds `@godxjp/ui/styles/core` adds `@godxjp/ui/themes/godx-tokens.css` (the
 * same colours without the fonts) instead.
 *
 * NO `timeZone` (gh#1282): a preset must not pin a country's zone. 32.x shipped
 * `"Asia/Ho_Chi_Minh"` here, so every godx app showed Vietnam time to its users in Japan; the zone
 * now falls back to the viewer's browser, and an app that needs a fixed one passes `defaultTimezone`.
 *
 * Core never imports this module, which is what keeps the GoDX artwork out of a neutral bundle.
 */
export const godxPreset: AppPreset = Object.freeze({
  name: "godx",
  defaultLocale: "vi",
  // `tone: "primary"` (gh#1345): the mark, its wordmark and the primary button are ONE colour —
  // the brand green the stylesheet sets on `--primary` and `--brand` alike. "success" would name
  // the 若竹 status role, which this mark is not.
  brandMark: createElement(Logo, { mark: "godx", tone: "primary" }),
  emailBrandLabel: "GoDX",
});
