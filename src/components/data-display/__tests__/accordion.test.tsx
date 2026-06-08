import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../accordion";
import { expectNoA11yViolations } from "@/test/a11y";

function Demo(props: { type?: "single" | "multiple"; collapsible?: boolean }) {
  const { type = "single", collapsible = true } = props;
  return (
    <Accordion type={type} collapsible={type === "single" ? collapsible : undefined}>
      <AccordionItem value="a">
        <AccordionTrigger>勘定科目</AccordionTrigger>
        <AccordionContent>売掛金の明細</AccordionContent>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionTrigger>税区分</AccordionTrigger>
        <AccordionContent>仮受消費税の明細</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

describe("Accordion", () => {
  it("renders triggers collapsed, then expands one on click", async () => {
    const user = userEvent.setup();
    const { getByRole } = render(<Demo />);
    const trigger = getByRole("button", { name: "勘定科目" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(getByRole("region", { name: "勘定科目" })).toBeInTheDocument();
  });

  it("single mode: opening one panel closes the other", async () => {
    const user = userEvent.setup();
    const { getByRole } = render(<Demo type="single" />);
    const first = getByRole("button", { name: "勘定科目" });
    const second = getByRole("button", { name: "税区分" });
    await user.click(first);
    await user.click(second);
    expect(first).toHaveAttribute("aria-expanded", "false");
    expect(second).toHaveAttribute("aria-expanded", "true");
  });

  it("single + collapsible: clicking the open trigger closes it", async () => {
    const user = userEvent.setup();
    const { getByRole } = render(<Demo type="single" collapsible />);
    const trigger = getByRole("button", { name: "勘定科目" });
    await user.click(trigger);
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("multiple mode: panels open independently", async () => {
    const user = userEvent.setup();
    const { getByRole } = render(<Demo type="multiple" />);
    const first = getByRole("button", { name: "勘定科目" });
    const second = getByRole("button", { name: "税区分" });
    await user.click(first);
    await user.click(second);
    expect(first).toHaveAttribute("aria-expanded", "true");
    expect(second).toHaveAttribute("aria-expanded", "true");
  });

  it("has no axe violations", async () => {
    await expectNoA11yViolations(<Demo />);
  });
});
