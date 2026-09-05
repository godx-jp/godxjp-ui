/** Canonical prop vocabulary taught by the MCP. Mirrors src/props/vocabulary. */

export interface PropVocabEntry {
  name: string;
  concept: string;
  values: string[];
  usedBy: string[];
  notes?: string;
}

export const PROP_VOCABULARY: PropVocabEntry[] = [
  {
    name: "ValueProp<T = string>",
    concept: "Abstract controlled value.",
    values: ["generic"],
    usedBy: ["CheckboxGroup", "Upload", "Cascader", "TreeSelect", "Tabs", "SearchSelect"],
  },
  {
    name: "DefaultValueProp<T = string>",
    concept: "Abstract uncontrolled initial value.",
    values: ["generic"],
    usedBy: ["CheckboxGroup", "Upload", "Cascader", "TreeSelect", "Tabs"],
  },
  {
    name: "OnValueChangeProp<T = string>",
    concept: "Callback for abstract value changes. DOM events continue to use onChange.",
    values: ["(value: T) => void"],
    usedBy: ["CheckboxGroup", "Upload", "Cascader", "TreeSelect", "Transfer", "settings pickers"],
  },
  {
    name: "OpenProp / DefaultOpenProp / OnOpenChangeProp",
    concept: "Disclosure state.",
    values: ["boolean", "(open: boolean) => void"],
    usedBy: ["Dialog", "Sheet", "Popover"],
  },
  {
    name: "SizeProp",
    concept: "Shared public size names.",
    values: ["xs", "sm", "md", "lg"],
    usedBy: ["Button", "Steps", "Switch"],
    notes: "Component-specific subsets must be documented. Old alias small is sm.",
  },
  {
    name: "ToneProp",
    concept: "Semantic status/color intent.",
    values: ["default", "success", "warning", "destructive", "info", "muted", "neutral"],
    usedBy: ["Badge", "Alert"],
    notes: "Status values belong in tone, not variant.",
  },
  {
    name: "GapProp",
    concept: "Shared layout gap scale.",
    values: ["xs", "sm", "md", "lg", "xl"],
    usedBy: ["Flex"],
    notes:
      'The single shared gap scale on Flex — the one layout primitive (default direction="row"; use direction="col" for vertical rhythm; these replaced the removed Stack/Inline).',
  },
  {
    name: "TitleProp",
    concept: "Primary heading text.",
    values: ["React.ReactNode"],
    usedBy: ["PageContainer", "PageHeader", "EmptyState", "Dialog"],
  },
  {
    name: "DensityProp",
    concept: "Page/subtree density.",
    values: ["compact", "default", "comfortable"],
    usedBy: ["PageContainer"],
  },
  {
    name: "CenteredShellPresetProp",
    concept:
      "Named whole-page SHELL contract for CenteredShell — the page measure, section rhythm, chrome flatness and hero heading tier, all owned by component tokens.",
    values: ["default", "public-landing"],
    usedBy: ["CenteredShell"],
    notes:
      'public-landing is the PUBLIC marketing/product landing geometry: one 67.5rem measure shared by the header bar, the centred column and the footer, the section rhythm, flat elevation-free cards and the hero h1 tier. "default" emits NO data-preset at all, so the existing shell box is untouched. Pair with `Flex hideBelow`/`hideFrom` for header region visibility — a landing must never own a page-local media query or a max-width wrapper.',
  },
  {
    name: "TablePresetProp",
    concept:
      "Named collection contract for a table — how a dense collection behaves when its container gets narrow.",
    values: ["default", "action-collection"],
    usedBy: ["Table", "DataTable"],
    notes:
      "action-collection swaps the desktop intrinsic column widths for table-layout: fixed + the token-owned column PRIORITY measures below `collapseBelow`, so a five-column approval queue keeps every column — including row actions — inside a 390px frame with no page-local CSS, no hidden column and no horizontal scroll. It changes the SIZING model only: no display change, no role rewriting, no card transformation, so table semantics and screen-reader navigation are identical at every width. ONE contract, two entry points: the `Table` primitive (mark `priority` on each TableHead/TableCell yourself) and the TanStack `DataTable` (mark `priority` on the ColumnDef; it stamps both cells for you, and additionally releases the surface's `--table-surface-min-inline-size` floor). Both read the same `--table-action-collection-*` tokens — there is no parallel DataTable family.",
  },
  {
    name: "TableColumnPriorityProp",
    concept:
      "Relative importance of a table column, used by the action-collection preset to allocate the narrow-frame measure.",
    values: ["primary", "secondary", "meta", "actions"],
    usedBy: ["Table", "DataTable"],
    notes:
      "On the raw `Table`, set it on BOTH the TableHead and the TableCell of a column; on `DataTable` set it once on the `ColumnDef` and it is stamped onto the <th> and every <td>. `actions` reserves its measure first so the row-action affordance can never be pushed outside the viewport; a column with no priority takes the remaining space (the free-text column).",
  },
  {
    name: "AuthShellPresetProp",
    concept:
      "Named hosted-identity FLOW MEASURE for AuthShell — the card max-width plus the desktop and mobile page gutters, all owned by component tokens.",
    values: ["default", "device-authorization", "context-selection"],
    usedBy: ["AuthShell"],
    notes:
      'Orthogonal to AuthShell\'s `variant` (which owns control density + heading size) and applied after it, so `variant="canonical" preset="device-authorization"` composes. device-authorization = 380px card / 5px inline gutter at 390; context-selection = 25rem card, edge-to-edge on mobile. Selecting a preset REPLACES any consumer-side --auth-shell-card-max-width override — a page-local width is the anti-pattern these presets exist to remove.',
  },
  {
    name: "AvatarShapeProp",
    concept:
      "Avatar geometry — WHAT the identity mark represents: a person or an entity. Deliberately NOT the control ShapeProp (default|pill|sharp), whose `sharp` is --radius-sharp: 0 and cannot express the rounded rect an entity mark needs.",
    values: ["circle", "square"],
    usedBy: ["Avatar"],
    notes:
      'circle (default, inert) = the round --radius-pill person avatar on the muted surface; square = the entity-header organization/service mark — a compact rounded square on the brand surface driven by --avatar-square-{radius,size,background,foreground}. Choose by meaning, never by look: a className="rounded-md bg-primary" override on the call site is the anti-pattern this prop removes.',
  },
];

export function findVocab(name: string): PropVocabEntry | undefined {
  const normalized = name
    .trim()
    .toLowerCase()
    .replace(/prop(?:<.*>)?$/i, "");
  return PROP_VOCABULARY.find(
    (v) => v.name.toLowerCase().replace(/prop(?:<.*>)?$/i, "") === normalized,
  );
}
