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
  ValueProp: { file: "vocabulary/shared.prop.ts", category: "shared", description: "String value" },
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
  PageContainerVariantProp: {
    file: "vocabulary/layout.prop.ts",
    category: "layout",
    description: "Page shell layout — default, narrow, flush, ghost",
  },
  StackGapProp: {
    file: "vocabulary/layout.prop.ts",
    category: "layout",
    description: "Vertical Stack gap",
  },
  InlineGapProp: {
    file: "vocabulary/layout.prop.ts",
    category: "layout",
    description: "Horizontal Inline gap",
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
    description: "Button size preset",
  },
  ConfirmVariantProp: {
    file: "vocabulary/interaction.prop.ts",
    category: "interaction",
    description: "Dialog confirm emphasis",
  },
  StatusToneProp: {
    file: "vocabulary/interaction.prop.ts",
    category: "interaction",
    description: "StatusBadge color tone",
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
  PageTitleProp: {
    file: "vocabulary/navigation.prop.ts",
    category: "navigation",
    description: "Alias of TitleProp in page context",
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
  PageContainerProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: [
      "PageTitleProp",
      "SubtitleProp",
      "ExtraProp",
      "FooterProp",
      "BreadcrumbProp",
      "PageDensityProp",
      "PageContainerVariantProp",
    ],
  },
  StackProp: { group: "layout", file: "components/layout.prop.ts", vocabulary: ["StackGapProp"] },
  InlineProp: { group: "layout", file: "components/layout.prop.ts", vocabulary: ["InlineGapProp"] },
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
  SidebarProductProp: { group: "layout", file: "components/layout.prop.ts", vocabulary: [] },
  SidebarItemProp: { group: "layout", file: "components/layout.prop.ts", vocabulary: [] },
  SidebarSectionProp: { group: "layout", file: "components/layout.prop.ts", vocabulary: [] },
  SidebarProp: { group: "layout", file: "components/layout.prop.ts", vocabulary: [] },
  TopbarProductProp: { group: "layout", file: "components/layout.prop.ts", vocabulary: [] },
  TopbarProjectProp: { group: "layout", file: "components/layout.prop.ts", vocabulary: [] },
  TopbarProp: { group: "layout", file: "components/layout.prop.ts", vocabulary: [] },
  PageHeaderProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: ["PageTitleProp", "SubtitleProp", "ExtraProp", "BreadcrumbProp"],
    deprecated: true,
  },
  ButtonProp: {
    group: "general",
    file: "components/general.prop.ts",
    vocabulary: [
      "ButtonVariantProp",
      "ButtonSizeProp",
      "AsChildProp",
      "DisabledProp",
      "OnClickProp",
    ],
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
  FormFieldProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: ["IdProp", "LabelProp", "RequiredProp", "HelperProp", "ErrorProp"],
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
    vocabulary: ["DisabledProp"],
  },
  ChoiceOptionProp: { group: "data-entry", file: "components/data-entry.prop.ts", vocabulary: [] },
  RadioProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: ["DisabledProp"],
  },
  RadioGroupProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: ["DisabledProp"],
  },
  SwitchProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: ["DisabledProp"],
  },
  SwitchFieldProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: [
      "IdProp",
      "LabelProp",
      "RequiredProp",
      "HelperProp",
      "ErrorProp",
      "DisabledProp",
      "ClassNameProp",
    ],
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
    vocabulary: ["PlaceholderProp", "DisabledProp", "IdProp"],
  },
  DateRangePickerProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: ["PlaceholderProp", "DisabledProp", "IdProp"],
  },
  TimePickerProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: ["DisabledProp"],
  },
  ColorPickerProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: ["DisabledProp", "IdProp"],
  },
  AutocompleteProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: [
      "PlaceholderProp",
      "ValueProp",
      "DisabledProp",
      "IdProp",
      "EmptyMessageProp",
      "ClassNameProp",
    ],
    note: "Deprecated — a thin wrapper over SearchSelect (static options).",
  },
  SearchSelectProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: [
      "ValueProp",
      "PlaceholderProp",
      "EmptyMessageProp",
      "DisabledProp",
      "NameProp",
      "IdProp",
      "ClassNameProp",
    ],
    note: "Deprecated — the searchable engine behind `<Select options showSearch>`; prefer Select.",
  },
  SelectDataProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: [
      "ValueProp",
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
    vocabulary: [],
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
    vocabulary: ["DisabledProp", "ClassNameProp"],
  },
  UploadFileItemProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: [],
  },
  UploadVariantProp: { group: "data-entry", file: "components/data-entry.prop.ts", vocabulary: [] },
  TreeOptionProp: { group: "data-entry", file: "components/data-entry.prop.ts", vocabulary: [] },
  TreeFieldNamesProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: [],
  },
  CascaderProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: ["PlaceholderProp", "DisabledProp", "ClassNameProp", "IdProp"],
  },
  TreeSelectProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: ["PlaceholderProp", "DisabledProp", "ClassNameProp", "IdProp"],
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
  TransferItemProp: { group: "data-entry", file: "components/data-entry.prop.ts", vocabulary: [] },
  EmptyStateProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: ["IconProp", "TitleProp", "DescriptionProp", "ActionProp"],
  },
  KeyValueGridProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: [],
  },
  StatusBadgeProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: ["StatusToneProp"],
  },
  DataTableProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: ["ColumnDefProp", "TableDensityProp", "SortStateProp", "SelectedIdsProp"],
  },
  BadgeProp: { group: "data-display", file: "components/data-display.prop.ts", vocabulary: [] },
  DialogConfirmProp: {
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
      "HandlerProp",
      "PendingProp",
    ],
  },
  DataStateProp: { group: "query", file: "components/query.prop.ts", vocabulary: ["HandlerProp"] },
  MutationFeedbackProp: {
    group: "query",
    file: "components/query.prop.ts",
    vocabulary: ["HandlerProp"],
  },
  QueryRefetchButtonProp: { group: "query", file: "components/query.prop.ts", vocabulary: [] },
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
    vocabulary: ["AlertVariantProp", "IconProp", "HandlerProp", "ClassNameProp", "ChildrenProp"],
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
  FilterBarProp: {
    group: "navigation",
    file: "components/navigation.prop.ts",
    vocabulary: ["OnClearFiltersProp", "HasActiveFiltersProp", "ChildrenProp"],
  },
  FilterGroupProp: {
    group: "navigation",
    file: "components/navigation.prop.ts",
    vocabulary: ["LabelProp", "ChildrenProp"],
  },
  PaginationProp: {
    group: "navigation",
    file: "components/navigation.prop.ts",
    vocabulary: ["DisabledProp", "ClassNameProp"],
  },
  StepsProp: {
    group: "navigation",
    file: "components/navigation.prop.ts",
    vocabulary: ["ClassNameProp"],
  },
  StepItemProp: { group: "navigation", file: "components/navigation.prop.ts", vocabulary: [] },
  StepStatusProp: { group: "navigation", file: "components/navigation.prop.ts", vocabulary: [] },
  TabsItemsProp: {
    group: "navigation",
    file: "components/navigation.prop.ts",
    vocabulary: ["ClassNameProp"],
  },
  TabItemProp: { group: "navigation", file: "components/navigation.prop.ts", vocabulary: [] },
  FormRootProp: {
    group: "form",
    file: "components/form.prop.ts",
    vocabulary: ["UseZodFormReturnProp", "ZodSchemaProp"],
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
} as const;

export type ComponentPropName = keyof typeof COMPONENT_PROP_REGISTRY;

/** Forbidden duplicate concepts — use the canonical name on the left. */
export const PROP_ALIASES_FORBIDDEN = {
  description: "Use SubtitleProp (pages) or DescriptionProp (dialogs/empty states)",
  actions: "Use ExtraProp (page header) or ActionsProp (toolbars)",
  density: "Disambiguate: PageDensityProp vs TableDensityProp",
  gap: "Disambiguate: StackGapProp vs InlineGapProp",
  onClear: "Use OnClearFiltersProp",
  pending: "Use PendingProp",
  loading: "Use PendingProp or DataStateProp (query group)",
} as const;
