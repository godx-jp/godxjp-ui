/** Editorial account family prop types (gh#1439) — @see components/layout/editorial-account.tsx */
import type { ReactNode } from "react";
import type { ClassNameProp } from "../vocabulary";

/** One choice of an EditorialToggleGroup. `label` is the visible text (text variant) and the
 * accessible name of the button in both variants. */
export type EditorialToggleGroupItemProp = {
  value: string;
  label: string;
  icon?: ReactNode;
};

/**
 * @see EditorialToggleGroup — a named `role="group"` of `aria-pressed` buttons, one pressed at a
 * time: `variant="text"` for a filter ("All · Cards · Sealed"), `variant="icon"` for a framed
 * icon-only switch (grid / list view). Geometry: `--editorial-toggle-group-*`.
 */
export type EditorialToggleGroupProp = {
  "aria-label": string;
  items: EditorialToggleGroupItemProp[];
  value: string;
  onValueChange: (value: string) => void;
  /** `text` (default) shows the labels; `icon` shows only the icons, the label is the name. */
  variant?: "text" | "icon";
  className?: ClassNameProp;
};
