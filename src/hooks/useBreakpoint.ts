import { useEffect, useState } from "react";
import type { Breakpoint } from "../components/layout/Row";

/**
 * useBreakpoint — reads the framework's responsive breakpoint
 * tokens (`--breakpoint-{xs,sm,md,lg,xl,xxl}`) from the CSS
 * token system and returns the WIDEST currently-matching
 * breakpoint name.
 *
 * Per cardinal rule 22 the breakpoint values are token-pinned —
 * no hardcoded literals here; the hook reads `:root` via
 * `getComputedStyle`. Falls back to Tailwind v4 defaults if the
 * tokens aren't set yet (e.g. SSR / hydration / Storybook iframe
 * before theme.css loads).
 *
 * Per cardinal rule 23 §B the breakpoint name vocabulary is locked
 * across the framework — the `Breakpoint` type lives in
 * `components/layout/Row.ts` and is imported here so
 * consumers see exactly one definition.
 *
 * @example
 *   const bp = useBreakpoint()
 *   if (bp === "xs" || bp === "sm") return <MobileShell />
 *   return <DesktopShell />
 *
 * @example
 *   // Render only on >= md
 *   const bp = useBreakpoint()
 *   return matchBreakpoint(bp, "md") ? <Aside /> : null
 */
export type { Breakpoint };

const BP_ORDER: Breakpoint[] = ["xxl", "xl", "lg", "md", "sm", "xs"];
const BP_ORDER_ASC: Breakpoint[] = ["xs", "sm", "md", "lg", "xl", "xxl"];

const FALLBACK_WIDTH: Record<Breakpoint, string> = {
  xs: "0px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  xxl: "1536px",
};

function widthOf(bp: Breakpoint): string {
  if (typeof window === "undefined") return FALLBACK_WIDTH[bp];
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(`--breakpoint-${bp}`)
    .trim();
  return v || FALLBACK_WIDTH[bp];
}

function currentBreakpoint(): Breakpoint {
  if (typeof window === "undefined") return "xs";
  for (const bp of BP_ORDER) {
    if (window.matchMedia(`(min-width: ${widthOf(bp)})`).matches) {
      return bp;
    }
  }
  return "xs";
}

export function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>(() => currentBreakpoint());

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mqls = BP_ORDER.map((b) =>
      window.matchMedia(`(min-width: ${widthOf(b)})`),
    );
    const update = () => setBp(currentBreakpoint());
    mqls.forEach((mql) => mql.addEventListener("change", update));
    update();
    return () => {
      mqls.forEach((mql) => mql.removeEventListener("change", update));
    };
  }, []);

  return bp;
}

/**
 * matchBreakpoint — true if `current` is at-or-above the target
 * breakpoint in the mobile-first order.
 *
 *   matchBreakpoint("lg", "md") → true  (lg ≥ md)
 *   matchBreakpoint("sm", "lg") → false (sm < lg)
 */
export function matchBreakpoint(current: Breakpoint, target: Breakpoint): boolean {
  return BP_ORDER_ASC.indexOf(current) >= BP_ORDER_ASC.indexOf(target);
}
