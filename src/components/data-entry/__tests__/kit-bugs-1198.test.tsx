import { mkdtempSync, symlinkSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderWithUi } from "@/test/render";
// @ts-expect-error — plain ESM script without a declaration file
import { isMainModule } from "../../../../scripts/visual-audit.mjs";
import { FormField } from "../form-field";
import { RecordPicker } from "../record-picker";
import { Segmented } from "../segmented";

/** gh#1198 — four kit problems godx-task hit while building the schedules UI on 31.31.0. */
const nameOf = (el: HTMLElement) =>
  (el.getAttribute("aria-labelledby") ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .map((id) =>
      id === el.id
        ? (el.getAttribute("aria-label") ?? "")
        : document.getElementById(id)?.textContent,
    )
    .join(" ");

describe("Segmented inside a FormField has ONE name (gh#1198)", () => {
  it("takes the visible label once, not the label plus a copy as aria-label", () => {
    renderWithUi(
      <FormField id="kind" label="区分">
        <Segmented
          options={[
            { value: "a", label: "A" },
            { value: "b", label: "B" },
          ]}
          defaultValue="a"
        />
      </FormField>,
    );
    const group = screen.getByRole("radiogroup");
    expect(group).not.toHaveAttribute("aria-label");
    expect(nameOf(group)).toBe("区分");
  });

  it("keeps an aria-label when there is no visible label", () => {
    renderWithUi(
      <Segmented aria-label="表示" options={[{ value: "a", label: "A" }]} defaultValue="a" />,
    );
    expect(screen.getByRole("radiogroup", { name: "表示" })).toBeInTheDocument();
  });
});

describe("RecordPicker inline: Enter never submits the outer form (gh#1198)", () => {
  const load = () => vi.fn(async () => ({ options: [{ value: "PKG-1", label: "PKG-1" }] }));

  it("searches inside the picker instead of submitting", async () => {
    const user = userEvent.setup();
    const submit = vi.fn((event: React.FormEvent) => event.preventDefault());
    render(
      <form onSubmit={submit}>
        <RecordPicker shape="inline" count={500} loadOptions={load()} placeholder="課題" />
      </form>,
    );
    await user.type(screen.getByPlaceholderText("課題"), "PKG{Enter}");
    expect(submit).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
  });

  it("leaves an IME commit (Enter while composing) alone", () => {
    const submit = vi.fn((event: React.FormEvent) => event.preventDefault());
    render(
      <form onSubmit={submit}>
        <RecordPicker shape="inline" count={500} loadOptions={load()} placeholder="課題" />
      </form>,
    );
    const input = screen.getByPlaceholderText("課題");
    const notPrevented = fireEvent.keyDown(input, {
      key: "Enter",
      isComposing: true,
      keyCode: 229,
    });
    expect(notPrevented).toBe(true);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

describe("visual-audit runs through a symlinked node_modules (gh#1198)", () => {
  it("treats a symlinked path to the script as the main module", () => {
    const root = mkdtempSync(join(tmpdir(), "va-"));
    mkdirSync(join(root, "real"));
    const target = join(root, "real", "visual-audit.mjs");
    writeFileSync(target, "");
    symlinkSync(join(root, "real"), join(root, "link"));
    const viaLink = join(root, "link", "visual-audit.mjs");
    expect(isMainModule(viaLink, pathToFileURL(target).href)).toBe(true);
    expect(isMainModule(join(root, "real", "other.mjs"), pathToFileURL(target).href)).toBe(false);
  });
});
