import { describe, expect, it, vi } from "vitest";
import { renderWithUi } from "@/test/render";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../dropdown-menu";

describe("DropdownMenu invalid children diagnostics", () => {
  it("names the fix for silently discarded DOM content, including fragments", () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      renderWithUi(
        <DropdownMenu>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <>
              <div>Notifications</div>
            </>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      expect(log.mock.calls.flat().join(" ")).toMatch(/Popover \+ ListRow/);
    } finally {
      log.mockRestore();
    }
  });
  it("allows item content and opaque components returning items", () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const Item = () => (
      <DropdownMenuItem>
        <span>Action</span>
      </DropdownMenuItem>
    );
    try {
      renderWithUi(
        <DropdownMenu>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <Item />
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      expect(log).not.toHaveBeenCalled();
    } finally {
      log.mockRestore();
    }
  });
});
