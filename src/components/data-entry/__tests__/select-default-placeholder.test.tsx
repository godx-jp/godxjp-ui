import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AppProvider } from "../../../app/app-provider";
import { FormField } from "../form-field";
import { Select } from "../select";

/*
 * An unselected plain `<Select options>` showed an EMPTY trigger — only the chevron — while the
 * same field with `showSearch` showed 「選択…」, because only the search branch defaulted its
 * placeholder (gino-cloud VD-418: 実習実施者 / 技能実習生 320px triggers with no text on the
 * create form, 「選択…」 on the filter bar). Both branches now show the same catalogue string.
 *
 * The default is DISPLAY ONLY. The plain branch names an unlabelled trigger after its placeholder
 * (gh#643) because an author-written placeholder says what the field is for; 「選択…」 says
 * nothing, so it must never become the accessible name.
 */
const OPTIONS = [
  { value: "a", label: "株式会社A" },
  { value: "b", label: "株式会社B" },
];

function renderIn(locale: "ja" | "vi", ui: React.ReactElement) {
  return render(
    <AppProvider persist={false} defaultLocale={locale} fallbackLocale="en">
      {ui}
    </AppProvider>,
  );
}

const valueText = (container: HTMLElement) =>
  container.querySelector('[data-slot="select-value"]')?.textContent;

describe("Select — default placeholder (gino VD-418)", () => {
  it.each([
    ["ja", "選択…"],
    ["vi", "Chọn…"],
  ] as const)(
    "shows the %s catalogue placeholder on an unselected plain Select",
    (locale, text) => {
      const { container } = renderIn(
        locale,
        <FormField id="employer" label="実習実施者">
          <Select options={OPTIONS} />
        </FormField>,
      );
      expect(valueText(container)).toBe(text);
    },
  );

  it("matches the placeholder of the showSearch branch", () => {
    const plain = renderIn("ja", <Select aria-label="A" options={OPTIONS} />);
    const search = renderIn("ja", <Select aria-label="B" showSearch options={OPTIONS} />);
    expect(valueText(plain.container)).toBe("選択…");
    expect(search.container.textContent).toContain("選択…");
  });

  it("keeps a placeholder the caller gives", () => {
    const { container } = renderIn(
      "ja",
      <Select aria-label="区分" options={OPTIONS} placeholder="区分を選ぶ" />,
    );
    expect(valueText(container)).toBe("区分を選ぶ");
  });

  it("never turns the default into the accessible name", () => {
    const { getByRole } = renderIn("ja", <Select options={OPTIONS} />);
    const trigger = getByRole("combobox");
    expect(trigger.getAttribute("aria-label")).toBeNull();
  });

  it("still names an unlabelled trigger after a caller placeholder (gh#643)", () => {
    const { getByRole } = renderIn("ja", <Select options={OPTIONS} placeholder="部署" />);
    expect(getByRole("combobox").getAttribute("aria-label")).toBe("部署");
  });

  it("shows the selected option, not the placeholder, once a value is set", () => {
    const { container } = renderIn("ja", <Select aria-label="A" options={OPTIONS} value="b" />);
    expect(valueText(container)).toBe("株式会社B");
  });
});
