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

/**
 * @see EditorialMetaBar — a hairline-ruled strip under a page header: a start cluster (a glyph and
 * a line, e.g. "Your private collection") and an end slot (a badge). Stacks on a phone (tokens).
 */
export type EditorialMetaBarProp = {
  /** Leading glyph, drawn in the primary tone. */
  icon?: ReactNode;
  start: ReactNode;
  end?: ReactNode;
  className?: ClassNameProp;
};

/**
 * @see EditorialEmptyPanel — a centred panel for a signed-out or an empty state. `variant="guest"`
 * draws a decorative three-card stack above the copy; `variant="empty"` is dashed, with a round
 * icon medallion.
 */
export type EditorialEmptyPanelProp = {
  variant?: "guest" | "empty";
  /** A kicker (an `Eyebrow`) above the title. */
  eyebrow?: ReactNode;
  title: ReactNode;
  /** Heading level of the title. Default `2`. */
  level?: 2 | 3;
  description?: ReactNode;
  /** Buttons, centred in a wrapping row. */
  actions?: ReactNode;
  /** The medallion glyph of `variant="empty"`. */
  icon?: ReactNode;
  className?: ClassNameProp;
};

/** One tile of an EditorialStats strip. */
export type EditorialStatsItemProp = {
  label: ReactNode;
  value: ReactNode;
  /** A small unit after the figure ("items"). */
  unit?: ReactNode;
  /** A short line under the figure. */
  note?: ReactNode;
};

/**
 * @see EditorialStats — a strip of figure tiles on unequal tracks; the first tile is the lead
 * (emphasised; on a phone it spans the row with its figure beside the label).
 */
export type EditorialStatsProp = {
  items: EditorialStatsItemProp[];
  /** Accessible name of the strip (a list). */
  "aria-label"?: string;
  className?: ClassNameProp;
};

/**
 * @see EditorialToolbar — a wrapping bar over a hairline: a start cluster (filters) and an end
 * cluster (view switch, primary action).
 */
export type EditorialToolbarProp = {
  start?: ReactNode;
  end?: ReactNode;
  className?: ClassNameProp;
};

/** `grid` = tiles; `list` = the same cards as wide rows. */
export type HoldingViewProp = "grid" | "list";

/** @see HoldingGrid — the track of HoldingCards in grid or list view. */
export type HoldingGridProp = {
  view?: HoldingViewProp;
  /** Accessible name of the list. */
  "aria-label"?: string;
  children?: ReactNode;
  className?: ClassNameProp;
};

/**
 * @see HoldingCard — one owned item: a picture ground (the consumer's link around an image), then
 * overline, title, meta, tags, the purchase line, a date and actions. Its geometry follows the
 * enclosing HoldingGrid's view.
 */
export type HoldingCardProp = {
  /** The picture ground: a link (router Link or `<a>`) whose child is the image. */
  media: ReactNode;
  /** Small line above the title (kind, badges). */
  overline?: ReactNode;
  title: ReactNode;
  /** Heading level of the title. Default `2`. */
  level?: 2 | 3;
  meta?: ReactNode;
  /** Outlined tags (condition, grade, quantity); the last one is set apart. */
  tags?: ReactNode[];
  /** The owner's purchase line: a label and a figure. */
  purchase?: { label: ReactNode; value: ReactNode };
  /** A date line ("Purchased: 2026-10-01"). */
  date?: ReactNode;
  /** HoldingCardAction elements. */
  actions?: ReactNode;
  className?: ClassNameProp;
};

/**
 * @see HoldingCardAction — a quiet glyph + label action of a HoldingCard (edit, remove). A
 * `<button>` by default; `asChild` turns the consumer's link into the action.
 */
export type HoldingCardActionProp = {
  icon?: ReactNode;
  children?: ReactNode;
  asChild?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  "aria-label"?: string;
  className?: ClassNameProp;
};

/**
 * @see SettingsLayout — a settings page: a sticky rail (`aside`) beside the panels. The rail hides
 * on narrow screens through tokens.
 */
export type SettingsLayoutProp = {
  aside?: ReactNode;
  children?: ReactNode;
  className?: ClassNameProp;
};

/**
 * @see SettingsPanel — one bordered settings section: a number and a title with a description,
 * then its fields.
 */
export type SettingsPanelProp = {
  /** The section number ("01"), set in the figure face. */
  number?: ReactNode;
  title: ReactNode;
  /** Heading level of the title. Default `2`. */
  level?: 2 | 3;
  description?: ReactNode;
  children?: ReactNode;
  /** id of the title, so a group inside can be named by it. */
  titleId?: string;
  className?: ClassNameProp;
};

/** A painted preview of the interface in a ThemePicker choice. */
export type ThemePickerPreviewProp = "light" | "dark" | "system";

/** One choice of a ThemePicker. */
export type ThemePickerOptionProp = {
  value: string;
  label: string;
  icon?: ReactNode;
  preview: ThemePickerPreviewProp;
};

/**
 * @see ThemePicker — an illustrated radio group for the colour theme: each choice is a painted
 * preview of the interface (light / dark / split system) with a glyph and its label.
 */
export type ThemePickerProp = {
  /** Accessible name of the radio group (a visually hidden legend). */
  legend: string;
  options: ThemePickerOptionProp[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Name of the radio inputs. */
  name?: string;
  className?: ClassNameProp;
};

/**
 * @see EditorialAuth — a sign-in / sign-up page: a story column (kicker, display title, copy,
 * decorative art, benefits) beside the form card (`children`).
 */
export type EditorialAuthProp = {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** The picture on the front card of the decorative card pair (e.g. the brand mark). */
  art?: ReactNode;
  /** Short benefit lines, each led by a check glyph. */
  benefits?: ReactNode[];
  children?: ReactNode;
  className?: ClassNameProp;
};

/**
 * @see EditorialAuthCard — the form card of EditorialAuth: badge, title, copy, the form
 * (`children`) and a ruled footer line ("New here? Create an account").
 */
export type EditorialAuthCardProp = {
  badge?: ReactNode;
  title: ReactNode;
  /** Heading level of the title. Default `2`. */
  level?: 2 | 3;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  className?: ClassNameProp;
};

/**
 * @see EditorialTextButton — an underlined text action in the primary tone ("Reset display
 * preferences", "Your collection →"). A `<button>` by default; `asChild` turns the consumer's link
 * into it. `icon` trails the label.
 */
export type EditorialTextButtonProp = {
  children?: ReactNode;
  icon?: ReactNode;
  asChild?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: ClassNameProp;
};

/**
 * @see EditorialFootnote — a quiet closing line under a collection or a settings form: a note at the
 * start and an optional action (an EditorialTextButton) at the end. Geometry:
 * `--editorial-footnote-*`.
 */
export type EditorialFootnoteProp = {
  children?: ReactNode;
  action?: ReactNode;
  /** Cross-axis alignment of note and action: `start` (default, a multi-line note) or `center`. */
  align?: "start" | "center";
  className?: ClassNameProp;
};
