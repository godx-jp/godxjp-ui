import { describe, expect, it } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { TagInput } from "../tag-input";

/**
 * gh#840 — three defects the owner measured on /showcase/theme-customization, and the three
 * assertions that would have caught them.
 *
 * NOTHING below looks at a class name. The report was about what a person can find out from the
 * control — can I read the whole id, can I learn what `+1` stands for, does the caret arrive — so
 * every expectation is on rendered text, an accessible name, a tooltip or `document.activeElement`.
 * The chip's width is a consequence of the text it holds, so asserting the text asserts the width
 * without pinning the CSS.
 */

/** The reporter's exact string: 71 characters, no space, no hyphenation opportunity. */
const UNBREAKABLE = "THEME_SEED_LEDGER_0007_CONTRAST_VERIFIED_AGAINST_CANVAS_AND_LABEL_00042";
const CUT = 12;
const TRUNCATED = `${UNBREAKABLE.slice(0, CUT)}…`;

/** The `+N` node — a documented slot, not a style hook. */
const overflowNode = () => document.querySelector<HTMLElement>('[data-slot="tag-input-overflow"]');

describe("TagInput — maxTagTextLength cuts the TEXT, never the value (gh#840)", () => {
  it("draws at most maxTagTextLength characters plus an ellipsis", () => {
    renderWithUi(<TagInput value={[UNBREAKABLE]} maxTagTextLength={CUT} aria-label="ラベル" />);

    // The prop was declared on the public type and never destructured, so the chip painted all
    // 71 characters, set the row's width, and painted outside the control.
    expect(screen.getByText(TRUNCATED)).toBeInTheDocument();
    expect(screen.queryByText(UNBREAKABLE)).toBeNull();
  });

  it("keeps the WHOLE value reachable — in the tooltip and in the remover's accessible name", async () => {
    renderWithUi(
      <TagInput defaultValue={[UNBREAKABLE]} maxTagTextLength={CUT} aria-label="ラベル" />,
    );

    // A chip that silently hides half an identifier is its own defect — the issue says so in as
    // many words. Truncation is only allowed because BOTH of these still carry all 71 characters.
    expect(screen.getByText(TRUNCATED)).toHaveAttribute("title", UNBREAKABLE);

    const remover = screen.getByRole("button", { name: new RegExp(UNBREAKABLE) });
    expect(remover).toHaveAttribute("aria-label", expect.stringContaining(UNBREAKABLE));

    // …and it still removes the tag it names.
    await userEvent.setup().click(remover);
    expect(screen.queryByText(TRUNCATED)).toBeNull();
  });

  it("leaves a tag shorter than the ceiling alone — no ellipsis, no tooltip", () => {
    renderWithUi(<TagInput value={["本番"]} maxTagTextLength={CUT} aria-label="ラベル" />);
    expect(screen.getByText("本番")).not.toHaveAttribute("title");
  });

  it("without the prop the full value is drawn — the documented default, not the bug", () => {
    renderWithUi(<TagInput value={[UNBREAKABLE]} aria-label="ラベル" />);
    expect(screen.getByText(UNBREAKABLE)).toBeInTheDocument();
  });
});

describe("TagInput — `+N` names what it hides and can be reached (gh#840)", () => {
  it("carries the omitted value in its accessible name and its tooltip", () => {
    renderWithUi(
      <TagInput value={["本番", "ổn định", UNBREAKABLE]} maxTagCount={2} aria-label="ラベル" />,
    );

    const overflow = overflowNode();
    expect(overflow, "the +N node must exist").not.toBeNull();
    expect(overflow!.textContent).toContain("1");

    // Measured in Chromium on the live page BEFORE the fix: title null, tabindex null,
    // role listitem. Someone who saw `+1` had no way at all to learn which tag it stood for.
    expect(overflow).toHaveAttribute("title", UNBREAKABLE);
    expect(overflow).toHaveAttribute("aria-label", expect.stringContaining(UNBREAKABLE));
  });

  it("names EVERY omitted value, not just the first", () => {
    renderWithUi(<TagInput value={["a", "b", "c", "d"]} maxTagCount={1} aria-label="ラベル" />);
    const overflow = overflowNode()!;
    for (const hidden of ["b", "c", "d"]) {
      expect(overflow.getAttribute("aria-label")).toContain(hidden);
      expect(overflow.getAttribute("title")).toContain(hidden);
    }
  });

  it("is reachable by keyboard — Tab lands on it", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <TagInput value={["本番", "ổn định", UNBREAKABLE]} maxTagCount={2} aria-label="ラベル" />,
    );
    const overflow = overflowNode()!;

    // Walk the tab order from the top of the document. Before the fix the node carried no
    // tabindex, so no number of Tabs could ever put it in `document.activeElement`.
    let reached = false;
    for (let i = 0; i < 12 && !reached; i += 1) {
      await user.tab();
      if (document.activeElement === overflow) reached = true;
    }
    expect(reached, "`+N` must be in the tab order").toBe(true);
  });

  it("a custom maxTagPlaceholder still announces the hidden values", () => {
    renderWithUi(
      <TagInput
        value={["a", "b", "c"]}
        maxTagCount={1}
        maxTagPlaceholder={(omitted) => `ほか${omitted.length}件`}
        aria-label="ラベル"
      />,
    );
    const overflow = overflowNode()!;
    // The consumer's node replaces the TEXT; the accessible name still has to say which values
    // are behind it, or a custom placeholder silently re-opens the defect.
    expect(overflow.textContent).toBe("ほか2件");
    expect(overflow.getAttribute("aria-label")).toContain("b");
    expect(overflow.getAttribute("aria-label")).toContain("c");
  });
});

describe("TagInput — clicking the field focuses the input (gh#840)", () => {
  it("a press on the control's own box puts the caret in the draft field", async () => {
    const user = userEvent.setup();
    renderWithUi(<TagInput defaultValue={["本番"]} aria-label="ラベル" />);

    const box = document.querySelector<HTMLElement>('[data-slot="tag-input"]')!;
    const field = screen.getByRole("textbox");
    expect(document.activeElement).not.toBe(field);

    await user.click(box);

    // "A tag field is a text input wearing chips." Before the fix the caret never arrived unless
    // you happened to hit the field itself, and the control read as inert.
    expect(document.activeElement).toBe(field);
  });

  it("typing straight after that press commits a tag — the caret really is in the field", async () => {
    const user = userEvent.setup();
    renderWithUi(<TagInput defaultValue={["本番"]} aria-label="ラベル" />);

    await user.click(document.querySelector<HTMLElement>('[data-slot="tag-input"]')!);
    await user.keyboard("出張{Enter}");

    expect(screen.getByText("出張")).toBeInTheDocument();
  });

  it("a press on a chip's remover is still the remover's own press, not a focus grab", async () => {
    const user = userEvent.setup();
    renderWithUi(<TagInput defaultValue={["本番", "出張"]} aria-label="ラベル" />);

    await user.click(screen.getByRole("button", { name: /本番/ }));
    expect(screen.queryByText("本番")).toBeNull();
    expect(screen.getByText("出張")).toBeInTheDocument();
  });
});
