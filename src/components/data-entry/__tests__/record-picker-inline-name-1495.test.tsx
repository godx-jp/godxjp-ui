import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";

import { Form } from "../form";
import { FormField } from "../form-field";
import { RecordPicker } from "../record-picker";

/**
 * gh#1495 — the inline RecordPicker's search box had no accessible name outside a FormField
 * (WCAG 4.1.2), and gh#1494 — inside one it dropped FormField's `aria-required` / `aria-invalid`:
 * the inline branch forwarded only `aria-describedby` to its <input>.
 */
const OPTIONS = [
  { value: "E001", label: "山田 太郎", sublabel: "E001" },
  { value: "E002", label: "佐藤 花子", sublabel: "E002" },
];

const searchBox = () => screen.getByRole("searchbox");

describe("RecordPicker inline search box: name and field state (gh#1495, gh#1494)", () => {
  it("outside a FormField it is named by the caller's placeholder", () => {
    renderWithUi(<RecordPicker shape="inline" options={OPTIONS} placeholder="従業員を検索" />);
    expect(searchBox()).toHaveAccessibleName("従業員を検索");
  });

  it("outside a FormField with no placeholder it still has a localized name", () => {
    renderWithUi(<RecordPicker shape="inline" options={OPTIONS} />);
    expect(searchBox()).toHaveAccessibleName(/\S/);
  });

  it("a caller's aria-label wins over the fallback", () => {
    renderWithUi(
      <RecordPicker shape="inline" options={OPTIONS} placeholder="検索" aria-label="承認者" />,
    );
    expect(searchBox()).toHaveAccessibleName("承認者");
  });

  it("a native <label for> keeps naming it — the fallback never overrides it (negative case)", () => {
    renderWithUi(
      <>
        <label htmlFor="approver">承認者</label>
        <RecordPicker id="approver" shape="inline" options={OPTIONS} placeholder="検索" />
      </>,
    );
    expect(searchBox()).toHaveAccessibleName("承認者");
    expect(searchBox()).not.toHaveAttribute("aria-label");
  });

  it("inside a required, invalid FormField it is named by the label and carries the state", () => {
    renderWithUi(
      <Form>
        <FormField id="approver" label="承認者" required error="必須です">
          <RecordPicker shape="inline" options={OPTIONS} />
        </FormField>
      </Form>,
    );
    const box = searchBox();
    expect(box).toHaveAccessibleName("承認者");
    expect(box).toHaveAttribute("aria-required", "true");
    expect(box).toHaveAttribute("aria-invalid", "true");
  });
});
