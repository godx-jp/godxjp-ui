import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { renderWithUi, screen, userEvent, waitFor, within } from "@/test/render";
import { expectNoA11yViolations } from "@/test/a11y";
import { FormRoot } from "../form-root";
import { FormFieldControl } from "../form-field-control";
import { FormFieldArray } from "../form-field-array";
import { useZodForm } from "../use-zod-form";
import { Input } from "../../components/data-entry/input";
import { Button } from "../../components/general/button";

const schema = z.object({
  contacts: z
    .array(z.object({ email: z.string().email("Email không hợp lệ") }))
    .min(1, "Cần ít nhất một liên hệ"),
});
type Values = z.infer<typeof schema>;

function ContactsForm({
  onSubmit = () => {},
  initial = [{ email: "a@example.com" }],
}: {
  onSubmit?: (values: Values) => void;
  initial?: Values["contacts"];
}) {
  const form = useZodForm(schema, { defaultValues: { contacts: initial } });
  return (
    <FormRoot form={form} onSubmit={onSubmit}>
      <FormFieldArray<Values, "contacts"> name="contacts">
        {({ fields, append, remove, move, error }) => (
          <>
            {error ? <p role="alert">{error}</p> : null}
            {fields.map((row, position) => (
              <div key={row.key} data-testid={`row-${position}`}>
                <FormFieldControl<Values>
                  name={`${row.name}.email`}
                  label={`Email ${position + 1}`}
                >
                  {(field) => (
                    <Input {...field} value={typeof field.value === "string" ? field.value : ""} />
                  )}
                </FormFieldControl>
                <Button type="button" onClick={() => remove(row.index)}>
                  {`Remove ${position + 1}`}
                </Button>
              </div>
            ))}
            <Button type="button" onClick={() => append({ email: "" })}>
              Add
            </Button>
            <Button type="button" onClick={() => move(0, 1)}>
              Move first down
            </Button>
          </>
        )}
      </FormFieldArray>
      <Button type="submit">Submit</Button>
    </FormRoot>
  );
}

describe("FormFieldArray — dynamic rows (antd Form.List parity)", () => {
  it("appends a row and submits both values in order", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithUi(<ContactsForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: "Add" }));
    await user.type(screen.getByRole("textbox", { name: "Email 2" }), "b@example.com");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        contacts: [{ email: "a@example.com" }, { email: "b@example.com" }],
      });
    });
  });

  it("removes the right row by index, not by position in the DOM", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithUi(
      <ContactsForm
        onSubmit={onSubmit}
        initial={[{ email: "a@example.com" }, { email: "b@example.com" }]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Remove 1" }));
    expect(screen.queryByDisplayValue("a@example.com")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ contacts: [{ email: "b@example.com" }] });
    });
  });

  it("move reorders the submitted values", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithUi(
      <ContactsForm
        onSubmit={onSubmit}
        initial={[{ email: "a@example.com" }, { email: "b@example.com" }]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Move first down" }));
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        contacts: [{ email: "b@example.com" }, { email: "a@example.com" }],
      });
    });
  });

  it("surfaces a row-level Zod error on that row only", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithUi(
      <ContactsForm
        onSubmit={onSubmit}
        initial={[{ email: "a@example.com" }, { email: "not-an-email" }]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(screen.getByText("Email không hợp lệ")).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
    expect(within(screen.getByTestId("row-0")).queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Email 2" })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("surfaces the ARRAY-level error when every row is removed", async () => {
    const user = userEvent.setup();
    renderWithUi(<ContactsForm />);

    await user.click(screen.getByRole("button", { name: "Remove 1" }));
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(screen.getByText("Cần ít nhất một liên hệ")).toBeInTheDocument();
    });
  });

  it("has no axe violations", async () => {
    await expectNoA11yViolations(<ContactsForm />);
  });
});
