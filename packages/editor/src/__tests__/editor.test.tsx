import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { AppProvider } from "../../../../src/app/app-provider";
import { FormField } from "../../../../src/components/data-entry/form-field";
import { MarkdownEditor, type MarkdownEditorProps } from "../editor";

const renderEditor = (
  props: Partial<MarkdownEditorProps> = {},
  locale: "en" | "ja" | "vi" = "en",
) =>
  render(
    <AppProvider defaultLocale={locale} persist={false}>
      <MarkdownEditor aria-label="Body" {...props} />
    </AppProvider>,
  );
const box = () => screen.getByRole("textbox", { name: "Body" }) as HTMLTextAreaElement;
const toolbar = () => screen.getByRole("toolbar", { name: "Formatting" });
const button = (name: string) => within(toolbar()).getByRole("button", { name });
const select = (start: number, end: number) => {
  box().focus();
  box().setSelectionRange(start, end);
};

function Controlled({ onChange }: { onChange?: (v: string) => void }) {
  const [value, setValue] = React.useState("");
  return (
    <AppProvider defaultLocale="en" persist={false}>
      <MarkdownEditor
        aria-label="Body"
        value={value}
        onValueChange={(next) => {
          setValue(next);
          onChange?.(next);
        }}
      />
      <output data-testid="mirror">{value}</output>
    </AppProvider>
  );
}

describe("MarkdownEditor (gh#1109)", () => {
  it("is a textbox with a named WAI-ARIA toolbar and a view switch", () => {
    renderEditor();
    expect(box()).toBeInTheDocument();
    expect(toolbar()).toHaveAttribute("aria-orientation", "horizontal");
    expect(screen.getByRole("radiogroup", { name: "View" })).toBeInTheDocument();
  });

  it("speaks the active locale (ja)", () => {
    renderEditor({}, "ja");
    expect(screen.getByRole("toolbar", { name: "書式" })).toBeInTheDocument();
    expect(
      within(screen.getByRole("toolbar")).getByRole("button", { name: "太字" }),
    ).toBeInTheDocument();
  });

  it("a controlled editor never freezes: typing reaches the host and back", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);
    await user.type(box(), "hello");
    expect(box()).toHaveValue("hello");
    expect(screen.getByTestId("mirror")).toHaveTextContent("hello");
    expect(onChange).toHaveBeenLastCalledWith("hello");
  });

  it("the Bold button wraps the selection and keeps it selected", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderEditor({ defaultValue: "say hi", onValueChange });
    select(4, 6);
    await user.click(button("Bold"));
    expect(box()).toHaveValue("say **hi**");
    expect(onValueChange).toHaveBeenLastCalledWith("say **hi**");
    expect([box().selectionStart, box().selectionEnd]).toEqual([6, 8]);
  });

  it("Ctrl+B / ⌘+B toggle bold from the keyboard", async () => {
    const user = userEvent.setup();
    renderEditor({ defaultValue: "say hi" });
    select(4, 6);
    await user.keyboard("{Control>}b{/Control}");
    expect(box()).toHaveValue("say **hi**");
    await user.keyboard("{Meta>}b{/Meta}");
    expect(box()).toHaveValue("say hi");
  });

  it("a shortcut never fires during IME composition", () => {
    renderEditor({ defaultValue: "かんじ" });
    select(0, 3);
    fireEvent.keyDown(box(), { key: "b", ctrlKey: true, isComposing: true });
    fireEvent.keyDown(box(), { key: "b", ctrlKey: true, keyCode: 229 });
    expect(box()).toHaveValue("かんじ");
  });

  it("a host onKeyDown that prevents default wins over the shortcut", () => {
    renderEditor({ defaultValue: "hi", onKeyDown: (event) => event.preventDefault() });
    select(0, 2);
    fireEvent.keyDown(box(), { key: "b", ctrlKey: true });
    expect(box()).toHaveValue("hi");
  });

  it("list and heading buttons prefix the touched lines", async () => {
    const user = userEvent.setup();
    renderEditor({ defaultValue: "a\nb" });
    select(0, 3);
    await user.click(button("Bulleted list"));
    expect(box()).toHaveValue("- a\n- b");
    select(0, 0);
    await user.click(button("Heading"));
    expect(box()).toHaveValue("## - a\n- b");
  });

  it("the toolbar is one tab stop with arrow-key movement", async () => {
    const user = userEvent.setup();
    renderEditor();
    const bold = button("Bold");
    bold.focus();
    await user.keyboard("{ArrowRight}");
    expect(button("Italic")).toHaveFocus();
    expect(
      within(toolbar())
        .getAllByRole("button")
        .filter((b) => b.tabIndex === 0),
    ).toHaveLength(1);
  });

  it("preview renders through @godxjp/markdown and keeps the textarea mounted", async () => {
    const user = userEvent.setup();
    renderEditor({ defaultValue: "# Title\n\n[x](javascript:alert(1))" });
    await user.click(screen.getByRole("radio", { name: "Preview" }));
    const region = screen.getByRole("region", { name: "Preview" });
    expect(within(region).getByRole("heading", { name: "Title" })).toHaveAttribute("id", "title");
    // The same sanitiser as the published page: the javascript: link has no href.
    expect(within(region).getByText("x")).not.toHaveAttribute("href");
    expect(document.querySelector("textarea")).not.toBeNull();
    expect(
      within(toolbar())
        .getAllByRole("button")
        .every((b) => b.hasAttribute("disabled") || b.getAttribute("aria-disabled") === "true"),
    ).toBe(true);
  });

  it("an empty preview says so; a host preview replaces the default", async () => {
    const user = userEvent.setup();
    const { unmount } = renderEditor();
    await user.click(screen.getByRole("radio", { name: "Preview" }));
    expect(screen.getByText("Nothing to preview yet.")).toBeInTheDocument();
    unmount();
    renderEditor({
      defaultValue: "x",
      defaultMode: "preview",
      renderPreview: (v) => <p data-host="">{v}!</p>,
    });
    expect(screen.getByText("x!")).toHaveAttribute("data-host", "");
  });

  it("side by side shows the textarea and the preview together", () => {
    renderEditor({ defaultValue: "**b**", defaultMode: "split" });
    expect(box()).toBeVisible();
    expect(within(screen.getByRole("region", { name: "Preview" })).getByText("b").tagName).toBe(
      "STRONG",
    );
  });

  it("a pasted image uploads through the host and replaces its placeholder", async () => {
    let finish!: (r: { url: string }) => void;
    const upload = vi.fn(() => new Promise<{ url: string }>((resolve) => (finish = resolve)));
    renderEditor({ defaultValue: "see ", upload });
    select(4, 4);
    const file = new File(["x"], "shot.png", { type: "image/png" });
    fireEvent.paste(box(), { clipboardData: { files: [file] } });
    await waitFor(() => expect(upload).toHaveBeenCalledWith(file));
    expect(box().value).toMatch(/^see !\[Uploading shot\.png #\d+\]\(\)$/);
    expect(screen.getByRole("status")).toHaveTextContent("Uploading…");
    await act(async () => finish({ url: "https://files.example/shot.png" }));
    expect(box()).toHaveValue("see ![shot.png](https://files.example/shot.png)");
    expect(screen.getByRole("status")).toHaveTextContent("");
  });

  it("a failed upload removes its placeholder and says which file failed", async () => {
    const upload = vi.fn(() => Promise.reject(new Error("413")));
    renderEditor({ defaultValue: "", upload });
    fireEvent.drop(box(), {
      dataTransfer: { files: [new File(["x"], "big.pdf", { type: "application/pdf" })] },
    });
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Could not upload big.pdf."),
    );
    expect(box()).toHaveValue("");
  });

  it("a blocked upload is refused with the host's reason and never calls upload", async () => {
    const upload = vi.fn();
    renderEditor({ upload, uploadBlockedReason: "Storage is full." });
    fireEvent.paste(box(), {
      clipboardData: { files: [new File(["x"], "a.png", { type: "image/png" })] },
    });
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Storage is full."));
    expect(upload).not.toHaveBeenCalled();
  });

  it("a blocked editor says why even when the host passes no `upload` (godx-content 31.18.0)", async () => {
    renderEditor({ uploadBlockedReason: "Uploads are off in this space." });
    fireEvent.paste(box(), {
      clipboardData: { files: [new File(["x"], "a.png", { type: "image/png" })] },
    });
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Uploads are off in this space."),
    );
  });

  it("a blocked attach button names the reason up front and never opens the picker", async () => {
    const user = userEvent.setup();
    const upload = vi.fn();
    const { container } = renderEditor({ upload, uploadBlockedReason: "Storage is full." });
    const attach = button("Attach a file — Storage is full.");
    expect(container.querySelector('input[type="file"]')).toBeNull();
    await user.click(attach);
    expect(screen.getByRole("alert")).toHaveTextContent("Storage is full.");
    expect(upload).not.toHaveBeenCalled();
  });

  it("without `upload`, pasted files are left to the browser and there is no attach button", () => {
    renderEditor();
    expect(within(toolbar()).queryByRole("button", { name: "Attach a file" })).toBeNull();
  });

  it("a host action (a later block type) gets the editor API", async () => {
    const user = userEvent.setup();
    renderEditor({
      defaultValue: "ab",
      actions: [
        {
          key: "board",
          label: "Insert board",
          icon: <span />,
          run: (api) => api.insert("[board]"),
        },
      ],
    });
    select(1, 1);
    await user.click(button("Insert board"));
    expect(box()).toHaveValue("a[board]b");
  });

  it("inside a FormField the label names the textarea (the id reaches it)", () => {
    render(
      <AppProvider defaultLocale="en" persist={false}>
        <FormField id="page-body" label="Page body" helper="Markdown">
          <MarkdownEditor />
        </FormField>
      </AppProvider>,
    );
    const textarea = screen.getByRole("textbox", { name: "Page body" });
    expect(textarea.tagName).toBe("TEXTAREA");
    expect(textarea).toHaveAccessibleDescription("Markdown");
  });

  it("labels override any string", () => {
    renderEditor({ labels: { bold: "Strong" } });
    expect(button("Strong")).toBeInTheDocument();
  });

  it("disabled: the toolbar is inert and the textarea is disabled", () => {
    renderEditor({ disabled: true, defaultValue: "x" });
    expect(box()).toBeDisabled();
    const bold = button("Bold");
    expect(bold.hasAttribute("disabled") || bold.getAttribute("aria-disabled") === "true").toBe(
      true,
    );
  });
});
