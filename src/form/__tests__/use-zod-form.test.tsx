import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { act, renderHook } from "@testing-library/react";
import { renderWithUi, screen, userEvent, waitFor } from "@/test/render";
import { useZodForm } from "../use-zod-form";
import { FormRoot } from "../form-root";
import { FormFieldControl } from "../form-field-control";
import { Input } from "../../components/data-entry/input";
import { Button } from "../../components/general/button";

const schema = z.object({
  email: z.string().email("Email không hợp lệ"),
  name: z.string().min(1, "Bắt buộc"),
});

function TestForm({ onSubmit }: { onSubmit: (v: z.infer<typeof schema>) => void }) {
  const form = useZodForm(schema, { defaultValues: { email: "", name: "" } });
  return (
    <FormRoot form={form} onSubmit={onSubmit}>
      <FormFieldControl name="name" label="Name" required>
        {(field) => <Input {...field} value={typeof field.value === "string" ? field.value : ""} />}
      </FormFieldControl>
      <FormFieldControl name="email" label="Email" required>
        {(field) => (
          <Input
            {...field}
            type="email"
            value={typeof field.value === "string" ? field.value : ""}
          />
        )}
      </FormFieldControl>
      <Button type="submit">Submit</Button>
    </FormRoot>
  );
}

describe("useZodForm + FormRoot + FormFieldControl", () => {
  it("useZodForm handleSubmit invokes callback with valid data", async () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useZodForm(schema, { defaultValues: { name: "", email: "" } }),
    );

    await act(async () => {
      result.current.setValue("name", "Bao");
      result.current.setValue("email", "dev@example.com");
      await result.current.handleSubmit(onSubmit)();
    });

    expect(onSubmit.mock.calls[0]?.[0]).toEqual({
      name: "Bao",
      email: "dev@example.com",
    });
  });

  it("blocks submit and shows Zod validation errors", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithUi(<TestForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(screen.getAllByRole("alert").length).toBeGreaterThan(0);
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("FormRoot submits with registered inputs after user typing", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    function SimpleForm() {
      const form = useZodForm(schema, { defaultValues: { name: "", email: "" } });
      const { register } = form;
      return (
        <FormRoot form={form} onSubmit={onSubmit}>
          <input aria-label="name" {...register("name")} />
          <input aria-label="email" type="email" {...register("email")} />
          <Button type="submit">Submit</Button>
        </FormRoot>
      );
    }

    renderWithUi(<SimpleForm />);
    await user.type(screen.getByLabelText("name"), "Bao");
    await user.type(screen.getByLabelText("email"), "dev@example.com");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: "Bao",
        email: "dev@example.com",
      });
    });
  });
});
