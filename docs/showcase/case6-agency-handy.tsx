/**
 * Showcase · case6 — 代理店ハンディ (Agency Handy, mobile)
 *
 * The Tiximax consolidation-warehouse handheld app (390×844, gloves-on, scan-heavy),
 * rebuilt ENTIRELY from real @godxjp/ui primitives — the dxs-kintai "Handy Agency"
 * design recreated as a skeleton (intent + look), not a transcription of its prototype DOM.
 *
 * Composition map (Handy prototype block → @godxjp/ui primitive):
 *   phone shell ................. composed frame (status bar / header / scroll / sticky bar / tabbar)
 *   header text-action .......... Button(ghost, size=sm) — iOS "Chọn" select-mode entry
 *   filter chips ................ ToggleGroup(type=single) — 32px count pills
 *   outbound segmented .......... ToggleGroup(type=single) — Chờ niêm phong / Chờ bàn giao / Đã bàn giao
 *   list-card recipe ............ Card + composed 3-line row + Badge(tone) + select-mode Checkbox
 *   status badge (1:1) .......... Badge tone — attention/info/muted/success/warning, color-locked
 *   select-mode bar ............. primary-soft toolbar strip (count + actions) above tabbar
 *   big scan Button ............. sticky-actions primary "Quét / Tìm mã" (flex-2, dominant)
 *   ItemLookupSheet ............. Sheet(side=bottom) — viewfinder placeholder + manual mono input
 *   package-picker Sheet ........ Sheet(side=bottom) — list of PKG rows + create-new row
 *   ItemFormModal Sheet ......... Sheet(side=bottom) — barcode + qty + radio-row "Đích đến"
 *   detail rows ................. Descriptions + Descriptions.Item(mono) — item detail
 *   confirm Dialog .............. AlertDialog — Seal / Handoff (verb confirm, not "OK")
 *   toast ....................... Toaster + toast.success — "Đã bàn giao … · 16:24"
 *   four list states ............ Loading(Skeleton) · Empty(EmptyState) · Error(Alert) · populated
 *
 * DNA applied: comfortable 44px touch density, mono codes (RC-/JAN/PKG-/A-03-02),
 * fixed color signaling (attention 朱 = Chưa phân loại + fixable errors, info 群青 = open,
 * muted = in-package/draft, success 若竹 = sealed, warning 山吹 = delivered), tabular-nums,
 * scan-first (primary action widest), bottom-sheet-driven, vi-first quiet copy, no emoji.
 */
import * as React from "react";
import {
  Boxes,
  Check,
  Inbox,
  Package,
  PackagePlus,
  Plus,
  RefreshCw,
  ScanLine,
  Search,
  Truck,
  X,
} from "lucide-react";

import { Button } from "@godxjp/ui/general";
import {
  Badge,
  type BadgeProps,
  Card,
  CardContent,
  Descriptions,
  EmptyState,
} from "@godxjp/ui/data-display";
import {
  Checkbox,
  Input,
  RadioGroupRoot,
  RadioItem,
  ToggleGroup,
  ToggleGroupItem,
} from "@godxjp/ui/data-entry";
import {
  AlertDialog,
  Alert,
  AlertTitle,
  AlertDescription,
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Skeleton,
  Toaster,
  toast,
} from "@godxjp/ui/feedback";

type BadgeTone = NonNullable<BadgeProps["tone"]>;

// ── Status vocabulary — 1:1 color-locked (Handy §6b: "same word in different colors is a bug") ──
type ItemStatus = "unsorted" | "shelf" | "packed";
const ITEM_STATUS: Record<ItemStatus, { label: string; tone: BadgeTone }> = {
  unsorted: { label: "Chưa phân loại", tone: "destructive" }, // 朱 attention via destructive-adjacent? -> use warning? see note
  shelf: { label: "Trên giá hàng", tone: "info" }, //  群青 open
  packed: { label: "Trong kiện", tone: "muted" }, // draft / in-package
};

// Attention (朱) is the fixable-but-needs-action signal. Badge tones expose
// success/warning/destructive/info/muted/neutral — there is no dedicated "attention"
// tone, so non-destructive "Chưa phân loại" maps to warning (山吹), reserving
// destructive (茜) for the irreversible logout confirm only. (see gapNotes)
ITEM_STATUS.unsorted.tone = "warning";

type PackingStatus = "active" | "open" | "draft" | "sealed" | "delivered";
const PACKING_STATUS: Record<PackingStatus, { label: string; tone: BadgeTone }> = {
  active: { label: "Đang làm", tone: "info" },
  open: { label: "Đang mở", tone: "info" },
  draft: { label: "Nháp", tone: "muted" },
  sealed: { label: "Đã niêm phong", tone: "success" },
  delivered: { label: "Đã bàn giao", tone: "muted" },
};

// ── Mock data ───────────────────────────────────────────────────────────────

interface HandyItem {
  id: string;
  name: string;
  rc: string;
  jan: string;
  status: ItemStatus;
  qty: number;
  receivedAt: string;
}

const ITEMS: HandyItem[] = [
  {
    id: "1",
    name: "Sữa rửa mặt Hada Labo",
    rc: "RC-204881",
    jan: "4987241135219",
    status: "unsorted",
    qty: 3,
    receivedAt: "14:02",
  },
  {
    id: "2",
    name: "Kem chống nắng Anessa",
    rc: "RC-204882",
    jan: "4909978141004",
    status: "shelf",
    qty: 1,
    receivedAt: "13:48",
  },
  {
    id: "3",
    name: "Vitamin DHC B-Complex",
    rc: "RC-204879",
    jan: "4511413404164",
    status: "shelf",
    qty: 2,
    receivedAt: "13:31",
  },
  {
    id: "4",
    name: "Bàn chải Ora2 Me",
    rc: "RC-204875",
    jan: "4903301242697",
    status: "packed",
    qty: 4,
    receivedAt: "11:20",
  },
];

interface Packing {
  id: string;
  code: string;
  customer: string;
  city: string;
  items: number;
  status: PackingStatus;
  slot?: string;
}

const PACKINGS: Packing[] = [
  {
    id: "p1",
    code: "PKG-000041",
    customer: "Bùi Hà",
    city: "Hà Nội",
    items: 8,
    status: "active",
    slot: "A-03-02",
  },
  { id: "p2", code: "PKG-000040", customer: "Lê Minh", city: "TP.HCM", items: 5, status: "open" },
  {
    id: "p3",
    code: "PKG-000038",
    customer: "Trần Linh",
    city: "Đà Nẵng",
    items: 12,
    status: "draft",
  },
];

const OUTBOUND: Packing[] = [
  {
    id: "o1",
    code: "PKG-000037",
    customer: "Phạm An",
    city: "Hà Nội",
    items: 9,
    status: "sealed",
    slot: "B-01-04",
  },
  {
    id: "o2",
    code: "PKG-000036",
    customer: "Vũ Nga",
    city: "TP.HCM",
    items: 6,
    status: "sealed",
    slot: "B-02-01",
  },
];

const TABS = [
  { id: "inbound", label: "Nhập kho", icon: Inbox },
  { id: "packing", label: "Đóng gói", icon: Package },
  { id: "outbound", label: "Xuất kho", icon: Truck },
] as const;

const FILTERS = [
  { id: "all", label: "Tất cả", count: 42 },
  { id: "unsorted", label: "Chưa phân loại", count: 9 },
  { id: "shelf", label: "Trên giá hàng", count: 33 },
] as const;

// ── Small composed parts ─────────────────────────────────────────────────────

function MonoCode({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-muted-foreground font-mono text-[12px] tabular-nums">{children}</span>
  );
}

/** The Handy list-card recipe: full-tap row, name + mono codes + badge/meta. */
function ItemListCard({
  item,
  selectMode,
  selected,
  onToggle,
}: {
  item: HandyItem;
  selectMode: boolean;
  selected: boolean;
  onToggle: () => void;
}) {
  const st = ITEM_STATUS[item.status];
  return (
    <Card
      density="tight"
      className={
        "rounded-[10px] transition-colors " +
        (selected
          ? "border-primary bg-[color-mix(in_oklch,var(--primary)_8%,transparent)]"
          : "hover:border-primary")
      }
    >
      <CardContent solo className="flex items-start gap-3">
        {selectMode ? (
          <Checkbox
            checked={selected}
            onCheckedChange={onToggle}
            aria-label={`選択 ${item.name}`}
            className="mt-0.5 size-[22px]"
          />
        ) : null}
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] font-bold">{item.name}</div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <MonoCode>{item.rc}</MonoCode>
            <MonoCode>JAN {item.jan}</MonoCode>
          </div>
          <div className="mt-1.5 flex items-center justify-between gap-2">
            <Badge tone={st.tone} variant="outline" className="rounded-full">
              {st.label}
            </Badge>
            <span className="text-muted-foreground shrink-0 text-[12px] tabular-nums">
              ×{item.qty} · {item.receivedAt}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PackingListCard({ packing, onTap }: { packing: Packing; onTap?: () => void }) {
  const st = PACKING_STATUS[packing.status];
  return (
    <Card
      density="tight"
      role={onTap ? "button" : undefined}
      tabIndex={onTap ? 0 : undefined}
      onClick={onTap}
      className={
        "rounded-[10px] transition-colors " + (onTap ? "hover:border-primary cursor-pointer" : "")
      }
    >
      <CardContent solo>
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[14px] font-bold tabular-nums">{packing.code}</span>
          <Badge tone={st.tone} variant="outline" className="rounded-full">
            {st.label}
          </Badge>
        </div>
        <div className="text-muted-foreground mt-1 flex items-center justify-between gap-2 text-[12px]">
          <span className="truncate">
            {packing.customer} · {packing.city}
          </span>
          <span className="shrink-0 tabular-nums">
            ×{packing.items}
            {packing.slot ? ` · ${packing.slot}` : ""}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

/** Three uppercase muted section header + right-aligned mono count. */
function SectionHeader({ children, count }: { children: React.ReactNode; count?: number }) {
  return (
    <div className="flex items-center justify-between px-0.5">
      <span className="text-muted-foreground text-[11px] font-medium tracking-[0.08em] uppercase">
        {children}
      </span>
      {count != null ? (
        <span className="text-muted-foreground font-mono text-[11px] tabular-nums">{count}</span>
      ) : null}
    </div>
  );
}

// ── Phone shell ──────────────────────────────────────────────────────────────

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-[390px] max-w-full shrink-0">
      <div className="bg-background flex h-[844px] max-h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-[28px] border">
        {children}
      </div>
    </div>
  );
}

function StatusBar() {
  return (
    <div className="flex h-9 shrink-0 items-center justify-between px-5 text-[13px] font-medium tabular-nums">
      <span>9:41</span>
      <span className="text-muted-foreground">Tiximax Handy</span>
    </div>
  );
}

function TabBar({ active, onChange }: { active: string; onChange: (id: string) => void }) {
  return (
    <nav className="grid shrink-0 grid-cols-3 border-t" aria-label="ワークフロー">
      {TABS.map((t) => {
        const isActive = t.id === active;
        const Icon = t.icon;
        return (
          <Button
            key={t.id}
            variant="ghost"
            onClick={() => onChange(t.id)}
            aria-current={isActive ? "page" : undefined}
            className={
              "h-[64px] flex-col gap-1 rounded-none text-[11px] font-medium " +
              (isActive ? "text-primary" : "text-muted-foreground")
            }
          >
            <Icon className="size-5" aria-hidden="true" strokeWidth={1.5} />
            <span className="whitespace-nowrap">{t.label}</span>
          </Button>
        );
      })}
    </nav>
  );
}

// ── Sheets ───────────────────────────────────────────────────────────────────

function ItemLookupSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [code, setCode] = React.useState("");
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-[16px]">
        <SheetHeader>
          <SheetTitle>Quét hoặc nhập mã</SheetTitle>
        </SheetHeader>
        {/* Viewfinder placeholder — a Card surface, not a hand-rolled illustration */}
        <div className="border-border bg-secondary/40 mt-2 flex h-40 items-center justify-center rounded-[12px] border-2 border-dashed">
          <div className="text-muted-foreground flex flex-col items-center gap-2">
            <ScanLine
              className="size-7 text-[color:var(--attention,var(--warning))]"
              aria-hidden="true"
              strokeWidth={1.5}
            />
            <span className="text-[13px]">Đưa mã vạch vào khung</span>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <span className="text-[13px] font-medium">Hoặc nhập mã thủ công</span>
          <div className="flex gap-2">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="RC- / PKG- / JAN"
              className="font-mono"
              inputMode="text"
              autoComplete="off"
            />
            <Button
              onClick={() => {
                onOpenChange(false);
                setCode("");
                toast.success("Đã tìm thấy RC-204881 · Sữa rửa mặt Hada Labo");
              }}
              disabled={code.trim() === ""}
            >
              <Search aria-hidden="true" />
              Tìm
            </Button>
          </div>
        </div>
        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function PackagePickerSheet({
  open,
  onOpenChange,
  count,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  count: number;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-[16px]">
        <SheetHeader>
          <SheetTitle>Gán vào kiện</SheetTitle>
        </SheetHeader>
        <div className="mt-3 flex flex-col gap-2">
          <SectionHeader count={PACKINGS.length}>Kiện đang mở</SectionHeader>
          {PACKINGS.map((p) => (
            <PackingListCard
              key={p.id}
              packing={p}
              onTap={() => {
                onOpenChange(false);
                toast.success(`Đã gán ${count} item vào ${p.code}`);
              }}
            />
          ))}
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              toast.success(`Đã tạo kiện mới với ${count} item`);
            }}
            className="text-primary hover:border-primary h-11 w-full border-2 border-dashed"
          >
            <PackagePlus aria-hidden="true" strokeWidth={1.5} />
            Tạo kiện mới với {count} item này
          </Button>
        </div>
        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Huỷ
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

const DESTINATIONS = [
  { id: "unsorted", label: "Chưa phân loại", hint: "Để xử lý sau" },
  { id: "shelf", label: "Giá hàng", hint: "Lên kệ lưu trữ" },
  { id: "open", label: "Kiện đang mở", hint: "Gói cùng đơn hiện tại" },
  { id: "new", label: "Tạo kiện mới", hint: "Mở kiện mới cho item" },
] as const;

function ItemFormSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [dest, setDest] = React.useState<string>("unsorted");
  const [qty, setQty] = React.useState("1");
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto rounded-t-[16px]">
        <SheetHeader>
          <SheetTitle>Thêm hàng mới</SheetTitle>
        </SheetHeader>
        <div className="mt-3 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium">Mã vạch</span>
            <Input defaultValue="JAN 4987241135219" readOnly className="font-mono" />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium">Tên hàng (tùy chọn)</span>
            <Input placeholder="Nhập tên hàng" autoComplete="off" />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium">Số lượng</span>
            <Input
              type="number"
              value={qty}
              min={1}
              onChange={(e) => setQty(e.target.value)}
              className="w-24 tabular-nums"
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-medium">Đích đến</span>
            <RadioGroupRoot value={dest} onValueChange={setDest} className="flex flex-col gap-2">
              {DESTINATIONS.map((d) => {
                const checked = dest === d.id;
                const rowId = `handy-dest-${d.id}`;
                return (
                  <label
                    key={d.id}
                    htmlFor={rowId}
                    className={
                      "flex cursor-pointer items-center gap-3 rounded-[10px] border p-3 transition-colors " +
                      (checked
                        ? "border-primary bg-[color-mix(in_oklch,var(--primary)_8%,transparent)]"
                        : "hover:border-primary")
                    }
                  >
                    <RadioItem id={rowId} value={d.id} className="mt-0.5" />
                    <span className="min-w-0">
                      <span className="block text-[14px] font-medium">{d.label}</span>
                      <span className="text-muted-foreground block text-[12px]">{d.hint}</span>
                    </span>
                  </label>
                );
              })}
            </RadioGroupRoot>
          </div>
        </div>
        <SheetFooter className="flex-row gap-2">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Huỷ
          </Button>
          <Button
            className="flex-[2]"
            onClick={() => {
              onOpenChange(false);
              toast.success("Đã lưu hàng mới");
            }}
          >
            Lưu
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// ── Tab bodies ───────────────────────────────────────────────────────────────

type ListState = "ready" | "loading" | "empty" | "error";

function InboundTab({
  state,
  onRetry,
  selectMode,
  setSelectMode,
  selected,
  setSelected,
  onScan,
  onAdd,
  onAssign,
}: {
  state: ListState;
  onRetry: () => void;
  selectMode: boolean;
  setSelectMode: (v: boolean) => void;
  selected: Set<string>;
  setSelected: React.Dispatch<React.SetStateAction<Set<string>>>;
  onScan: () => void;
  onAdd: () => void;
  onAssign: () => void;
}) {
  const [filter, setFilter] = React.useState<string>("all");

  const visible = ITEMS.filter((i) =>
    filter === "all"
      ? true
      : filter === "unsorted"
        ? i.status === "unsorted"
        : i.status === "shelf",
  );

  return (
    <>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        {/* Filter chips — horizontal scroll, count pills */}
        <ToggleGroup
          type="single"
          value={filter}
          onValueChange={(v) => {
            if (v) setFilter(v);
          }}
          className="flex w-full justify-start gap-2 overflow-x-auto"
        >
          {FILTERS.map((f) => (
            <ToggleGroupItem
              key={f.id}
              value={f.id}
              className="h-9 shrink-0 gap-1.5 rounded-full px-3 text-[13px] whitespace-nowrap"
            >
              {f.label}
              <span className="font-mono text-[12px] tabular-nums opacity-70">{f.count}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        {state === "loading" ? (
          <div className="flex flex-col gap-3" aria-busy="true">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} density="tight" className="rounded-[10px]">
                <CardContent solo>
                  <Skeleton className="h-4 w-3/5" />
                  <Skeleton className="mt-2 h-3 w-2/5" />
                  <Skeleton className="mt-3 h-5 w-24 rounded-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : state === "error" ? (
          <Alert tone="warning">
            <AlertTitle>Không tải được danh sách</AlertTitle>
            <AlertDescription className="flex flex-col items-start gap-2">
              Kiểm tra kết nối rồi thử lại.
              <Button variant="outline" size="sm" onClick={onRetry}>
                <RefreshCw aria-hidden="true" />
                Thử lại
              </Button>
            </AlertDescription>
          </Alert>
        ) : state === "empty" || visible.length === 0 ? (
          <EmptyState
            icon={Boxes}
            title="Chưa có hàng trong mục này"
            description="Quét mã để nhập hàng mới vào kho."
            action={
              <Button size="sm" onClick={onScan}>
                <ScanLine aria-hidden="true" />
                Quét / Tìm mã
              </Button>
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {visible.map((item) => (
              <ItemListCard
                key={item.id}
                item={item}
                selectMode={selectMode}
                selected={selected.has(item.id)}
                onToggle={() =>
                  setSelected((prev) => {
                    const next = new Set(prev);
                    if (next.has(item.id)) next.delete(item.id);
                    else next.add(item.id);
                    return next;
                  })
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Sticky action bar (scan-first) OR select-mode contextual bar */}
      {selectMode ? (
        <div className="shrink-0 border-t bg-[color-mix(in_oklch,var(--primary)_5%,var(--background))] p-3">
          <div className="mb-2 flex items-center justify-between text-[13px]">
            <span className="tabular-nums">
              <span className="font-bold">{selected.size}</span> item đã chọn
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectMode(false);
                setSelected(new Set());
              }}
            >
              Xong
            </Button>
          </div>
          <div className="flex gap-2">
            <Button className="flex-[2]" disabled={selected.size === 0} onClick={onAssign}>
              <Package aria-hidden="true" />
              Gán vào kiện…
            </Button>
            <Button variant="outline" className="flex-1" disabled={selected.size === 0}>
              Kiện mới
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex shrink-0 gap-2 border-t p-3">
          <Button className="flex-[2]" onClick={onScan}>
            <ScanLine aria-hidden="true" />
            Quét / Tìm mã
          </Button>
          <Button variant="outline" className="flex-1" onClick={onAdd}>
            <Plus aria-hidden="true" />
            Thêm hàng
          </Button>
        </div>
      )}
    </>
  );
}

function PackingTab({ onScan }: { onScan: () => void }) {
  const active = PACKINGS.find((p) => p.status === "active");
  const others = PACKINGS.filter((p) => p.status !== "active");
  return (
    <>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        {active ? (
          <Card
            density="tight"
            accent="primary"
            className="border-primary rounded-[10px] bg-[color-mix(in_oklch,var(--primary)_6%,transparent)]"
          >
            <CardContent solo>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-[11px] font-medium tracking-[0.08em] uppercase">
                  Kiện đang làm
                </span>
                <Badge tone="info" variant="outline" className="rounded-full">
                  {PACKING_STATUS.active.label}
                </Badge>
              </div>
              <div className="mt-1 font-mono text-[16px] font-bold tabular-nums">{active.code}</div>
              <div className="text-muted-foreground mt-0.5 text-[12px] tabular-nums">
                {active.customer} · {active.city} · ×{active.items} · {active.slot}
              </div>
            </CardContent>
          </Card>
        ) : null}

        <SectionHeader count={others.length}>Kiện đang mở</SectionHeader>
        <div className="flex flex-col gap-3">
          {others.map((p) => (
            <PackingListCard key={p.id} packing={p} onTap={() => undefined} />
          ))}
        </div>
      </div>
      <div className="flex shrink-0 flex-col gap-2 border-t p-3">
        <Button onClick={onScan}>
          <ScanLine aria-hidden="true" />
          Quét item vào kiện
        </Button>
        <Button variant="outline">
          <Plus aria-hidden="true" />
          Tạo kiện trống
        </Button>
      </div>
    </>
  );
}

function OutboundTab({ onSeal, onHandoff }: { onSeal: () => void; onHandoff: () => void }) {
  const [seg, setSeg] = React.useState<string>("seal");
  return (
    <>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        {/* Segmented — outbound status */}
        <ToggleGroup
          type="single"
          value={seg}
          onValueChange={(v) => {
            if (v) setSeg(v);
          }}
          className="bg-secondary/60 grid w-full grid-cols-3 gap-1 rounded-[10px] p-1"
        >
          <ToggleGroupItem value="seal" className="h-9 rounded-[8px] text-[13px] whitespace-nowrap">
            Chờ niêm phong
          </ToggleGroupItem>
          <ToggleGroupItem
            value="handoff"
            className="h-9 rounded-[8px] text-[13px] whitespace-nowrap"
          >
            Chờ bàn giao
          </ToggleGroupItem>
          <ToggleGroupItem value="done" className="h-9 rounded-[8px] text-[13px] whitespace-nowrap">
            Đã bàn giao
          </ToggleGroupItem>
        </ToggleGroup>

        <SectionHeader count={OUTBOUND.length}>
          {seg === "seal"
            ? "Sẵn sàng niêm phong"
            : seg === "handoff"
              ? "Chờ bàn giao"
              : "Đã bàn giao"}
        </SectionHeader>
        <div className="flex flex-col gap-3">
          {OUTBOUND.map((p) => (
            <Card key={p.id} density="tight" className="rounded-[10px]">
              <CardContent solo>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[14px] font-bold tabular-nums">{p.code}</span>
                  <Badge tone="success" variant="outline" className="rounded-full">
                    Sẵn sàng niêm phong
                  </Badge>
                </div>
                <div className="text-muted-foreground mt-1 flex items-center justify-between gap-2 text-[12px] tabular-nums">
                  <span className="truncate">
                    {p.customer} · {p.city}
                  </span>
                  <span className="shrink-0">
                    ×{p.items} · {p.slot}
                  </span>
                </div>
                <div className="mt-3">
                  <Descriptions columns={1} className="gap-y-1">
                    <Descriptions.Item label="Vị trí" mono>
                      {p.slot}
                    </Descriptions.Item>
                    <Descriptions.Item label="Số kiện" mono>
                      ×{p.items}
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <div className="flex shrink-0 gap-2 border-t p-3">
        {seg === "handoff" ? (
          <Button className="flex-1" onClick={onHandoff}>
            <Truck aria-hidden="true" />
            Xác nhận bàn giao
          </Button>
        ) : (
          <Button className="flex-1" onClick={onSeal}>
            <Check aria-hidden="true" />
            Quét mã kiện · Niêm phong
          </Button>
        )}
      </div>
    </>
  );
}

// ── Root ─────────────────────────────────────────────────────────────────────

export default function AgencyHandyShowcase() {
  const [tab, setTab] = React.useState<string>("inbound");
  const [listState, setListState] = React.useState<ListState>("ready");

  const [selectMode, setSelectMode] = React.useState(false);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  const [lookupOpen, setLookupOpen] = React.useState(false);
  const [formOpen, setFormOpen] = React.useState(false);
  const [pickerOpen, setPickerOpen] = React.useState(false);

  const [sealOpen, setSealOpen] = React.useState(false);
  const [handoffOpen, setHandoffOpen] = React.useState(false);

  const headerTitle = tab === "inbound" ? "Nhập kho" : tab === "packing" ? "Đóng gói" : "Xuất kho";

  return (
    <div className="bg-secondary/30 min-h-screen py-4">
      <Toaster />
      <PhoneFrame>
        <StatusBar />

        {/* App header (52px) — title + iOS text-action select-mode entry (inbound only) */}
        <header className="flex h-[52px] shrink-0 items-center justify-between border-b px-4">
          <h1 className="text-[17px] font-bold whitespace-nowrap">{headerTitle}</h1>
          <div className="flex items-center gap-1">
            {tab === "inbound" && !selectMode ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectMode(true);
                  setSelected(new Set());
                }}
              >
                <Check aria-hidden="true" />
                Chọn
              </Button>
            ) : null}
            {/* State switcher — exposes the 4 list states at rest (showcase affordance) */}
            {tab === "inbound" && !selectMode ? (
              <ToggleGroup
                type="single"
                value={listState}
                onValueChange={(v) => {
                  if (v) setListState(v as ListState);
                }}
                aria-label="List state (showcase)"
                className="flex gap-0.5"
              >
                {(["ready", "loading", "empty", "error"] as const).map((s) => (
                  <ToggleGroupItem
                    key={s}
                    value={s}
                    className="size-7 rounded-md p-0 text-[10px] uppercase"
                    title={s}
                  >
                    {s[0]}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            ) : null}
          </div>
        </header>

        {/* Select-mode header strip — replaces the standard header context (inbound) */}
        {selectMode ? (
          <div className="flex h-10 shrink-0 items-center justify-between border-b bg-[color-mix(in_oklch,var(--primary)_5%,var(--background))] px-3">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="閉じる"
              onClick={() => {
                setSelectMode(false);
                setSelected(new Set());
              }}
            >
              <X className="size-4" aria-hidden="true" strokeWidth={1.5} />
            </Button>
            <span className="font-mono text-[13px] tabular-nums">{selected.size} đã chọn</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelected(new Set(ITEMS.map((i) => i.id)))}
            >
              Chọn tất cả
            </Button>
          </div>
        ) : null}

        {tab === "inbound" ? (
          <InboundTab
            state={listState}
            onRetry={() => setListState("ready")}
            selectMode={selectMode}
            setSelectMode={setSelectMode}
            selected={selected}
            setSelected={setSelected}
            onScan={() => setLookupOpen(true)}
            onAdd={() => setFormOpen(true)}
            onAssign={() => setPickerOpen(true)}
          />
        ) : tab === "packing" ? (
          <PackingTab onScan={() => setLookupOpen(true)} />
        ) : (
          <OutboundTab onSeal={() => setSealOpen(true)} onHandoff={() => setHandoffOpen(true)} />
        )}

        <TabBar
          active={tab}
          onChange={(id) => {
            setTab(id);
            setSelectMode(false);
            setSelected(new Set());
          }}
        />
      </PhoneFrame>

      {/* Sheets */}
      <ItemLookupSheet open={lookupOpen} onOpenChange={setLookupOpen} />
      <ItemFormSheet open={formOpen} onOpenChange={setFormOpen} />
      <PackagePickerSheet open={pickerOpen} onOpenChange={setPickerOpen} count={selected.size} />

      {/* Confirm dialogs — verb confirm, surface summary; forward step = primary */}
      <AlertDialog
        open={sealOpen}
        onOpenChange={setSealOpen}
        title="Niêm phong kiện?"
        description="PKG-000037 · 9 item · vị trí B-01-04. Sau khi niêm phong không thể thêm item."
        confirmLabel="Niêm phong"
        cancelLabel="Huỷ"
        onConfirm={() => {
          toast.success("Đã niêm phong PKG-000037 · 16:24");
        }}
      />
      <AlertDialog
        open={handoffOpen}
        onOpenChange={setHandoffOpen}
        title="Xác nhận bàn giao?"
        description="PKG-000037 lên xe giao. Thao tác này có thể hoàn tác trong 10 phút."
        confirmLabel="Xác nhận"
        cancelLabel="Huỷ"
        onConfirm={() => {
          toast.success("Đã bàn giao PKG-000037 · 16:24");
        }}
      />
    </div>
  );
}
