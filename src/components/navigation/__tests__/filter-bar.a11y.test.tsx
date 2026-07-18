import { describe, it } from "vitest";
import { X } from "lucide-react";
import { Toolbar, ToolbarGroup } from "../filter-bar";
import { Button } from "../../general/button";
import { Badge } from "../../data-display/badge";
import { Input } from "../../data-entry/input";
import { Label } from "../../data-entry/label";
import { SearchInput } from "../../data-entry/search-input";
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

  // #197 — sticky list-filter strip: SearchInput + Select slot + active-filter chips.
  // Each chip is a Badge label with a SIBLING remove Button (never nested inside the
  // Badge div) so every clear-one control keeps an accessible name and valid markup.
  it("has no axe violations as a sticky strip with active-filter chips", async () => {
    await expectNoA11yViolations(
      <Toolbar sticky onClear={() => {}} hasActiveFilters>
        <SearchInput
          aria-label="メンバーを検索"
          placeholder="氏名・メールで検索"
          defaultValue="田中"
        />
        <ToolbarGroup label="ステータス">
          <Select defaultValue="active">
            <SelectTrigger aria-label="ステータス">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">有効</SelectItem>
              <SelectItem value="invited">招待中</SelectItem>
              <SelectItem value="suspended">停止</SelectItem>
            </SelectContent>
          </Select>
        </ToolbarGroup>
        <ToolbarGroup label="適用中のフィルター">
          <span className="inline-flex items-center gap-1">
            <Badge variant="outline">検索: 田中</Badge>
            <Button variant="ghost" size="icon-sm" aria-label="検索フィルターを解除">
              <X aria-hidden="true" />
            </Button>
          </span>
          <span className="inline-flex items-center gap-1">
            <Badge tone="success" variant="outline">
              状態: 有効
            </Badge>
            <Button variant="ghost" size="icon-sm" aria-label="状態フィルターを解除">
              <X aria-hidden="true" />
            </Button>
          </span>
        </ToolbarGroup>
      </Toolbar>,
    );
  });
});
