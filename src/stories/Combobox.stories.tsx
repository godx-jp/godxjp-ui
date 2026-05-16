import type { Meta, StoryObj } from "@storybook/react";
import { useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "../components/primitives/combobox";
import { Button } from "../components/primitives/Button";
import { Label } from "../components/primitives/Label";
import { Flex } from "../components/primitives/layout";

const meta: Meta = {
  title: "Primitives/Combobox",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**Combobox** — searchable typeahead, Radix Popover + cmdk under the hood.

This primitive is a **composite** assembled from \`Combobox\` (= Radix Popover Root),
\`ComboboxTrigger\` (= Radix Popover Trigger), \`ComboboxContent\` (Popover Portal + Content
wrapping a cmdk \`Command\` root), \`ComboboxInput\`, \`ComboboxList\`, \`ComboboxItem\`,
and \`ComboboxEmpty\`. The shadcn-style ownership rule applies: copy-fork the file
when you need a deeply different composition.

Visual contract: trigger reuses any button (typically \`<Button variant="secondary" asChild>\`);
the popover uses \`.popover-content\` + \`.combobox-content\`; input is the standard \`.input\`
plus \`.combobox-input\`; items use \`.combobox-item\`.

**Filtering** — cmdk filters by item \`value\` (string-match against the input). Pass
\`shouldFilter={false}\` on \`ComboboxContent\` to take over filtering (e.g. async search).
Render an empty state via \`<ComboboxEmpty>\` — it is shown automatically when no item
matches.

**Accessibility (WCAG 2.1 AA)** — cmdk manages \`role="combobox"\` on the input,
\`role="listbox"\` on the list, \`role="option"\` on items, \`aria-selected\` /
\`aria-activedescendant\`, and arrow-key navigation. Radix Popover handles focus
trapping + restore. Always pair the trigger with a \`<Label>\` (the trigger is a
button — set its \`id\` then \`<Label htmlFor>\`).
        `.trim(),
      },
    },
  },
};
export default meta;

type Story = StoryObj;

const TIMEZONES = [
  "Asia/Tokyo",
  "Asia/Ho_Chi_Minh",
  "Asia/Manila",
  "Asia/Singapore",
  "Asia/Seoul",
  "Asia/Shanghai",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "Europe/Madrid",
  "America/New_York",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "Australia/Sydney",
  "UTC",
];

function TimezoneDemo() {
  const [selected, setSelected] = useState("Asia/Tokyo");
  const [open, setOpen] = useState(false);
  return (
    <Flex vertical gap="small" style={{ width: 280 }}>
      <Label htmlFor="tz-trigger">タイムゾーン</Label>
      <Combobox open={open} onOpenChange={setOpen}>
        <ComboboxTrigger asChild>
          <Button id="tz-trigger" variant="secondary" aria-expanded={open}>
            <span style={{ flex: 1, textAlign: "left" }}>{selected}</span>
            <ChevronsUpDown size={14} aria-hidden />
          </Button>
        </ComboboxTrigger>
        <ComboboxContent style={{ width: 280 }}>
          <ComboboxInput placeholder="Search timezone…" />
          <ComboboxList>
            <ComboboxEmpty>No timezone matched</ComboboxEmpty>
            {TIMEZONES.map((tz) => (
              <ComboboxItem
                key={tz}
                value={tz}
                onSelect={(v) => {
                  setSelected(v);
                  setOpen(false);
                }}
              >
                <Check
                  size={14}
                  aria-hidden
                  style={{
                    marginRight: 8,
                    opacity: selected === tz ? 1 : 0,
                  }}
                />
                {tz}
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </Flex>
  );
}

export const Playground: Story = {
  render: () => <TimezoneDemo />,
};

export const TimezonePicker: Story = {
  name: "Default — timezone picker",
  parameters: { controls: { disable: true } },
  render: () => <TimezoneDemo />,
};

const COUNTRIES = [
  { code: "jp", name: "日本", flag: "🇯🇵" },
  { code: "vn", name: "Việt Nam", flag: "🇻🇳" },
  { code: "ph", name: "Philippines", flag: "🇵🇭" },
  { code: "sg", name: "Singapore", flag: "🇸🇬" },
  { code: "kr", name: "대한민국", flag: "🇰🇷" },
  { code: "us", name: "United States", flag: "🇺🇸" },
  { code: "gb", name: "United Kingdom", flag: "🇬🇧" },
  { code: "de", name: "Deutschland", flag: "🇩🇪" },
  { code: "fr", name: "France", flag: "🇫🇷" },
  { code: "br", name: "Brasil", flag: "🇧🇷" },
  { code: "au", name: "Australia", flag: "🇦🇺" },
];

function CountryDemo() {
  const [selected, setSelected] = useState("jp");
  const [open, setOpen] = useState(false);
  const current = COUNTRIES.find((c) => c.code === selected);
  return (
    <Flex vertical gap="small" style={{ width: 280 }}>
      <Label htmlFor="country-trigger">国 / 地域</Label>
      <Combobox open={open} onOpenChange={setOpen}>
        <ComboboxTrigger asChild>
          <Button id="country-trigger" variant="secondary" aria-expanded={open}>
            <span style={{ flex: 1, textAlign: "left" }}>
              {current ? `${current.flag} ${current.name}` : "Choose…"}
            </span>
            <ChevronsUpDown size={14} aria-hidden />
          </Button>
        </ComboboxTrigger>
        <ComboboxContent style={{ width: 280 }}>
          <ComboboxInput placeholder="国を検索…" />
          <ComboboxList>
            <ComboboxEmpty>No country matched</ComboboxEmpty>
            {COUNTRIES.map((c) => (
              <ComboboxItem
                key={c.code}
                value={`${c.code} ${c.name}`}
                onSelect={() => {
                  setSelected(c.code);
                  setOpen(false);
                }}
              >
                <span aria-hidden style={{ marginRight: 8 }}>{c.flag}</span>
                <span style={{ flex: 1 }}>{c.name}</span>
                <Check
                  size={14}
                  aria-hidden
                  style={{ marginLeft: 8, opacity: selected === c.code ? 1 : 0 }}
                />
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </Flex>
  );
}

export const CountryPicker: Story = {
  name: "Filterable — country picker with flags",
  parameters: { controls: { disable: true } },
  render: () => <CountryDemo />,
};

function EmptyStateDemo() {
  const [open, setOpen] = useState(true);
  return (
    <Flex vertical gap="small" style={{ width: 280 }}>
      <Combobox open={open} onOpenChange={setOpen}>
        <ComboboxTrigger asChild>
          <Button variant="secondary">Open…</Button>
        </ComboboxTrigger>
        <ComboboxContent style={{ width: 280 }}>
          <ComboboxInput placeholder="検索しても何も見つからない…" defaultValue="xyz-unmatched" />
          <ComboboxList>
            <ComboboxEmpty>
              <Flex vertical gap="small" align="center" style={{ padding: 16 }}>
                <span>該当なし</span>
                <span style={{ color: "var(--muted-foreground)", fontSize: 12 }}>
                  Try a different keyword.
                </span>
              </Flex>
            </ComboboxEmpty>
            <ComboboxItem value="apple">Apple</ComboboxItem>
            <ComboboxItem value="banana">Banana</ComboboxItem>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </Flex>
  );
}

export const EmptyState: Story = {
  name: "Empty state",
  parameters: { controls: { disable: true } },
  render: () => <EmptyStateDemo />,
};

interface Project {
  id: string;
  name: string;
  org: string;
}
const PROJECTS: Project[] = [
  { id: "p1", name: "godx-admin", org: "godx-jp" },
  { id: "p2", name: "godx-forge", org: "godx-jp" },
  { id: "p3", name: "godxjp-ui", org: "godx-jp" },
  { id: "p4", name: "media-service", org: "godx-jp" },
  { id: "p5", name: "knowledge-service", org: "godx-jp" },
  { id: "p6", name: "famgia-shell", org: "famgia" },
  { id: "p7", name: "openclaw", org: "openclaw" },
];

function AsyncPresetDemo() {
  // Simulated async search: filter happens client-side here, but with
  // shouldFilter={false} the consumer would hit an API on input change
  // and feed the result list directly.
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Project | null>(null);
  const results = useMemo(() => {
    if (!query) return PROJECTS;
    const q = query.toLowerCase();
    return PROJECTS.filter(
      (p) => p.name.toLowerCase().includes(q) || p.org.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <Flex vertical gap="small" style={{ width: 320 }}>
      <Label htmlFor="proj-trigger">プロジェクト</Label>
      <Combobox open={open} onOpenChange={setOpen}>
        <ComboboxTrigger asChild>
          <Button id="proj-trigger" variant="secondary" aria-expanded={open}>
            <span style={{ flex: 1, textAlign: "left" }}>
              {selected ? `${selected.org}/${selected.name}` : "Search projects…"}
            </span>
            <ChevronsUpDown size={14} aria-hidden />
          </Button>
        </ComboboxTrigger>
        <ComboboxContent style={{ width: 320 }} shouldFilter={false}>
          <ComboboxInput
            value={query}
            onValueChange={setQuery}
            placeholder="リポジトリを検索…"
          />
          <ComboboxList>
            <ComboboxEmpty>該当するプロジェクトがありません</ComboboxEmpty>
            {results.map((p) => (
              <ComboboxItem
                key={p.id}
                value={`${p.org} ${p.name}`}
                onSelect={() => {
                  setSelected(p);
                  setOpen(false);
                }}
              >
                <span style={{ flex: 1 }}>
                  <span style={{ color: "var(--muted-foreground)" }}>{p.org}/</span>
                  {p.name}
                </span>
                <Check
                  size={14}
                  aria-hidden
                  style={{ marginLeft: 8, opacity: selected?.id === p.id ? 1 : 0 }}
                />
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </Flex>
  );
}

export const AsyncPreset: Story = {
  name: "Behaviour — async / external filter (shouldFilter=false)",
  parameters: { controls: { disable: true } },
  render: () => <AsyncPresetDemo />,
};

export const Disabled: Story = {
  name: "States — disabled trigger",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="small" style={{ width: 280 }}>
      <Label htmlFor="dis-trigger">プロジェクト (locked)</Label>
      <Combobox>
        <ComboboxTrigger asChild>
          <Button id="dis-trigger" variant="secondary" disabled>
            <span style={{ flex: 1, textAlign: "left" }}>godx-admin</span>
            <ChevronsUpDown size={14} aria-hidden />
          </Button>
        </ComboboxTrigger>
      </Combobox>
    </Flex>
  ),
};
