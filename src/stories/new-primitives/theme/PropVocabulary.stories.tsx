import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "../../../components/primitives/Card";
import { Flex } from "../../../components/primitives/layout";

/**
 * new-primitives/Prop vocabulary — visual catalogue for the
 * locked shared prop axes (cardinal rule 23 §B). Walks through
 * every prop name + type + usage.
 *
 * Source-of-truth: `new-docs/04-prop-vocabulary.md`.
 */

const meta: Meta = {
  title: "new-primitives/Theme/Prop vocabulary",
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

const muted = { fontSize: "var(--card-meta-size)", color: "var(--muted-foreground)" } as const;
const propName = { width: 130, fontSize: "var(--text-sm)", fontWeight: 500 } as const;
const propType = { fontSize: "var(--text-2xs)", fontFamily: "var(--font-mono)", color: "var(--muted-foreground)" } as const;

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
    concept: "Dimensional scale of the primitive itself — height, font, internal pad.",
    usedBy: ["Button", "Input", "InputPassword", "InputSearch", "TimeInput", "DateField", "TimeField", "DatePicker", "DateRangePicker", "Avatar", "AvatarStack", "Tag", "Badge", "IconButton", "Spinner", "SegmentedControl"],
  },
  {
    prop: "variant",
    type: "primitive-specific enum",
    concept: "Visual treatment — how the primitive is drawn (filled / outlined / ghost / link).",
    usedBy: ["Button (primary | secondary | ghost | outline | link)", "Badge (soft | solid | outline)", "Tag (inherits Badge)", "Alert (planned)"],
  },
  {
    prop: "color",
    type: `"primary" | "success" | "warning" | "attention" | "info" | "destructive" | "default"`,
    concept: "Semantic role — maps to a semantic token. Use 'attention' for non-destructive alerts.",
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
    usedBy: ["Card", "Dialog (planned)", "Sheet (planned)", "Popover (planned)"],
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
    concept: "Form-field validation state — drives border + ring + helper text.",
    usedBy: ["Input family", "Field", "FormItem"],
  },
  {
    prop: "block",
    type: "boolean",
    concept: "Stretches the primitive to fill available width, OR (for region atoms) marks as flush block.",
    usedBy: ["Button", "CardHeader", "CardBody", "CardFooter"],
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
    usedBy: ["Button (disabled, loading)", "Input family (disabled, readOnly, required)", "Tabs item (disabled)", "Checkbox (disabled)", "Switch (disabled)"],
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
    concept: "Slots OUTSIDE the chrome — separate border (e.g. country code, '.com').",
    usedBy: ["Input"],
  },
  {
    prop: "title / subtitle / kicker / meta / extra / footer / actions / band",
    type: "ReactNode + enum",
    concept: "Card-specific slot family — header / footer regions. See §O in the doc.",
    usedBy: ["Card"],
  },
];

export const Vocabulary: StoryObj = {
  name: "Locked vocabulary catalogue",
  render: () => (
    <Flex vertical gap="middle">
      {ROWS.map((r) => (
        <Card key={r.prop} padding="default" tone="default" accent="primary">
          <Flex vertical gap="small">
            <Flex align="baseline" gap="middle">
              <code style={propName}>{r.prop}</code>
              <code style={propType}>{r.type}</code>
            </Flex>
            <span style={muted}>{r.concept}</span>
            <div style={{ ...muted, paddingTop: 4, borderTop: "1px dashed var(--border)" }}>
              <strong>Used by</strong>: {r.usedBy.join(" · ")}
            </div>
          </Flex>
        </Card>
      ))}
    </Flex>
  ),
};

const FORBIDDEN: Array<[string, string]> = [
  ["scale / dimension / width",     "use `size`"],
  ["kind / style / look / appearance", "use `variant`"],
  ["intent / tint / status (when meaning role-color)", "use `color`"],
  ["compactness / spacing / dense", "use `padding`"],
  ["fullWidth / wide / stretched",  "use `block`"],
  ["primary={true} (boolean)",      "use `variant=\"primary\"`"],
  ["error={true} (boolean for role-color)", "use `color=\"destructive\"`"],
  ["large={true} (boolean)",        "use `size=\"large\"`"],
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
    <Card title="Forbidden synonyms" meta="rule 23 §B">
      <div className="dv-stack">
        {FORBIDDEN.map(([bad, good]) => (
          <Flex key={bad} align="center" gap="middle">
            <code className="mono" style={{ width: 320, fontSize: "var(--text-2xs)", color: "var(--destructive)" }}>{bad}</code>
            <span style={muted}>→</span>
            <code className="mono" style={{ fontSize: "var(--text-2xs)", color: "var(--success)" }}>{good}</code>
          </Flex>
        ))}
      </div>
    </Card>
  ),
};
