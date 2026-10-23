import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AppProvider } from "@/app/app-provider";

import { FormField } from "../form-field";
import { Upload } from "../upload";

/**
 * gh#1412 — WCAG 2.2 SC 2.5.3 Label in Name. The drop area was named 「ファイルをアップロード」 by an
 * `aria-label` that appears nowhere on screen; what it SHOWS is the hint. A speech-input user says
 * what they see, so the visible hint is the name now — after a FormField label (gh#1288), and
 * never over a caller's own `aria-label`.
 */
const HINT_JA = "ここにドラッグ＆ドロップ、またはクリックして選択";

const inJa = (ui: React.ReactElement) =>
  render(
    <AppProvider defaultLocale="ja" persist={false}>
      {ui}
    </AppProvider>,
  );

describe("Upload dropzone is named by its visible text (gh#1412)", () => {
  it("a bare dropzone's name is its visible hint", () => {
    inJa(<Upload variant="dropzone" />);
    const zone = screen.getByRole("button", { name: HINT_JA });
    expect(zone).toHaveClass("ui-upload-dropzone");
    expect(zone).not.toHaveAttribute("aria-label");
    expect(screen.queryByRole("button", { name: "ファイルをアップロード" })).toBeNull();
  });

  it("follows the app locale", () => {
    render(
      <AppProvider defaultLocale="vi" persist={false}>
        <Upload variant="dropzone" />
      </AppProvider>,
    );
    expect(
      screen.getByRole("button", { name: "Kéo thả file vào đây, hoặc bấm để chọn" }),
    ).toBeInTheDocument();
  });

  it("inside a FormField the field label leads, then the visible hint", () => {
    inJa(
      <FormField id="doc" label="在留カード">
        <Upload id="doc" variant="dropzone" />
      </FormField>,
    );
    expect(screen.getByRole("button", { name: `在留カード ${HINT_JA}` })).toHaveClass(
      "ui-upload-dropzone",
    );
  });

  it("a caller's own aria-label still names it", () => {
    inJa(<Upload variant="dropzone" aria-label="在留カードの写しを選択" />);
    expect(screen.getByRole("button", { name: "在留カードの写しを選択" })).toHaveClass(
      "ui-upload-dropzone",
    );
  });
});
