import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "../../components/data-entry/combobox";
import { Button } from "../../components/general/Button";
import { Flex } from "../../components/layout";

/**
 * data-entry/Combobox — cmdk command + Radix Popover compositional API.
 *
 * Documented exports (per `combobox.tsx`):
 *   <Combobox>          Radix Popover Root (open / onOpenChange)
 *   <ComboboxTrigger>   Radix Popover Trigger (use `asChild`)
 *   <ComboboxAnchor>    Radix Popover Anchor (rarely used)
 *   <ComboboxContent>   Portal-rendered cmdk Command surface
 *     align?, sideOffset?, commandClassName?, shouldFilter?, filter?,
 *     value?, defaultValue?, onValueChange?, loop?, label?, vimBindings?
 *   <ComboboxInput>     cmdk Command.Input — filterable input
 *   <ComboboxList>      cmdk Command.List — scrollable result region
 *   <ComboboxItem>      cmdk Command.Item — selectable row
 *   <ComboboxEmpty>     cmdk Command.Empty — shown when no items match
 *
 * Per cardinal rule 25 stories drive the documented API; visual contract
 * lives in `.popover-content` / `.combobox-*` classes in tokens.css.
 */

const meta: Meta<typeof Combobox> = {
  title: "Data Entry/Combobox",
  component: Combobox,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
**Combobox** — cmdk + Radix Popover compositional API. Trigger opens a
filterable command surface; \`ComboboxInput\` drives case-insensitive
filtering; \`ComboboxEmpty\` renders when no items match.
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Combobox>;

interface Employee {
  value: string;
  label: string;
  role: string;
}

const employees: Employee[] = [
  { value: "tanaka-misaki", label: "田中 美咲", role: "店長 · 渋谷本店" },
  { value: "sato-kenta", label: "佐藤 健太", role: "副店長 · 新宿支店" },
  { value: "suzuki-rina", label: "鈴木 莉奈", role: "店員 · 池袋支店" },
  { value: "takahashi-haruto", label: "高橋 陽斗", role: "店員 · 渋谷本店" },
  { value: "watanabe-yui", label: "渡辺 結衣", role: "アルバイト · 新宿支店" },
];

// ─── Default — data-driven via `options` prop ────────────────────

export const Default: Story = {
  name: "Default · options prop (Ant / MUI canonical)",
  render: function Default() {
    const [value, setValue] = useState<string>("");
    return (
      <div style={{ width: 240 }}>
        <Combobox
          options={employees.map((e) => ({ value: e.value, label: e.label }))}
          triggerLabel="従業員を選択"
          placeholder="名前で検索"
          emptyLabel="該当する従業員がいません。"
          value={value}
          onValueChange={setValue}
        />
      </div>
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const portal = canvasElement.ownerDocument.body;
    await step("trigger opens command surface", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /従業員を選択/ }));
      await waitFor(() => {
        expect(within(portal).getByPlaceholderText("名前で検索")).toBeInTheDocument();
      });
    });
  },
};

// ─── WithSelection — rich items + check indicator + controlled state ─

export const WithSelection: Story = {
  name: "WithSelection · controlled state + check indicator + role meta",
  render: function WithSelection() {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<Employee | null>(null);
    return (
      <Combobox open={open} onOpenChange={setOpen}>
        <ComboboxTrigger asChild>
          <Button
            variant="secondary"
            endContent={<ChevronsUpDown size={14} aria-hidden />}
            style={{ justifyContent: "space-between", width: 240 }}
          >
            {selected ? selected.label : "従業員を選択"}
          </Button>
        </ComboboxTrigger>
        <ComboboxContent style={{ width: 240 }}>
          <ComboboxInput placeholder="名前で検索" />
          <ComboboxList>
            <ComboboxEmpty>該当する従業員がいません。</ComboboxEmpty>
            {employees.map((emp) => (
              <ComboboxItem
                key={emp.value}
                value={emp.value}
                onSelect={() => {
                  setSelected(emp);
                  setOpen(false);
                }}
              >
                <Flex justify="space-between" align="center" style={{ width: "100%" }}>
                  <Flex vertical gap={2}>
                    <span>{emp.label}</span>
                    <span className="muted" style={{ fontSize: 11 }}>
                      {emp.role}
                    </span>
                  </Flex>
                  {selected?.value === emp.value && <Check size={14} aria-hidden />}
                </Flex>
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    );
  },
};

// ─── Empty — search yields no matches ────────────────────────────

export const Empty: Story = {
  name: "Empty · ComboboxEmpty surface when no items match",
  render: function Empty() {
    // Controlled input — cmdk's `Command.Input` internally tracks the
    // value, so passing `defaultValue` while the underlying primitive
    // also drives `value` produces React's controlled / uncontrolled
    // warning. A single controlled state seeded with the no-match
    // string is the canonical fix.
    const [query, setQuery] = useState("存在しない名前");
    return (
      <div style={{ maxWidth: 280 }}>
        <Combobox defaultOpen>
          <ComboboxTrigger asChild>
            <Button variant="secondary">従業員を選択</Button>
          </ComboboxTrigger>
          <ComboboxContent style={{ width: 260 }}>
            <ComboboxInput
              value={query}
              onValueChange={setQuery}
              placeholder="名前で検索"
            />
            <ComboboxList>
              <ComboboxEmpty>該当する従業員がいません。</ComboboxEmpty>
              {employees.map((emp) => (
                <ComboboxItem key={emp.value} value={emp.value}>
                  {emp.label}
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
    );
  },
};

// ─── Async — deferred load with loading row ──────────────────────

export const Async: Story = {
  name: "Async · deferred load + loading row",
  render: function Async() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<Employee[]>([]);

    useEffect(() => {
      if (!open) return;
      setLoading(true);
      setItems([]);
      const timer = window.setTimeout(() => {
        setItems(employees);
        setLoading(false);
      }, 600);
      return () => window.clearTimeout(timer);
    }, [open]);

    return (
      <div style={{ maxWidth: 280 }}>
        <Combobox open={open} onOpenChange={setOpen}>
          <ComboboxTrigger asChild>
            <Button variant="secondary">従業員を読み込む</Button>
          </ComboboxTrigger>
          <ComboboxContent style={{ width: 260 }}>
            <ComboboxInput placeholder="名前で検索" />
            <ComboboxList>
              {loading && (
                <ComboboxItem value="__loading" disabled>
                  <Flex align="center" gap="small">
                    <Loader2
                      size={14}
                      aria-hidden
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                    <span>読み込み中…</span>
                  </Flex>
                </ComboboxItem>
              )}
              {!loading && (
                <ComboboxEmpty>該当する従業員がいません。</ComboboxEmpty>
              )}
              {items.map((emp) => (
                <ComboboxItem key={emp.value} value={emp.value}>
                  {emp.label}
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
    );
  },
};
