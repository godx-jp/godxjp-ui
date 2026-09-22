import type { ToneProp } from "../../props/vocabulary";

/**
 * Soft semantic background band for an overlay header (Sheet / Dialog / Drawer).
 * Tints ONLY the background — text stays `--foreground` (渋み: never invert the band into a loud
 * solid fill).
 *
 * The four STATUS bands read `--surface-*` with today's 10% wash as the call-site fallback
 * (gh#866), so a brand whose kit pairs each status ink with an independently chosen pale ground
 * paints that ground here too — the band is one of eight surfaces that used to derive its own and
 * therefore could not agree with the Badge sitting in it. `muted`/`neutral` are not statuses and
 * keep `bg-muted`. Arbitrary property rather than `bg-success/10`: same utility layer, same
 * specificity, nothing about the cascade moves.
 */
export const overlayHeaderToneClass: Record<ToneProp, string> = {
  default: "",
  success:
    "[background-color:var(--surface-success,color-mix(in_oklab,hsl(var(--success))_10%,transparent))]",
  warning:
    "[background-color:var(--surface-warning,color-mix(in_oklab,hsl(var(--warning))_10%,transparent))]",
  destructive:
    "[background-color:var(--surface-destructive,color-mix(in_oklab,hsl(var(--destructive))_10%,transparent))]",
  info: "[background-color:var(--surface-info,color-mix(in_oklab,hsl(var(--info))_10%,transparent))]",
  muted: "bg-muted",
  neutral: "bg-muted",
};
