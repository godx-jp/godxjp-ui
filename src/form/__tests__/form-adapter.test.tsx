import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";
import { expectNoA11yViolations } from "@/test/a11y";
import { FormRoot } from "../form-root";
import { FormFieldControl } from "../form-field-control";
import { useFormSubmitting } from "../form-context";
import { Input } from "../../components/data-entry/input";
import { Button } from "../../components/general/button";
import type { FormStateAdapter } from "../../props/components/form.prop";

// A minimal server-driven form store (Inertia-shaped) exposed as a FormStateAdapter, so we exercise
// the adapter path of FormRoot/FormFieldControl WITHOUT react-hook-form.
function useStoreAdapter(initial: Record<string, string>, errors: Record<string, string> = {}) {
  const [data, setData] = useState(initial);
  const [submitting, setSubmitting] = useState(false);
  const adapter: FormStateAdapter = {
    getValue: (name) => data[name],
    setValue: (name, value) => setData((d) => ({ ...d, [name]: String(value) })),
    getError: (name) => errors[name],
    isSubmitting: submitting,
    getValues: () => data,
  };
  return { adapter, setSubmitting };
}

function SubmitButton() {
  return (
    <Button type="submit" loading={useFormSubmitting()}>
      Submit
    </Button>
  );
}

describe("FormRoot/FormFieldControl — adapter path", () => {
  it("binds value from the adapter (getValue) and writes back on change (setValue)", async () => {
    function Harness() {
      const { adapter } = useStoreAdapter({ email: "seed@example.com" });
      return (
        <FormRoot adapter={adapter} onSubmit={() => {}}>
          <FormFieldControl name="email" label="Email" required>
            {(field) => <Input {...field} type="email" value={String(field.value ?? "")} />}
          </FormFieldControl>
        </FormRoot>
      );
    }
    renderWithUi(<Harness />);
    const input = screen.getByLabelText(/email/i) as HTMLInputElement;
    expect(input.value).toBe("seed@example.com");
    await userEvent.clear(input);
    await userEvent.type(input, "new@example.com");
    expect(input.value).toBe("new@example.com");
  });

  it("surfaces a server error on the matching field and sets aria-invalid", () => {
    const adapter: FormStateAdapter = {
      getValue: () => "",
      setValue: () => {},
      getError: (name) => (name === "email" ? "Email is not registered." : undefined),
      isSubmitting: false,
    };
    renderWithUi(
      <FormRoot adapter={adapter} onSubmit={() => {}}>
        <FormFieldControl name="email" label="Email" required>
          {(field) => <Input {...field} type="email" value={String(field.value ?? "")} />}
        </FormFieldControl>
      </FormRoot>,
    );
    expect(screen.getByText("Email is not registered.")).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toHaveAttribute("aria-invalid", "true");
  });

  it("useFormSubmitting reflects the adapter isSubmitting flag", () => {
    const adapter: FormStateAdapter = {
      getValue: () => "",
      setValue: () => {},
      getError: () => undefined,
      isSubmitting: true,
    };
    renderWithUi(
      <FormRoot adapter={adapter} onSubmit={() => {}}>
        <SubmitButton />
      </FormRoot>,
    );
    // Button with loading=true exposes aria-busy.
    expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");
  });

  it("submits via onSubmit with a values snapshot and prevents native navigation", async () => {
    const onSubmit = vi.fn();
    const adapter: FormStateAdapter = {
      getValue: () => "x",
      setValue: () => {},
      getError: () => undefined,
      isSubmitting: false,
      getValues: () => ({ email: "x@example.com" }),
    };
    renderWithUi(
      <FormRoot adapter={adapter} onSubmit={onSubmit}>
        <SubmitButton />
      </FormRoot>,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(onSubmit).toHaveBeenCalledWith({ email: "x@example.com" });
  });

  it("has no axe violations on the adapter path", async () => {
    const adapter: FormStateAdapter = {
      getValue: () => "",
      setValue: () => {},
      getError: () => undefined,
      isSubmitting: false,
    };
    await expectNoA11yViolations(
      <FormRoot adapter={adapter} onSubmit={() => {}}>
        <FormFieldControl name="email" label="Email" required>
          {(field) => <Input {...field} type="email" value={String(field.value ?? "")} />}
        </FormFieldControl>
      </FormRoot>,
    );
  });
});
