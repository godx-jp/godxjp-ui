/**
 * Shared prop-vocabulary catalog — mirrors `src/props/` in the
 * framework. Consumers reach for this to know the canonical value
 * unions before authoring a new primitive or a wrapper.
 *
 * See also: `docs/specs/04-prop-vocabulary.md` (the rule) +
 * `docs/specs/06-prop-vocabulary-audit.md` (the audit findings).
 */

export interface PropVocabEntry {
  /** Canonical type name (matches `src/props/{file}.ts`). */
  name: string;
  /** Concept the union represents. */
  concept: string;
  /** Literal values. */
  values: string[];
  /** Primitives that use this exact vocabulary (or alias to it). */
  usedBy: string[];
  /** Optional notes (subtypes, related aliases, gotchas). */
  notes?: string;
}

export const PROP_VOCABULARY: PropVocabEntry[] = [
  {
    name: "SizeProp",
    concept: "Dimensional scale for most primitives.",
    values: ["small", "default", "large"],
    usedBy: [
      "InputSize", "CheckboxGroupSize", "ColorPickerSize", "MediaUploadSize",
      "ProgressSize", "RadioGroupSize", "RateSize", "TransferSize",
      "SegmentedControlSize (subset)", "SpaceSize (+ number)",
      "FlexGap (+ number)", "GridGap (+ number)", "MasonryGap (+ number)",
    ],
  },
  {
    name: "SizeWithXSProp",
    concept: 'Extension of `SizeProp` with `"x-small"` for compact icon-bar / table-row contexts.',
    values: ["x-small", "small", "default", "large"],
    usedBy: ["ButtonSize"],
  },
  {
    name: "IconSizeProp",
    concept: "Icon-symbol shaped primitives (visual axis = glyph size, not height).",
    values: ["sm", "md", "lg"],
    usedBy: ["SpinnerSize", "IconButtonSize"],
  },
  {
    name: "StatusProp",
    concept: "Form-field validation state.",
    values: ["default", "error", "warning", "success"],
    usedBy: ["InputStatus"],
    notes: 'Form errors use `"error"` (not `"destructive"`) — different concern from destructive actions.',
  },
  {
    name: "ToneProp",
    concept: "Same values as StatusProp — name chosen when describing surface colouring rather than validation.",
    values: ["default", "error", "warning", "success"],
    usedBy: ["(alias of StatusProp)"],
  },
  {
    name: "HelpToneProp",
    concept: "Help-line / Alert colour ladder. Adds `info` + `warn` to StatusProp.",
    values: ["default", "info", "warn", "error", "success"],
    usedBy: ["FieldHelpTone"],
  },
  {
    name: "OrientationProp",
    concept: "Layout axis.",
    values: ["horizontal", "vertical"],
    usedBy: [
      "AnchorOrientation", "MenuOrientation", "RadioGroupOrientation",
      "CheckboxGroupOrientation", "SegmentedControlOrientation",
      "StepsOrientation", "TabsOrientation",
    ],
  },
  {
    name: "DensityProp",
    concept: "Internal row-height / padding scale (distinct from SizeProp — density rescales chrome, size rescales the primitive's own visual axis).",
    values: ["compact", "default", "comfortable"],
    usedBy: ["TreeDensity", "TableDensity"],
  },
  {
    name: "SideProp",
    concept: "Edge a floating panel docks against.",
    values: ["top", "right", "bottom", "left"],
    usedBy: ["SheetSide", "TabsPlacement", "TableStickySide (subset)"],
  },
  {
    name: "PlacementProp",
    concept: "Extension of SideProp with a centred anchor (Tabs placement, Tour spotlight).",
    values: ["top", "right", "bottom", "left", "center"],
    usedBy: ["TourPlacement"],
  },
  {
    name: "PaddingProp",
    concept: "Outer gutter scale for surface containers.",
    values: ["tight", "default", "cozy", "none"],
    usedBy: ["CardPadding", "PageHeaderPadding", "PageContentPadding"],
  },
  {
    name: "AlignProp",
    concept: "CSS-flexbox cross-axis alignment ladder.",
    values: ["start", "end", "center", "stretch", "baseline"],
    usedBy: ["FlexAlign"],
  },
  {
    name: "ColorProp",
    concept: "Full semantic palette — every CSS variable slot.",
    values: ["default", "info", "success", "warning", "destructive", "attention", "primary", "secondary"],
    usedBy: ["TagPresetColor (− secondary)", "TimelineColor (− secondary)", "SpinnerTone (+ muted)"],
    notes:
      'Each value maps 1:1 to a CSS variable (`--info`, `--success`, `--warning`, `--destructive`, `--attention`, `--primary`, `--secondary`). The `data-accent` axis rebinds `--primary`\'s hue without renaming the slot.',
  },
  {
    name: "FeedbackColorProp",
    concept: "Subset of ColorProp accepted by feedback primitives (no brand `primary` since they are themselves informational).",
    values: ["default", "info", "success", "warning", "destructive"],
    usedBy: ["AlertColor", "ResultColor", "ProgressColor"],
  },
  {
    name: "LoadingProp",
    concept: "Loading-state union — shared across Form / FormField / data-entry primitives.",
    values: ["true", "false", '{ kind: "spinner" }', '{ kind: "skeleton" }', '{ kind, label }'],
    usedBy: ["FormProps.loading", "FormFieldProps.loading"],
    notes:
      'Cascade: `<Form loading>` sets a default for every nested `<FormField>`. Per-field `loading` overrides Form\'s. `true` → spinner (default). `{ kind: "skeleton" }` → use for INITIAL fetch state. UX nuance: skeleton on init, spinner on save.',
  },
];

export function findVocab(name: string): PropVocabEntry | undefined {
  const normalized = name.trim().toLowerCase().replace(/prop$/i, "");
  return PROP_VOCABULARY.find(
    (v) => v.name.toLowerCase().replace(/prop$/i, "") === normalized,
  );
}
