import { beforeAll, describe, expect, it } from "vitest";
import "@testing-library/jest-dom/vitest";
import { renderWithUi, screen, userEvent, waitFor } from "@/test/render";

import { registerDocsMessages } from "../../../preview/src/docs-messages";
import { DependentLocationFields } from "../form-dependent-selects";

/**
 * gh#1252 — the dependent-selects COMPOSITION PATTERN (docs/showcase/form-dependent-selects.tsx).
 * This drives the page's own fields, not a copy of them: a child Select stays disabled until its
 * parent's onValueChange, its FormField helper says why, and a parent change clears the child.
 * `renderWithUi` renders in `vi`, so the helper is asserted in the docs catalogue's vi copy.
 */
beforeAll(() => {
  registerDocsMessages();
});

/**
 * The trigger for a field, looked up FRESH every time: Select wraps its trigger while `loading`,
 * so a node captured before the options arrive is detached afterwards. react-aria also renders a
 * hidden native <select> (implicit role combobox) per field; the trigger is the button.
 */
function trigger(field: "country" | "region" | "city") {
  const el = document.getElementById(`t-${field}`);
  if (!(el instanceof HTMLButtonElement)) throw new Error(`no trigger for ${field}`);
  return el;
}

const regionName = (code: string) => new Intl.DisplayNames(["vi"], { type: "region" }).of(code)!;

async function pick(user: ReturnType<typeof userEvent.setup>, field: "country", name: string) {
  await user.click(trigger(field));
  await user.click(await screen.findByRole("option", { name }));
}

describe("dependent selects (gh#1252)", () => {
  it("keeps state and city disabled, with a reason, until the parent has a value", async () => {
    const user = userEvent.setup();
    renderWithUi(<DependentLocationFields idPrefix="t" fetchDelay={0} />);

    expect(trigger("country")).toBeEnabled();
    expect(trigger("region")).toBeDisabled();
    expect(trigger("city")).toBeDisabled();
    expect(screen.getByText("Hãy chọn quốc gia trước")).toBeInTheDocument();
    expect(screen.getByText("Hãy chọn tỉnh / bang trước")).toBeInTheDocument();

    // Country names come from Intl.DisplayNames in the render locale (vi).
    await pick(user, "country", regionName("JP"));

    // The parent's onValueChange is what unlocks the child (once its options arrive).
    await waitFor(() => {
      expect(trigger("region")).toBeEnabled();
    });
    expect(screen.queryByText("Hãy chọn quốc gia trước")).not.toBeInTheDocument();
    expect(trigger("city")).toBeDisabled();
  });

  it("clears the child when the parent changes", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <DependentLocationFields
        idPrefix="t"
        fetchDelay={0}
        defaultValue={{ country: "JP", region: "JP-13", city: "shinjuku" }}
      />,
    );

    await waitFor(() => {
      expect(trigger("city")).toHaveTextContent("Shinjuku");
    });
    expect(trigger("region")).toHaveTextContent("Tokyo");

    await pick(user, "country", regionName("US"));

    // Reset to "" — the placeholder, not the stale Tokyo / Shinjuku.
    await waitFor(() => {
      expect(trigger("region")).toBeEnabled();
    });
    expect(trigger("region")).not.toHaveTextContent("Tokyo");
    expect(trigger("city")).not.toHaveTextContent("Shinjuku");
    expect(trigger("city")).toBeDisabled();
    expect(screen.getByText("Hãy chọn tỉnh / bang trước")).toBeInTheDocument();
  });
});
