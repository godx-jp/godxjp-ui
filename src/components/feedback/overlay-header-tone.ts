import type { ToneProp } from "../../props/vocabulary";

/**
 * Soft semantic background band for an overlay header (Sheet / Dialog / Drawer), Ant-Design style.
 * Tints ONLY the background — text stays `--foreground` (渋み: never invert the band into a loud
 * solid fill). `default` = no band. Shared so the three overlays stay consistent.
 */
export const overlayHeaderToneClass: Record<ToneProp, string> = {
  default: "",
  success: "bg-success/10",
  warning: "bg-warning/10",
  destructive: "bg-destructive/10",
  info: "bg-info/10",
  muted: "bg-muted",
  neutral: "bg-muted",
};
