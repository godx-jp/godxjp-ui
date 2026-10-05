import * as React from "react";

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
