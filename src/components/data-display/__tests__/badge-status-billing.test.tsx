// StatusBadge · subscription/billing lifecycle keys (gh#216).
//
// These four keys shipped in the canonical STATUS_MAP before their i18n entries existed, so every
// billing surface rendered the RAW key ("status.trialing") instead of a label. The bug was only
// visible once something actually rendered them, which is why this file pins the rendered TEXT in
// all three supported locales rather than just the tone class.
//
// Browser-confirmed (headless Chromium, /frame/data-display-badge?locale=en|ja|vi at 1440/1024/390):
// 33 badges, ZERO strings matching /^status\./, with the labels asserted below.
import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { AppProvider } from "../../../app/app-provider";
import type { AppLocale } from "../../../app/types";
import { StatusBadge } from "../badge";

function renderIn(locale: AppLocale, ui: React.ReactElement) {
  return render(ui, {
    wrapper: ({ children }) => (
      <AppProvider persist={false} defaultLocale={locale} fallbackLocale="en">
        <MemoryRouter>{children}</MemoryRouter>
      </AppProvider>
    ),
  });
}

/** The exact strings observed in the browser, per locale. */
const LABELS: Record<AppLocale, Record<string, string>> = {
  en: {
    trialing: "Trialing",
    past_due: "Past due",
    incomplete: "Incomplete",
    canceled: "Canceled",
  },
  ja: {
    trialing: "試用中",
    past_due: "支払期限超過",
    incomplete: "未完了",
    canceled: "解約済み",
  },
  vi: {
    trialing: "Đang dùng thử",
    past_due: "Quá hạn thanh toán",
    incomplete: "Chưa hoàn tất",
    canceled: "Đã huỷ",
  },
};

const BILLING_STATUSES = ["trialing", "past_due", "incomplete", "canceled"] as const;

describe("StatusBadge · billing lifecycle statuses", () => {
  for (const locale of ["en", "ja", "vi"] as const) {
    it(`renders a localized label for every billing status in ${locale}`, () => {
      const { container } = renderIn(
        locale,
        <>
          {BILLING_STATUSES.map((status) => (
            <StatusBadge key={status} status={status} />
          ))}
        </>,
      );

      for (const status of BILLING_STATUSES) {
        expect(screen.getByText(LABELS[locale][status]!)).toBeInTheDocument();
      }

      // The regression guard: a missing message key renders the dotted key path verbatim.
      const texts = [...container.querySelectorAll('[data-slot="badge"]')].map((b) =>
        (b.textContent ?? "").trim(),
      );
      expect(texts).toHaveLength(BILLING_STATUSES.length);
      expect(texts.filter((t) => t.startsWith("status."))).toEqual([]);
    });
  }

  it("maps each billing status onto the canonical tone (no page-local colour table)", () => {
    // Tone comes from the shared STATUS_MAP, so a billing screen never keeps its own map (#216).
    const tones: Record<string, string> = {
      trialing: "text-info",
      past_due: "text-warning",
      canceled: "text-error-strong",
    };
    for (const [status, toneClass] of Object.entries(tones)) {
      const { container, unmount } = renderIn("en", <StatusBadge status={status} />);
      expect(
        (container.querySelector('[data-slot="badge"]') as HTMLElement).className,
        `${status} should map to ${toneClass}`,
      ).toContain(toneClass);
      unmount();
    }
  });
});
