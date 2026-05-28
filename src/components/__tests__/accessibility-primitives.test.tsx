import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";
import { Checkbox } from "../data-entry/checkbox";
import { Command, CommandInput } from "../data-entry/command";
import { Radio } from "../data-entry/radio";
import { Select, SelectTrigger, SelectValue } from "../data-entry/select";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../feedback/dialog";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "../feedback/sheet";

function expectDecorativeIconsHidden(container: HTMLElement) {
  container.querySelectorAll("svg").forEach((icon) => {
    expect(icon).toHaveAttribute("aria-hidden", "true");
  });
}

describe("primitive accessibility", () => {
  it("hides decorative icons from accessibility tree", () => {
    const { baseElement } = renderWithUi(
      <>
        <Select>
          <SelectTrigger aria-label="Hub">
            <SelectValue placeholder="Hub" />
          </SelectTrigger>
        </Select>
        <Checkbox defaultChecked aria-label="Accept" />
        <Radio.Root defaultValue="air">
          <Radio.Item value="air" aria-label="Air" />
        </Radio.Root>
        <Command>
          <CommandInput aria-label="Search" />
        </Command>
      </>,
    );

    expectDecorativeIconsHidden(baseElement);
  });

  it("keeps dialog close button named while hiding close icon", () => {
    const { baseElement } = renderWithUi(
      <Dialog open onOpenChange={() => undefined}>
        <DialogContent>
          <DialogTitle>Dialog title</DialogTitle>
          <DialogDescription>Dialog description</DialogDescription>
        </DialogContent>
      </Dialog>,
    );

    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
    expectDecorativeIconsHidden(baseElement);
  });

  it("keeps sheet close button named while hiding close icon", () => {
    const { baseElement } = renderWithUi(
      <Sheet open onOpenChange={() => undefined}>
        <SheetContent>
          <SheetTitle>Sheet title</SheetTitle>
          <SheetDescription>Sheet description</SheetDescription>
        </SheetContent>
      </Sheet>,
    );

    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
    expectDecorativeIconsHidden(baseElement);
  });
});
