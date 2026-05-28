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
