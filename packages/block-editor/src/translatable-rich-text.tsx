import * as React from "react";
import { TranslatableField, type TranslatableLocaleProp } from "@godxjp/ui/data-entry";

import {
  RichTextEditor,
  type RichTextEditorHandle,
  type RichTextEditorProps,
} from "./rich-text-editor";

export type TranslatableRichTextProps = Omit<
  RichTextEditorProps,
  "value" | "defaultValue" | "onValueChange" | "lang"
> &
  TranslatableLocaleProp & {
    /** The tab strip's tier, as on TranslatableTextarea (`sm` tabs; `md` for `lg`). */
    size?: "sm" | "md" | "lg";
  };

/** The text of an HTML string, for a placeholder. Parsed inert (DOMParser runs no script). */
const htmlToText = (html: string) =>
  new DOMParser().parseFromString(html, "text/html").body.textContent?.trim() ?? "";

/**
 * TranslatableRichText (gh#1365) — ONE {@link RichTextEditor} holding an HTML value per locale
 * (`{ ja, en, vi }`), switched by locale tabs: the kit's `TranslatableField` engine, the same as
 * `TranslatableInput` / `TranslatableTextarea` (locales and the first tab from AppProvider
 * `contentLocales`, fallback placeholder, per-locale error marks, FormField error report). An empty
 * locale shows the fallback locale's TEXT as its placeholder. `ref` is the editor's handle.
 */
export const TranslatableRichText = React.forwardRef<
  RichTextEditorHandle,
  TranslatableRichTextProps
>(function TranslatableRichText(props, ref) {
  return (
    <TranslatableField
      {...props}
      toPlaceholder={htmlToText}
      renderControl={({ size: _size, ...control }) => (
        <RichTextEditor {...(control as RichTextEditorProps)} ref={ref} />
      )}
    />
  );
});
