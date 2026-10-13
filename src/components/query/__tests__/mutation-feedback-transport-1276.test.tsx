import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { AppProvider } from "../../../app/app-provider";
import { AlertMutationFeedback } from "../mutation-feedback";
import type { AlertMutationFeedbackProp } from "../../../props/components/query.prop";
import ja from "../../../i18n/messages/ja.json";

// gh#1276 — a network or 5xx failure carries TRANSPORT text in the server's or the HTTP client's
// language ("Server Error", "Could not reach the server…"), and a ja screen showed it in English.
// Those take the kit's localized transient message; a 4xx validation message keeps the server's
// words, because that is where the server tells the user what to fix.

const failed = (error: unknown): AlertMutationFeedbackProp["mutation"] => ({
  isError: true,
  error,
  isPending: false,
});
const httpError = (status: number, message: string) =>
  Object.assign(new Error(message), { status });

const inJa = (error: unknown) =>
  render(
    <AppProvider defaultLocale="ja" persist={false}>
      <AlertMutationFeedback mutation={failed(error)} />
    </AppProvider>,
  );

describe("AlertMutationFeedback — transport errors are localized (gh#1276)", () => {
  it("a 500 'Server Error' shows the localized transient message, not the English text", () => {
    inJa(httpError(500, "Server Error"));
    expect(screen.queryByText("Server Error")).not.toBeInTheDocument();
    expect(screen.getByText(ja.query.error.description.transient)).toBeInTheDocument();
  });

  it("a network failure with no status is localized too", () => {
    inJa(new Error("Could not reach the server. Check your connection."));
    expect(screen.queryByText(/Could not reach the server/)).not.toBeInTheDocument();
    expect(screen.getByText(ja.query.error.description.transient)).toBeInTheDocument();
  });

  it("a 422 validation message keeps the server's own words", () => {
    inJa(httpError(422, "受付番号はすでに使われています。"));
    expect(screen.getByText("受付番号はすでに使われています。")).toBeInTheDocument();
  });
});
