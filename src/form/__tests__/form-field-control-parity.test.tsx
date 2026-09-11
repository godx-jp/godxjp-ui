import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { renderWithUi, screen, userEvent, waitFor } from "@/test/render";
import { FormRoot } from "../form-root";
import { FormFieldControl } from "../form-field-control";
import { useZodForm } from "../use-zod-form";
import { Input } from "../../components/data-entry/input";
import { Button } from "../../components/general/button";
import type { FormStateAdapter } from "../../props/components/form.prop";

const schema = z
  .object({
    password: z.string().min(4, "Tối thiểu 4 ký tự"),
    confirm: z.string(),
    code: z.string(),
  })
  // antd expresses this with a `rules` validator on `confirm`; the Zod engine owns it here, and
  // `dependencies` is what re-runs it when the OTHER field changes.
  .refine((values) => values.confirm === values.password, {
    path: ["confirm"],
    message: "Mật khẩu không khớp",
  });
type Values = z.infer<typeof schema>;

function TextField(props: {
  name: keyof Values;
  label: string;
  dependencies?: (keyof Values)[];
  normalize?: (value: unknown, previousValue: unknown) => unknown;
  getValueFromEvent?: (...args: unknown[]) => unknown;
  help?: string;
  validateStatus?: "success" | "warning" | "error" | "validating";
  hasFeedback?: boolean;
}) {
  const { name, label, ...rest } = props;
  return (
    <FormFieldControl<Values> name={name} label={label} {...rest}>
      {(field) => <Input {...field} value={typeof field.value === "string" ? field.value : ""} />}
    </FormFieldControl>
  );
}

describe("FormFieldControl — antd Form.Item parity", () => {
  it("dependencies re-validate the dependent field after the first submit", async () => {
    const user = userEvent.setup();
    function Harness() {
      const form = useZodForm(schema, {
        defaultValues: { password: "secret", confirm: "mismatch", code: "1" },
      });
      return (
        <FormRoot form={form} onSubmit={() => {}}>
          <TextField name="password" label="Password" />
          <TextField name="confirm" label="Confirm" dependencies={["password"]} />
          <Button type="submit">Submit</Button>
        </FormRoot>
      );
    }
    renderWithUi(<Harness />);

    // Before the first submit the mismatch is silent — the user has not reached the field.
    expect(screen.queryByText("Mật khẩu không khớp")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() => expect(screen.getByText("Mật khẩu không khớp")).toBeInTheDocument());

    // Editing the DEPENDENCY (password), not the field itself, must clear the message.
    const password = screen.getByRole("textbox", { name: "Password" });
    await user.clear(password);
    await user.type(password, "mismatch");
    await waitFor(() => expect(screen.queryByText("Mật khẩu không khớp")).not.toBeInTheDocument());
  });

  it("normalize transforms the value before it is stored", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    function Harness() {
      const form = useZodForm(schema, {
        defaultValues: { password: "secret", confirm: "secret", code: "" },
      });
      return (
        <FormRoot form={form} onSubmit={onSubmit}>
          <TextField
            name="code"
            label="Code"
            normalize={(value) => String(value ?? "").toUpperCase()}
          />
          <Button type="submit">Submit</Button>
        </FormRoot>
      );
    }
    renderWithUi(<Harness />);
    await user.type(screen.getByRole("textbox", { name: "Code" }), "ab1");
    expect(screen.getByRole("textbox", { name: "Code" })).toHaveValue("AB1");

    await user.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        password: "secret",
        confirm: "secret",
        code: "AB1",
      }),
    );
  });

  it("normalize can reject a change by returning the previous value", async () => {
    const user = userEvent.setup();
    function Harness() {
      const form = useZodForm(schema, {
        defaultValues: { password: "secret", confirm: "secret", code: "" },
      });
      return (
        <FormRoot form={form} onSubmit={() => {}}>
          <TextField
            name="code"
            label="Code"
            normalize={(value, previous) => (/^\d*$/.test(String(value ?? "")) ? value : previous)}
          />
        </FormRoot>
      );
    }
    renderWithUi(<Harness />);
    const input = screen.getByRole("textbox", { name: "Code" });
    await user.type(input, "12a3");
    expect(input).toHaveValue("123");
  });

  it("getValueFromEvent replaces the built-in payload detection", async () => {
    const user = userEvent.setup();
    function Harness() {
      const form = useZodForm(schema, {
        defaultValues: { password: "secret", confirm: "secret", code: "" },
      });
      return (
        <FormRoot form={form} onSubmit={() => {}}>
          <TextField
            name="code"
            label="Code"
            // A control reporting `(value, meta)` — the first argument is not a DOM event.
            getValueFromEvent={(event) =>
              `#${(event as React.ChangeEvent<HTMLInputElement>).target.value}`
            }
          />
        </FormRoot>
      );
    }
    renderWithUi(<Harness />);
    await user.type(screen.getByRole("textbox", { name: "Code" }), "a");
    expect(screen.getByRole("textbox", { name: "Code" })).toHaveValue("#a");
  });

  it("help replaces the resolved validation message", async () => {
    const user = userEvent.setup();
    function Harness() {
      const form = useZodForm(schema, {
        defaultValues: { password: "x", confirm: "x", code: "1" },
      });
      return (
        <FormRoot form={form} onSubmit={() => {}}>
          <TextField name="password" label="Password" help="Máy chủ từ chối mật khẩu này" />
          <Button type="submit">Submit</Button>
        </FormRoot>
      );
    }
    renderWithUi(<Harness />);
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() =>
      expect(screen.getByText("Máy chủ từ chối mật khẩu này")).toBeInTheDocument(),
    );
    expect(screen.queryByText("Tối thiểu 4 ký tự")).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Password" })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("help also overrides a server error on the adapter path", () => {
    const adapter: FormStateAdapter = {
      getValue: () => "",
      setValue: () => {},
      getError: () => "Server said no",
      isSubmitting: false,
    };
    renderWithUi(
      <FormRoot adapter={adapter} onSubmit={() => {}}>
        <FormFieldControl name="code" label="Code" help="Đang kiểm tra lại…">
          {(field) => (
            <Input {...field} value={typeof field.value === "string" ? field.value : ""} />
          )}
        </FormFieldControl>
      </FormRoot>,
    );
    expect(screen.getByText("Đang kiểm tra lại…")).toBeInTheDocument();
    expect(screen.queryByText("Server said no")).not.toBeInTheDocument();
  });

  it("validateStatus + hasFeedback announce an in-flight remote check", () => {
    function Harness() {
      const form = useZodForm(schema, {
        defaultValues: { password: "secret", confirm: "secret", code: "1" },
      });
      return (
        <FormRoot form={form} onSubmit={() => {}}>
          <TextField name="code" label="Code" validateStatus="validating" hasFeedback />
        </FormRoot>
      );
    }
    renderWithUi(<Harness />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Code" })).toHaveAttribute("aria-busy", "true");
  });

  it("preserve={false} drops the value when the field unmounts (default keeps it)", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    // Own schema: an unregistered key must still satisfy validation, which is exactly why an
    // optional branch field is the case `preserve={false}` exists for.
    const branchSchema = z.object({ base: z.string(), extra: z.string().optional() });
    type BranchValues = z.infer<typeof branchSchema>;

    function Harness({ preserve }: { preserve?: boolean }) {
      const [showExtra, setShowExtra] = useState(true);
      const form = useZodForm(branchSchema, {
        defaultValues: { base: "b", extra: "stale" },
      });
      return (
        <FormRoot form={form} onSubmit={onSubmit}>
          {showExtra ? (
            <FormFieldControl<BranchValues> name="extra" label="Extra" preserve={preserve}>
              {(field) => (
                <Input {...field} value={typeof field.value === "string" ? field.value : ""} />
              )}
            </FormFieldControl>
          ) : null}
          <Button type="button" onClick={() => setShowExtra(false)}>
            Hide
          </Button>
          <Button type="submit">Submit</Button>
        </FormRoot>
      );
    }

    const kept = renderWithUi(<Harness />);
    await user.click(screen.getByRole("button", { name: "Hide" }));
    await user.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0]?.[0]).toHaveProperty("extra", "stale");
    kept.unmount();

    onSubmit.mockClear();
    renderWithUi(<Harness preserve={false} />);
    await user.click(screen.getByRole("button", { name: "Hide" }));
    await user.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0]?.[0]).not.toHaveProperty("extra");
  });
});
