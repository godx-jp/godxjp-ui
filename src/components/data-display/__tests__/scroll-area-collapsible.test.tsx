import { describe, expect, it } from "vitest";
import * as React from "react";
import { renderWithUi, screen, userEvent } from "@/test/render";
import { Button } from "../../general/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../collapsible";
import { ScrollArea } from "../scroll-area";

describe("ScrollArea", () => {
  it("renders scrollable content", () => {
    renderWithUi(
      <ScrollArea className="h-24 w-48">
        <div>
          {Array.from({ length: 20 }, (_, i) => (
            <p key={i}>Dòng {i + 1}</p>
          ))}
        </div>
      </ScrollArea>,
    );
    expect(screen.getByText("Dòng 1")).toBeInTheDocument();
    expect(screen.getByText("Dòng 20")).toBeInTheDocument();
  });
});

describe("Collapsible", () => {
  it("toggles content visibility", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button type="button">Mở rộng</Button>
        </CollapsibleTrigger>
        <CollapsibleContent>Chi tiết lô hàng GX-001</CollapsibleContent>
      </Collapsible>,
    );

    expect(screen.queryByText("Chi tiết lô hàng GX-001")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Mở rộng" }));
    expect(screen.getByText("Chi tiết lô hàng GX-001")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Mở rộng" }));
    expect(screen.queryByText("Chi tiết lô hàng GX-001")).not.toBeInTheDocument();
  });

  it("supports controlled open state", async () => {
    const user = userEvent.setup();
    function Demo() {
      const [open, setOpen] = React.useState(false);
      return (
        <>
          <Button type="button" onClick={() => setOpen(true)}>
            Mở ngoài
          </Button>
          <Collapsible open={open} onOpenChange={setOpen}>
            <CollapsibleTrigger asChild>
              <Button type="button">Trigger</Button>
            </CollapsibleTrigger>
            <CollapsibleContent>Nội dung controlled</CollapsibleContent>
          </Collapsible>
        </>
      );
    }

    renderWithUi(<Demo />);
    await user.click(screen.getByRole("button", { name: "Mở ngoài" }));
    expect(screen.getByText("Nội dung controlled")).toBeInTheDocument();
  });
});
