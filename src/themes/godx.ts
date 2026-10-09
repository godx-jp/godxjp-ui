import { createElement } from "react";

import type { AppPreset } from "../app/preset";
import { Logo } from "../components/general/logo";

/**
 * The GoDX PRESET (v32, gh#1220): the product defaults GoDX surfaces shipped with in 31.x, now
 * opt-in so the package's own defaults stay neutral. Pair it with the stylesheet that restores the
 * violet identity:
 *
 *     import "@godxjp/ui/themes/godx.css";
 *     import { godxPreset } from "@godxjp/ui/themes/godx";
 *     <AppProvider preset={godxPreset}>…</AppProvider>
 *
 * A shadow root that embeds `@godxjp/ui/styles/core` adds `@godxjp/ui/themes/godx-tokens.css` (the
 * same colours without the fonts) instead.
 *
 * Core never imports this module, which is what keeps the GoDX artwork out of a neutral bundle.
 */
export const godxPreset: AppPreset = Object.freeze({
  name: "godx",
  defaultLocale: "vi",
  timeZone: "Asia/Ho_Chi_Minh",
  brandMark: createElement(Logo, { mark: "godx", tone: "success" }),
  emailBrandLabel: "GoDX",
});
