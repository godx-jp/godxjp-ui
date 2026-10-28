import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AppProvider, useAppContext } from "../app-provider";
import { getDateFnsLocale, getDayPickerLocale } from "../locales";

/** #1464b: the existing public adapters are synchronous, including on the first SSR render.
 * Replacing them with async imports or English placeholders would change this contract.
 */
describe("#1464b synchronous locale compatibility boundary", () => {
  for (const [locale, month, selected] of [
    ["ja", "1月", "選択済み"],
    ["vi", "Tháng Một", "đã chọn"],
    ["en", "January", "selected"],
  ]) {
    it(`${locale} exposes complete localized adapters before effects or preload`, () => {
      function Probe() {
        const context = useAppContext();
        expect(context.dateFnsLocale).toBe(getDateFnsLocale(locale));
        expect(context.dayPickerLocale).toBe(getDayPickerLocale(locale));
        const names = context.dateFnsLocale.localize.month(0, { width: "wide" });
        const label = (
          context.dayPickerLocale.labels!.labelDayButton as (...args: unknown[]) => string
        )(new Date(2026, 0, 1), { selected: true }, undefined, undefined);
        return <span>{`${names}|${label}`}</span>;
      }
      const html = renderToStaticMarkup(
        <AppProvider defaultLocale={locale} persist={false}>
          <Probe />
        </AppProvider>,
      );
      expect(html).toContain(month);
      expect(html).toContain(selected);
    });
  }
});
