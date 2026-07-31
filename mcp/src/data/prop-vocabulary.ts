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
    name: "AuthShellPresetProp",
    concept:
      "Named hosted-identity FLOW MEASURE for AuthShell — the card max-width plus the desktop and mobile page gutters, all owned by component tokens.",
    values: ["default", "device-authorization", "context-selection"],
    usedBy: ["AuthShell"],
    notes:
      'Orthogonal to AuthShell\'s `variant` (which owns control density + heading size) and applied after it, so `variant="canonical" preset="device-authorization"` composes. device-authorization = 380px card / 5px inline gutter at 390 (gh#220); context-selection = 25rem card, edge-to-edge on mobile (gh#217). Selecting a preset REPLACES any consumer-side --auth-shell-card-max-width override — a page-local width is the anti-pattern these presets exist to remove.',
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
