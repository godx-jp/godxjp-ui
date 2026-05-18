import type { Meta, StoryObj } from "@storybook/react";
import { Table, type TableColumn } from "../../components/data-display/Table";

/**
 * Theme/Prop vocabulary — visual catalogue for the
 * locked shared prop axes (cardinal rule 23 §B). Walks through
 * every prop name + type + usage.
 *
 * Source-of-truth: `new-docs/04-prop-vocabulary.md`.
 */

const meta: Meta = {
  title: "Theme/Prop vocabulary",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**Prop vocabulary** — the locked shared prop axes (cardinal rule 23 §B).
Every primitive's prop names map to one of these rows; synonyms
(\`scale\` for \`size\`, \`kind\` for \`variant\`, \`intent\` for
\`color\`, \`compactness\` for \`padding\`, …) are rejected at review.

Source: [\`new-docs/04-prop-vocabulary.md\`](https://github.com/godx-jp/godxjp-ui/blob/main/new-docs/04-prop-vocabulary.md).
        `.trim(),
      },
    },
  },
};
export default meta;

const muted = {
  fontSize: "var(--card-meta-size)",
  color: "var(--muted-foreground)",
} as const;
const propName = {
  fontSize: "var(--text-sm)",
  fontWeight: 500,
  whiteSpace: "nowrap",
} as const;
const propType = {
  fontSize: "var(--text-2xs)",
  fontFamily: "var(--font-mono)",
  color: "var(--muted-foreground)",
} as const;

interface Row {
  prop: string;
  type: string;
  concept: string;
  usedBy: string[];
}

const ROWS: Row[] = [
  {
    prop: "size",
    type: `"x-small" | "small" | "default" | "large" | "x-large"`,
    concept:
      "Dimensional scale of the primitive itself — height, font, internal pad.",
    usedBy: [
      "Button",
      "Input",
      "InputPassword",
      "InputSearch",
      "TimeInput",
      "DateField",
      "TimeField",
      "DatePicker",
      "DateRangePicker",
      "Avatar",
      "AvatarStack",
      "Tag",
      "Badge",
      "IconButton",
      "Spinner",
      "SegmentedControl",
    ],
  },
  {
    prop: "variant",
    type: "primitive-specific enum",
    concept:
      "Visual treatment — how the primitive is drawn (filled / outlined / ghost / link).",
    usedBy: [
      "Button (primary | secondary | ghost | outline | link)",
      "Badge (soft | solid | outline)",
      "Tag (inherits Badge)",
      "Separator (solid | dashed | dotted)",
      "Alert (planned)",
    ],
  },
  {
    prop: "color",
    type: `"primary" | "success" | "warning" | "attention" | "info" | "destructive" | "default"`,
    concept:
      "Semantic role — maps to a semantic token. Use 'attention' for non-destructive alerts.",
    usedBy: ["Tag", "Badge", "Alert", "Statistic (delta)", "Dot", "IconSquare"],
  },
  {
    prop: "tone",
    type: `"default" | "muted" | "outline-only"`,
    concept: "Surface tint / background treatment.",
    usedBy: ["Card"],
  },
  {
    prop: "accent",
    type: `"primary" | "success" | "warning" | "attention" | "info" | "destructive" | "featured"`,
    concept: "Edge indicator (3px left edge or full --primary ring).",
    usedBy: ["Card"],
  },
  {
    prop: "padding",
    type: `"tight" | "default" | "cozy" | "none"`,
    concept: "Internal spacing density of the surface.",
    usedBy: [
      "Card",
      "Dialog (planned)",
      "Sheet (planned)",
      "Popover (planned)",
    ],
  },
  {
    prop: "density",
    type: `"compact" | "default" | "comfortable"`,
    concept: "Page-level spacing — usually inherited from [data-density] axis.",
    usedBy: ["Table (explicit)", "every other primitive via token chain"],
  },
  {
    prop: "shape",
    type: `"square" | "circle"`,
    concept: "Geometric form (circle profile pic vs square logo tile).",
    usedBy: ["Avatar", "IconButton"],
  },
  {
    prop: "status",
    type: `"default" | "success" | "warning" | "error"`,
    concept:
      "Form-field validation state — drives border + ring + helper text.",
    usedBy: ["Input family", "Field", "Form"],
  },
  {
    prop: "block",
    type: "boolean",
    concept:
      "Stretches the primitive to fill available width, OR (for region atoms) marks as flush block.",
    usedBy: ["Button", "Card"],
  },
  {
    prop: "hoverable",
    type: "boolean",
    concept: "Adds hover affordance — border lift + shadow + cursor.",
    usedBy: ["Card"],
  },
  {
    prop: "disabled / loading / readOnly / required",
    type: "boolean",
    concept: "Interaction state — each carries ONE concept.",
    usedBy: [
      "Button (disabled, loading)",
      "Input family (disabled, readOnly, required)",
      "Tabs item (disabled)",
      "Checkbox (disabled)",
      "Switch (disabled)",
    ],
  },
  {
    prop: "prefix / suffix",
    type: "ReactNode",
    concept: "Slots INSIDE the chrome — share the same border as the input.",
    usedBy: ["Input", "InputPassword", "InputSearch"],
  },
  {
    prop: "addonBefore / addonAfter",
    type: "ReactNode",
    concept:
      "Slots OUTSIDE the chrome — separate border (e.g. country code, '.com').",
    usedBy: ["Input"],
  },
  {
    prop: "items",
    type: "typed object array",
    concept:
      "Data-driven rows/options. Use this instead of parallel sub-components when the primitive owns item layout.",
    usedBy: [
      "Descriptions",
      "Timeline",
      "SegmentedControl",
      "Checklist",
      "Anchor",
    ],
  },
  {
    prop: "renderItem",
    type: "(item, index) => ReactNode",
    concept:
      "Escape hatch for custom item rendering while keeping the primitive data-driven.",
    usedBy: ["Descriptions", "Timeline", "List", "Transfer"],
  },
  {
    prop: "children",
    type: "ReactNode",
    concept:
      "Primary content slot for leaf primitives. Do not use it to define repeated data rows.",
    usedBy: [
      "Separator (horizontal label)",
      "Button",
      "Tag",
      "Badge",
      "Typography",
    ],
  },
  {
    prop: "titlePlacement",
    type: `"start" | "center" | "end"`,
    concept:
      "Inline label placement inside a horizontal separator. Kept distinct from overlay/region `placement`.",
    usedBy: ["Separator"],
  },
  {
    prop: "orientationMargin",
    type: "number | string",
    concept:
      "Distance from the nearest edge when a labeled Separator uses start/end title placement.",
    usedBy: ["Separator"],
  },
  {
    prop: "title / subtitle / kicker / meta / extra / footer / actions / band",
    type: "ReactNode + enum",
    concept:
      "Card-specific slot family — header / footer regions. See §O in the doc.",
    usedBy: ["Card"],
  },
];

const VOCABULARY_COLUMNS: TableColumn<Row>[] = [
  {
    accessorKey: "prop",
    header: "Prop",
    cell: ({ row }) => <code style={propName}>{row.original.prop}</code>,
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => <code style={propType}>{row.original.type}</code>,
  },
  {
    accessorKey: "concept",
    header: "Concept",
    cell: ({ row }) => row.original.concept,
    meta: { cellStyle: { minWidth: 280 } },
  },
  {
    accessorKey: "usedBy",
    header: "Used by",
    cell: ({ row }) => (
      <span style={muted}>{row.original.usedBy.join(" · ")}</span>
    ),
    meta: { cellStyle: { minWidth: 260 } },
  },
];

export const Vocabulary: StoryObj = {
  name: "Locked vocabulary catalogue",
  render: () => (
    <Table
      density="compact"
      stickyHeader
      containerClassName="card"
      style={{ maxWidth: 1120 }}
      columns={VOCABULARY_COLUMNS}
      data={ROWS}
      getRowId={(row) => row.prop}
    />
  ),
};

interface ForbiddenRow {
  forbidden: string;
  canonical: string;
}

const FORBIDDEN: ForbiddenRow[] = [
  { forbidden: "scale / dimension / width", canonical: "use `size`" },
  { forbidden: "kind / style / look / appearance", canonical: "use `variant`" },
  {
    forbidden: "intent / tint / status (when meaning role-color)",
    canonical: "use `color`",
  },
  { forbidden: "compactness / spacing / dense", canonical: "use `padding`" },
  {
    forbidden: "labelPlacement (Separator label)",
    canonical: "use `titlePlacement`",
  },
  { forbidden: "fullWidth / wide / stretched", canonical: "use `block`" },
  {
    forbidden: "primary={true} (boolean)",
    canonical: 'use `variant="primary"`',
  },
  {
    forbidden: "error={true} (boolean for role-color)",
    canonical: 'use `color="destructive"`',
  },
  { forbidden: "large={true} (boolean)", canonical: 'use `size="large"`' },
];

const FORBIDDEN_COLUMNS: TableColumn<ForbiddenRow>[] = [
  {
    accessorKey: "forbidden",
    header: "Forbidden",
    cell: ({ row }) => (
      <code
        className="mono"
        style={{ fontSize: "var(--text-2xs)", color: "var(--destructive)" }}
      >
        {row.original.forbidden}
      </code>
    ),
  },
  {
    accessorKey: "canonical",
    header: "Canonical",
    cell: ({ row }) => (
      <code
        className="mono"
        style={{ fontSize: "var(--text-2xs)", color: "var(--success)" }}
      >
        {row.original.canonical}
      </code>
    ),
  },
];

export const ForbiddenSynonyms: StoryObj = {
  name: "Forbidden synonyms (rejected at review)",
  parameters: {
    docs: {
      description: {
        story: `Every row below is rejected automatically at review.
Use the canonical name on the right instead. Cardinal rule 23 §B
binds the vocabulary; this list is the explicit black-list.`.trim(),
      },
    },
  },
  render: () => (
    <Table
      density="compact"
      containerClassName="card"
      style={{ maxWidth: 760 }}
      columns={FORBIDDEN_COLUMNS}
      data={FORBIDDEN}
      getRowId={(row) => row.forbidden}
    />
  ),
};
