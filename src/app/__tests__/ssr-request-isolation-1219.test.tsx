import { renderToString } from "react-dom/server";
import { de } from "date-fns/locale";
import { de as deDayPicker } from "react-day-picker/locale";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { AppProvider } from "../app-provider";
import { registerLocale } from "../locales";
import { getAppRequestHeaders } from "../request-headers";
import { runWithAppSettings } from "../settings-scope";
import { translateCurrent } from "../../i18n/translate";
import { useTranslation } from "../../i18n/use-translation";
import { formatDate, getDatetimeContext } from "../../lib/datetime";

/**
 * TWO SERVER REQUESTS AT ONCE MUST NOT READ EACH OTHER'S LOCALE (v32, gh#1219).
 *
 * Locale, timezone, formats and headers were three module variables, written by whichever
 * `AppProvider` rendered last. Request A renders in `ja`, awaits (a data fetch, a stream flush),
 * request B renders in `de` meanwhile — and when A resumes, every non-React reader in A answers in
 * B's language and zone. Each request below renders, yields so the other one renders, then reads.
 *
 * jsdom like the repo's other SSR tests (the shared setup file needs `window`); `<html lang>` is
 * cleared so no client-only input leaks in, and `window` is removed where the server's own default
 * is what is measured.
 */

beforeEach(() => {
  document.documentElement.lang = "";
});
afterEach(() => {
  vi.unstubAllGlobals();
});

beforeAll(() => {
  registerLocale({
    code: "de",
    dateFns: de,
    dayPicker: deDayPicker,
    messages: { common: { cancel: "Abbrechen" } },
  });
});

const INSTANT = "2026-10-08T12:00:00Z";

function Page() {
  const { t } = useTranslation();
  // `formatDate` with no options reads the scope AppProvider synced while rendering.
  return <p>{`${t("common.cancel")} ${formatDate(INSTANT, { kind: "datetime" })}`}</p>;
}

const yieldToOtherRequest = () => new Promise((resolve) => setTimeout(resolve, 10));

async function handle(locale: string, timezone: string) {
  const html = renderToString(
    <AppProvider defaultLocale={locale} defaultTimezone={timezone} persist={false}>
      <Page />
    </AppProvider>,
  );
  await yieldToOtherRequest();
  return {
    html,
    message: translateCurrent("common.cancel"),
    datetime: { ...getDatetimeContext(), dateFnsLocale: undefined },
    formatted: formatDate(INSTANT, { kind: "datetime" }),
    headers: getAppRequestHeaders(),
  };
}

describe("SSR request isolation", () => {
  it("ja and de rendered concurrently in separate scopes do not bleed", async () => {
    const [ja, deReq] = await Promise.all([
      runWithAppSettings({}, () => handle("ja", "Asia/Tokyo")),
      runWithAppSettings({}, () => handle("de", "Europe/Berlin")),
    ]);

    expect(ja.html).toContain("キャンセル 2026/10/08 21:00");
    expect(deReq.html).toContain("Abbrechen 08.10.2026 14:00");

    // Messages
    expect(ja.message).toBe("キャンセル");
    expect(deReq.message).toBe("Abbrechen");
    // Timezone + formats
    expect(ja.datetime).toMatchObject({
      locale: "ja",
      timezone: "Asia/Tokyo",
      dateFormat: "ymd",
      timeFormat: "24h",
    });
    expect(deReq.datetime).toMatchObject({
      locale: "de",
      timezone: "Europe/Berlin",
      dateFormat: "dmy",
      timeFormat: "24h",
    });
    expect(ja.formatted).toBe("2026/10/08 21:00");
    expect(deReq.formatted).toBe("08.10.2026 14:00");
    // Headers
    expect(ja.headers).toEqual({
      "x-locale": "ja",
      "x-timezone": "Asia/Tokyo",
      "x-time-format": "24h",
      "x-date-format": "ymd",
    });
    expect(deReq.headers).toEqual({
      "x-locale": "de",
      "x-timezone": "Europe/Berlin",
      "x-time-format": "24h",
      "x-date-format": "dmy",
    });
  });

  it("a scope seeded without a provider answers for non-React code, and the server default zone is UTC", async () => {
    vi.stubGlobal("window", undefined);
    const [seeded, bare] = await Promise.all([
      runWithAppSettings({ locale: "de", timezone: "Europe/Berlin" }, async () => {
        await yieldToOtherRequest();
        return { message: translateCurrent("common.cancel"), headers: getAppRequestHeaders() };
      }),
      runWithAppSettings({}, async () => {
        await yieldToOtherRequest();
        return { message: translateCurrent("common.cancel"), headers: getAppRequestHeaders() };
      }),
    ]);
    expect(seeded.message).toBe("Abbrechen");
    expect(seeded.headers).toEqual({
      "x-locale": "de",
      "x-timezone": "Europe/Berlin",
      "x-time-format": "24h",
      "x-date-format": "dmy",
    });
    // Nothing chose anything: en, UTC, en's own formats — not vi / Asia/Ho_Chi_Minh / dmy.
    expect(bare.message).toBe("Cancel");
    expect(bare.headers).toEqual({
      "x-locale": "en",
      "x-timezone": "UTC",
      "x-time-format": "12h",
      "x-date-format": "mdy",
    });
  });

  it("control: WITHOUT a scope the module fallback is shared — which is the bleed the scope removes", async () => {
    const [ja] = await Promise.all([handle("ja", "Asia/Tokyo"), handle("de", "Europe/Berlin")]);
    // React output is per tree (context) and stays right even here …
    expect(ja.html).toContain("キャンセル");
    // … but a non-React reader in request A now answers with request B's settings.
    expect(ja.message).toBe("Abbrechen");
    expect(ja.headers["x-timezone"]).toBe("Europe/Berlin");
  });
});
