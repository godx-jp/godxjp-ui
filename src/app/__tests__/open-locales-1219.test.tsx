import { render, screen, within } from "@testing-library/react";
import { de } from "date-fns/locale";
import { de as deDayPicker } from "react-day-picker/locale";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppProvider, useAppContext } from "../app-provider";
import {
  getDateFnsLocale,
  getLocaleWeekStart,
  isAppLocale,
  registerLocale,
  resolveRegisteredLocale,
} from "../locales";
import { getLocaleDatePattern, getLocaleDateOrder } from "../date-formats";
import { resolveDefaultDateFormat } from "../date-format-labels";
import { resolveDefaultTimeFormat } from "../time-format-labels";
import { useAppPreset, type AppPreset } from "../preset";
import { resetUnknownLocaleWarningsForTests } from "../../i18n/locale-tags";
import { registerMessages, resetI18nLocale, translate } from "../../i18n/translate";
import { formatDate, resetDatetimeContextForTests } from "../../lib/datetime";
import { DatePicker } from "../../components/data-entry/date-picker";

/**
 * OPEN LOCALES (v32, gh#1219). `AppLocale` was the closed union `"vi" | "en" | "ja"`, the date
 * adapters were a fixed table of three, and AppProvider defaulted to `vi`. A German app could not
 * get a German date or a Monday week out of the package at all.
 */

let warn: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  document.documentElement.lang = "";
  resetI18nLocale();
  resetDatetimeContextForTests();
  resetUnknownLocaleWarningsForTests();
  warn = vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
  warn.mockRestore();
  document.documentElement.removeAttribute("data-preset");
});

const unknownLocaleWarnings = () =>
  warn.mock.calls.filter((call: unknown[]) => String(call[0]).includes("is not registered"));

/** The calendar's weekday row, read the way a screen reader does. */
const weekdays = () =>
  [...within(screen.getByRole("dialog")).getByRole("grid").querySelectorAll("th")].map((cell) =>
    cell.getAttribute("aria-label"),
  );

describe("registerLocale('de') — the issue's done-when", () => {
  it("DatePicker shows 08.10.2026 for 2026-10-08, and the week starts on Monday", () => {
    registerLocale({
      code: "de",
      dateFns: de,
      dayPicker: deDayPicker,
      messages: { common: { cancel: "Abbrechen" } },
    });
    render(
      <AppProvider defaultLocale="de" persist={false}>
        <DatePicker
          aria-label="Datum"
          defaultValue={new Date(2026, 9, 8)}
          format={getLocaleDatePattern("de")}
          defaultOpen
        />
      </AppProvider>,
    );
    expect(screen.getByRole("combobox", { name: "Datum" })).toHaveValue("08.10.2026");
    expect(weekdays()[0]).toBe("Montag");
    expect(weekdays()).toHaveLength(7);
  });

  it("formatDate under de prints de's own separators, and the library strings come from its pack", () => {
    registerLocale({ code: "de", dateFns: de, dayPicker: deDayPicker });
    function Probe() {
      const { locale, dateFormat, timeFormat } = useAppContext();
      return (
        <span>
          {[locale, dateFormat, timeFormat, formatDate("2026-10-08", { kind: "date" })].join("|")}
        </span>
      );
    }
    render(
      <AppProvider defaultLocale="de" persist={false}>
        <Probe />
      </AppProvider>,
    );
    expect(screen.getByText("de|dmy|24h|08.10.2026")).toBeInTheDocument();
    expect(translate("de", "en", "common.cancel")).toBe("Abbrechen");
  });
});

describe("registerLocale with no date-fns pack — everything from Intl", () => {
  it("pt-BR: Sunday first, Portuguese names, dd/MM/yyyy", () => {
    const code = registerLocale({ code: "pt-br" });
    expect(code).toBe("pt-BR");
    const locale = getDateFnsLocale("pt-BR");
    expect(locale.options?.weekStartsOn).toBe(0);
    expect(locale.localize.month(9, { width: "wide" })).toBe("outubro");
    expect(getLocaleDatePattern("pt-BR")).toBe("dd/MM/yyyy");
  });

  it("en-GB starts on Monday and writes day-first; ar starts on Saturday", () => {
    registerLocale({ code: "en-GB" });
    registerLocale({ code: "ar" });
    expect(getDateFnsLocale("en-GB").options?.weekStartsOn).toBe(1);
    expect(getLocaleDateOrder("en-GB")).toBe("dmy");
    expect(getDateFnsLocale("ar").options?.weekStartsOn).toBe(6);
  });

  it("the built-ins keep exactly what they had", () => {
    expect([resolveDefaultDateFormat("vi"), resolveDefaultDateFormat("en")]).toEqual([
      "dmy",
      "mdy",
    ]);
    expect(resolveDefaultDateFormat("ja")).toBe("ymd");
    expect([resolveDefaultTimeFormat("vi"), resolveDefaultTimeFormat("ja")]).toEqual([
      "24h",
      "24h",
    ]);
    expect(resolveDefaultTimeFormat("en")).toBe("12h");
    expect(getLocaleDatePattern("vi")).toBe("dd/MM/yyyy");
    expect(getLocaleDatePattern("en")).toBe("MM/dd/yyyy");
    expect(getLocaleDatePattern("ja")).toBe("yyyy/MM/dd");
    expect([getLocaleWeekStart("vi"), getLocaleWeekStart("en"), getLocaleWeekStart("ja")]).toEqual([
      1, 0, 0,
    ]);
  });

  it("falls back to the pack, then the region, when the engine has no getWeekInfo", () => {
    const proto = Intl.Locale.prototype as unknown as Record<string, unknown>;
    const descriptors = ["getWeekInfo", "weekInfo"].map(
      (key) => [key, Object.getOwnPropertyDescriptor(proto, key)] as const,
    );
    for (const [key] of descriptors) {
      Object.defineProperty(proto, key, { value: undefined, configurable: true });
    }
    try {
      expect(getLocaleWeekStart("pt-BR")).toBe(0);
      expect(getLocaleWeekStart("de")).toBe(1);
      expect(getLocaleWeekStart("ar")).toBe(6);
      expect(getLocaleWeekStart("xx-YY", { options: { weekStartsOn: 3 } })).toBe(3);
    } finally {
      for (const [key, descriptor] of descriptors) {
        if (descriptor) Object.defineProperty(proto, key, descriptor);
        else delete proto[key];
      }
    }
  });
});

describe("unknown tags and registerMessages", () => {
  it("an unregistered tag falls back with ONE development warning", () => {
    expect(isAppLocale("fr")).toBe(false);
    expect(getDateFnsLocale("fr")).toBe(getDateFnsLocale("en"));
    getDateFnsLocale("fr");
    expect(unknownLocaleWarnings()).toHaveLength(1);
  });

  it("BCP-47 lookup: ja-JP is served by ja, de-AT by a registered de", () => {
    registerLocale({ code: "de", dateFns: de });
    expect(resolveRegisteredLocale("ja-JP")).toBe("ja");
    expect(resolveRegisteredLocale("de-AT")).toBe("de");
    expect(resolveRegisteredLocale("fr-FR")).toBeUndefined();
  });

  it("registerMessages accepts any registered locale and refuses an unregistered one", () => {
    registerLocale({ code: "en-GB" });
    registerMessages("en-GB", { myApp: { colour: "Colour" } });
    expect(translate("en-GB", "en", "myApp.colour")).toBe("Colour");
    expect(() => registerMessages("fr", { myApp: { colour: "Couleur" } })).toThrow(
      /not registered/,
    );
  });
});

describe("default locale (decision A2): <html lang> if registered, else en — never navigator", () => {
  function Locale() {
    return <span data-testid="locale">{useAppContext().locale}</span>;
  }
  const locale = () => screen.getByTestId("locale").textContent;

  it("a registered <html lang> wins when the host passes no defaultLocale", () => {
    document.documentElement.lang = "ja-JP";
    render(
      <AppProvider persist={false}>
        <Locale />
      </AppProvider>,
    );
    expect(locale()).toBe("ja");
  });

  it("an unregistered <html lang> gives en — not vi, and not the browser language", () => {
    document.documentElement.lang = "fr";
    const languages = vi.spyOn(navigator, "language", "get").mockReturnValue("vi-VN");
    render(
      <AppProvider persist={false}>
        <Locale />
      </AppProvider>,
    );
    languages.mockRestore();
    expect(locale()).toBe("en");
  });

  it("an unregistered defaultLocale prop falls back with one warning", () => {
    render(
      <AppProvider defaultLocale="xx" persist={false}>
        <Locale />
      </AppProvider>,
    );
    expect(locale()).toBe("en");
    expect(unknownLocaleWarnings()).toHaveLength(1);
  });
});

describe("AppPreset precedence: prop > preset > neutral default", () => {
  const preset: AppPreset = { name: "acme", defaultLocale: "ja", timeZone: "Asia/Tokyo" };
  function Probe() {
    const { locale, timezone } = useAppContext();
    return (
      <span data-testid="probe">{`${locale}|${timezone}|${useAppPreset()?.name ?? "-"}`}</span>
    );
  }
  const probe = () => screen.getByTestId("probe").textContent;

  it("the preset fills what the props leave unset, and names <html data-preset>", () => {
    render(
      <AppProvider preset={preset} persist={false}>
        <Probe />
      </AppProvider>,
    );
    expect(probe()).toBe("ja|Asia/Tokyo|acme");
    expect(document.documentElement.getAttribute("data-preset")).toBe("acme");
  });

  it("an explicit prop beats the preset", () => {
    render(
      <AppProvider preset={preset} defaultLocale="vi" defaultTimezone="UTC" persist={false}>
        <Probe />
      </AppProvider>,
    );
    expect(probe()).toBe("vi|UTC|acme");
  });

  it("no preset → the neutral default, and no data-preset", () => {
    render(
      <AppProvider defaultTimezone="UTC" persist={false}>
        <Probe />
      </AppProvider>,
    );
    expect(probe()).toBe("en|UTC|-");
    expect(document.documentElement.hasAttribute("data-preset")).toBe(false);
  });
});
