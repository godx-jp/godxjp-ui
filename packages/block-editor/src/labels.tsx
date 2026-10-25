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

/**
 * What a directive preview can do to its own block (gh#1479): a host's picker or config form writes
 * the result back without the "Edit source" textarea.
 */
export type BlockEditorDirectiveControls = {
  /**
   * Replace the block's Markdown. Parsed like "Edit source" → Done: still one directive, it stays
   * this block with the new source; anything else (blocks, raw Markdown, nothing) takes its place.
   */
  update: (source: string) => void;
  /** Remove the block. */
  remove: () => void;
  /** False in a read-only or disabled editor: the preview should offer no edits. */
  editable: boolean;
};

/** Draws a directive block's preview in the editor; `undefined` shows its source instead. */
export type BlockEditorDirectiveRenderer = (
  block: DirectiveBlock,
  controls: BlockEditorDirectiveControls,
) => React.ReactNode | undefined;

/** The host's directive previews, by name — a context for the same reason as the labels. */
export const DirectivesContext = React.createContext<
  Readonly<Record<string, BlockEditorDirectiveRenderer>> | undefined
>(undefined);
