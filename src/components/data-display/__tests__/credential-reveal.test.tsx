import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CredentialReveal } from "../credential-reveal";
import { expectNoA11yViolations } from "@/test/a11y";

const SECRET = "gxp_live_8Fh2kQ9wR7nZ1xV4bT6mL0cD";

function pick(container: HTMLElement, selector: string): HTMLElement {
  const el = container.querySelector<HTMLElement>(selector);
  if (!el) throw new Error(`element not found: ${selector}`);
  return el;
}

describe("CredentialReveal", () => {
  it("masks the secret by default and reveals it on the show/hide toggle", async () => {
    const user = userEvent.setup();
    const { container } = render(<CredentialReveal label="APIキー" secret={SECRET} />);
    const value = pick(container, '[data-slot="credential-reveal-secret"]');
    expect(value).toHaveAttribute("data-state", "masked");
    expect(value).not.toHaveTextContent(SECRET);

    const toggle = pick(container, "button[aria-pressed]");
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(value).toHaveAttribute("data-state", "revealed");
    expect(value).toHaveTextContent(SECRET);
  });

  it("copy writes the secret to the clipboard, fires onCopy, and confirms via button state + live region", async () => {
    const user = userEvent.setup();
    const onCopy = vi.fn();
    const { container } = render(<CredentialReveal label="k" secret={SECRET} onCopy={onCopy} />);
    const copyBtn = pick(container, "button[data-state]");
    expect(copyBtn).toHaveAttribute("data-state", "idle");
    const status = pick(container, '[data-slot="credential-reveal-status"]');
    expect(status).toBeEmptyDOMElement();

    await user.click(copyBtn);
    expect(await navigator.clipboard.readText()).toBe(SECRET);
    expect(onCopy).toHaveBeenCalledWith(SECRET);
    expect(copyBtn).toHaveAttribute("data-state", "copied");
    expect(status).not.toBeEmptyDOMElement();
  });

  it("controlled `revealed` stays masked and only reports intent via onRevealedChange", async () => {
    const user = userEvent.setup();
    const onRevealedChange = vi.fn();
    const { container } = render(
      <CredentialReveal
        label="k"
        secret={SECRET}
        revealed={false}
        onRevealedChange={onRevealedChange}
      />,
    );
    await user.click(pick(container, "button[aria-pressed]"));
    expect(onRevealedChange).toHaveBeenCalledWith(true);
    // Parent owns the state → the value remains masked until the parent flips `revealed`.
    expect(pick(container, '[data-slot="credential-reveal-secret"]')).toHaveAttribute(
      "data-state",
      "masked",
    );
  });

  it("re-masks when the secret changes (a fresh credential re-blurs)", async () => {
    const user = userEvent.setup();
    const { container, rerender } = render(<CredentialReveal label="k" secret="one-abc" />);
    await user.click(pick(container, "button[aria-pressed]"));
    expect(pick(container, '[data-slot="credential-reveal-secret"]')).toHaveAttribute(
      "data-state",
      "revealed",
    );
    rerender(<CredentialReveal label="k" secret="two-xyz" />);
    expect(pick(container, '[data-slot="credential-reveal-secret"]')).toHaveAttribute(
      "data-state",
      "masked",
    );
  });

  it("renders the acknowledge action only when onAcknowledge is provided and fires it", async () => {
    const user = userEvent.setup();
    const onAcknowledge = vi.fn();
    const { container, rerender } = render(<CredentialReveal label="k" secret={SECRET} />);
    expect(container.querySelector(".ui-credential-reveal-footer")).toBeNull();
    rerender(<CredentialReveal label="k" secret={SECRET} onAcknowledge={onAcknowledge} />);
    await user.click(pick(container, ".ui-credential-reveal-footer button"));
    expect(onAcknowledge).toHaveBeenCalledTimes(1);
  });

  it("shows the caution banner by default and suppresses it with warning={null}", () => {
    const { container, rerender } = render(<CredentialReveal label="k" secret={SECRET} />);
    expect(container.querySelector(".ui-credential-reveal-warning")).not.toBeNull();
    rerender(<CredentialReveal label="k" secret={SECRET} warning={null} />);
    expect(container.querySelector(".ui-credential-reveal-warning")).toBeNull();
  });

  it("offers the download action only when downloadable", () => {
    const { container, rerender } = render(<CredentialReveal label="k" secret={SECRET} />);
    expect(container.querySelectorAll(".ui-credential-reveal-actions button")).toHaveLength(2);
    rerender(<CredentialReveal label="k" secret={SECRET} downloadable />);
    expect(container.querySelectorAll(".ui-credential-reveal-actions button")).toHaveLength(3);
  });

  it("associates the secret with its label via aria-labelledby", () => {
    const { container } = render(<CredentialReveal label="APIキー" secret={SECRET} />);
    const value = pick(container, '[data-slot="credential-reveal-secret"]');
    const labelledby = value.getAttribute("aria-labelledby");
    expect(labelledby).toBeTruthy();
    expect(container.querySelector(`#${labelledby}`)).toHaveTextContent("APIキー");
  });

  it("has no axe violations", async () => {
    await expectNoA11yViolations(
      <CredentialReveal label="APIキー" secret={SECRET} downloadable onAcknowledge={() => {}} />,
    );
  });
});
