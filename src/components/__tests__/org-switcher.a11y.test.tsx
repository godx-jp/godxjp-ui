import { describe, it } from "vitest";
import { Check, ChevronsUpDown, Plus, TicketPlus } from "lucide-react";

import { expectNoA11yViolations } from "@/test/a11y";
import { Button, Text } from "../general";
import { Avatar, AvatarFallback } from "../data-display/avatar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../data-entry/command";

/**
 * a11y guard for the OrgSwitcher composition (docs/showcase/org-switcher.tsx, godxjp-ui#196).
 * The floating panel content is rendered INLINE (not through the Popover portal) so axe
 * scans the real list + footer surfaces, not just the trigger. The current org is marked
 * with a Check icon (aria-hidden) AND an sr-only status word — never colour-only.
 */
describe("OrgSwitcher a11y", () => {
  it("trigger exposes an accessible name announcing the current org", async () => {
    await expectNoA11yViolations(
      <Button
        type="button"
        variant="ghost"
        aria-label="Tổ chức hiện tại: Acme Holdings. Nhấn để đổi tổ chức"
      >
        <Avatar className="size-6 rounded">
          <AvatarFallback>A</AvatarFallback>
        </Avatar>
        <Text as="span" size="sm">
          Acme Holdings
        </Text>
        <ChevronsUpDown aria-hidden className="size-4" />
      </Button>,
    );
  });

  it("open panel (search + org list + footer actions) has no violations", async () => {
    await expectNoA11yViolations(
      <Command label="Chọn tổ chức">
        <CommandInput placeholder="Tìm tổ chức…" aria-label="Tìm tổ chức" />
        <CommandList>
          <CommandEmpty>Không tìm thấy tổ chức.</CommandEmpty>
          <CommandGroup heading="Tổ chức của bạn">
            <CommandItem value="Acme Holdings Admin">
              <Text as="span" size="sm">
                Acme Holdings
              </Text>
              <Check aria-hidden className="ms-auto size-4" />
              <span className="sr-only">(đang chọn)</span>
            </CommandItem>
            <CommandItem value="BlueWave Retail Member">
              <Text as="span" size="sm">
                BlueWave Retail
              </Text>
            </CommandItem>
          </CommandGroup>
        </CommandList>
        <div className="border-t p-1">
          <Button type="button" variant="ghost" size="sm">
            <Plus aria-hidden className="size-4" />
            Tạo tổ chức mới
          </Button>
          <Button type="button" variant="ghost" size="sm">
            <TicketPlus aria-hidden className="size-4" />
            Tham gia bằng mã mời
          </Button>
        </div>
      </Command>,
    );
  });
});
