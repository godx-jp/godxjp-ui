import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";
import { Select } from "../select";
import { EditorialToolbar } from "../../layout/editorial-account";
import { Flex } from "../../layout/flex";
const options = [
  { value: "all", label: "All areas" },
  { value: "delivery", label: "Delivery" },
  ...Array.from({ length: 47 }, (_, i) => ({
    value: String(i + 1).padStart(2, "0"),
    label: i === 12 ? "Tokyo" : "Area " + (i + 1),
  })),
];
describe("controlled area picker #1483", () => {
  for (const keyboard of [false, true])
    it(`keeps typing focused then selects once by ${keyboard ? "keyboard" : "pointer"}`, async () => {
      const change = vi.fn();
      function Area() {
        const [value, setValue] = React.useState("all");
        return (
          <EditorialToolbar
            start={
              <Flex>
                <Select
                  width="auto"
                  showSearch
                  aria-label="Area"
                  value={value}
                  onValueChange={(v) => {
                    change(v);
                    setValue(v);
                  }}
                  options={options}
                />
              </Flex>
            }
          />
        );
      }
      const user = userEvent.setup();
      renderWithUi(<Area />);
      const trigger = screen.getByRole("combobox", { name: "Area" });
      await user.click(trigger);
      const input = document.querySelector(".ui-search-select-panel input") as HTMLInputElement;
      await user.type(input, "Tokyo");
      expect(input).toHaveValue("Tokyo");
      expect(input).toHaveFocus();
      expect(screen.getByRole("option", { name: "Tokyo" })).toBeVisible();
      if (keyboard) await user.keyboard("{ArrowDown}{Enter}");
      else await user.click(screen.getByRole("option", { name: "Tokyo" }));
      expect(change).toHaveBeenCalledExactlyOnceWith("13");
      expect(trigger).toHaveTextContent("Tokyo");
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      await user.click(trigger);
      expect(document.querySelector(".ui-search-select-panel input")).toHaveValue("");
    });
});
