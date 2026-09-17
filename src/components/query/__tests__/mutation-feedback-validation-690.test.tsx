import { useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";
import { FormRoot } from "../../../form/form-root";
import { AlertMutationFeedback } from "../mutation-feedback";
import type { AlertMutationFeedbackProp } from "../../../props/components/query.prop";
import type { ErrorBagProp } from "../../../props/vocabulary";

// gh#690 — a 422 validation bag handed to `FormRoot errors` is the form's to show on its fields.
// AlertMutationFeedback must not draw it a second time as a page-level alert inside that form.

function httpError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

const failed = (error: unknown): AlertMutationFeedbackProp["mutation"] => ({
  isError: true,
  error,
  isPending: false,
});

function InForm({ errors, ...feedback }: AlertMutationFeedbackProp & { errors?: ErrorBagProp }) {
  const form = useForm<{ code: string }>({ defaultValues: { code: "" } });
  return (
    <FormRoot form={form} onSubmit={() => undefined} errors={errors}>
      <AlertMutationFeedback {...feedback} />
    </FormRoot>
  );
}

const bag: ErrorBagProp = { code: ["The code has already been taken."] };
const invalid = httpError(422, "The given data was invalid.");

describe("AlertMutationFeedback — validation errors (gh#690)", () => {
  it("renders no alert for a 422 inside a FormRoot that received errors", () => {
    renderWithUi(<InForm mutation={failed(invalid)} errors={bag} />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByText(/given data was invalid/)).not.toBeInTheDocument();
  });

  it("still renders the alert for a 422 outside a form (unchanged default)", () => {
    renderWithUi(<AlertMutationFeedback mutation={failed(invalid)} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("still renders the alert for a 422 inside a FormRoot without errors", () => {
    renderWithUi(<InForm mutation={failed(invalid)} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("renders the alert for a 500 inside a FormRoot that received errors", () => {
    renderWithUi(<InForm mutation={failed(httpError(500, "Server exploded"))} errors={bag} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("renders the alert for a 422 in the form when ignoreValidationErrors={false}", () => {
    renderWithUi(<InForm mutation={failed(invalid)} errors={bag} ignoreValidationErrors={false} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("skips a 422 outside a form when ignoreValidationErrors is set explicitly", () => {
    const { container } = renderWithUi(
      <AlertMutationFeedback mutation={failed(invalid)} ignoreValidationErrors />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
