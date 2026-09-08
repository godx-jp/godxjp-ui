import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../tooltip";

describe("Tooltip", () => {
  it("reveals the content when controlled open", () => {
    render(
      <Tooltip open>
        <TooltipTrigger>?</TooltipTrigger>
        <TooltipContent>保存します</TooltipContent>
      </Tooltip>,
    );
    expect(screen.getByRole("tooltip")).toHaveTextContent("保存します");
  });

  it("keeps the content hidden when closed", () => {
    render(
      <Tooltip>
        <TooltipTrigger>?</TooltipTrigger>
        <TooltipContent>隠れたヒント</TooltipContent>
      </Tooltip>,
    );
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("opens on hover", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip delayDuration={0}>
        <TooltipTrigger>ヘルプ</TooltipTrigger>
        <TooltipContent>詳しい説明</TooltipContent>
      </Tooltip>,
    );
    const trigger = screen.getByText("ヘルプ");

    // The pointer has to TRAVEL to the trigger; it cannot teleport onto it.
    //
    // React Aria's useTooltipTrigger only counts a hover as real when
    // getInteractionModality() === "pointer", and modality flips to "pointer" only through the
    // document-level pointerdown/pointermove/pointerup listeners in useFocusVisible. A real mouse
    // emits a stream of pointermove on its way across the page, so that condition is always
    // already true by the time pointerenter fires. A bare user.hover() emits pointerenter BEFORE
    // pointermove (measured order: pointerover > pointerenter > mouseover > mouseenter >
    // pointermove > mousemove), so the first hover in a fresh document lands while modality is
    // still null and the tooltip stays shut.
    //
    // So drive the pointer over two stops — off the trigger, then onto it — which is the path a
    // mouse actually takes. This makes the simulation more faithful, not the assertion weaker.
    await user.pointer([{ target: document.body }, { target: trigger }]);

    await waitFor(() => expect(screen.getByRole("tooltip")).toHaveTextContent("詳しい説明"));
    // Hovering must also wire up the accessible description, not merely paint the text.
    expect(trigger).toHaveAttribute("aria-describedby", screen.getByRole("tooltip").id);
  });

  it("works under an explicit TooltipProvider", () => {
    render(
      <TooltipProvider delayDuration={0}>
        <Tooltip open>
          <TooltipTrigger>i</TooltipTrigger>
          <TooltipContent>プロバイダ内</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    expect(screen.getByRole("tooltip")).toHaveTextContent("プロバイダ内");
  });
});
