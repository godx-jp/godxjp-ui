/**
 * Showcase · OrgSwitcher — sidebar organization/tenant switcher (Slack/Linear pattern)
 *
 * Requested by dxs-platform (godxjp-ui#196) as a "first-class OrgSwitcher component".
 * GATE 0 — Framework-Component Test verdict: **COMPOSITION PATTERN**, not a framework
 * component. It owns NO new behaviour — search/keyboard/filtering come from `Command`
 * (cmdk), open/focus-trap/dismiss from `Popover`, the trigger from `Button` + `Avatar`.
 * It is fully expressible today from existing primitives + tokens (the issue itself asks
 * to "compose an interim from existing primitives"), its `current`/`organizations`/
 * `onSelect`/`footerActions` shape is screen-shaped, and `Sidebar` already ships the
 * `brand`/`product` + `onProductClick` slot designed to host exactly this. So it lives
 * here as a real, copy-pasteable recipe — NOT in `src/components/`.
 *
 * Composition map (OrgSwitcher block → @godxjp/ui primitive):
 *   sidebar-top card ........... Sidebar `brand` slot (renders above the nav scroll area)
 *   current-org trigger ........ Button(ghost) + Avatar(fallback initial) + Text(name/role)
 *   floating panel ............. Popover (open/close/focus-trap/Esc/outside-click)
 *   searchable org list ........ Command + CommandInput + CommandList + CommandItem
 *   current marker ............. Check icon + sr-only "(đang chọn)" (never colour-only)
 *   footer actions ............. Button(ghost) rows — "Tạo tổ chức" / "Tham gia bằng mã mời"
 *   app chrome ................. AppShell + Sidebar + Topbar + PageContainer
 *
 * a11y: trigger has an accessible name announcing the current org; the list is cmdk's
 * combobox→listbox with `role=option`; the active org carries a visible Check AND an
 * sr-only status word; every icon is `aria-hidden`; footer actions are siblings of the
 * list (no nested interactive controls). RTL-safe: logical spacing only (`ps-/pe-/ms-/
 * text-start`); `border-t`/`p-*` are direction-neutral.
 */
import * as React from "react";
import {
  Boxes,
  Check,
  ChevronsUpDown,
  LayoutDashboard,
  Plus,
  Settings,
  Shield,
  TicketPlus,
  Users,
} from "lucide-react";

import { Button, Heading, Text } from "@godxjp/ui/general";
import {
  AppShell,
  Flex,
  PageContainer,
  Sidebar,
  type SidebarSectionProp,
  Topbar,
} from "@godxjp/ui/layout";
import {
  Avatar,
  AvatarFallback,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@godxjp/ui/data-display";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@godxjp/ui/data-entry";

type Org = { id: string; name: string; role: string };

const ORGS: Org[] = [
  { id: "acme-hq", name: "Acme Holdings", role: "Quản trị viên" },
  { id: "acme-jp", name: "Acme Japan K.K.", role: "Quản lý chi nhánh" },
  { id: "acme-logi", name: "Acme Logistics", role: "Điều phối" },
  { id: "bluewave", name: "BlueWave Retail", role: "Thành viên" },
  { id: "northwind", name: "Northwind Trading", role: "Kế toán" },
];

/** First grapheme of the org name, upper-cased — a stable, emoji-free monogram. */
function monogram(name: string): string {
  return Array.from(name.trim())[0]?.toUpperCase() ?? "?";
}

type OrgSwitcherProps = {
  organizations: Org[];
  currentId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onJoin: () => void;
};

/**
 * OrgSwitcher — the reusable recipe. A `Popover` whose trigger is the current-org card
 * and whose panel is a searchable `Command` list of orgs plus create/join footer actions.
 * Copy this function into a consumer app; every import is a real `@godxjp/ui` primitive.
 */
function OrgSwitcher({ organizations, currentId, onSelect, onCreate, onJoin }: OrgSwitcherProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const current = organizations.find((org) => org.id === currentId) ?? organizations[0];

  function choose(id: string) {
    onSelect(id);
    setOpen(false);
    setQuery("");
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          aria-label={`Tổ chức hiện tại: ${current.name}. Nhấn để đổi tổ chức`}
          className="w-full justify-between gap-2 px-2"
        >
          <Flex align="center" gap="sm" className="min-w-0">
            <Avatar className="size-7 rounded-md">
              <AvatarFallback>{monogram(current.name)}</AvatarFallback>
            </Avatar>
            <span className="flex min-w-0 flex-col text-start">
              <Text as="span" size="sm" weight="medium" truncate>
                {current.name}
              </Text>
              <Text as="span" size="xs" tone="muted" truncate>
                {current.role}
              </Text>
            </span>
          </Flex>
          <ChevronsUpDown aria-hidden className="size-4 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={6} className="w-64 p-0">
        <Command label="Chọn tổ chức">
          <CommandInput
            placeholder="Tìm tổ chức…"
            aria-label="Tìm tổ chức"
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>Không tìm thấy tổ chức.</CommandEmpty>
            <CommandGroup heading="Tổ chức của bạn">
              {organizations.map((org) => {
                const active = org.id === currentId;
                return (
                  <CommandItem
                    key={org.id}
                    value={`${org.name} ${org.role}`}
                    keywords={[org.id]}
                    onSelect={() => choose(org.id)}
                  >
                    <Flex align="center" gap="sm" className="w-full min-w-0">
                      <Avatar className="size-6 rounded">
                        <AvatarFallback>{monogram(org.name)}</AvatarFallback>
                      </Avatar>
                      <span className="flex min-w-0 flex-col text-start">
                        <Text as="span" size="sm" truncate>
                          {org.name}
                        </Text>
                        <Text as="span" size="xs" tone="muted" truncate>
                          {org.role}
                        </Text>
                      </span>
                      {active ? (
                        <Check aria-hidden className="text-primary ms-auto size-4 shrink-0" />
                      ) : null}
                    </Flex>
                    {active ? <span className="sr-only">(đang chọn)</span> : null}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
          <div className="border-t p-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => {
                onCreate();
                setOpen(false);
              }}
            >
              <Plus aria-hidden className="size-4" />
              Tạo tổ chức mới
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => {
                onJoin();
                setOpen(false);
              }}
            >
              <TicketPlus aria-hidden className="size-4" />
              Tham gia bằng mã mời
            </Button>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

const SECTIONS: SidebarSectionProp[] = [
  {
    label: "Điều hành",
    items: [
      { id: "overview", label: "Tổng quan", icon: LayoutDashboard },
      { id: "workspaces", label: "Không gian làm việc", icon: Boxes },
      { id: "members", label: "Thành viên", icon: Users },
    ],
  },
  {
    label: "Quản trị",
    items: [
      { id: "roles", label: "Vai trò", icon: Shield },
      { id: "settings", label: "Cài đặt", icon: Settings },
    ],
  },
];

export default function OrgSwitcherShowcase() {
  const [activeId, setActiveId] = React.useState("overview");
  const [currentOrg, setCurrentOrg] = React.useState("acme-hq");
  const [lastAction, setLastAction] = React.useState<string | null>(null);

  const current = ORGS.find((org) => org.id === currentOrg) ?? ORGS[0];

  return (
    <AppShell
      sidebar={
        <Sidebar
          activeId={activeId}
          onSelect={setActiveId}
          sections={SECTIONS}
          brand={
            <OrgSwitcher
              organizations={ORGS}
              currentId={currentOrg}
              onSelect={(id) => {
                setCurrentOrg(id);
                setLastAction(null);
              }}
              onCreate={() => setLastAction("Mở luồng tạo tổ chức mới")}
              onJoin={() => setLastAction("Mở luồng nhập mã mời")}
            />
          }
          footer={
            <Flex direction="col" gap="xs">
              <Text size="xs" weight="medium">
                Satoshi Yamamoto
              </Text>
              <Text size="xs" tone="muted">
                Trực tuyến · Tokyo
              </Text>
            </Flex>
          }
        />
      }
      topbar={
        <Topbar
          start={
            <Text size="sm" weight="medium">
              Acme Console
            </Text>
          }
          end={
            <Avatar className="size-7 rounded-md">
              <AvatarFallback>SY</AvatarFallback>
            </Avatar>
          }
        />
      }
    >
      <PageContainer
        title="Bảng điều khiển"
        subtitle={`Tổ chức: ${current.name} · ${current.role}`}
      >
        <Card>
          <CardHeader>
            <CardTitle>OrgSwitcher (mẫu tổ hợp)</CardTitle>
            <CardDescription>
              Thẻ tổ chức ở đầu Sidebar mở một danh sách tìm kiếm bằng Command, kèm hành động tạo tổ
              chức và tham gia bằng mã mời. Toàn bộ dựng từ primitive @godxjp/ui · không thêm
              component framework.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="sm" align="start">
              <Flex align="center" gap="sm">
                <Heading level={4}>Tổ chức đang chọn</Heading>
                <Badge tone="info">{current.name}</Badge>
              </Flex>
              <Text size="sm" tone="muted">
                Đổi tổ chức từ thẻ ở góc trên Sidebar để cập nhật giá trị này.
              </Text>
              {lastAction ? <Badge tone="warning">{lastAction}</Badge> : null}
            </Flex>
          </CardContent>
        </Card>
      </PageContainer>
    </AppShell>
  );
}
