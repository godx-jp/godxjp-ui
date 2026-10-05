import * as React from "react";
import type { Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { Bold, Code, Italic, Link2, Strikethrough } from "lucide-react";
import { Input, ToggleGroup, ToggleGroupItem } from "@godxjp/ui/data-entry";
import { Button } from "@godxjp/ui/general";

import { useLabel } from "./labels";

const MARKS = ["bold", "italic", "strike", "code"] as const;
type MarkName = (typeof MARKS)[number];

/**
 * The floating format toolbar over a text selection: the kit ToggleGroup (a WAI-ARIA toolbar of
 * toggle buttons with pressed state) for bold / italic / strike / code, and a link field. Only the
 * marks the codec writes back exist here — there is no underline because Markdown has none.
 */
export function FormatToolbar({ editor }: { editor: Editor }) {
  const label = useLabel();
  const [linking, setLinking] = React.useState(false);
  const [href, setHref] = React.useState("");
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      marks: MARKS.filter((mark) => e.isActive(mark)),
      link: (e.getAttributes("link").href as string | undefined) ?? null,
    }),
  });

  const toggle = (next: string[]) => {
    const chain = editor.chain().focus();
    for (const mark of MARKS) {
      const on = next.includes(mark);
      if (on === state.marks.includes(mark)) continue;
      if (mark === "bold") chain.toggleBold();
      else if (mark === "italic") chain.toggleItalic();
      else if (mark === "strike") chain.toggleStrike();
      else chain.toggleCode();
    }
    chain.run();
  };

  const applyLink = () => {
    const url = href.trim();
    const chain = editor.chain().focus().extendMarkRange("link");
    if (url) chain.setLink({ href: url }).run();
    else chain.unsetLink().run();
    setLinking(false);
  };

  return (
    <BubbleMenu
      editor={editor}
      className="ui-block-editor-toolbar"
      shouldShow={({ editor: e, state: s }) =>
        e.isEditable &&
        !s.selection.empty &&
        !e.isActive("codeBlock") &&
        s.selection.content().size > 0
      }
      options={{ placement: "top" }}
    >
      {linking ? (
        <form
          className="ui-block-editor-toolbar-link"
          onSubmit={(event) => {
            event.preventDefault();
            applyLink();
          }}
        >
          <Input
            size="sm"
            type="url"
            inputMode="url"
            aria-label={label("linkUrl")}
            value={href}
            onValueChange={setHref}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setLinking(false);
                editor.commands.focus();
              }
            }}
            autoFocus
          />
          <Button size="sm" type="submit">
            {label("applyLink")}
          </Button>
          {state.link ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                editor.chain().focus().extendMarkRange("link").unsetLink().run();
                setLinking(false);
              }}
            >
              {label("removeLink")}
            </Button>
          ) : null}
        </form>
      ) : (
        <div className="ui-block-editor-toolbar-row">
          <ToggleGroup
            type="multiple"
            size="sm"
            aria-label={label("formatting")}
            value={state.marks}
            onValueChange={toggle}
          >
            <ToggleGroupItem value="bold" aria-label={label("bold")}>
              <Bold />
            </ToggleGroupItem>
            <ToggleGroupItem value="italic" aria-label={label("italic")}>
              <Italic />
            </ToggleGroupItem>
            <ToggleGroupItem value="strike" aria-label={label("strike")}>
              <Strikethrough />
            </ToggleGroupItem>
            <ToggleGroupItem value="code" aria-label={label("inlineCode")}>
              <Code />
            </ToggleGroupItem>
          </ToggleGroup>
          <Button
            size="icon-sm"
            variant={state.link ? "secondary" : "ghost"}
            aria-label={label("link")}
            aria-pressed={state.link != null}
            onClick={() => {
              setHref(state.link ?? "");
              setLinking(true);
            }}
          >
            <Link2 />
          </Button>
        </div>
      )}
    </BubbleMenu>
  );
}

export type { MarkName };
