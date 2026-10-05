import * as React from "react";
import type { Editor } from "@tiptap/core";
import { ExternalLink, ImageUp, Trash2 } from "lucide-react";
import { Image } from "@godxjp/ui/data-display";
import { FormField, Input } from "@godxjp/ui/data-entry";
import { Sheet, SheetBody, SheetContent, SheetFooter, SheetHeader } from "@godxjp/ui/feedback";
import { Button } from "@godxjp/ui/general";
import { Flex } from "@godxjp/ui/layout";

import { useLabel } from "./labels";

/** What a click on a link or an image opens: its Markdown-storable settings, in a drawer. */
export type EditTarget =
  | { kind: "link"; from: number; to: number; text: string; href: string; title: string }
  | { kind: "image"; pos: number; src: string; alt: string; title: string };

/**
 * The link / image drawer (the owner's request): a click on a link or an image in the editor
 * opens the kit Sheet with what Markdown can store for it — a link's text, URL and title
 * (`[text](url "title")`), an image's source, alt text and title (`![alt](src "title")`) — plus
 * the actions that belong there: open / remove a link, replace / remove an image.
 */
export function EditDrawer({
  editor,
  target,
  onClose,
  resolveUrl,
  replaceImage,
}: {
  editor: Editor;
  target: EditTarget | null;
  onClose: () => void;
  resolveUrl?: (url: string) => string | undefined;
  /** The host's media path (pickMedia, else a file through upload), or null when neither is set. */
  replaceImage: ((pos: number) => void) | null;
}) {
  const label = useLabel();
  const [draft, setDraft] = React.useState<EditTarget | null>(target);
  React.useEffect(() => setDraft(target), [target]);
  if (!draft) return <Sheet open={false} onOpenChange={() => undefined} />;

  const set = (patch: Partial<Record<"text" | "href" | "title" | "src" | "alt", string>>) =>
    setDraft((d) => (d ? ({ ...d, ...patch } as EditTarget) : d));

  const save = () => {
    if (draft.kind === "link") {
      const href = draft.href.trim();
      const text = draft.text === "" ? href : draft.text;
      const chain = editor.chain().focus();
      if (!href) chain.setTextSelection({ from: draft.from, to: draft.to }).unsetLink();
      else
        chain.insertContentAt(
          { from: draft.from, to: draft.to },
          {
            type: "text",
            text,
            marks: [{ type: "link", attrs: { href, title: draft.title.trim() || null } }],
          },
        );
      chain.run();
    } else {
      const { tr } = editor.state;
      tr.setNodeMarkup(draft.pos, undefined, {
        ...editor.state.doc.nodeAt(draft.pos)?.attrs,
        src: draft.src.trim(),
        alt: draft.alt,
        title: draft.title.trim() || null,
      });
      editor.view.dispatch(tr);
    }
    onClose();
  };

  const remove = () => {
    if (draft.kind === "link") {
      editor.chain().focus().setTextSelection({ from: draft.from, to: draft.to }).unsetLink().run();
    } else {
      const node = editor.state.doc.nodeAt(draft.pos);
      if (node)
        editor
          .chain()
          .focus()
          .deleteRange({ from: draft.pos, to: draft.pos + node.nodeSize })
          .run();
    }
    onClose();
  };

  const preview = draft.kind === "image" ? (resolveUrl?.(draft.src) ?? draft.src) : "";
  return (
    <Sheet open onOpenChange={(open) => (open ? undefined : onClose())}>
      <SheetContent side="right" responsive="auto" className="ui-block-editor-drawer">
        <SheetHeader title={label(draft.kind === "link" ? "editLink" : "editImage")} />
        <SheetBody>
          <form
            id="block-editor-edit"
            onSubmit={(event) => {
              event.preventDefault();
              save();
            }}
          >
            <Flex direction="col" gap="md">
              {draft.kind === "link" ? (
                <>
                  <FormField id="block-editor-link-text" label={label("linkText")}>
                    <Input value={draft.text} onValueChange={(text) => set({ text })} />
                  </FormField>
                  <FormField id="block-editor-link-href" label={label("linkUrl")} required>
                    <Input
                      type="url"
                      inputMode="url"
                      value={draft.href}
                      onValueChange={(href) => set({ href })}
                      autoFocus
                    />
                  </FormField>
                  <FormField id="block-editor-link-title" label={label("linkTitle")}>
                    <Input value={draft.title} onValueChange={(title) => set({ title })} />
                  </FormField>
                </>
              ) : (
                <>
                  {preview ? (
                    <Image
                      src={preview}
                      alt={draft.alt}
                      className="ui-block-editor-drawer-preview"
                    />
                  ) : null}
                  <FormField id="block-editor-image-src" label={label("imageSrc")} required>
                    <Input value={draft.src} onValueChange={(src) => set({ src })} />
                  </FormField>
                  <FormField
                    id="block-editor-image-alt"
                    label={label("imageAlt")}
                    helper={label("imageAltHint")}
                  >
                    <Input value={draft.alt} onValueChange={(alt) => set({ alt })} autoFocus />
                  </FormField>
                  <FormField id="block-editor-image-title" label={label("imageTitle")}>
                    <Input value={draft.title} onValueChange={(title) => set({ title })} />
                  </FormField>
                </>
              )}
            </Flex>
          </form>
        </SheetBody>
        <SheetFooter>
          <Flex gap="sm" wrap justify="between" className="ui-block-editor-drawer-actions">
            <Flex gap="sm" wrap>
              {draft.kind === "link" && draft.href.trim() ? (
                <Button variant="ghost" size="sm" asChild>
                  <a href={draft.href.trim()} target="_blank" rel="noopener noreferrer">
                    <ExternalLink aria-hidden="true" />
                    {label("openLink")}
                  </a>
                </Button>
              ) : null}
              {draft.kind === "image" && replaceImage ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    replaceImage(draft.pos);
                    onClose();
                  }}
                >
                  <ImageUp aria-hidden="true" />
                  {label("replaceImage")}
                </Button>
              ) : null}
              <Button variant="ghost" size="sm" onClick={remove}>
                <Trash2 aria-hidden="true" />
                {label(draft.kind === "link" ? "removeLink" : "removeImage")}
              </Button>
            </Flex>
            <Button type="submit" form="block-editor-edit" size="sm">
              {label("save")}
            </Button>
          </Flex>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
