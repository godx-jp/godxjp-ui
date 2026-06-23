import { describe, it } from "vitest";
import { Toolbar, ToolbarGroup } from "../filter-bar";
import { Input } from "../../data-entry/input";
import { Label } from "../../data-entry/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../data-entry/select";
import { expectNoA11yViolations } from "@/test/a11y";

// The filter bar is a role="toolbar" with grouped, labelled filter controls plus a
// clear-filters affordance. Every control must keep an accessible name.
describe("Toolbar (filter bar) a11y", () => {
  it("has no axe violations with realistic, labelled filter controls", async () => {
    await expectNoA11yViolations(
      <Toolbar onClear={() => {}} hasActiveFilters>
        <ToolbarGroup label="Tìm kiếm">
          <Label htmlFor="filter-q">Từ khóa</Label>
          <Input id="filter-q" placeholder="Mã đơn, tên khách…" defaultValue="HAWB" />
        </ToolbarGroup>
        <ToolbarGroup label="Trạng thái">
          <Select defaultValue="pending">
            <SelectTrigger aria-label="Trạng thái">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Chờ xử lý</SelectItem>
              <SelectItem value="shipped">Đã gửi</SelectItem>
              <SelectItem value="done">Hoàn tất</SelectItem>
            </SelectContent>
          </Select>
        </ToolbarGroup>
      </Toolbar>,
    );
  });
});
