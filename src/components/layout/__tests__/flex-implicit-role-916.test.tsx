import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Flex } from "../flex";

/**
 * gh#916 — a label must not cost an element the role it already has.
 *
 * `as` is a closed union (`div | span | ul | ol | li`), so the elements with a role to lose are
 * exactly `ul`, `ol` and `li`. The first draft of this file tested `section` and `nav`; the
 * release's typecheck rejected them, which is how the fix learned its own scope.
 *
 * A named `Flex` defaults to `role="group"` because `FormField` lands its contract there: a range
 * from/to pair or a 年/月 combo is a group, and `group` is the WAI-ARIA container for exactly that.
 * The default was applied without looking at what `as` renders, so `<Flex as="ul" aria-label="…">`
 * had `group` written over the `list` role the `<ul>` already carries, and every `<li>` inside
 * became a `listitem` with no `list` to belong to — an ARIA error, and one a screen reader turns
 * into "5 items" going missing.
 *
 * Reported from a consumer's organisation list, where two e2e specs asserted a `list` and were
 * right to. Their stopgap was `role="list"` at the call site, which is the consumer paying for a
 * library default.
 *
 * BOTH DIRECTIONS ARE PINNED HERE ON PURPOSE. The obvious "simplification" of this fix is to drop
 * the `group` default altogether, and that silently breaks every composite field — so the `div`
 * case is asserted as loudly as the `ul` case.
 */
describe("a labelled Flex keeps the role its element already has (gh#916)", () => {
  it("leaves a <ul> as a list, and its children as its items", () => {
    render(
      <Flex as="ul" aria-label="組織">
        <li>Acme</li>
        <li>Globex</li>
      </Flex>,
    );

    const list = screen.getByRole("list", { name: "組織" });
    expect(list.tagName).toBe("UL");
    expect(list).not.toHaveAttribute("role");
    // The point of the bug: the items are only items if they are inside a list.
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("leaves a labelled <li> a listitem, not a group inside its list", () => {
    render(
      <ul aria-label="組織">
        <Flex as="li" aria-label="Acme">
          <span>Acme</span>
        </Flex>
      </ul>,
    );

    expect(screen.getByRole("listitem", { name: "Acme" }).tagName).toBe("LI");
    expect(screen.queryByRole("group")).toBeNull();
  });

  it("STILL defaults a named <div> to group — this is FormField's contract, not an accident", () => {
    render(
      <Flex aria-label="期間">
        <span>from</span>
        <span>to</span>
      </Flex>,
    );

    expect(screen.getByRole("group", { name: "期間" })).toBeInTheDocument();
  });

  it("still folds aria-errormessage into describedby on that group, and drops widget-only aria", () => {
    render(
      <Flex aria-label="期間" aria-errormessage="err" aria-required aria-invalid>
        <span>from</span>
      </Flex>,
    );

    const group = screen.getByRole("group", { name: "期間" });
    expect(group).toHaveAttribute("aria-describedby", expect.stringContaining("err"));
    expect(group).not.toHaveAttribute("aria-required");
    expect(group).not.toHaveAttribute("aria-invalid");
  });

  it("an explicit role still wins, on any element", () => {
    render(
      <Flex as="ul" role="tablist" aria-label="タブ">
        <li role="tab">one</li>
      </Flex>,
    );

    expect(screen.getByRole("tablist", { name: "タブ" }).tagName).toBe("UL");
  });

  it("an UNLABELLED element is untouched either way", () => {
    const { container } = render(
      <Flex as="ul">
        <li>Acme</li>
      </Flex>,
    );

    expect(container.querySelector("ul")).not.toHaveAttribute("role");
  });
});
