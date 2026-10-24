import * as React from "react";

import type { DirectiveBlock } from "@godxjp/markdown/codec";

import type { BlockEditorLabels } from "./messages";

export type LabelFn = (
  key: keyof BlockEditorLabels,
  params?: Record<string, string | number>,
) => string;

/**
 * The editor's strings: a host `labels` override, else the kit catalogue (`blockEditor.*`). A
 * context, because node views render through portals inside `EditorContent` and still need them.
 */
export const LabelsContext = React.createContext<LabelFn>((key) => key);

export const useLabel = () => React.useContext(LabelsContext);

/** Draws a directive block's preview in the editor; `undefined` shows its source instead. */
export type BlockEditorDirectiveRenderer = (block: DirectiveBlock) => React.ReactNode | undefined;

/** The host's directive previews, by name — a context for the same reason as the labels. */
export const DirectivesContext = React.createContext<
  Readonly<Record<string, BlockEditorDirectiveRenderer>> | undefined
>(undefined);
