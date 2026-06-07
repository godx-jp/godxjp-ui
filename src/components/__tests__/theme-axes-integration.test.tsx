import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { Button } from "../general/button";
import { Input } from "../data-entry/input";
import { Textarea } from "../data-entry/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../data-entry/select";
import { Checkbox } from "../data-entry/checkbox";
import { Switch } from "../data-entry/switch";
import { Badge } from "../data-display/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../data-display/table";
import { Pagination } from "../navigation/pagination";
import { Calendar } from "../data-entry/calendar";
import { renderWithTheme } from "@/test/theme-test-utils";
import {
  controlMultilineClass,
  tableRowHeightClass,
  toneInfoClass,
  toneSuccessClass,
  toneWarningClass,
} from "@/lib/control-styles";

const componentsDir = join(dirname(fileURLToPath(import.meta.url)), "..");

function readComponent(relative: string): string {
  return readFileSync(join(componentsDir, relative), "utf8");
}

function statusBadgeRoot(label: string): HTMLElement {
  const text = screen.getByText(label);
  const root = text.closest('[data-slot="badge"]') as HTMLElement | null;
  expect(root).toBeTruthy();
  return root!;
}

describe("theme axes integration (render + class contracts)", () => {
  describe("density — ui-control on interactive primitives", () => {
    it("Button default size uses semantic button size class", () => {
      renderWithTheme(<Button>Save</Button>);
      expect(screen.getByRole("button", { name: "Save" })).toHaveClass("ui-button--default-size");
    });

    it("Input uses ui-control", () => {
      renderWithTheme(<Input aria-label="HAWB" />);
      expect(screen.getByRole("textbox", { name: "HAWB" })).toHaveClass("ui-control");
    });

    it("Textarea uses ui-control-multiline", () => {
      renderWithTheme(<Textarea aria-label="Notes" />);
      expect(screen.getByRole("textbox", { name: "Notes" })).toHaveClass("ui-control-multiline");
      expect(controlMultilineClass.split(" ")[0]).toBe("ui-control-multiline");
    });

    it("SelectTrigger uses ui-control flex layout", () => {
      renderWithTheme(
        <Select defaultValue="a">
          <SelectTrigger aria-label="Hub">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">A</SelectItem>
          </SelectContent>
        </Select>,
      );
      const trigger = screen.getByRole("combobox", { name: "Hub" });
      expect(trigger).toHaveClass("ui-control");
      expect(trigger.className).toContain("flex");
    });

    it.each(["compact", "default", "comfortable"] as const)(
      "renders Input under ui-density-%s",
      (density) => {
        renderWithTheme(<Input aria-label={`field-${density}`} />, { density });
        expect(screen.getByRole("textbox", { name: `field-${density}` })).toHaveClass("ui-control");
      },
    );
  });

  describe("semantic badges — token tone classes (no raw palette)", () => {
    it("Badge success variant uses success token", () => {
      renderWithTheme(<Badge tone="success">Cleared</Badge>);
      const el = screen.getByText("Cleared");
      expect(el.className).toContain("success");
      expect(el.className).not.toMatch(/green-/);
    });

    it("Badge pending uses warning token", () => {
      renderWithTheme(<Badge status="pending" />);
      const el = statusBadgeRoot("Chờ xử lý");
      expect(el.className).toContain("warning");
      expect(el.className).not.toMatch(/amber-/);
    });

    it("Badge scheduled uses info token", () => {
      renderWithTheme(<Badge status="scheduled" />);
      const el = statusBadgeRoot("Đã lên lịch");
      expect(el.className).toContain("info");
      expect(el.className).not.toMatch(/blue-/);
    });

    it("Badge active uses success token", () => {
      renderWithTheme(<Badge status="active" />);
      const el = statusBadgeRoot("Đang hoạt động");
      expect(el.className).toContain("success");
    });

    it("tone class constants match expected token names", () => {
      expect(toneSuccessClass).toContain("success");
      expect(toneWarningClass).toContain("warning");
      expect(toneInfoClass).toContain("info");
    });
  });

  describe("table density tokens", () => {
    it("TableHead references --table-row-height", () => {
      renderWithTheme(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>HAWB</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className={tableRowHeightClass}>
              <TableCell>GX-1</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      );
      expect(screen.getByRole("columnheader", { name: "HAWB" }).className).toContain(
        "var(--table-row-height)",
      );
    });
  });

  describe("primary brand — checkbox/switch", () => {
    it("Checkbox uses centralized semantic class", () => {
      renderWithTheme(<Checkbox defaultChecked aria-label="ok" />);
      expect(screen.getByRole("checkbox", { name: "ok" })).toHaveClass("ui-checkbox");
    });

    it("Switch uses centralized semantic class", () => {
      renderWithTheme(<Switch defaultChecked aria-label="notify" />);
      expect(screen.getByRole("switch", { name: "notify" })).toHaveClass("ui-switch");
    });
  });

  describe("Preview-equivalent theme globals on wrapper", () => {
    it("fontSize sm overrides ONLY --font-size-base (golden scale derives the rest)", () => {
      const { container } = renderWithTheme(<span>x</span>, { fontSize: "sm" });
      const root = container.firstElementChild as HTMLElement;
      expect(root.style.getPropertyValue("--font-size-base")).toBe("0.8125rem");
    });

    it("fontSize lg overrides ONLY --font-size-base", () => {
      const { container } = renderWithTheme(<span>x</span>, { fontSize: "lg" });
      const root = container.firstElementChild as HTMLElement;
      expect(root.style.getPropertyValue("--font-size-base")).toBe("1rem");
    });

    it("primaryColor logistics sets primary + accent + ring", () => {
      const { container } = renderWithTheme(<span>x</span>, { primaryColor: "logistics" });
      const root = container.firstElementChild as HTMLElement;
      expect(root.style.getPropertyValue("--primary")).toBe("173 80% 36%");
      expect(root.style.getPropertyValue("--accent")).toBe("173 80% 94%");
      expect(root.style.getPropertyValue("--ring")).toBe("173 80% 36%");
    });

    it.each(["brand", "crm", "partner", "slate"] as const)(
      "primaryColor %s sets matching accent foreground pair",
      (primaryColor) => {
        const { container } = renderWithTheme(<span>x</span>, { primaryColor });
        const root = container.firstElementChild as HTMLElement;
        const primary = root.style.getPropertyValue("--primary");
        const accent = root.style.getPropertyValue("--accent");
        expect(primary.length).toBeGreaterThan(0);
        expect(accent.length).toBeGreaterThan(0);
        expect(primary).not.toBe(accent);
      },
    );
  });

  describe("pagination + calendar avoid legacy hardcoded sizes", () => {
    it("pagination prev button uses the default control-height tier, not a hardcoded/sub-default size", () => {
      renderWithTheme(
        <Pagination value={2} total={100} pageSize={20} onValueChange={() => undefined} />,
      );
      const prev = screen.getByRole("button", { name: /trang trước/i });
      expect(prev.className).not.toMatch(/\bsize-8\b/);
      // Primitive must not bake in a sub-default size tier — it carries the
      // pagination-link class whose height resolves to var(--control-height).
      expect(prev).toHaveClass("ui-pagination-link");
      expect(prev.className).not.toMatch(/compact-icon/);
    });

    it("calendar day button uses var(--control-height)", () => {
      renderWithTheme(<Calendar mode="single" />);
      const dayButton = screen.getByRole("grid").querySelector("button");
      expect(dayButton?.className ?? "").toContain("var(--control-height)");
      expect(dayButton?.className ?? "").not.toMatch(/\bsize-9\b/);
    });
  });
});

describe("theme axes — control-styles import contracts", () => {
  const requiredImports: { file: string; exportName: string }[] = [
    { file: "data-entry/select.tsx", exportName: "controlTriggerClass" },
    { file: "data-entry/textarea.tsx", exportName: "controlMultilineClass" },
    { file: "data-entry/command.tsx", exportName: "controlIconLeadingClass" },
    { file: "data-entry/calendar.tsx", exportName: "controlIconSmClass" },
    { file: "data-entry/color-picker.tsx", exportName: "controlIconClass" },
    { file: "data-entry/upload.tsx", exportName: "controlIconClass" },
    { file: "data-display/badge.tsx", exportName: "toneSuccessClass" },
    { file: "data-display/table.tsx", exportName: "tableHeadHeightClass" },
    { file: "data-display/data-table.tsx", exportName: "tableRowHeightClass" },
    { file: "data-display/badge.tsx", exportName: "toneSuccessClass" },
    { file: "navigation/steps.tsx", exportName: "controlIconClass" },
    { file: "feedback/skeleton.tsx", exportName: "tableRowHeightClass" },
  ];

  it.each(requiredImports)(
    "$file imports $exportName from control-styles",
    ({ file, exportName }) => {
      const content = readComponent(file);
      expect(content, `${file} must import from control-styles`).toContain("control-styles");
      expect(content, `${file} must use ${exportName}`).toContain(exportName);
    },
  );
});
