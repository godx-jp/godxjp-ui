import { describe, expect, it, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";

import { Button } from "../../general/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "../dropdown-menu";

/**
 * A LABEL INSIDE A RADIO GROUP STARTS A NEW GROUP (gh#632).
 *
 * RAC's `MenuSection` takes a `Header` child as the SECTION'S accessible name and hides it with
 * `role="presentation"` so it is not read twice. Right for one heading at the top of a section,
 * actively wrong for a heading in the MIDDLE of a list. Measured before the fix:
 *
 *     section [role=group aria-labelledby=_r_5_]
 *       div   [role=menuitemradio] "Live"
 *       div   [id=_r_5_ role=presentation] "Archived"
 *       div   [role=menuitemradio] "Old"
 *
 * The group holding BOTH items became named "Archived". The reporter read it as "the heading is
 * dropped from the a11y tree"; it is worse than dropped — promoted to the name of a group it does
 * not describe, so a live project sat under a heading announcing it as archived, and the only
 * remaining difference from an archived one was text colour (WCAG 2.2 SC 1.4.1).
 *
 * Three fixes that do NOT work, each measured rather than assumed: an explicit `aria-label` on the
 * section (RAC still writes `aria-labelledby` at the header, which wins the accname algorithm);
 * forcing `aria-labelledby: undefined` (RAC puts it back); rendering the label as a plain element
 * (RAC's collection builder drops unknown nodes AND swallowed the item after it). Two `Header`s in
 * one section is not a way out either — both receive the SAME id, which is invalid HTML.
 */
const open = (ui: React.ReactElement) =>
  render(
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger asChild>
        <Button>open</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>{ui}</DropdownMenuContent>
    </DropdownMenu>,
  );

const groups = () => [...document.querySelectorAll('[role="group"]')];
const nameOf = (group: Element) => {
  const id = group.getAttribute("aria-labelledby");
  return id ? (document.getElementById(id)?.textContent ?? null) : null;
};

describe("DropdownMenuRadioGroup — a label names only what follows it", () => {
  const withMidLabel = (
    <DropdownMenuRadioGroup value="a">
      <DropdownMenuRadioItem value="a">Live</DropdownMenuRadioItem>
      <DropdownMenuLabel>Archived</DropdownMenuLabel>
      <DropdownMenuRadioItem value="b">Old</DropdownMenuRadioItem>
    </DropdownMenuRadioGroup>
  );

  it("splits into one group per heading", () => {
    open(withMidLabel);
    expect(groups()).toHaveLength(2);
  });

  it("never names a group after a heading that sits below some of its items", () => {
    open(withMidLabel);
    const named = groups().filter((g) => nameOf(g) === "Archived");
    expect(named).toHaveLength(1);
    // The group named "Archived" must not contain the live item.
    expect(named[0].textContent).not.toContain("Live");
    expect(named[0].textContent).toContain("Old");
  });

  it("leaves the items before the heading in an unnamed group", () => {
    open(withMidLabel);
    const live = screen.getByText("Live").closest('[role="group"]');
    expect(nameOf(live!)).toBeNull();
  });

  it("assigns no duplicate ids — two Headers in one section share one, which is invalid HTML", () => {
    open(
      <DropdownMenuRadioGroup value="a">
        <DropdownMenuLabel>Top</DropdownMenuLabel>
        <DropdownMenuRadioItem value="a">Live</DropdownMenuRadioItem>
        <DropdownMenuLabel>Archived</DropdownMenuLabel>
        <DropdownMenuRadioItem value="b">Old</DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>,
    );
    const ids = [...document.querySelectorAll("[id]")].map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps selection working ACROSS the split — the item is the key, not the section", () => {
    const onValueChange = vi.fn();
    open(
      <DropdownMenuRadioGroup value="a" onValueChange={onValueChange}>
        <DropdownMenuRadioItem value="a">Live</DropdownMenuRadioItem>
        <DropdownMenuLabel>Archived</DropdownMenuLabel>
        <DropdownMenuRadioItem value="b">Old</DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>,
    );
    fireEvent.click(screen.getByText("Old"));
    expect(onValueChange).toHaveBeenCalledWith("b");
  });

  it("drops no item — the plain-element attempt lost the one after the label", () => {
    open(withMidLabel);
    expect(screen.getByText("Live")).toBeInTheDocument();
    expect(screen.getByText("Old")).toBeInTheDocument();
    expect(screen.getByText("Archived")).toBeInTheDocument();
    expect(document.querySelectorAll('[role="menuitemradio"]')).toHaveLength(2);
  });

  it("stays ONE group when there is no label — the shape that already worked", () => {
    open(
      <DropdownMenuRadioGroup value="a">
        <DropdownMenuRadioItem value="a">Live</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="b">Old</DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>,
    );
    expect(groups()).toHaveLength(1);
  });
});
