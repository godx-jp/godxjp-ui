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
    await user.hover(screen.getByText("ヘルプ"));
    await waitFor(() => expect(screen.getAllByText("詳しい説明").length).toBeGreaterThan(0));
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
