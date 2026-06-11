/**
 * Central registry — canonical list of all prop concepts.
 * Check here BEFORE inventing a new prop name.
 * @see docs/PROPS-REGISTRY.md
 */

export const VOCABULARY_REGISTRY = {
  // shared.prop.ts
  ClassNameProp: {
    file: "vocabulary/shared.prop.ts",
    category: "shared",
    description: "Root CSS class override",
  },
  ChildrenProp: {
    file: "vocabulary/shared.prop.ts",
    category: "shared",
    description: "Child nodes slot",
  },
  IdProp: {
    file: "vocabulary/shared.prop.ts",
    category: "shared",
    description: "DOM / form element id",
  },
  OpenProp: {
    file: "vocabulary/shared.prop.ts",
    category: "shared",
    description: "Dialog/Sheet/Popover open state",
  },
  DefaultOpenProp: {
    file: "vocabulary/shared.prop.ts",
    category: "shared",
    description: "Dialog/Sheet/Popover initial uncontrolled open state",
  },
  OnOpenChangeProp: {
    file: "vocabulary/shared.prop.ts",
    category: "shared",
    description: "Panel open change handler",
  },
  HandlerProp: {
    file: "vocabulary/shared.prop.ts",
    category: "shared",
    description: "Void async/sync callback",
  },
  PendingProp: {
    file: "vocabulary/shared.prop.ts",
    category: "shared",
    description: "Loading / in-flight state",
  },
  RequiredProp: {
    file: "vocabulary/shared.prop.ts",
    category: "shared",
    description: "Field is mandatory",
  },
  DisabledProp: {
    file: "vocabulary/shared.prop.ts",
    category: "shared",
    description: "Control disabled",
  },
  LabelProp: {
    file: "vocabulary/shared.prop.ts",
    category: "shared",
    description: "Generic label text",
  },
  HelperProp: {
    file: "vocabulary/shared.prop.ts",
    category: "shared",
    description: "Input hint below field",
  },
  ErrorProp: {
    file: "vocabulary/shared.prop.ts",
    category: "shared",
    description: "Validation error message",
  },
  PlaceholderProp: {
    file: "vocabulary/shared.prop.ts",
    category: "shared",
    description: "Input placeholder",
  },
  NameProp: {
    file: "vocabulary/shared.prop.ts",
    category: "shared",
    description: "Form field name",
  },
  ValueProp: {
    file: "vocabulary/shared.prop.ts",
    category: "shared",
    description: "Abstract controlled value",
  },
  DefaultValueProp: {
    file: "vocabulary/shared.prop.ts",
    category: "shared",
    description: "Abstract uncontrolled initial value",
  },
  OnValueChangeProp: {
    file: "vocabulary/shared.prop.ts",
    category: "shared",
    description: "Abstract value change handler",
  },
  OnChangeProp: {
    file: "vocabulary/shared.prop.ts",
    category: "shared",
    description: "Input change handler",
  },
  OnClickProp: {
    file: "vocabulary/shared.prop.ts",
    category: "shared",
    description: "Button click handler",
  },
  AsChildProp: {
    file: "vocabulary/shared.prop.ts",
    category: "shared",
    description: "Radix asChild polymorphism",
  },
  WidthProp: {
    file: "vocabulary/shared.prop.ts",
    category: "shared",
    description: "Explicit layout length (number→px | CSS string) — NOT the SizeProp tier",
  },

  // content.prop.ts
  TitleProp: {
    file: "vocabulary/content.prop.ts",
    category: "content",
    description: "Primary heading",
  },
  SubtitleProp: {
    file: "vocabulary/content.prop.ts",
    category: "content",
    description: "Secondary line under title",
  },
  DescriptionProp: {
    file: "vocabulary/content.prop.ts",
    category: "content",
    description: "Body / explanatory copy",
  },
  ExtraProp: {
    file: "vocabulary/content.prop.ts",
    category: "content",
    description: "Top-right actions (Ant extra)",
  },
  FooterProp: {
    file: "vocabulary/content.prop.ts",
    category: "content",
    description: "Bottom action bar",
  },
  ActionProp: {
    file: "vocabulary/content.prop.ts",
    category: "content",
    description: "Primary CTA slot",
  },
  IconProp: {
    file: "vocabulary/content.prop.ts",
    category: "content",
    description: "Lucide icon component",
  },
  ConfirmLabelProp: {
    file: "vocabulary/content.prop.ts",
    category: "content",
    description: "Dialog confirm label",
  },
  CancelLabelProp: {
    file: "vocabulary/content.prop.ts",
    category: "content",
    description: "Dialog cancel label",
  },
  ActionsProp: {
    file: "vocabulary/content.prop.ts",
    category: "content",
    description: "Toolbar actions slot",
  },
  EmptyMessageProp: {
    file: "vocabulary/content.prop.ts",
    category: "content",
    description: "No-results / no-data message in lists, selects, empty states",
  },

  // layout.prop.ts
  PageDensityProp: {
    file: "vocabulary/layout.prop.ts",
    category: "layout",
    description: "Page padding / control scale",
  },
  DensityProp: {
    file: "vocabulary/layout.prop.ts",
    category: "layout",
    description: "Canonical page/subtree density",
  },
  PageContainerVariantProp: {
    file: "vocabulary/layout.prop.ts",
    category: "layout",
    description: "Page shell layout — default, narrow, flush, ghost",
  },
  GapProp: {
    file: "vocabulary/layout.prop.ts",
    category: "layout",
    description: "Shared gap scale; components may document subsets",
  },
  TableDensityProp: {
    file: "vocabulary/layout.prop.ts",
    category: "layout",
    description: "DataTable row height — NOT PageDensityProp",
  },

  // interaction.prop.ts
  ButtonVariantProp: {
    file: "vocabulary/interaction.prop.ts",
    category: "interaction",
    description: "Button visual variant",
  },
  ButtonSizeProp: {
    file: "vocabulary/interaction.prop.ts",
    category: "interaction",
    description: "Button size preset; includes documented icon-only subset",
  },
  BadgeVariantProp: {
    file: "vocabulary/interaction.prop.ts",
    category: "interaction",
    description: "Badge visual variant (default | secondary | outline | dashed)",
  },
  ShapeProp: {
    file: "vocabulary/interaction.prop.ts",
    category: "interaction",
    description: "Corner shape default | pill | sharp — shared by Button + Badge (radius tokens)",
  },
  TextSizeProp: {
    file: "vocabulary/interaction.prop.ts",
    category: "interaction",
    description: "Text size — golden-ratio type-scale steps (2xs…2xl), never an arbitrary px",
  },
  TextToneProp: {
    file: "vocabulary/interaction.prop.ts",
    category: "interaction",
    description: "Text colour intent — semantic foreground tokens",
  },
  FontWeightProp: {
    file: "vocabulary/interaction.prop.ts",
    category: "interaction",
    description: "Font weight regular | medium | bold — the 3-weight canon (400/500/700, no 600)",
  },
  HeadingLevelProp: {
    file: "vocabulary/interaction.prop.ts",
    category: "interaction",
    description: "Heading level 1-4 — sizes from --heading-h* and the semantic element",
  },
  TextAlignProp: {
    file: "vocabulary/interaction.prop.ts",
    category: "interaction",
    description: "Inline text alignment start | center | end (logical, RTL-safe)",
  },
  SizeProp: {
    file: "vocabulary/interaction.prop.ts",
    category: "interaction",
    description: "Shared size names xs | sm | md | lg",
  },
  FormLayoutProp: {
    file: "vocabulary/interaction.prop.ts",
    category: "interaction",
    description: "Form label layout: vertical | horizontal | inline",
  },
  BreakpointProp: {
    file: "vocabulary/interaction.prop.ts",
    category: "interaction",
    description: "Responsive breakpoint name sm | md | lg | xl (mobile-first)",
  },
  ConfirmVariantProp: {
    file: "vocabulary/interaction.prop.ts",
    category: "interaction",
    description: "Dialog confirm emphasis",
  },
  ToneProp: {
    file: "vocabulary/interaction.prop.ts",
    category: "interaction",
    description: "Semantic status/color intent",
  },
  AlertVariantProp: {
    file: "vocabulary/interaction.prop.ts",
    category: "interaction",
    description: "Inline Alert banner tone",
  },
  SortDirectionProp: {
    file: "vocabulary/interaction.prop.ts",
    category: "interaction",
    description: "asc | desc",
  },
  ColumnAlignProp: {
    file: "vocabulary/interaction.prop.ts",
    category: "interaction",
    description: "Table column alignment",
  },
  SortStateProp: {
    file: "vocabulary/interaction.prop.ts",
    category: "interaction",
    description: "Active table sort",
  },

  // navigation.prop.ts
  BreadcrumbItemProp: {
    file: "vocabulary/navigation.prop.ts",
    category: "navigation",
    description: "Single breadcrumb segment",
  },
  BreadcrumbProp: {
    file: "vocabulary/navigation.prop.ts",
    category: "navigation",
    description: "Breadcrumb trail array",
  },
  ZodSchemaProp: {
    file: "components/form.prop.ts",
    category: "form",
    description: "Zod 4 schema passed to form helpers",
  },
  UseZodFormOptionsProp: {
    file: "components/form.prop.ts",
    category: "form",
    description: "react-hook-form options accepted by useZodForm",
  },
  UseZodFormReturnProp: {
    file: "components/form.prop.ts",
    category: "form",
    description: "react-hook-form return object from useZodForm",
  },
  FieldErrorMessageProp: {
    file: "components/form.prop.ts",
    category: "form",
    description: "Mapped field error message displayed through FormField",
  },

  // data.prop.ts
  GetRowIdProp: {
    file: "vocabulary/data.prop.ts",
    category: "data",
    description: "Row ID extractor generic",
  },
  OnRowClickProp: {
    file: "vocabulary/data.prop.ts",
    category: "data",
    description: "Row click handler generic",
  },
  ColumnDefProp: {
    file: "vocabulary/data.prop.ts",
    category: "data",
    description: "DataTable column definition",
  },
  SelectedIdsProp: {
    file: "vocabulary/data.prop.ts",
    category: "data",
    description: "Selected row ID set",
  },
  OnSelectChangeProp: {
    file: "vocabulary/data.prop.ts",
    category: "data",
    description: "Selection change handler",
  },
  OnTableDensityChangeProp: {
    file: "vocabulary/data.prop.ts",
    category: "data",
    description: "Table density change",
  },
  OnSortChangeProp: {
    file: "vocabulary/data.prop.ts",
    category: "data",
    description: "Table sort change",
  },
  OnSearchChangeProp: {
    file: "vocabulary/data.prop.ts",
    category: "data",
    description: "Debounced search callback",
  },
  OnClearFiltersProp: {
    file: "vocabulary/data.prop.ts",
    category: "data",
    description: "FilterBar clear all",
  },
  HasActiveFiltersProp: {
    file: "vocabulary/data.prop.ts",
    category: "data",
    description: "Any filter active flag",
  },
} as const;

export type VocabularyPropName = keyof typeof VOCABULARY_REGISTRY;

export const COMPONENT_PROP_REGISTRY = {
  AppProviderProp: { group: "app", file: "components/app.prop.ts", vocabulary: ["ChildrenProp"] },
  AppSettingPickerProp: {
    group: "app",
    file: "components/app.prop.ts",
    vocabulary: ["ValueProp", "OnValueChangeProp", "DisabledProp", "IdProp", "ClassNameProp"],
  },
  PageContainerProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: [
      "TitleProp",
      "SubtitleProp",
      "ExtraProp",
      "FooterProp",
      "BreadcrumbProp",
      "DensityProp",
      "PageContainerVariantProp",
    ],
  },
  FlexDirectionProp: { group: "layout", file: "components/layout.prop.ts", vocabulary: [] },
  FlexAlignProp: { group: "layout", file: "components/layout.prop.ts", vocabulary: [] },
  FlexJustifyProp: { group: "layout", file: "components/layout.prop.ts", vocabulary: [] },
  FlexProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: [
      { field: "direction", local: true, reason: "Flex-specific axis control." },
      "GapProp",
      { field: "align", local: true, reason: "Flex-specific align-items keyword subset." },
      { field: "justify", local: true, reason: "Flex-specific justify-content keyword subset." },
      { field: "wrap", local: true, reason: "Flex-specific boolean shorthand for flex-wrap." },
    ],
  },
  ResponsiveGridColumnsProp: { group: "layout", file: "components/layout.prop.ts", vocabulary: [] },
  PageInsetProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: ["ChildrenProp", "ClassNameProp"],
  },
  AppShellProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: ["ChildrenProp"],
  },
  SidebarProductProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: ["LabelProp"],
  },
  SidebarItemProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: ["IdProp", "LabelProp", "DisabledProp", "ChildrenProp"],
  },
  SidebarSectionProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: ["LabelProp"],
  },
  SidebarProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: ["IdProp", "OnValueChangeProp", "ChildrenProp"],
  },
  TopbarProductProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: ["LabelProp"],
  },
  TopbarProjectProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: ["LabelProp"],
  },
  TopbarProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: ["ChildrenProp", "OnOpenChangeProp", "OnValueChangeProp"],
  },
  ButtonProp: {
    group: "general",
    file: "components/general.prop.ts",
    vocabulary: [
      "ButtonVariantProp",
      "SizeProp",
      "ShapeProp",
      "AsChildProp",
      "DisabledProp",
      "OnClickProp",
      "PendingProp",
    ],
  },
  TextProp: {
    group: "general",
    file: "components/general.prop.ts",
    vocabulary: [
      "TextSizeProp",
      "TextToneProp",
      "FontWeightProp",
      "TextAlignProp",
      "ClassNameProp",
    ],
  },
  HeadingProp: {
    group: "general",
    file: "components/general.prop.ts",
    vocabulary: ["HeadingLevelProp", "TextToneProp", "TextAlignProp", "ClassNameProp"],
  },
  InputProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: ["PlaceholderProp", "ValueProp", "DisabledProp"],
  },
  TextareaProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: ["PlaceholderProp", "DisabledProp"],
  },
  NumberInputProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: [
      "ValueProp",
      "DefaultValueProp",
      "OnValueChangeProp",
      "SizeProp",
      "PlaceholderProp",
      "DisabledProp",
      "NameProp",
      "IdProp",
      "ClassNameProp",
    ],
  },
  FormProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: ["FormLayoutProp", "WidthProp", "BreakpointProp", "DensityProp"],
  },
  FormFieldProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: [
      "IdProp",
      "LabelProp",
      "RequiredProp",
      "HelperProp",
      "ErrorProp",
      "FormLayoutProp",
      "WidthProp",
    ],
  },
  SearchInputProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: ["LabelProp", "PlaceholderProp", "OnSearchChangeProp"],
  },
  CheckboxProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: ["DisabledProp"],
  },
  CheckboxGroupProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: ["ValueProp", "DefaultValueProp", "OnValueChangeProp", "DisabledProp"],
  },
  ChoiceOptionProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: ["LabelProp", "ValueProp", "DisabledProp", "DescriptionProp"],
  },
  RadioProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: ["ValueProp", "DefaultValueProp", "OnValueChangeProp", "DisabledProp"],
  },
  RadioGroupProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: ["SizeProp", "DisabledProp"],
  },
  SwitchProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: ["DisabledProp"],
  },
  FieldProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: ["IdProp", "LabelProp", "DescriptionProp", "ClassNameProp", "ChildrenProp"],
  },
  SliderProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: ["DisabledProp"],
  },
  CalendarProp: { group: "data-entry", file: "components/data-entry.prop.ts", vocabulary: [] },
  DatePickerProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: ["ValueProp", "OnValueChangeProp", "PlaceholderProp", "DisabledProp", "IdProp"],
  },
  MonthPickerProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: ["ValueProp", "OnValueChangeProp", "PlaceholderProp", "DisabledProp", "IdProp"],
  },
  MonthRangePickerProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: ["ValueProp", "OnValueChangeProp", "PlaceholderProp", "DisabledProp", "IdProp"],
  },
  DateRangePickerProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: ["ValueProp", "OnValueChangeProp", "PlaceholderProp", "DisabledProp", "IdProp"],
  },
  TimePickerProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: ["ValueProp", "DefaultValueProp", "OnValueChangeProp", "DisabledProp"],
  },
  ColorPickerProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: ["ValueProp", "OnValueChangeProp", "DisabledProp", "IdProp"],
  },
  SearchSelectProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: [
      "ValueProp",
      "OnValueChangeProp",
      "PlaceholderProp",
      "EmptyMessageProp",
      "DisabledProp",
      "NameProp",
      "IdProp",
      "ClassNameProp",
    ],
    note: "Internal — the searchable engine behind `<Select options showSearch>` (not public API); use Select.",
  },
  SelectDataProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: [
      "ValueProp",
      "OnValueChangeProp",
      "PlaceholderProp",
      "EmptyMessageProp",
      "DisabledProp",
      "NameProp",
      "IdProp",
      "ClassNameProp",
    ],
    note: "Ant-style data-driven form of Select (options|loadOptions + showSearch). One Select for all single-selects.",
  },
  SearchSelectOptionProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: ["ValueProp", "LabelProp", "DisabledProp"],
  },
  SearchSelectLoadParamsProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: [],
  },
  SearchSelectLoadResultProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: [],
  },
  UploadProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: [
      "ValueProp",
      "DefaultValueProp",
      "OnValueChangeProp",
      "DisabledProp",
      "ClassNameProp",
    ],
  },
  UploadFileItemProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: [],
  },
  UploadVariantProp: { group: "data-entry", file: "components/data-entry.prop.ts", vocabulary: [] },
  TreeOptionProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: ["ValueProp", "LabelProp", "DisabledProp", "ChildrenProp"],
  },
  TreeFieldNamesProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: ["LabelProp", "ValueProp", "ChildrenProp"],
  },
  CascaderProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: [
      "ValueProp",
      "DefaultValueProp",
      "OnValueChangeProp",
      "PlaceholderProp",
      "DisabledProp",
      "ClassNameProp",
      "IdProp",
    ],
  },
  TreeSelectProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: [
      "ValueProp",
      "DefaultValueProp",
      "OnValueChangeProp",
      "PlaceholderProp",
      "DisabledProp",
      "ClassNameProp",
      "IdProp",
    ],
  },
  ShowCheckedStrategyProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: [],
  },
  TransferProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: ["DisabledProp", "ClassNameProp"],
  },
  TransferItemProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: ["TitleProp", "DescriptionProp", "DisabledProp"],
  },
  EmptyStateProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: ["IconProp", "TitleProp", "DescriptionProp", "ActionProp"],
  },
  DescriptionsProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: ["ClassNameProp"],
  },
  DescriptionsItemProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: ["LabelProp", "ValueProp"],
  },
  BadgeProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: ["BadgeVariantProp", "ShapeProp", "ToneProp", "ChildrenProp", "ClassNameProp"],
  },
  DataTableProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: ["ColumnDefProp", "DensityProp", "SortStateProp", "SelectedIdsProp"],
  },
  AlertDialogProp: {
    group: "feedback",
    file: "components/feedback.prop.ts",
    vocabulary: [
      "OpenProp",
      "OnOpenChangeProp",
      "TitleProp",
      "DescriptionProp",
      "ConfirmLabelProp",
      "CancelLabelProp",
      "ConfirmVariantProp",
      {
        field: "confirmPhrase",
        local: true,
        reason: "Destructive-dialog type-to-confirm friction phrase.",
      },
      "HandlerProp",
      {
        field: "keepOpenOnConfirm",
        local: true,
        reason: "AlertDialog-specific async completion behavior.",
      },
      "PendingProp",
    ],
  },
  DataStateProp: { group: "query", file: "components/query.prop.ts", vocabulary: ["HandlerProp"] },
  AlertMutationFeedbackProp: {
    group: "query",
    file: "components/query.prop.ts",
    vocabulary: [
      {
        field: "mutation",
        local: true,
        reason: "TanStack mutation lifecycle object consumed by this helper.",
      },
      "HandlerProp",
      { field: "showRetry", local: true, reason: "Query helper retry affordance toggle." },
      {
        field: "pending",
        local: true,
        reason: "Inline pending ReactNode slot, not boolean PendingProp state.",
      },
      "ClassNameProp",
    ],
  },
  ButtonRefetchProp: {
    group: "query",
    file: "components/query.prop.ts",
    vocabulary: [
      {
        field: "query",
        local: true,
        reason: "TanStack query refetch handle consumed by this helper.",
      },
      "LabelProp",
    ],
  },
  InfiniteQueryStateProp: {
    group: "query",
    file: "components/query.prop.ts",
    vocabulary: ["HandlerProp"],
  },
  PrefetchLinkProp: { group: "query", file: "components/query.prop.ts", vocabulary: [] },
  AlertQueryErrorProp: {
    group: "feedback",
    file: "components/feedback.prop.ts",
    vocabulary: ["HandlerProp"],
  },
  AlertProp: {
    group: "feedback",
    file: "components/feedback.prop.ts",
    vocabulary: [
      "AlertVariantProp",
      "ToneProp",
      "IconProp",
      "OnValueChangeProp",
      "ClassNameProp",
      "ChildrenProp",
    ],
  },
  AlertTitleProp: {
    group: "feedback",
    file: "components/feedback.prop.ts",
    vocabulary: ["ClassNameProp", "ChildrenProp"],
  },
  AlertContentProp: {
    group: "feedback",
    file: "components/feedback.prop.ts",
    vocabulary: ["ClassNameProp", "ChildrenProp"],
  },
  AlertDescriptionProp: {
    group: "feedback",
    file: "components/feedback.prop.ts",
    vocabulary: ["ClassNameProp", "ChildrenProp"],
  },
  AlertActionsProp: {
    group: "feedback",
    file: "components/feedback.prop.ts",
    vocabulary: ["ClassNameProp", "ChildrenProp"],
  },
  SkeletonRowsProp: { group: "feedback", file: "components/feedback.prop.ts", vocabulary: [] },
  ToolbarProp: {
    group: "navigation",
    file: "components/navigation.prop.ts",
    vocabulary: ["OnClearFiltersProp", "HasActiveFiltersProp", "ClassNameProp", "ChildrenProp"],
  },
  ToolbarGroupProp: {
    group: "navigation",
    file: "components/navigation.prop.ts",
    vocabulary: ["LabelProp", "ClassNameProp", "ChildrenProp"],
  },
  PaginationProp: {
    group: "navigation",
    file: "components/navigation.prop.ts",
    vocabulary: ["ValueProp", "OnValueChangeProp", "DisabledProp", "ClassNameProp"],
  },
  StepsProp: {
    group: "navigation",
    file: "components/navigation.prop.ts",
    vocabulary: ["ValueProp", "DefaultValueProp", "SizeProp", "OnValueChangeProp", "ClassNameProp"],
  },
  StepItemProp: {
    group: "navigation",
    file: "components/navigation.prop.ts",
    vocabulary: ["TitleProp", "SubtitleProp", "DescriptionProp", "IconProp", "DisabledProp"],
  },
  StepStatusProp: { group: "navigation", file: "components/navigation.prop.ts", vocabulary: [] },
  TabsProp: {
    group: "navigation",
    file: "components/navigation.prop.ts",
    vocabulary: ["ValueProp", "DefaultValueProp", "OnValueChangeProp", "ClassNameProp"],
  },
  TabItemProp: {
    group: "navigation",
    file: "components/navigation.prop.ts",
    vocabulary: ["ValueProp", "LabelProp", "ChildrenProp", "DisabledProp"],
  },
  FormRootProp: {
    group: "form",
    file: "components/form.prop.ts",
    vocabulary: ["UseZodFormReturnProp", "ZodSchemaProp"],
  },
  ZodSchemaProp: {
    group: "form",
    file: "components/form.prop.ts",
    vocabulary: ["ZodSchemaProp"],
  },
  UseZodFormReturnProp: {
    group: "form",
    file: "components/form.prop.ts",
    vocabulary: ["UseZodFormReturnProp"],
  },
  FieldErrorMessageProp: {
    group: "form",
    file: "components/form.prop.ts",
    vocabulary: ["FieldErrorMessageProp"],
  },
  FormFieldControlProp: {
    group: "form",
    file: "components/form.prop.ts",
    vocabulary: ["LabelProp", "RequiredProp", "HelperProp", "ErrorProp"],
  },
  UseZodFormOptionsProp: {
    group: "form",
    file: "components/form.prop.ts",
    vocabulary: ["ZodSchemaProp"],
  },

  // Component-declared prop types (XProps in src/components/**) — registered here so the
  // prop-vocabulary guard governs them too (their fields are mostly Radix/native passthroughs).
  ToggleProp: {
    group: "data-entry",
    file: "components/ui/toggle.tsx",
    vocabulary: ["SizeProp", "ClassNameProp"],
  },
  RatingProp: {
    group: "data-entry",
    file: "components/ui/rating.tsx",
    vocabulary: ["ValueProp", "OnValueChangeProp", "DisabledProp", "ClassNameProp"],
  },
  TagInputProp: {
    group: "data-entry",
    file: "components/ui/tag-input.tsx",
    vocabulary: ["ValueProp", "OnValueChangeProp", "PlaceholderProp", "IdProp", "ClassNameProp"],
  },
  PasswordInputProp: {
    group: "data-entry",
    file: "components/ui/password-input.tsx",
    vocabulary: ["ClassNameProp"],
  },
  PasswordStrengthProp: {
    group: "data-entry",
    file: "components/data-entry/password-strength.tsx",
    vocabulary: ["ValueProp", "ClassNameProp"],
  },
  ProgressProp: {
    group: "data-display",
    file: "components/data-display/progress.tsx",
    vocabulary: ["ValueProp", "LabelProp", "ClassNameProp"],
  },
  TimelineProp: {
    group: "data-display",
    file: "components/data-display/timeline.tsx",
    vocabulary: ["ClassNameProp"],
  },
  TreeListProp: {
    group: "data-display",
    file: "components/data-display/tree-list.tsx",
    vocabulary: ["ClassNameProp"],
  },
  CardProp: {
    group: "data-display",
    file: "components/data-display/card.tsx",
    vocabulary: ["ToneProp", "ClassNameProp", "ChildrenProp"],
  },
  CardCoverProp: {
    group: "data-display",
    file: "components/data-display/card.tsx",
    vocabulary: ["ClassNameProp", "ChildrenProp"],
  },
  CardHeaderProp: {
    group: "data-display",
    file: "components/data-display/card.tsx",
    vocabulary: ["TitleProp", "DescriptionProp", "ClassNameProp", "ChildrenProp"],
  },
  CardContentProp: {
    group: "data-display",
    file: "components/data-display/card.tsx",
    vocabulary: ["ClassNameProp", "ChildrenProp"],
  },
  CardFooterProp: {
    group: "data-display",
    file: "components/data-display/card.tsx",
    vocabulary: ["ClassNameProp", "ChildrenProp"],
  },
  CardBarProp: {
    group: "data-display",
    file: "components/data-display/card.tsx",
    vocabulary: ["ClassNameProp", "ChildrenProp"],
  },
  StatCardProp: {
    group: "data-display",
    file: "components/data-display/card.tsx",
    vocabulary: ["TitleProp", "ToneProp", "ClassNameProp"],
  },
  ResponsiveGridProp: {
    group: "layout",
    file: "components/layout/responsive-grid.tsx",
    vocabulary: ["GapProp", "ClassNameProp", "ChildrenProp"],
  },
  SplitPaneProp: {
    group: "layout",
    file: "components/layout/split-pane.tsx",
    vocabulary: ["ClassNameProp", "ChildrenProp"],
  },
} as const;

export type ComponentPropName = keyof typeof COMPONENT_PROP_REGISTRY;

/** Forbidden duplicate concepts — use the canonical name on the left. */
export const PROP_ALIASES_FORBIDDEN = {
  description: "Use SubtitleProp (pages) or DescriptionProp (dialogs/empty states)",
  actions: "Use ExtraProp (page header) or ActionsProp (toolbars)",
  density: "Disambiguate: PageDensityProp vs TableDensityProp",
  gap: "Use GapProp; document any component-specific subset with a registry reason",
  onClear: "Use OnClearFiltersProp",
  pending: "Use PendingProp",
  loading: "Use PendingProp or DataStateProp (query group)",
} as const;
