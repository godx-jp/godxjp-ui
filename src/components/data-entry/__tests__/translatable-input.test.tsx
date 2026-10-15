import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, userEvent, within } from "@/test/render";
import { AppProvider } from "../../../app/app-provider";
import { FormField } from "../form-field";
import {
  TranslatableInput,
  TranslatableTextarea,
  type TranslatableValue,
} from "../translatable-input";

const LOCALES = ["ja", "en", "vi"] as const;

/** An English UI, so the tab names read "Japanese / English / Vietnamese". */
function renderEn(
  ui: React.ReactElement,
  provider: { fallbackLocale?: string; defaultLocale?: string } = {},
) {
  return render(
    <AppProvider
      persist={false}
      defaultLocale={provider.defaultLocale ?? "en"}
      fallbackLocale={provider.fallbackLocale ?? "ja"}
    >
      {ui}
    </AppProvider>,
  );
}

function Controlled({
  initial = {},
  onChange,
  Component = TranslatableInput,
  ...props
}: {
  initial?: TranslatableValue;
  onChange?: (value: TranslatableValue) => void;
  Component?: typeof TranslatableInput | typeof TranslatableTextarea;
} & Record<string, unknown>) {
  const [value, setValue] = React.useState<TranslatableValue>(initial);
  return (
    <Component
      aria-label="Name"
      locales={LOCALES}
      {...props}
      value={value}
      onValueChange={(next: TranslatableValue) => {
        setValue(next);
        onChange?.(next);
      }}
    />
  );
}

describe("TranslatableInput", () => {
  it("renders one tab per locale, named by Intl.DisplayNames in the UI language, and one textbox", () => {
    renderEn(<Controlled />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs.map((tab) => tab.textContent)).toEqual(["Japanese", "English", "Vietnamese"]);
    // the BCP-47 codes stay codes: they are the keys, not the labels
    expect(tabs.map((tab) => tab.getAttribute("data-locale"))).toEqual(["ja", "en", "vi"]);
    expect(screen.getAllByRole("textbox")).toHaveLength(1);
  });

  it("updates only the active locale's key in the value map", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderEn(<Controlled initial={{ ja: "ラーメン" }} onChange={onChange} />);
    // English UI → English tab first
    expect(screen.getByRole("tab", { name: "English" })).toHaveAttribute("aria-selected", "true");
    await user.type(screen.getByRole("textbox"), "Ramen");
    expect(onChange).toHaveBeenLastCalledWith({ ja: "ラーメン", en: "Ramen" });
  });

  it("keeps the other locales' values when switching locale", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderEn(<Controlled onChange={onChange} />);
    const box = screen.getByRole("textbox");
    await user.type(box, "Ramen");
    await user.click(screen.getByRole("tab", { name: "Japanese" }));
    expect(screen.getByRole("textbox")).toHaveValue("");
    await user.type(screen.getByRole("textbox"), "拉麺");
    await user.click(screen.getByRole("tab", { name: "Vietnamese" }));
    await user.type(screen.getByRole("textbox"), "Mì");
    expect(onChange).toHaveBeenLastCalledWith({ en: "Ramen", ja: "拉麺", vi: "Mì" });
    await user.click(screen.getByRole("tab", { name: "English" }));
    expect(screen.getByRole("textbox")).toHaveValue("Ramen");
  });

  it("works uncontrolled from defaultValue", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderEn(
      <TranslatableInput
        aria-label="Name"
        locales={LOCALES}
        defaultValue={{ en: "A" }}
        onValueChange={onValueChange}
      />,
    );
    await user.type(screen.getByRole("textbox"), "B");
    expect(screen.getByRole("textbox")).toHaveValue("AB");
    expect(onValueChange).toHaveBeenLastCalledWith({ en: "AB" });
  });

  it("the clear ✕ empties the active locale only", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderEn(<Controlled initial={{ ja: "拉麺", en: "Ramen" }} onChange={onChange} allowClear />);
    await user.click(screen.getByRole("button", { name: /clear/i }));
    expect(onChange).toHaveBeenLastCalledWith({ ja: "拉麺", en: "" });
  });

  it("shows the fallback locale's text as the placeholder of an empty locale", async () => {
    const user = userEvent.setup();
    renderEn(<Controlled initial={{ ja: "醤油ラーメン" }} placeholder="Product name" />);
    // English is empty → Japanese (the AppProvider fallbackLocale here) shows through
    expect(screen.getByRole("textbox")).toHaveAttribute("placeholder", "醤油ラーメン");
    // the fallback locale itself shows the plain placeholder
    await user.click(screen.getByRole("tab", { name: "Japanese" }));
    await user.clear(screen.getByRole("textbox"));
    expect(screen.getByRole("textbox")).toHaveAttribute("placeholder", "Product name");
  });

  it("a filled locale shows its own text and no fallback placeholder", () => {
    renderEn(
      <Controlled initial={{ ja: "醤油ラーメン", en: "Shoyu" }} placeholder="Product name" />,
    );
    expect(screen.getByRole("textbox")).toHaveValue("Shoyu");
    expect(screen.getByRole("textbox")).toHaveAttribute("placeholder", "Product name");
  });

  it("sets lang on the control to the active locale", async () => {
    const user = userEvent.setup();
    renderEn(<Controlled />);
    expect(screen.getByRole("textbox")).toHaveAttribute("lang", "en");
    await user.click(screen.getByRole("tab", { name: "Vietnamese" }));
    expect(screen.getByRole("textbox")).toHaveAttribute("lang", "vi");
  });

  it("marks a locale with an error on its tab — a glyph plus words, not colour alone", () => {
    renderEn(<Controlled errors={{ vi: "Required" }} />);
    const vi = screen.getByRole("tab", { name: "Vietnamese, has an error" });
    expect(vi).toHaveAttribute("data-invalid", "true");
    expect(vi.querySelector(".ui-translatable-field-error-mark")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(screen.getByRole("tab", { name: "English" })).not.toHaveAttribute("data-invalid");
    // the active locale (en) has no error → the control is not invalid
    expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-invalid");
  });

  it("the ACTIVE locale's error sets aria-invalid and is announced", async () => {
    const user = userEvent.setup();
    renderEn(<Controlled errors={{ vi: "Vietnamese name is required" }} />);
    await user.click(screen.getByRole("tab", { name: /Vietnamese/ }));
    const box = screen.getByRole("textbox");
    expect(box).toHaveAttribute("aria-invalid", "true");
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Vietnamese name is required");
    expect(box.getAttribute("aria-errormessage")).toContain(alert.id);
  });

  it("switches locale from the keyboard (APG tabs: arrows + Home/End, one tab stop)", async () => {
    const user = userEvent.setup();
    renderEn(<Controlled />);
    await user.tab();
    expect(screen.getByRole("tab", { name: "English" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Vietnamese" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("textbox")).toHaveAttribute("lang", "vi");
    await user.keyboard("{Home}");
    expect(screen.getByRole("tab", { name: "Japanese" })).toHaveAttribute("aria-selected", "true");
    // Tab leaves the strip for the field — the strip is ONE stop
    await user.tab();
    expect(screen.getByRole("textbox")).toHaveFocus();
    expect(screen.getByRole("textbox")).toHaveAttribute("lang", "ja");
  });

  it("the tab controls a tabpanel labelled by it, which holds the control", () => {
    renderEn(<Controlled />);
    const tab = screen.getByRole("tab", { name: "English" });
    const panel = screen.getByRole("tabpanel");
    expect(tab.getAttribute("aria-controls")).toBe(panel.id);
    expect(panel).toHaveAccessibleName("English");
    expect(within(panel).getByRole("textbox")).toBeInTheDocument();
  });

  it("defaults: locales = registered app locales, first tab = app locale, fallback = app fallbackLocale", () => {
    render(
      <AppProvider persist={false} defaultLocale="ja" fallbackLocale="vi">
        <TranslatableInput aria-label="Name" value={{ vi: "Phở" }} />
      </AppProvider>,
    );
    expect(screen.getAllByRole("tab").map((tab) => tab.getAttribute("data-locale"))).toEqual(
      expect.arrayContaining(["ja", "en", "vi"]),
    );
    expect(screen.getByRole("tab", { selected: true })).toHaveAttribute("data-locale", "ja");
    expect(screen.getByRole("textbox")).toHaveAttribute("placeholder", "Phở");
  });

  it("per-field locales / defaultLocale / fallbackLocale override the provider", () => {
    render(
      <AppProvider persist={false} defaultLocale="ja" fallbackLocale="vi">
        <TranslatableInput
          aria-label="Name"
          locales={["en", "ja"]}
          defaultLocale="en"
          fallbackLocale="ja"
          value={{ ja: "拉麺", vi: "Phở" }}
        />
      </AppProvider>,
    );
    expect(screen.getAllByRole("tab").map((tab) => tab.getAttribute("data-locale"))).toEqual([
      "en",
      "ja",
    ]);
    expect(screen.getByRole("tab", { selected: true })).toHaveAttribute("data-locale", "en");
    expect(screen.getByRole("textbox")).toHaveAttribute("placeholder", "拉麺");
  });

  it("works outside AppProvider", () => {
    render(<TranslatableInput aria-label="Name" locales={["ja", "en"]} defaultLocale="ja" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("lang", "ja");
  });

  it("forwards ref to the one <input>, which stays the same node across switches", async () => {
    const user = userEvent.setup();
    const ref = React.createRef<HTMLInputElement>();
    renderEn(<Controlled ref={ref} />);
    const node = ref.current;
    expect(node).toBeInstanceOf(HTMLInputElement);
    await user.click(screen.getByRole("tab", { name: "Japanese" }));
    expect(ref.current).toBe(node);
  });
});

describe("TranslatableInput inside FormField", () => {
  it("is named by the field label + locale, and the strip is labelled by the field", () => {
    renderEn(
      <FormField label="Product name" required helper="Shown on the menu">
        <Controlled />
      </FormField>,
    );
    const box = screen.getByRole("textbox", { name: "Product name English" });
    expect(box).toHaveAttribute("aria-required", "true");
    expect(box).toHaveAccessibleDescription("Shown on the menu");
    expect(screen.getByRole("tablist")).toHaveAccessibleName("Product name Language");
  });

  it("clicking the label focuses the control", async () => {
    const user = userEvent.setup();
    renderEn(
      <FormField label="Product name">
        <Controlled />
      </FormField>,
    );
    await user.click(screen.getByText("Product name"));
    expect(screen.getByRole("textbox")).toHaveFocus();
  });

  it("the active locale's error renders in FormField's error line, wired by aria-errormessage", async () => {
    const user = userEvent.setup();
    renderEn(
      <FormField label="Product name">
        <Controlled errors={{ ja: "日本語名は必須です" }} />
      </FormField>,
    );
    // active = en, no error: FormField shows nothing, control valid
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-invalid");

    await user.click(screen.getByRole("tab", { name: /Japanese/ }));
    const alerts = screen.getAllByRole("alert");
    expect(alerts).toHaveLength(1); // ONE message — FormField's, not a second one of our own
    expect(alerts[0]).toHaveTextContent("日本語名は必須です");
    expect(alerts[0]!.parentElement).toHaveAttribute("data-slot", "form-field-control");
    const box = screen.getByRole("textbox");
    expect(box).toHaveAttribute("aria-invalid", "true");
    expect(box.getAttribute("aria-errormessage")).toContain(alerts[0]!.id);

    await user.click(screen.getByRole("tab", { name: "English" }));
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("FormField's own error still wins over a reported one", async () => {
    renderEn(
      <FormField label="Product name" error="Server says no">
        <Controlled errors={{ en: "Required" }} />
      </FormField>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Server says no");
  });
});

describe("TranslatableTextarea", () => {
  it("has the same contract over a <textarea>", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const ref = React.createRef<HTMLTextAreaElement>();
    renderEn(
      <FormField label="Description">
        <Controlled
          Component={TranslatableTextarea}
          ref={ref}
          initial={{ ja: "濃厚なスープ" }}
          errors={{ vi: "Required" }}
          onChange={onChange}
        />
      </FormField>,
    );
    const box = screen.getByRole("textbox", { name: "Description English" });
    expect(box.tagName).toBe("TEXTAREA");
    expect(ref.current).toBe(box);
    expect(box).toHaveAttribute("lang", "en");
    expect(box).toHaveAttribute("placeholder", "濃厚なスープ");
    await user.type(box, "Rich");
    expect(onChange).toHaveBeenLastCalledWith({ ja: "濃厚なスープ", en: "Rich" });
    await user.click(screen.getByRole("tab", { name: "Vietnamese, has an error" }));
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Required");
  });
});
