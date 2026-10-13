import { describe, expect, it } from "vitest";

import { FormField } from "../form-field";
import { Upload } from "../upload";
import { renderWithUi } from "@/test/render";

/**
 * gh#1280 — the FormField contract lands on Upload's visible trigger. A dropzone that does not open
 * the picker is `role="group"`, where aria-invalid / aria-errormessage are not allowed (ARIA 1.2):
 * the error is folded into the description instead.
 */
describe("Upload field contract on the trigger (gh#1280)", () => {
  it("a button-role dropzone carries aria-invalid + aria-errormessage", () => {
    const { container, getByText } = renderWithUi(
      <FormField id="f" label="書類" error="必須項目です">
        <Upload id="f" variant="dropzone" />
      </FormField>,
    );
    const trigger = container.querySelector<HTMLElement>(".ui-upload-dropzone")!;
    expect(trigger).toHaveAttribute("role", "button");
    expect(trigger).toHaveAttribute("aria-invalid", "true");
    expect(trigger.getAttribute("aria-errormessage")).toBe(getByText("必須項目です").id);
  });

  it("a group-role dropzone gets no aria-invalid; the error is in its description", () => {
    const { container, getByText } = renderWithUi(
      <FormField id="f" label="書類" error="必須項目です">
        <Upload id="f" variant="dropzone" openFileDialogOnClick={false} />
      </FormField>,
    );
    const trigger = container.querySelector<HTMLElement>(".ui-upload-dropzone")!;
    expect(trigger).toHaveAttribute("role", "group");
    expect(trigger).not.toHaveAttribute("aria-invalid");
    expect(trigger).not.toHaveAttribute("aria-errormessage");
    expect(trigger.getAttribute("aria-describedby")?.split(" ")).toContain(
      getByText("必須項目です").id,
    );
  });

  it("the empty state is described in the app locale, not by the browser", () => {
    const { container } = renderWithUi(
      <FormField id="f" label="書類">
        <Upload id="f" variant="button" />
      </FormField>,
    );
    const trigger = container.querySelector<HTMLElement>(".ui-upload-trigger")!;
    const description = (trigger.getAttribute("aria-describedby") ?? "")
      .split(" ")
      .map((id) => document.getElementById(id)?.textContent)
      .join(" ");
    expect(description).toMatch(/Chưa chọn tệp|未選択|No file selected/);
  });
});
