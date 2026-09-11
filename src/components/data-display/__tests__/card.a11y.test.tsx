import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { CardTitle } from "../card";

// Cards are composition shells; the title must be a real heading and any
// actions must carry accessible names.
describe("Card a11y", () => {
  it("defaults to an h3 section heading and supports explicit levels", () => {
    // Default level is 3 (a card nested under an already-h2 section) per #169; a card sitting
    // directly under the page h1 opts up to level={2} to keep the outline gap-free.
    const { rerender } = render(<CardTitle>Primary section</CardTitle>);
    expect(screen.getByRole("heading", { level: 3, name: "Primary section" })).toBeInTheDocument();
    rerender(<CardTitle level={2}>Nested section</CardTitle>);
    expect(screen.getByRole("heading", { level: 2, name: "Nested section" })).toBeInTheDocument();
  });
});
