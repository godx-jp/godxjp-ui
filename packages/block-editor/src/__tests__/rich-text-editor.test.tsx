import * as React from "react";
import { renderToString } from "react-dom/server";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, userEvent, waitFor, within } from "@/test/render";

import { AppProvider } from "../../../../src/app/app-provider";
import { getRegisteredLocales } from "../../../../src/app/locales";
import { FormField } from "../../../../src/components/data-entry/form-field";
import type { TranslatableValue } from "../../../../src/components/data-entry/translatable-input";
import {
  RICH_TEXT_ALLOWED_TAGS,
  RichTextEditor,
  type RichTextEditorHandle,
  type RichTextEditorProps,
} from "../rich-text-editor";
import { TranslatableRichText, type TranslatableRichTextProps } from "../translatable-rich-text";

/**
 * gh#1365 — RichTextEditor (HTML in, schema HTML out) and TranslatableRichText (the kit's
 * TranslatableField engine around it). jsdom runs ProseMirror's model, commands, DOM rendering and
 * DOM parsing; it has no layout, no native text input into contenteditable and no real IME — so
 * edits here go through the editor's own commands and the toolbar, and composition is the
 * `compositionstart` event ProseMirror listens to. Real typing / IME commit is browser-only.
 */

// jsdom has no layout: a Range has no geometry, and ProseMirror scrolls the caret into view on focus.
beforeAll(() => {
  const empty = () => ({ x: 0, y: 0, top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 });
  Range.prototype.getClientRects ??= () => [] as unknown as DOMRectList;
  Range.prototype.getBoundingClientRect ??= () => empty() as DOMRect;
});

const renderIn = (ui: React.ReactElement, locale: "en" | "ja" | "vi" = "en", extra = {}) =>
  render(
    <AppProvider persist={false} defaultLocale={locale} fallbackLocale="ja" {...extra}>
      {ui}
    </AppProvider>,
  );

const editable = () => screen.getByRole("textbox");
/** Wait until useEditor's deferred first render mounted the ProseMirror view. */
const mounted = () => waitFor(() => expect(editable()).toHaveAttribute("contenteditable", "true"));

function Controlled({
  initial = "",
  onChange,
  handle,
  ...props
}: Partial<RichTextEditorProps> & {
  initial?: string;
  onChange?: (html: string) => void;
  handle?: React.Ref<RichTextEditorHandle>;
}) {
  const [value, setValue] = React.useState(initial);
  return (
    <>
      <RichTextEditor
        aria-label="Body"
        ref={handle}
        {...props}
        value={value}
        onValueChange={(next) => {
          setValue(next);
          onChange?.(next);
        }}
      />
      <button
        type="button"
        onClick={() => setValue('<p style="color:red">from the <b>server</b></p>')}
      >
        external
      </button>
      <output data-testid="mirror">{value}</output>
    </>
  );
}

const tagsOf = (html: string) => [...html.matchAll(/<\/?([a-z0-9]+)/gi)].map((m) => m[1]!);

describe("RichTextEditor — HTML value", () => {
  it("round-trips a controlled HTML body through the schema unchanged", async () => {
    const html =
      "<h2>Shoyu ramen</h2><p><strong>Rich</strong> broth, <em>thin</em> noodles, <s>MSG</s> <code>v2</code></p>" +
      "<ul><li><p>pork</p></li></ul><ol><li><p>boil</p></li></ol><blockquote><p>best in town</p></blockquote>" +
      "<h1>A</h1><h3>B</h3><p>line<br>break</p>";
    const handle = React.createRef<RichTextEditorHandle>();
    renderIn(<Controlled initial={html} handle={handle} />);
    await mounted();
    expect(handle.current!.editor!.getHTML()).toBe(html);
    expect(within(editable()).getByRole("heading", { level: 2 })).toHaveTextContent("Shoyu ramen");
  });

  it("an edit emits the schema's HTML, and the parent's echo of it is not re-applied", async () => {
    const onChange = vi.fn();
    const handle = React.createRef<RichTextEditorHandle>();
    renderIn(<Controlled initial="<p>a</p>" onChange={onChange} handle={handle} />);
    await mounted();
    const editor = handle.current!.editor!;
    act(() => {
      editor.commands.setTextSelection(2);
      editor.commands.insertContent("b");
    });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith("<p>ab</p>");
    expect(screen.getByTestId("mirror")).toHaveTextContent("<p>ab</p>");
    // The echo did not reset the document (the caret stayed after "b").
    expect(editor.state.selection.from).toBe(3);
  });

  it("sanitises on input AND output: only the allowed tags, no attributes, no script", async () => {
    const dirty =
      '<script>alert(1)</script><p onclick="alert(2)" style="color:red" class="x">a' +
      '<a href="javascript:alert(3)">link</a><img src="x" onerror="alert(4)"><u>under</u>' +
      '<span style="font-size:40px">span</span></p><h4>four</h4><table><tr><td>cell</td></tr></table>' +
      '<pre><code>block</code></pre><hr><iframe src="https://evil"></iframe><style>p{}</style>' +
      '<ol type="a" style="list-style-type:upper-roman" data-x="1"><li style="list-style-type:disc"><p>item</p></li></ol>' +
      '<ol start="x3"><li><p>bad start</p></li></ol>';
    const handle = React.createRef<RichTextEditorHandle>();
    renderIn(<Controlled initial={dirty} handle={handle} />);
    await mounted();
    const html = handle.current!.editor!.getHTML();
    for (const tag of tagsOf(html)) {
      expect(RICH_TEXT_ALLOWED_TAGS as readonly string[]).toContain(tag);
    }
    expect(html).not.toMatch(/<[a-z0-9]+\s/i); // no attribute on any element
    expect(html).not.toMatch(/alert|javascript|evil/);
    expect(html).toContain("<ol><li><p>item</p></li></ol><ol><li><p>bad start</p></li></ol>");
    for (const text of ["link", "under", "span", "four", "cell", "block"]) {
      expect(html).toContain(text); // the content survives as text
    }
    expect(document.querySelector("script, img, iframe, a, u, table")).toBeNull();
  });

  it("a numbered list keeps an integer start, its only attribute", async () => {
    const handle = React.createRef<RichTextEditorHandle>();
    renderIn(<Controlled initial={'<ol start="3"><li><p>third</p></li></ol>'} handle={handle} />);
    await mounted();
    expect(handle.current!.editor!.getHTML()).toBe('<ol start="3"><li><p>third</p></li></ol>');
  });

  it("an empty body is '' both ways, never <p></p>", async () => {
    const onChange = vi.fn();
    const handle = React.createRef<RichTextEditorHandle>();
    renderIn(<Controlled initial="<p>x</p>" onChange={onChange} handle={handle} />);
    await mounted();
    act(() => {
      handle.current!.editor!.commands.clearContent(true);
    });
    expect(onChange).toHaveBeenLastCalledWith("");
  });

  it("an external value change re-syncs the document WITHOUT calling onValueChange", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    renderIn(<Controlled initial="<p>local</p>" onChange={onChange} />);
    await mounted();
    await user.click(screen.getByRole("button", { name: "external" }));
    await waitFor(() => expect(editable()).toHaveTextContent("from the server"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("does not replace the document while an IME composition is open", async () => {
    const onChange = vi.fn();
    const handle = React.createRef<RichTextEditorHandle>();
    const { rerender } = renderIn(
      <RichTextEditor
        aria-label="Body"
        ref={handle}
        value="<p>にほ</p>"
        onValueChange={onChange}
      />,
    );
    await mounted();
    const editor = handle.current!.editor!;
    fireEvent.compositionStart(editor.view.dom);
    expect(editor.view.composing).toBe(true);
    rerender(
      <AppProvider persist={false} defaultLocale="en" fallbackLocale="ja">
        <RichTextEditor
          aria-label="Body"
          ref={handle}
          value="<p>reset</p>"
          onValueChange={onChange}
        />
      </AppProvider>,
    );
    expect(editable()).toHaveTextContent("にほ");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("the toolbar applies marks and block types, and undo / redo follow the history", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const handle = React.createRef<RichTextEditorHandle>();
    renderIn(<Controlled initial="<p>hello</p>" onChange={onChange} handle={handle} />);
    await mounted();
    const editor = handle.current!.editor!;
    expect(screen.getByRole("button", { name: "Undo" })).toBeDisabled();
    act(() => {
      editor.commands.setTextSelection({ from: 1, to: 6 });
    });
    await user.click(screen.getByRole("button", { name: "Bold" }));
    expect(onChange).toHaveBeenLastCalledWith("<p><strong>hello</strong></p>");
    expect(screen.getByRole("button", { name: "Bold" })).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(onChange).toHaveBeenLastCalledWith("<p>hello</p>");
    await user.click(screen.getByRole("button", { name: "Redo" }));
    expect(onChange).toHaveBeenLastCalledWith("<p><strong>hello</strong></p>");
    expect(screen.getByRole("button", { name: "Redo" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Heading 2" }));
    expect(onChange).toHaveBeenLastCalledWith("<h2><strong>hello</strong></h2>");
    await user.click(screen.getByRole("button", { name: "Bulleted list" }));
    expect(onChange).toHaveBeenLastCalledWith("<ul><li><p><strong>hello</strong></p></li></ul>");
    // Pressing the active block type again returns to a paragraph.
    await user.click(screen.getByRole("button", { name: "Bulleted list" }));
    expect(onChange).toHaveBeenLastCalledWith("<p><strong>hello</strong></p>");
    await user.click(screen.getByRole("button", { name: "Quote" }));
    expect(onChange).toHaveBeenLastCalledWith(
      "<blockquote><p><strong>hello</strong></p></blockquote>",
    );
  });

  it.each([
    ["ja", "太字", "見出し1", "元に戻す", "書式"],
    ["en", "Bold", "Heading 1", "Undo", "Formatting"],
    ["vi", "In đậm", "Tiêu đề 1", "Hoàn tác", "Định dạng"],
  ] as const)("names the toolbar in %s", async (locale, bold, h1, undo, formatting) => {
    renderIn(<RichTextEditor aria-label="Body" />, locale);
    await mounted();
    expect(screen.getByRole("button", { name: bold })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: h1 })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: undo })).toBeInTheDocument();
    expect(screen.getByLabelText(formatting)).toBeInTheDocument();
  });

  it("inside FormField: labelled, required, aria-invalid and the error wired by aria-errormessage", async () => {
    renderIn(
      <FormField label="Description" required error="Description is required">
        <RichTextEditor />
      </FormField>,
    );
    await mounted();
    const box = screen.getByRole("textbox", { name: "Description" });
    expect(box).toHaveAttribute("aria-invalid", "true");
    expect(box).toHaveAttribute("aria-required", "true");
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Description is required");
    expect(box.getAttribute("aria-errormessage")).toContain(alert.id);
    expect(box.closest(".ui-rich-text-editor")).toHaveAttribute("data-status", "error");
    // FormField's id lands on the editable, so its label points at a real focus target.
    expect(box.id).toBeTruthy();
  });

  it("readOnly drops the toolbar and the editable; disabled keeps a disabled toolbar", async () => {
    const { unmount } = renderIn(<RichTextEditor aria-label="Body" readOnly value="<p>x</p>" />);
    await waitFor(() => expect(editable()).toHaveAttribute("contenteditable", "false"));
    expect(screen.queryByRole("button", { name: "Bold" })).toBeNull();
    unmount();
    renderIn(<RichTextEditor aria-label="Body" disabled value="<p>x</p>" />);
    await waitFor(() => expect(editable()).toHaveAttribute("contenteditable", "false"));
    expect(screen.getByRole("button", { name: "Bold" })).toBeDisabled();
  });
});

const LOCALES = ["ja", "en", "vi"] as const;

function ControlledTranslatable({
  initial = {},
  onChange,
  ...props
}: Partial<TranslatableRichTextProps> & {
  initial?: TranslatableValue;
  onChange?: (value: TranslatableValue) => void;
}) {
  const [value, setValue] = React.useState<TranslatableValue>(initial);
  return (
    <TranslatableRichText
      aria-label="Description"
      {...props}
      value={value}
      onValueChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
    />
  );
}

const tabLocales = () => screen.getAllByRole("tab").map((tab) => tab.getAttribute("data-locale"));

describe("TranslatableRichText", () => {
  const initial = { ja: "<p>濃厚な<strong>醤油</strong>スープ</p>", en: "<p>Rich soy broth</p>" };

  it("switching the locale tab swaps the HTML and lang without echoing onValueChange", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    renderIn(
      <ControlledTranslatable locales={LOCALES} initial={initial} onChange={onChange} />,
      "en",
      {
        contentLocales: ["ja", "en", "vi"],
      },
    );
    await mounted();
    expect(editable()).toHaveTextContent("濃厚な醤油スープ");
    expect(editable()).toHaveAttribute("lang", "ja");

    await user.click(screen.getByRole("tab", { name: "English" }));
    await waitFor(() => expect(editable()).toHaveTextContent("Rich soy broth"));
    expect(editable()).toHaveAttribute("lang", "en");
    await user.click(screen.getByRole("tab", { name: "Japanese" }));
    await waitFor(() => expect(editable()).toHaveTextContent("濃厚な醤油スープ"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("an edit writes only the active locale's HTML into the whole map", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    renderIn(
      <ControlledTranslatable locales={LOCALES} initial={initial} onChange={onChange} />,
      "en",
      {
        contentLocales: ["ja", "en", "vi"],
      },
    );
    await mounted();
    await user.click(screen.getByRole("tab", { name: "English" }));
    await waitFor(() => expect(editable()).toHaveTextContent("Rich soy broth"));
    editable().focus();
    await user.click(screen.getByRole("button", { name: "Heading 1" }));
    expect(onChange).toHaveBeenLastCalledWith({ ...initial, en: "<h1>Rich soy broth</h1>" });
  });

  it("an empty locale shows the fallback locale's TEXT (not its HTML) as the placeholder", async () => {
    const user = userEvent.setup();
    renderIn(<ControlledTranslatable locales={LOCALES} initial={initial} fallbackLocale="ja" />);
    await mounted();
    await user.click(screen.getByRole("tab", { name: "Vietnamese" }));
    await waitFor(() => expect(editable()).toHaveAttribute("aria-placeholder", "濃厚な醤油スープ"));
    expect(editable().querySelector("[data-placeholder]")).toHaveAttribute(
      "data-placeholder",
      "濃厚な醤油スープ",
    );
  });

  it("server-renders an empty locale with a fallback without DOMParser (no crash)", () => {
    // A server has no DOMParser. The editor itself is not built there (`immediatelyRender: false`),
    // but the fallback placeholder is computed during render.
    vi.stubGlobal("DOMParser", undefined);
    try {
      const html = renderToString(
        <AppProvider persist={false} defaultLocale="en" fallbackLocale="ja">
          <TranslatableRichText
            aria-label="Description"
            locales={LOCALES}
            value={initial}
            fallbackLocale="ja"
            defaultLocale="vi"
          />
        </AppProvider>,
      );
      expect(html).toContain('data-locale="vi"');
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("marks a locale with an error on its tab; the active one's error reaches FormField", async () => {
    const user = userEvent.setup();
    renderIn(
      <FormField label="Description">
        <ControlledTranslatable locales={LOCALES} initial={initial} errors={{ vi: "Bắt buộc" }} />
      </FormField>,
    );
    await mounted();
    const vi_ = screen.getByRole("tab", { name: /Vietnamese/ });
    expect(vi_).toHaveAttribute("data-invalid", "true");
    expect(vi_).toHaveTextContent("has an error");
    expect(editable()).not.toHaveAttribute("aria-invalid");

    await user.click(vi_);
    await waitFor(() => expect(editable()).toHaveAttribute("aria-invalid", "true"));
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Bắt buộc");
    expect(editable().getAttribute("aria-errormessage")).toContain(alert.id);
    expect(editable().closest(".ui-rich-text-editor")).toHaveAttribute("data-status", "error");
  });

  it("defaults: AppProvider contentLocales order the tabs and pick the first; unset → registered locales", async () => {
    const first = renderIn(<ControlledTranslatable />, "en", { contentLocales: ["ja", "vi"] });
    await mounted();
    expect(tabLocales()).toEqual(["ja", "vi"]);
    expect(screen.getByRole("tab", { selected: true })).toHaveAttribute("data-locale", "ja");
    first.unmount();

    renderIn(<ControlledTranslatable />, "en");
    await mounted();
    expect(tabLocales()).toEqual([...getRegisteredLocales()]);
    expect(screen.getByRole("tab", { selected: true })).toHaveAttribute("data-locale", "en");
  });
});
