import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AppProvider } from "../../app/app-provider";
import { resetI18nLocale, syncI18nLocale } from "../translate";
import {
  resetOutsideProviderWarningForTests,
  usePickerLocales,
  useTranslation,
} from "../use-translation";

/**
 * KIT STRINGS WITHOUT AN AppProvider (gh#1005).
 *
 * Measured in godx-mailer: with no AppProvider mounted, a dialog's cancel button, an upload's
 * delete and a ListRow's unread badge rendered in Vietnamese in a Japanese UI, and nothing said so.
 * `syncI18nLocale` did not reach the React path, which read a hard-coded "vi".
 */
function Cancel() {
  const { t } = useTranslation();
  return <span>{t("common.cancel")}</span>;
}
function Zone() {
  return <span>{usePickerLocales().timezone}</span>;
}

let warn: { mock: { calls: unknown[][] }; mockRestore: () => void };
beforeEach(() => {
  resetI18nLocale();
  resetOutsideProviderWarningForTests();
  warn = vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
  warn.mockRestore();
  vi.unstubAllEnvs();
});

const outsideWarnings = () =>
  warn.mock.calls.filter((c: unknown[]) => String(c[0]).includes("outside <AppProvider>"));

describe("kit strings outside an AppProvider (gh#1005)", () => {
  it("follow syncI18nLocale on the React path too — the consumer's KitLocaleBridge works", () => {
    syncI18nLocale("ja", "en");
    expect(render(<Cancel />).container.textContent).toBe("キャンセル");
  });

  it("without either, they are the resting 'en' (v32, gh#1219) — and a development build says so, ONCE", () => {
    document.documentElement.lang = "";
    const { container } = render(
      <>
        <Cancel />
        <Cancel />
        <Zone />
      </>,
    );
    expect(container.textContent).toContain("Cancel");
    expect(outsideWarnings()).toHaveLength(1);
    expect(String(outsideWarnings()[0][0])).toContain('"en"');
    render(<Cancel />);
    expect(outsideWarnings()).toHaveLength(1);
  });

  it("no warning once syncI18nLocale has CHOSEN a locale", () => {
    syncI18nLocale("en", "en");
    render(<Cancel />);
    expect(outsideWarnings()).toHaveLength(0);
  });

  it("no warning inside AppProvider, and the provider's locale wins", () => {
    const { container } = render(
      <AppProvider defaultLocale="ja">
        <Cancel />
      </AppProvider>,
    );
    expect(container.textContent).toBe("キャンセル");
    expect(outsideWarnings()).toHaveLength(0);
  });

  it("no warning in a production build", () => {
    vi.stubEnv("NODE_ENV", "production");
    render(<Cancel />);
    expect(outsideWarnings()).toHaveLength(0);
  });

  it("pickers outside AppProvider use UTC — AppProvider's own unconfigured answer (gh#968)", () => {
    // Was Asia/Ho_Chi_Minh: a zone that looks right when it is wrong.
    expect(render(<Zone />).container.textContent).toBe("UTC");
  });
});
