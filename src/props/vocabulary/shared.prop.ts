/**
 * Shared atomic prop types used across multiple components.
 * @see docs/PROPS-VOCABULARY.md
 */
import type * as React from "react";

/** Extra CSS class names on a component root. */
export type ClassNameProp = string;

/** Child nodes slot. */
export type ChildrenProp = React.ReactNode;

/** Stable DOM / form identifier. */
export type IdProp = string;

/** Controlled open state for panels (Dialog, Sheet, Popover). */
export type OpenProp = boolean;

/** Callback when open state changes. */
export type OnOpenChangeProp = (open: boolean) => void;

/** Async or sync handler — no return value expected. */
export type HandlerProp = () => void | Promise<void>;

/** Loading / pending state — disables actions and shows spinners. */
export type PendingProp = boolean;

/** Field or control is required. */
export type RequiredProp = boolean;

/** Disable user interaction. */
export type DisabledProp = boolean;

/** Generic label text (filters, form fields, nav groups). */
export type LabelProp = React.ReactNode;

/** Helper / hint text below inputs. */
export type HelperProp = React.ReactNode;

/** Validation error message. */
export type ErrorProp = React.ReactNode;

/** Placeholder text for inputs. */
export type PlaceholderProp = string;

/** HTML input `name` attribute. */
export type NameProp = string;

/** HTML input `value` — string form. */
export type ValueProp = string;

/** Change handler for text inputs. */
export type OnChangeProp = React.ChangeEventHandler<HTMLInputElement>;

/** Click handler for buttons and interactive elements. */
export type OnClickProp = React.MouseEventHandler<HTMLButtonElement>;

/** Radix/shadcn `asChild` polymorphism — render as child element. */
export type AsChildProp = boolean;
