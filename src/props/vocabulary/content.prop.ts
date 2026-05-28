/**
 * Content-slot prop types — titles, descriptions, actions.
 * @see docs/PROPS-VOCABULARY.md#content-slots
 */
import type * as React from "react";

/** Primary heading text — page title, dialog title, empty state title. */
export type TitleProp = React.ReactNode;

/** Secondary text below a title — page subtitle, card description. */
export type SubtitleProp = React.ReactNode;

/** Longer explanatory copy — dialog body, empty state body. */
export type DescriptionProp = React.ReactNode;

/** Top-right action slot on pages (Ant Design `extra`). */
export type ExtraProp = React.ReactNode;

/** Bottom action bar on pages — save/cancel, pagination controls. */
export type FooterProp = React.ReactNode;

/** Primary CTA in empty states or inline prompts. */
export type ActionProp = React.ReactNode;

/** Optional icon in empty states and status views (Lucide or compatible). */
export type IconProp = React.ComponentType<{ className?: string }>;

/** Confirm / submit button label in dialogs. */
export type ConfirmLabelProp = React.ReactNode;

/** Cancel / dismiss button label in dialogs. */
export type CancelLabelProp = React.ReactNode;

/** Toolbar actions slot in tables and filter rows. */
export type ActionsProp = React.ReactNode;
