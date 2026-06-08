import { describe, expect, it } from "vitest";
import { renderWithUi } from "@/test/render";

import { ColorPicker } from "../color-picker";

describe("ColorPicker — hex input id", () => {
  it("derives the hex input id from the component id", () => {
    const { container } = renderWithUi(<ColorPicker id="brand" value="#ff0000" />);
    // showHexInput defaults to true → the hex Input gets `${id}-hex`
    expect(container.querySelector("#brand-hex")).not.toBeNull();
  });

  it("leaves the hex input id undefined when no id is given", () => {
    const { container } = renderWithUi(<ColorPicker value="#00ff00" />);
    expect(container.querySelector('[id$="-hex"]')).toBeNull();
  });
});
