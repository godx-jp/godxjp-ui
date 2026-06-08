import { Star } from "lucide-react";
import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";

import { Badge } from "../badge";

const badgeEl = (label: string) =>
  screen.getByText(label).closest('[data-slot="badge"]') as HTMLElement;

describe("Badge — explicit icon", () => {
  it("renders an explicitly provided icon (icon !== undefined branch)", () => {
    renderWithUi(<Badge icon={Star}>新着</Badge>);
    expect(badgeEl("新着").querySelector("svg")).not.toBeNull();
  });

  it("renders no icon by default when there is no status", () => {
    renderWithUi(<Badge>通常</Badge>);
    expect(badgeEl("通常").querySelector("svg")).toBeNull();
  });
});
