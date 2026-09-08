import { describe, expect, it, vi } from "vitest";
import * as React from "react";
import { renderWithUi, screen, userEvent } from "@/test/render";
import { Button } from "../../general/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "../popover";

describe("Popover", () => {
  it("shows content when trigger is clicked", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Popover>
        <PopoverTrigger asChild>
          <Button type="button">Mở popover</Button>
        </PopoverTrigger>
        <PopoverContent>Lọc HAWB nâng cao</PopoverContent>
      </Popover>,
    );
    await user.click(screen.getByRole("button", { name: "Mở popover" }));
    expect(screen.getByText("Lọc HAWB nâng cao")).toHaveAttribute("data-slot", "popover-content");
  });

  it("closes when pressing Escape", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Popover>
        <PopoverTrigger asChild>
          <Button type="button">Mở popover</Button>
        </PopoverTrigger>
        <PopoverContent>Lọc HAWB nâng cao</PopoverContent>
      </Popover>,
    );
    await user.click(screen.getByRole("button", { name: "Mở popover" }));
    expect(screen.getByText("Lọc HAWB nâng cao")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByText("Lọc HAWB nâng cao")).not.toBeInTheDocument();
  });

  it("calls onOpenChange in controlled mode", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    function Demo() {
      const [open, setOpen] = React.useState(false);
      return (
        <Popover
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            onOpenChange(next);
          }}
        >
          <PopoverTrigger asChild>
            <Button type="button">Controlled</Button>
          </PopoverTrigger>
          <PopoverContent>Panel</PopoverContent>
        </Popover>
      );
    }

    renderWithUi(<Demo />);
    await user.click(screen.getByRole("button", { name: "Controlled" }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.getByText("Panel")).toBeInTheDocument();
  });

  /*
   * The one public-contract divergence from the Radix build: Radix looped Tab back to the first
   * element inside a NON-trapped panel, so focus could never leave; on RAC, Tab walks on to the
   * next element after the trigger and the panel closes behind it. Reasoning, and why the loop is
   * not reproduced, live in the "Tab RA KHỎI panel" section of `../popover.tsx`. Pinned here, at
   * the primitive, because all five focus-taking consumers inherit it.
   */
  it("tabs out of a non-modal panel to the next element after the trigger, closing it", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <>
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button">Mở popover</Button>
          </PopoverTrigger>
          <PopoverContent>
            <Button type="button">Trong panel</Button>
          </PopoverContent>
        </Popover>
        <Button type="button">Sau trigger</Button>
      </>,
    );

    await user.click(screen.getByRole("button", { name: "Mở popover" }));
    expect(screen.getByRole("button", { name: "Trong panel" })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole("button", { name: "Sau trigger" })).toHaveFocus();
    expect(screen.queryByRole("button", { name: "Trong panel" })).not.toBeInTheDocument();
  });

  /*
   * With nothing tabbable after the trigger there is nowhere to go, and the panel stays open —
   * `relatedTarget` is null, which is also what leaving the window looks like, so react-aria
   * deliberately does not close on it. What is asserted is the part that holds regardless of where
   * the empty document parks focus (react-aria blurs to `<body>`, or hands it straight back to the
   * trigger when the trigger itself sits in another scope): focus is OUT of the panel. Radix's
   * `loop` would have kept it inside.
   */
  it("still lets focus out of the panel when the trigger is the last tabbable on the page", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Popover>
        <PopoverTrigger asChild>
          <Button type="button">Mở popover</Button>
        </PopoverTrigger>
        <PopoverContent>
          <Button type="button">Trong panel</Button>
        </PopoverContent>
      </Popover>,
    );

    await user.click(screen.getByRole("button", { name: "Mở popover" }));
    const inside = screen.getByRole("button", { name: "Trong panel" });
    expect(inside).toHaveFocus();

    await user.tab();
    expect(inside).toBeInTheDocument();
    expect(inside.closest('[data-slot="popover-content"]')).not.toContainElement(
      document.activeElement as HTMLElement,
    );
  });

  /*
   * `onCloseAutoFocus` is the Radix-shaped escape hatch for "focus does not belong on the trigger
   * after this closes" — an emoji picker hands it back to the composer, not to the button. It fires
   * on every close path; the DEFAULT restore is what `preventDefault()` cancels.
   */
  it("restores focus to the trigger on close, and lets onCloseAutoFocus redirect it", async () => {
    const user = userEvent.setup();

    function Demo({ redirect }: { redirect: boolean }) {
      const field = React.useRef<HTMLInputElement>(null);
      return (
        <>
          <input aria-label="Soạn tin" ref={field} />
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button">Mở popover</Button>
            </PopoverTrigger>
            <PopoverContent
              onCloseAutoFocus={
                redirect
                  ? (event) => {
                      event.preventDefault();
                      field.current?.focus();
                    }
                  : undefined
              }
            >
              <Button type="button">Trong panel</Button>
            </PopoverContent>
          </Popover>
        </>
      );
    }

    const { rerender } = renderWithUi(<Demo redirect={false} />);
    await user.click(screen.getByRole("button", { name: "Mở popover" }));
    await user.keyboard("{Escape}");
    expect(screen.getByRole("button", { name: "Mở popover" })).toHaveFocus();

    rerender(<Demo redirect />);
    await user.click(screen.getByRole("button", { name: "Mở popover" }));
    await user.keyboard("{Escape}");
    expect(screen.getByLabelText("Soạn tin")).toHaveFocus();
  });

  /*
   * The close that must NOT restore: Tab already moved focus somewhere on purpose, so pulling it
   * back to the trigger would be stealing it, not returning it.
   */
  it("leaves focus alone when the panel closes because focus tabbed out of it", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <>
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button">Mở popover</Button>
          </PopoverTrigger>
          <PopoverContent>
            <Button type="button">Trong panel</Button>
          </PopoverContent>
        </Popover>
        <Button type="button">Sau trigger</Button>
      </>,
    );

    await user.click(screen.getByRole("button", { name: "Mở popover" }));
    await user.tab();
    expect(screen.getByRole("button", { name: "Sau trigger" })).toHaveFocus();
  });

  it("renders shadcn header slots", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Popover>
        <PopoverTrigger asChild>
          <Button type="button">Details</Button>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverHeader>
            <PopoverTitle>Title</PopoverTitle>
            <PopoverDescription>Description</PopoverDescription>
          </PopoverHeader>
        </PopoverContent>
      </Popover>,
    );
    await user.click(screen.getByRole("button", { name: "Details" }));
    expect(screen.getByText("Title")).toHaveAttribute("data-slot", "popover-title");
    expect(screen.getByText("Description")).toHaveAttribute("data-slot", "popover-description");
  });
});
