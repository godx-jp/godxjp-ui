import { useState } from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { renderWithUi, screen, userEvent, waitFor } from "@/test/render";
import { FormRoot } from "../form-root";
import { FormFieldControl } from "../form-field-control";
import { useZodForm } from "../use-zod-form";
import { useFormDisabled, useFormInstance, useFormWatch } from "../form-context";
import { FormErrors } from "../../components/data-entry/form-errors";
import { Input } from "../../components/data-entry/input";
import { Button } from "../../components/general/button";
import type { FormStateAdapter } from "../../props/components/form.prop";

const schema = z.object({
  name: z.string().min(1, "Bắt buộc"),
  email: z.string().email("Email không hợp lệ"),
});
type Values = z.infer<typeof schema>;

const scrollIntoView = vi.fn();
beforeAll(() => {
  // jsdom has no layout engine, so scrollIntoView is undefined — FormRoot guards on that, which
  // would make the scroll assertion vacuous. Install a spy instead.
  Element.prototype.scrollIntoView = scrollIntoView;
});

function Fields({ disabled }: { disabled?: boolean } = {}) {
  return (
    <>
      <FormFieldControl<Values> name="name" label="Name" disabled={disabled}>
        {(field) => <Input {...field} value={typeof field.value === "string" ? field.value : ""} />}
      </FormFieldControl>
      <FormFieldControl<Values> name="email" label="Email">
        {(field) => <Input {...field} value={typeof field.value === "string" ? field.value : ""} />}
      </FormFieldControl>
    </>
  );
}

describe("FormRoot — submission failure, reset, disabled, layout", () => {
  it("calls onSubmitFailed with the validation errors and does not call onSubmit", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onSubmitFailed = vi.fn();
    function Harness() {
      const form = useZodForm(schema, { defaultValues: { name: "", email: "" } });
      return (
        <FormRoot form={form} onSubmit={onSubmit} onSubmitFailed={onSubmitFailed}>
          <Fields />
          <Button type="submit">Submit</Button>
        </FormRoot>
      );
    }
    renderWithUi(<Harness />);
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => expect(onSubmitFailed).toHaveBeenCalledTimes(1));
    expect(Object.keys(onSubmitFailed.mock.calls[0]?.[0] ?? {})).toEqual(["name", "email"]);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("scrolls the first invalid field into view after a failed submit", async () => {
    const user = userEvent.setup();
    scrollIntoView.mockClear();
    function Harness() {
      const form = useZodForm(schema, { defaultValues: { name: "Bao", email: "nope" } });
      return (
        <FormRoot form={form} onSubmit={() => {}}>
          <Fields />
          <Button type="submit">Submit</Button>
        </FormRoot>
      );
    }
    renderWithUi(<Harness />);
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => expect(scrollIntoView).toHaveBeenCalled());
    const target = scrollIntoView.mock.instances[0] as HTMLElement;
    // The whole field row is centred, not just the control — otherwise the label scrolls off.
    expect(target.getAttribute("data-slot")).toBe("form-field");
    expect(target.querySelector("[data-field]")?.getAttribute("data-field")).toBe("email");
  });

  it("scrollToFirstError={false} leaves the viewport alone", async () => {
    const user = userEvent.setup();
    scrollIntoView.mockClear();
    function Harness() {
      const form = useZodForm(schema, { defaultValues: { name: "", email: "" } });
      return (
        <FormRoot form={form} onSubmit={() => {}} scrollToFirstError={false}>
          <Fields />
          <Button type="submit">Submit</Button>
        </FormRoot>
      );
    }
    renderWithUi(<Harness />);
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => expect(screen.getAllByRole("alert").length).toBeGreaterThan(0));
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it("routes a rejected onSubmit to onSubmitError instead of an unhandled rejection", async () => {
    const user = userEvent.setup();
    const onSubmitError = vi.fn();
    function Harness() {
      const form = useZodForm(schema, {
        defaultValues: { name: "Bao", email: "dev@example.com" },
      });
      return (
        <FormRoot
          form={form}
          onSubmit={() => Promise.reject(new Error("network down"))}
          onSubmitError={onSubmitError}
        >
          <Fields />
          <Button type="submit">Submit</Button>
        </FormRoot>
      );
    }
    renderWithUi(<Harness />);
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => expect(onSubmitError).toHaveBeenCalledTimes(1));
    expect((onSubmitError.mock.calls[0]?.[0] as Error).message).toBe("network down");
  });

  it("a native reset button restores defaultValues and runs onReset", async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();
    function Harness() {
      const form = useZodForm(schema, {
        defaultValues: { name: "Default", email: "default@example.com" },
      });
      return (
        <FormRoot form={form} onSubmit={() => {}} onReset={onReset}>
          <Fields />
          <Button type="reset">Reset</Button>
        </FormRoot>
      );
    }
    renderWithUi(<Harness />);
    const input = screen.getByRole("textbox", { name: "Name" });
    await user.clear(input);
    await user.type(input, "Changed");
    await user.click(screen.getByRole("button", { name: "Reset" }));

    expect(input).toHaveValue("Default");
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("a native reset button calls adapter.reset on the adapter path", async () => {
    const user = userEvent.setup();
    const reset = vi.fn();
    const adapter: FormStateAdapter = {
      getValue: () => "",
      setValue: () => {},
      getError: () => undefined,
      isSubmitting: false,
      reset,
    };
    renderWithUi(
      <FormRoot adapter={adapter} onSubmit={() => {}}>
        <Button type="reset">Reset</Button>
      </FormRoot>,
    );
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it("disabled disables every field but keeps its value in the payload", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    function Actions() {
      return (
        <Button type="submit" disabled={useFormDisabled()}>
          Submit
        </Button>
      );
    }
    function Harness() {
      const [locked, setLocked] = useState(true);
      const form = useZodForm(schema, {
        defaultValues: { name: "Bao", email: "dev@example.com" },
      });
      return (
        <FormRoot form={form} onSubmit={onSubmit} disabled={locked}>
          <Fields />
          <Actions />
          <Button type="button" onClick={() => setLocked(false)}>
            Unlock
          </Button>
        </FormRoot>
      );
    }
    renderWithUi(<Harness />);
    expect(screen.getByRole("textbox", { name: "Name" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Unlock" }));
    expect(screen.getByRole("textbox", { name: "Name" })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ name: "Bao", email: "dev@example.com" }),
    );
  });

  it("a per-field disabled={false} overrides the form-level disabled", () => {
    function Harness() {
      const form = useZodForm(schema, { defaultValues: { name: "", email: "" } });
      return (
        <FormRoot form={form} onSubmit={() => {}} disabled>
          <Fields disabled={false} />
        </FormRoot>
      );
    }
    renderWithUi(<Harness />);
    expect(screen.getByRole("textbox", { name: "Name" })).toBeEnabled();
    expect(screen.getByRole("textbox", { name: "Email" })).toBeDisabled();
  });

  it("layout props reach the fields through the Form layout shell", () => {
    function Harness() {
      const form = useZodForm(schema, { defaultValues: { name: "", email: "" } });
      return (
        <FormRoot form={form} onSubmit={() => {}} layout="horizontal" labelWidth={160}>
          <Fields />
        </FormRoot>
      );
    }
    const { container } = renderWithUi(<Harness />);
    const field = container.querySelector('[data-slot="form-field"]');
    expect(field).toHaveAttribute("data-layout", "horizontal");
    expect(container.querySelector("form")).toHaveClass("ui-form");
  });

  it("errors provides the bag registry: fields claim their key, FormErrors shows the rest", () => {
    function Harness() {
      const form = useZodForm(schema, { defaultValues: { name: "", email: "" } });
      return (
        <FormRoot
          form={form}
          onSubmit={() => {}}
          errors={{ name: "Tên đã tồn tại", action_mode: "Chế độ không hợp lệ" }}
        >
          <FormErrors />
          <Fields />
        </FormRoot>
      );
    }
    renderWithUi(<Harness />);
    // Claimed by the `name` field — rendered on the field, not repeated in the summary.
    expect(screen.getByText("Tên đã tồn tại")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Name" })).toHaveAttribute("aria-invalid", "true");
    // Unclaimed hidden key — only a summary can show it.
    expect(screen.getByText("Chế độ không hợp lệ")).toBeInTheDocument();
  });

  it("keeps the plain stack shell when no layout prop is given", () => {
    function Harness() {
      const form = useZodForm(schema, { defaultValues: { name: "", email: "" } });
      return (
        <FormRoot form={form} onSubmit={() => {}}>
          <Fields />
        </FormRoot>
      );
    }
    const { container } = renderWithUi(<Harness />);
    const form = container.querySelector("form");
    expect(form).toHaveClass("ui-stack-md");
    expect(form).not.toHaveClass("ui-form");
  });
});

describe("form context hooks", () => {
  it("useFormWatch tracks a field on the react-hook-form path", async () => {
    const user = userEvent.setup();
    function Preview() {
      return <p>{`Xem trước: ${String(useFormWatch<Values>("name") ?? "")}`}</p>;
    }
    function Harness() {
      const form = useZodForm(schema, { defaultValues: { name: "", email: "" } });
      return (
        <FormRoot form={form} onSubmit={() => {}}>
          <Fields />
          <Preview />
        </FormRoot>
      );
    }
    renderWithUi(<Harness />);
    await user.type(screen.getByRole("textbox", { name: "Name" }), "Bao");
    expect(screen.getByText("Xem trước: Bao")).toBeInTheDocument();
  });

  it("useFormWatch reads through the adapter on the server-driven path", async () => {
    const user = userEvent.setup();
    function Preview() {
      return <p>{`Xem trước: ${String(useFormWatch("name") ?? "")}`}</p>;
    }
    function Harness() {
      const [data, setData] = useState<Record<string, string>>({ name: "" });
      const adapter: FormStateAdapter = {
        getValue: (name) => data[name],
        setValue: (name, value) => setData((d) => ({ ...d, [name]: String(value) })),
        getError: () => undefined,
        isSubmitting: false,
      };
      return (
        <FormRoot adapter={adapter} onSubmit={() => {}}>
          <FormFieldControl name="name" label="Name">
            {(field) => (
              <Input {...field} value={typeof field.value === "string" ? field.value : ""} />
            )}
          </FormFieldControl>
          <Preview />
        </FormRoot>
      );
    }
    renderWithUi(<Harness />);
    await user.type(screen.getByRole("textbox", { name: "Name" }), "Bao");
    expect(screen.getByText("Xem trước: Bao")).toBeInTheDocument();
  });

  it("useFormInstance reaches the form without prop drilling", async () => {
    const user = userEvent.setup();
    function FillIn() {
      const form = useFormInstance<Values>();
      return (
        <Button type="button" onClick={() => form.setValue("name", "Từ context")}>
          Fill
        </Button>
      );
    }
    function Harness() {
      const form = useZodForm(schema, { defaultValues: { name: "", email: "" } });
      return (
        <FormRoot form={form} onSubmit={() => {}}>
          <Fields />
          <FillIn />
        </FormRoot>
      );
    }
    renderWithUi(<Harness />);
    await user.click(screen.getByRole("button", { name: "Fill" }));
    expect(screen.getByRole("textbox", { name: "Name" })).toHaveValue("Từ context");
  });
});
