import * as React from "react";
import { describe, it, expect } from "vitest";

import { renderWithUi, screen, userEvent, fireEvent } from "@/test/render";
import {
  OverlayBackground,
  expectHiddenBackgroundNotTabbable,
  hiddenBackgroundCount,
} from "@/test/overlay-background";

import { Popover, PopoverContent, PopoverTrigger } from "../data-display/popover";
import { DatePicker } from "../data-entry/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../data-entry/select";
import { SearchSelect } from "../data-entry/search-select";
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "../feedback/dialog";
import { Sheet, SheetBody, SheetContent, SheetHeader, SheetTrigger } from "../feedback/sheet";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../navigation/context-menu";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "../navigation/menubar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../navigation/dropdown-menu";
import { Button } from "../general/button";

/**
 * `aria-hidden-focus` on `.app-root` when an overlay is open.
 *
 * This suite exists because the per-component a11y tests CANNOT reach this class of bug. They
 * mount one overlay on its own; the violation only forms when there is an application around it
 * for Radix to hide (`hideOthers` stamps `aria-hidden="true"` up the sibling chain) while that
 * application still holds tabbable content. So every case here renders the overlay inside a real
 * `AppShell` background, opens it the way a user would, and checks the same condition axe checks.
 *
 * `it.each` on purpose: the risk is shared by every overlay in the library, so the next one that
 * is added gets a row here rather than its own bespoke test.
 *
 * WHICH OVERLAYS HIDE THE BACKGROUND AT ALL (verified in real Chromium at /frame — see the issue
 * thread for the numbers). Two backings are live at once while the Radix→react-aria migration is
 * in flight, and they hide by DIFFERENT means; `hiddenBackgroundCount` asks about the result
 * rather than the attribute, and the reasoning behind that is on `neutralisedBackground` in
 * `src/test/overlay-background.tsx`.
 *
 *   RADIX-BACKED (`hideOthers` → `aria-hidden` + `data-aria-hidden`, `inert` mirrored on top by
 *   `components/general/inert-background.ts`):
 *   • Select ......... always modal — `hideOthers` unconditionally. role="listbox" → NOT exempt,
 *                      so the `inert` mirror is what keeps axe quiet. This is the row that goes
 *                      red first if that mirror regresses.
 *   • ContextMenu .... `modal` defaults TRUE. role="menu" → NOT exempt. Same.
 *   • Menubar ........ Radix hard-codes `modal: false` → nothing is hidden.
 *
 *   REACT-ARIA-BACKED (`ariaHideOutside(…, { shouldUseInert: true })` → `inert` in a browser, a
 *   bare `aria-hidden="true"` in jsdom, which has no `inert` at all):
 *   • DropdownMenu ... modal by default → the background IS hidden. Its surface is a RAC
 *                      `Popover`, and RAC gives a modal Popover `role="dialog"` of its own
 *                      accord — so unlike the Radix menu this one now lands inside axe's
 *                      `isModalOpen` exemption as well as being `inert`.
 *   • Dialog/Sheet ... modal, role="dialog" + a full-bleed scrim, which is exactly what axe's
 *                      `isModalOpen` probe looks for → exempt.
 *   • Popover ........ non-modal → nothing is hidden at all. SearchSelect and DatePicker are
 *                      built on Popover and inherit that.
 */

type OverlayCase = {
  name: string;
  /** Does Radix hide the background for this overlay at its DEFAULT props? */
  hidesBackground: boolean;
  render: () => React.ReactElement;
  open: () => Promise<void>;
  /**
   * Resolves once the overlay is REALLY on screen. A case that silently failed to open would
   * assert nothing at all, so every row has to prove it opened before the guard runs.
   */
  assertOpen: () => Promise<unknown>;
};

const CASES: OverlayCase[] = [
  {
    name: "popover",
    assertOpen: () => screen.findByText("Lọc nâng cao"),
    hidesBackground: false,
    render: () => (
      <Popover>
        <PopoverTrigger asChild>
          <Button type="button">Bộ lọc</Button>
        </PopoverTrigger>
        <PopoverContent>
          <p>Lọc nâng cao</p>
          <Button type="button">Áp dụng</Button>
        </PopoverContent>
      </Popover>
    ),
    open: async () => userEvent.click(screen.getByRole("button", { name: "Bộ lọc" })),
  },
  {
    name: "select",
    assertOpen: () => screen.findByText("Hà Nội"),
    hidesBackground: true,
    render: () => (
      <Select>
        <SelectTrigger aria-label="Chi nhánh">
          <SelectValue placeholder="Chọn chi nhánh" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="hn">Hà Nội</SelectItem>
          <SelectItem value="hcm">Hồ Chí Minh</SelectItem>
        </SelectContent>
      </Select>
    ),
    open: async () => userEvent.click(screen.getByRole("combobox", { name: "Chi nhánh" })),
  },
  {
    name: "search-select",
    assertOpen: () => screen.findByText("Hà Nội"),
    hidesBackground: false,
    render: () => (
      <SearchSelect
        aria-label="Chi nhánh"
        options={[
          { value: "hn", label: "Hà Nội" },
          { value: "hcm", label: "Hồ Chí Minh" },
        ]}
      />
    ),
    open: async () => userEvent.click(screen.getByRole("combobox", { name: "Chi nhánh" })),
  },
  {
    name: "date-picker",
    assertOpen: () => screen.findByRole("grid"),
    hidesBackground: false,
    render: () => <DatePicker aria-label="Ngày bắt đầu" />,
    open: async () => userEvent.click(screen.getByRole("button", { name: /calendar|lịch/i })),
  },
  {
    name: "dialog",
    assertOpen: () => screen.findByText("Xác nhận xoá"),
    hidesBackground: true,
    render: () => (
      <Dialog>
        <DialogTrigger asChild>
          <Button type="button">Xoá</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader title="Xác nhận xoá" />
          <Button type="button">Đồng ý</Button>
        </DialogContent>
      </Dialog>
    ),
    open: async () => userEvent.click(screen.getByRole("button", { name: "Xoá" })),
  },
  {
    name: "sheet",
    assertOpen: () => screen.findByText("Bộ lọc nâng cao"),
    hidesBackground: true,
    render: () => (
      <Sheet>
        <SheetTrigger asChild>
          <Button type="button">Mở ngăn</Button>
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader title="Bộ lọc nâng cao" />
          <SheetBody>
            <Button type="button">Áp dụng</Button>
          </SheetBody>
        </SheetContent>
      </Sheet>
    ),
    open: async () => userEvent.click(screen.getByRole("button", { name: "Mở ngăn" })),
  },
  {
    name: "dropdown-menu",
    assertOpen: () => screen.findByText("Đổi tên"),
    hidesBackground: true,
    render: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button">Thao tác</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Đổi tên</DropdownMenuItem>
          <DropdownMenuItem>Xoá</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    open: async () => userEvent.click(screen.getByRole("button", { name: "Thao tác" })),
  },
  {
    name: "menubar",
    assertOpen: () => screen.findByText("Lưu"),
    // Radix hard-codes `modal: false` for menubar menus, so nothing is hidden and no guard is
    // needed. The row stays so a Radix change is caught rather than discovered in a consumer.
    hidesBackground: false,
    render: () => (
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>Tệp</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Lưu</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    ),
    open: async () => userEvent.click(screen.getByRole("menuitem", { name: "Tệp" })),
  },
  {
    name: "context-menu",
    assertOpen: () => screen.findByText("Sao chép"),
    hidesBackground: true,
    render: () => (
      <ContextMenu>
        <ContextMenuTrigger>Vùng nội dung</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Sao chép</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    ),
    open: async () => {
      fireEvent.contextMenu(screen.getByText("Vùng nội dung"));
    },
  },
];

describe("overlay over a real app background — axe aria-hidden-focus (#352)", () => {
  it.each(CASES)("$name: hidden background is never left tabbable", async (c) => {
    renderWithUi(<OverlayBackground>{c.render()}</OverlayBackground>);
    await c.open();
    await c.assertOpen();
    expectHiddenBackgroundNotTabbable();
  });

  it.each(CASES)("$name: the hiding behaviour is the one we reasoned about", async (c) => {
    renderWithUi(<OverlayBackground>{c.render()}</OverlayBackground>);
    await c.open();
    await c.assertOpen();
    // Pins the modality defaults the fix is scoped against: the day a Radix upgrade, a react-aria
    // upgrade or a DS change starts hiding the background for an overlay that did not — or stops
    // hiding it for one that did — this row goes red and the row above stops being vacuous.
    expect(hiddenBackgroundCount() > 0).toBe(c.hidesBackground);
  });
});
