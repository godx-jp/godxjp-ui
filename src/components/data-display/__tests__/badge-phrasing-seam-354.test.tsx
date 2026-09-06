import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";

import { Badge } from "../badge";
import { Tabs, TabsList, TabsTrigger } from "../../navigation/tabs";

const badgeEl = (label: string) =>
  screen.getByText(label).closest('[data-slot="badge"]') as HTMLElement;

// Badge always rendered a <div>, so a count chip inside a TabsTrigger (a <button>, whose
// content model is phrasing content only) was invalid HTML with no legal alternative.
describe("Badge — `as` tag seam", () => {
  it("renders a <div> by default", () => {
    renderWithUi(<Badge>既定</Badge>);
    expect(badgeEl("既定").tagName).toBe("DIV");
  });

  it('as="span" swaps the tag and keeps the chip contract', () => {
    renderWithUi(
      <Badge as="span" tone="neutral" shape="pill">
        12
      </Badge>,
    );
    const el = badgeEl("12");
    expect(el.tagName).toBe("SPAN");
    expect(el.dataset.tone).toBe("neutral");
    expect(el.dataset.shape).toBe("pill");
    expect(el.querySelector('[data-slot="badge-label"]')).not.toBeNull();
  });

  it("keeps a TabsTrigger's <button> free of flow content", () => {
    const { container } = renderWithUi(
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            <span>未承認</span>
            <Badge as="span" tone="neutral" shape="pill">
              7
            </Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>,
    );
    const trigger = container.querySelector("button") as HTMLElement;
    expect(trigger.querySelector('[data-slot="badge"]')).not.toBeNull();
    expect(trigger.querySelector("div")).toBeNull();
  });
});
