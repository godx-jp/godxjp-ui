import { QueryClient, QueryClientProvider, useMutation } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { renderWithUi, screen, userEvent, waitFor } from "@/test/render";
import { FormRoot } from "../form-root";
import { FormFieldControl } from "../form-field-control";
import { useZodForm } from "../use-zod-form";
import { FormErrors } from "../../components/data-entry/form-errors";
import { Input } from "../../components/data-entry/input";
import { Button } from "../../components/general/button";
import { AlertMutationFeedback } from "../../components/query/mutation-feedback";
import type { FormRootProp } from "../../props/components/form.prop";
import type { ErrorBagProp } from "../../props/vocabulary";

// gh#698 — a server validation failure (400/422) whose messages the fields / FormErrors already
// show must render ONCE: no generic `submitFailed` banner from FormRoot on top of it. Every other
// rejection (5xx, network, unknown) — and a validation rejection that carries no message anywhere —
// still shows the banner, so an error is never silently swallowed.

const schema = z.object({ code: z.string() });
type Values = z.infer<typeof schema>;

/** The vi (test default locale) text of `dataEntry.form.submitFailed`. */
const BANNER = /Không thể gửi biểu mẫu/;
const FIELD_MESSAGE = "The code has already been taken.";

type ApiError = Error & { status: number; errors?: ErrorBagProp };
function apiError(status: number, message: string, errors?: ErrorBagProp): ApiError {
  return Object.assign(new Error(message), { status, errors });
}
/** The app's own mapper from its API error to the Laravel-style bag. */
const serverErrors = (error: unknown) => (error as ApiError | null)?.errors;

function Canonical({
  failure,
  submitFailedMessage,
}: {
  failure: ApiError;
  submitFailedMessage?: FormRootProp<Values>["submitFailedMessage"];
}) {
  const form = useZodForm(schema, { defaultValues: { code: "A-1" } });
  const m = useMutation({
    mutationFn: async (_values: Values) => {
      throw failure;
    },
  });
  return (
    <FormRoot
      form={form}
      onSubmit={(values) => m.mutateAsync(values)}
      errors={serverErrors(m.error)}
      submitFailedMessage={submitFailedMessage}
    >
      <FormErrors />
      <AlertMutationFeedback mutation={m} />
      <FormFieldControl<Values> name="code" label="Code">
        {(field) => <Input {...field} value={String(field.value ?? "")} />}
      </FormFieldControl>
      <Button type="submit">Save</Button>
      <Button type="button" onClick={() => m.reset()}>
        Clear
      </Button>
    </FormRoot>
  );
}

async function submit(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  // Record every banner that is ever committed, not just the settled DOM — a banner that flashes
  // for one frame is still announced by `role="alert"`.
  let bannerEverShown = false;
  const observer = new MutationObserver(() => {
    if (BANNER.test(document.body.textContent ?? "")) bannerEverShown = true;
  });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  const user = userEvent.setup();
  renderWithUi(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
  await user.click(screen.getByRole("button", { name: "Save" }));
  return {
    bannerEverShown: () => {
      observer.disconnect();
      return bannerEverShown;
    },
  };
}

describe("FormRoot submitFailed banner — server validation (gh#698)", () => {
  it("renders a 422 exactly once in the canonical FormRoot + FormErrors + AlertMutationFeedback composition", async () => {
    const failure = apiError(422, "The given data was invalid.", { code: [FIELD_MESSAGE] });
    const run = await submit(<Canonical failure={failure} />);

    await waitFor(() => expect(screen.getByText(FIELD_MESSAGE)).toBeInTheDocument());
    // Let every pending commit (mutation notify, rejection, re-render) land before asserting absence.
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(screen.getAllByText(FIELD_MESSAGE)).toHaveLength(1);
    expect(screen.queryByText(BANNER)).not.toBeInTheDocument();
    expect(screen.queryByText("The given data was invalid.")).not.toBeInTheDocument();
    expect(run.bannerEverShown()).toBe(false);
  });

  it("names an unclaimed key once in FormErrors and still shows no banner", async () => {
    const failure = apiError(422, "The given data was invalid.", {
      code: [FIELD_MESSAGE],
      parent_id: ["The selected parent is invalid."],
    });
    await submit(<Canonical failure={failure} />);

    await waitFor(() =>
      expect(screen.getByText("The selected parent is invalid.")).toBeInTheDocument(),
    );
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(screen.getAllByText(FIELD_MESSAGE)).toHaveLength(1);
    expect(screen.getAllByText("The selected parent is invalid.")).toHaveLength(1);
    expect(screen.queryByText(BANNER)).not.toBeInTheDocument();
  });

  it("keeps the banner hidden when the app clears the bag after it was shown", async () => {
    const user = userEvent.setup();
    const failure = apiError(422, "The given data was invalid.", { code: [FIELD_MESSAGE] });
    await submit(<Canonical failure={failure} />);
    await waitFor(() => expect(screen.getByText(FIELD_MESSAGE)).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Clear" }));
    await waitFor(() => expect(screen.queryByText(FIELD_MESSAGE)).not.toBeInTheDocument());
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(screen.queryByText(BANNER)).not.toBeInTheDocument();
  });

  it("shows the banner for a 500 rejection", async () => {
    await submit(<Canonical failure={apiError(500, "Server exploded")} />);
    await waitFor(() => expect(screen.getByText(BANNER)).toBeInTheDocument());
  });

  it("shows the banner for a validation rejection that carries no field message", async () => {
    await submit(<Canonical failure={apiError(422, "The given data was invalid.", {})} />);
    await waitFor(() => expect(screen.getByText(BANNER)).toBeInTheDocument());
  });

  it("never shows the banner with submitFailedMessage={false}", async () => {
    await submit(
      <Canonical failure={apiError(500, "Server exploded")} submitFailedMessage={false} />,
    );
    // AlertMutationFeedback still reports the 5xx — only FormRoot's own banner is opted out.
    await waitFor(() => expect(screen.getByText("Server exploded")).toBeInTheDocument());
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(screen.queryByText(BANNER)).not.toBeInTheDocument();
  });

  it("replaces the banner text with a submitFailedMessage node", async () => {
    await submit(
      <Canonical failure={apiError(500, "Server exploded")} submitFailedMessage="Saving failed." />,
    );
    await waitFor(() => expect(screen.getByText("Saving failed.")).toBeInTheDocument());
    expect(screen.queryByText(BANNER)).not.toBeInTheDocument();
  });
});
