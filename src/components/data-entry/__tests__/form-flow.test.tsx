import { describe, expect, it, vi } from "vitest";
import * as React from "react";
import { renderWithUi, screen, userEvent, waitFor } from "@/test/render";

import { Form } from "../form";
import { FormField } from "../form-field";
import { Input } from "../input";
import { Select } from "../select";

/**
 * Behavioral test for the comprehensive form validation flow (docs/data-entry/form/examples):
 * submitting with empty required fields shows an inline error per field; filling a field clears its
 * error live; a valid submit calls onSubmit and renders the success state. Runs under `pnpm test`
 * (jsdom + user-event) — no browser MCP needed.
 */

interface Values {
  partner: string;
  code: string;
  account: string;
}

const EMPTY: Values = { partner: "", code: "", account: "" };

function validate(v: Values): Partial<Record<keyof Values, string>> {
  const e: Partial<Record<keyof Values, string>> = {};
  if (!v.partner.trim()) e.partner = "取引先名は必須です";
  if (!v.code.trim()) e.code = "取引先コードは必須です";
  if (!v.account) e.account = "勘定科目を選択してください";
  return e;
}

function InvoiceFormHarness({ onValidSubmit }: { onValidSubmit: (v: Values) => void }) {
  const [v, setV] = React.useState<Values>(EMPTY);
  const [errors, setErrors] = React.useState<Partial<Record<keyof Values, string>>>({});
  const [submitted, setSubmitted] = React.useState(false);

  function update<K extends keyof Values>(key: K, value: Values[K]) {
    setV((s) => ({ ...s, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const next = validate(v);
    setErrors(next);
    if (Object.keys(next).length === 0) {
      setSubmitted(true);
      onValidSubmit(v);
    }
  }

  return (
    <Form onSubmit={handleSubmit} aria-label="invoice">
      {submitted ? <p role="status">請求書を作成しました</p> : null}
      <FormField id="t-partner" label="取引先名" required error={errors.partner}>
        <Input
          id="t-partner"
          value={v.partner}
          onChange={(e) => update("partner", e.target.value)}
        />
      </FormField>
      <FormField id="t-code" label="取引先コード" required error={errors.code}>
        <Input id="t-code" value={v.code} onChange={(e) => update("code", e.target.value)} />
      </FormField>
      <FormField id="t-account" label="勘定科目" required error={errors.account}>
        <Select
          id="t-account"
          name="account"
          value={v.account}
          onValueChange={(val: string) => update("account", val)}
          placeholder="選択してください"
          options={[
            { value: "sales", label: "売上高" },
            { value: "rent", label: "地代家賃" },
          ]}
        />
      </FormField>
      <button type="submit">作成</button>
    </Form>
  );
}

describe("Form validation flow — required fields, clear-on-fix, valid submit", () => {
  it("submitting empty shows an error for each required field and does NOT call onSubmit", async () => {
    const user = userEvent.setup();
    const onValidSubmit = vi.fn();
    renderWithUi(<InvoiceFormHarness onValidSubmit={onValidSubmit} />);

    await user.click(screen.getByRole("button", { name: "作成" }));

    // One role=alert per empty required field (FormField renders error with role="alert").
    const alerts = screen.getAllByRole("alert");
    expect(alerts).toHaveLength(3);
    expect(screen.getByText("取引先名は必須です")).toBeInTheDocument();
    expect(screen.getByText("取引先コードは必須です")).toBeInTheDocument();
    expect(screen.getByText("勘定科目を選択してください")).toBeInTheDocument();

    // aria-invalid is wired onto the controls by FormField.
    expect(screen.getByLabelText(/取引先名/)).toHaveAttribute("aria-invalid", "true");

    expect(onValidSubmit).not.toHaveBeenCalled();
  });

  it("filling a required field clears that field's error live (validation-on-fix)", async () => {
    const user = userEvent.setup();
    renderWithUi(<InvoiceFormHarness onValidSubmit={() => {}} />);

    await user.click(screen.getByRole("button", { name: "作成" }));
    expect(screen.getByText("取引先名は必須です")).toBeInTheDocument();

    await user.type(screen.getByLabelText(/取引先名/), "株式会社ベトヤ");

    expect(screen.queryByText("取引先名は必須です")).not.toBeInTheDocument();
    // The other two errors remain until fixed.
    expect(screen.getByText("取引先コードは必須です")).toBeInTheDocument();
    expect(screen.getByLabelText(/取引先名/)).not.toHaveAttribute("aria-invalid");
  });

  it("a valid submit calls onSubmit with the values and renders the success state", async () => {
    const user = userEvent.setup();
    const onValidSubmit = vi.fn();
    renderWithUi(<InvoiceFormHarness onValidSubmit={onValidSubmit} />);

    await user.type(screen.getByLabelText(/取引先名/), "株式会社ベトヤ");
    await user.type(screen.getByLabelText(/取引先コード/), "BTY-0012");

    // Open the Select and pick an option.
    await user.click(screen.getByRole("combobox", { name: /勘定科目/ }));
    await user.click(await screen.findByRole("option", { name: "売上高" }));

    await user.click(screen.getByRole("button", { name: "作成" }));

    await waitFor(() => {
      expect(onValidSubmit).toHaveBeenCalledTimes(1);
    });
    expect(onValidSubmit).toHaveBeenCalledWith({
      partner: "株式会社ベトヤ",
      code: "BTY-0012",
      account: "sales",
    });
    expect(screen.getByRole("status")).toHaveTextContent("請求書を作成しました");
    // No errors remain.
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
