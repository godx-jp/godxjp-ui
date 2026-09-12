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
  ErrorBagProp: {
    file: "vocabulary/shared.prop.ts",
    category: "shared",
    description: "Server validation error bag keyed by field name (Laravel/Inertia errors)",
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
  FlushProp: {
    file: "vocabulary/shared.prop.ts",
    category: "shared",
    description:
      "Content owns its own inset — the container drops its padding so the child reaches the frame edge (CardContent/CardFooter flush, TableCell flush, PopoverContent flush)",
  },
  WidthProp: {
    file: "vocabulary/shared.prop.ts",
    category: "shared",
    description: "Explicit layout length (number→px | CSS string) — NOT the SizeProp tier",
  },
  ControlWidthProp: {
    file: "vocabulary/shared.prop.ts",
    category: "shared",
    description: "Inline sizing of a control: full (fill the column) | auto (hug the label)",
  },
  AllowClearProp: {
    file: "vocabulary/shared.prop.ts",
    category: "shared",
    description: "antd `allowClear` — boolean, or { clearIcon, label } for the clear control",
  },
  MaxTagCountProp: {
    file: "vocabulary/shared.prop.ts",
    category: "shared",
    description: "antd `maxTagCount` — visible selected values before the rest collapse",
  },
  MaxTagPlaceholderProp: {
    file: "vocabulary/shared.prop.ts",
    category: "shared",
    description: "antd `maxTagPlaceholder` — the overflow node standing in for hidden values",
  },
  NotFoundContentProp: {
    file: "vocabulary/shared.prop.ts",
    category: "shared",
    description: "antd `notFoundContent` — node shown when a popup has nothing to list",
  },
  PopupMatchWidthProp: {
    file: "vocabulary/shared.prop.ts",
    category: "shared",
    description: "antd `popupMatchSelectWidth` — true | false | pixel width for the popup",
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
  StatusProp: {
    file: "vocabulary/content.prop.ts",
    category: "content",
    description: "Status/meta band beside a title (StatusBadge, meta text)",
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
  CenteredShellWidthProp: {
    file: "vocabulary/layout.prop.ts",
    category: "layout",
    description: "CenteredShell column max-width — sm, md, lg",
  },
  CenteredShellAlignProp: {
    file: "vocabulary/layout.prop.ts",
    category: "layout",
    description:
      "CenteredShell column block alignment — start (flowing page), center (system surface)",
  },
  MobileShellHeightProp: {
    file: "vocabulary/layout.prop.ts",
    category: "layout",
    description:
      "MobileShell block-size contract — viewport (100dvh root, the real app) | fill (fills a bounded parent, e.g. a device-frame preview)",
  },
  MobileShellWidthProp: {
    file: "vocabulary/layout.prop.ts",
    category: "layout",
    description:
      "MobileShell inline-size contract — fill (takes the whole inline size, the default) | phone (caps at the handheld measure and centres, for a handheld screen on a wider viewport)",
  },
  CenteredShellPresetProp: {
    file: "vocabulary/layout.prop.ts",
    category: "layout",
    description:
      "CenteredShell whole-page preset — default (untouched box) | public-landing (token-owned public landing measure, section rhythm, flat chrome and hero h1 tier)",
  },
  TablePresetProp: {
    file: "vocabulary/data.prop.ts",
    category: "data",
    description:
      "Table collection preset — default | action-collection (dense approval/action queue: column-priority measures below the collapse step instead of desktop intrinsic widths)",
  },
  TableColumnPriorityProp: {
    file: "vocabulary/data.prop.ts",
    category: "data",
    description:
      "Table column priority for the action-collection preset — primary | secondary | meta | actions (unset = takes the remaining space)",
  },
  ColumnFixedProp: {
    file: "vocabulary/data.prop.ts",
    category: "data",
    description:
      "Table column sticky edge — start | end (logical; antd `fixed`, whose physical left/right cannot mirror for RTL)",
  },
  ColumnFilterValueProp: {
    file: "vocabulary/data.prop.ts",
    category: "data",
    description: "One value a table column filter can carry — string | number | boolean",
  },
  ColumnFilterItemProp: {
    file: "vocabulary/data.prop.ts",
    category: "data",
    description:
      "One option in a table column filter menu — { text, value } (antd ColumnFilterItem)",
  },
  ColumnFilterStateProp: {
    file: "vocabulary/data.prop.ts",
    category: "data",
    description: "Active filter selection for one table column (antd FilterValue)",
  },
  OnColumnFilterChangeProp: {
    file: "vocabulary/data.prop.ts",
    category: "data",
    description:
      "Column-filter change handler keyed by column — this library's split of the `filters` argument antd passes to the table-level onChange",
  },
  ColumnCompareProp: {
    file: "vocabulary/data.prop.ts",
    category: "data",
    description: "Table column comparator (a, b) => number — the `compare` half of antd's sorter",
  },
  ColumnSorterProp: {
    file: "vocabulary/data.prop.ts",
    category: "data",
    description:
      "Table column sort declaration — true | comparator | { compare, multiple } where `multiple` is the multi-column sort priority (antd sorter)",
  },
  TableSelectionItemProp: {
    file: "vocabulary/data.prop.ts",
    category: "data",
    description:
      "One entry in the selection-column dropdown — { key, text, onSelect } (antd SelectionItem)",
  },
  TableRowSelectionProp: {
    file: "vocabulary/data.prop.ts",
    category: "data",
    description:
      "DataTable row-selection config — type | selectedRowKeys | onChange | getCheckboxProps | preserveSelectedRowKeys | selections | hideSelectAll | columnTitle (antd TableRowSelection)",
  },
  TableExpandableProp: {
    file: "vocabulary/data.prop.ts",
    category: "data",
    description:
      "DataTable expandable-row config — expandedRowRender | rowExpandable | defaultExpandAllRows | expandedRowKeys | onExpandedRowsChange | expandRowByClick (antd/rc-table ExpandableConfig)",
  },
  TableSummaryProp: {
    file: "vocabulary/data.prop.ts",
    category: "data",
    description: "DataTable footer totals row — (rows) => ReactNode (antd/rc-table summary)",
  },
  TableScrollProp: {
    file: "vocabulary/data.prop.ts",
    category: "data",
    description:
      "DataTable scroll envelope { x, y } — published as --table-scroll-x / --table-scroll-y so the lengths stay data and the geometry stays in CSS (antd scroll)",
  },
  TableStickyProp: {
    file: "vocabulary/data.prop.ts",
    category: "data",
    description:
      "DataTable sticky header — true | { offsetHeader }, published as --table-sticky-offset (antd sticky)",
  },
  OnRowProp: {
    file: "vocabulary/data.prop.ts",
    category: "data",
    description: "Per-row DOM props merged onto the <tr> (antd onRow)",
  },
  DescriptionsColumnProp: {
    file: "vocabulary/data.prop.ts",
    category: "data",
    description:
      "Descriptions column count — a number (this library's mobile-first ladder) or antd's responsive { sm, md, lg, xl } object",
  },
  DescriptionsSpanProp: {
    file: "vocabulary/data.prop.ts",
    category: "data",
    description:
      "How many columns one Descriptions item occupies — number | 'filled' (the whole remaining row) | responsive { sm, md, lg, xl } (antd span)",
  },
  DescriptionsItemsProp: {
    file: "vocabulary/data.prop.ts",
    category: "data",
    description:
      "Declarative Descriptions items (antd `items`) — { key, label, children/value, mono, span } — the alternative to composing Descriptions.Item children",
  },
  TablePaginationProp: {
    file: "vocabulary/data.prop.ts",
    category: "data",
    description:
      "DataTable pagination object surface — 1-based current | pageSize | total | pageSizeOptions | showSizeChanger | onChange (antd TablePaginationConfig); `false` hides the pager",
  },
  TableCellIndentProp: {
    file: "vocabulary/data.prop.ts",
    category: "data",
    description:
      "TableCell hierarchy depth — indent = --table-cell-space-x + depth x --table-cell-indent-space-step (tree rows, grouped detail rows)",
  },
  ErrorSurfaceModeProp: {
    file: "vocabulary/layout.prop.ts",
    category: "layout",
    description:
      "ErrorSurface shell contract — application (400/403/404 body inside the route's existing AppShell) vs system (500/503 owns the page via CenteredShell align=center)",
  },
  ErrorSurfaceStatusProp: {
    file: "vocabulary/layout.prop.ts",
    category: "layout",
    description:
      "HTTP status an ErrorSurface presents — 400 | 403 | 404 | 500 | 503 (numeric); drives the default icon, tone and mode",
  },
  OrientationProp: {
    file: "vocabulary/layout.prop.ts",
    category: "layout",
    description:
      "Axis of a rule / track / group — horizontal (inline axis, the default) | vertical (block axis). One shared meaning for `orientation` across Separator, Steps, RadioGroup and Toolbar.",
  },
  AuthShellPresetProp: {
    file: "vocabulary/layout.prop.ts",
    category: "layout",
    description:
      "AuthShell named flow geometry — default | login (stable SCR-001 identity/card/footer anchor) | registration (360px SCR-002 sign-up measure, start-aligned long-form scroll, own footer clearance, 15px mobile gutter) | device-authorization (380px card, 5px mobile gutter) | context-selection (25rem card, edge-to-edge mobile) | account-recovery (432px SCR-008 recovery/MFA panel, 15px mobile gutter)",
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
  AppSettingPickerAppearanceProp: {
    file: "vocabulary/interaction.prop.ts",
    category: "interaction",
    description:
      "AppSettingPicker trigger presentation: labeled (icon + value) | icon (square icon-only topbar trigger) | inline (compact text footer trigger)",
  },
  AppSettingToggleAppearanceProp: {
    file: "vocabulary/interaction.prop.ts",
    category: "interaction",
    description:
      "AppSettingToggle box: bar (default — a full-height CELL of the bar, TopbarItem shape) | icon (square --control-height ghost button for anywhere that is not a bar)",
  },
  ShapeProp: {
    file: "vocabulary/interaction.prop.ts",
    category: "interaction",
    description: "Corner shape default | pill | sharp — shared by Button + Badge (radius tokens)",
  },
  AvatarShapeProp: {
    file: "vocabulary/interaction.prop.ts",
    category: "interaction",
    description:
      "Avatar geometry circle (person, --radius-pill) | square (entity-header organization/service mark, --avatar-square-* tokens) — a rounded rect ShapeProp cannot express",
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
  TextWhitespaceProp: {
    file: "vocabulary/interaction.prop.ts",
    category: "interaction",
    description:
      "Whitespace handling normal | pre-wrap: `pre-wrap` keeps the newlines and indentation a person typed (a plain-text note, a pasted log) and still wraps at the container edge; `truncate` outranks it",
  },
  TypographyTypeProp: {
    file: "vocabulary/interaction.prop.ts",
    category: "interaction",
    description:
      "antd Typography `type` — secondary | success | warning | danger. The narrower spelling of TextToneProp, accepted alongside it; `tone` wins when both are passed (secondary → muted, danger → destructive)",
  },
  TitleLevelProp: {
    file: "vocabulary/interaction.prop.ts",
    category: "interaction",
    description:
      "antd Typography.Title `level` — 1..5. Wider than HeadingLevelProp (1..4) because antd has a fifth step; level 5 reads --heading-h5, bound to the existing --font-size-2xs step",
  },
  TypographyCopyConfigProp: {
    file: "vocabulary/interaction.prop.ts",
    category: "interaction",
    description:
      "antd CopyConfig — { text, onCopy, icon, tooltips, format, tabIndex } for the copy affordance beside a run of text",
  },
  TypographyEditConfigProp: {
    file: "vocabulary/interaction.prop.ts",
    category: "interaction",
    description:
      "antd EditConfig — { text, editing, icon, tooltip, onStart, onChange, onCancel, onEnd, maxLength, autoSize, triggerType, enterIcon, tabIndex } for in-place text editing",
  },
  TypographyEllipsisConfigProp: {
    file: "vocabulary/interaction.prop.ts",
    category: "interaction",
    description:
      "antd EllipsisConfig — { rows, expandable, suffix, symbol, defaultExpanded, expanded, onExpand, onEllipsis, tooltip }; the richer spelling of this library truncate/clamp, and the winner when they collide",
  },
  TypographyActionsConfigProp: {
    file: "vocabulary/interaction.prop.ts",
    category: "interaction",
    description:
      "antd ActionsConfig — { placement: start | end } for the copy/edit/expand cluster. Logical, so it mirrors in RTL; NOT the ReactNode slot ActionsProp names",
  },
  SizeProp: {
    file: "vocabulary/interaction.prop.ts",
    category: "interaction",
    description: "Shared size names xs | sm | md | lg",
  },
  ControlStatusProp: {
    file: "vocabulary/interaction.prop.ts",
    category: "interaction",
    description: "Validation state a field paints — antd `status`: error | warning",
  },
  ControlVariantProp: {
    file: "vocabulary/interaction.prop.ts",
    category: "interaction",
    description: "Field chrome level — antd `variant`: outlined | filled | borderless",
  },
  FormLayoutProp: {
    file: "vocabulary/interaction.prop.ts",
    category: "interaction",
    description: "Form label layout: vertical | horizontal | inline",
  },
  DescriptionsLayoutProp: {
    file: "vocabulary/interaction.prop.ts",
    category: "interaction",
    description: "Descriptions label layout: vertical (over) | horizontal (beside)",
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
    description: "Alert structural axis: default inline card | banner full-bleed strip",
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
  RevealDelayProp: {
    file: "vocabulary/interaction.prop.ts",
    category: "interaction",
    description:
      "Reveal entrance-stagger ordinal (0..6) — an index into the motion ladder, never a raw ms",
  },
  ActivityVariantProp: {
    file: "vocabulary/interaction.prop.ts",
    category: "interaction",
    description:
      "Activity ambient mark — dots (typing) | pulse (live/recording) | bar (indeterminate sync)",
  },
  ActivityAnnounceProp: {
    file: "vocabulary/interaction.prop.ts",
    category: "interaction",
    description:
      "Whether an ambient indicator announces its label — false (default, no live region) | polite",
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
  BreadcrumbItemMenuProp: {
    file: "vocabulary/navigation.prop.ts",
    category: "navigation",
    description: "Sibling dropdown hung off one breadcrumb segment (antd BreadcrumbItemType.menu)",
  },
  BreadcrumbItemMenuEntryProp: {
    file: "vocabulary/navigation.prop.ts",
    category: "navigation",
    description: "One entry of a breadcrumb segment's sibling dropdown",
  },
  BreadcrumbSeparatorProp: {
    file: "vocabulary/navigation.prop.ts",
    category: "navigation",
    description: "Glyph drawn between breadcrumb segments (antd `separator`)",
  },
  BreadcrumbItemRenderProp: {
    file: "vocabulary/navigation.prop.ts",
    category: "navigation",
    description: "Per-segment render override (antd `itemRender`)",
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
  GetRowLabelProp: {
    file: "vocabulary/data.prop.ts",
    category: "data",
    description: "Row label extractor generic — the accessible name of a row's selection control",
  },
  OnRowClickProp: {
    file: "vocabulary/data.prop.ts",
    category: "data",
    description: "Row click handler generic",
  },
  ColumnDefProp: {
    file: "vocabulary/data.prop.ts",
    category: "data",
    description:
      'DataTable column definition — key/header/render/sortable/align/width/pin/hiddenOnMobile/enableHiding/ariaLabel plus `priority` (TableColumnPriorityProp), read by DataTable preset="action-collection"',
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
  StickyProp: {
    file: "vocabulary/data.prop.ts",
    category: "data",
    description: "Pin the filter strip while the list scrolls",
  },
} as const;

export type VocabularyPropName = keyof typeof VOCABULARY_REGISTRY;

export const COMPONENT_PROP_REGISTRY = {
  AppProviderProp: { group: "app", file: "components/app.prop.ts", vocabulary: ["ChildrenProp"] },
  AppSettingPickerProp: {
    group: "app",
    file: "components/app.prop.ts",
    vocabulary: [
      "ValueProp",
      "OnValueChangeProp",
      "DisabledProp",
      "IdProp",
      "ClassNameProp",
      "AppSettingPickerAppearanceProp",
      {
        field: "compact",
        local: true,
        reason:
          "Trigger DENSITY for the picker only (sm control tier + content-hugging width) — orthogonal to `appearance`, and not the page-level DensityProp scope.",
      },
    ],
  },
  AppSettingToggleProp: {
    group: "app",
    file: "components/app.prop.ts",
    vocabulary: [
      "ValueProp",
      "OnValueChangeProp",
      "DisabledProp",
      "IdProp",
      "ClassNameProp",
      "AppSettingToggleAppearanceProp",
    ],
  },
  PageContainerHeaderLayoutProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: [],
  },
  PageContainerHeaderScaleProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: [],
  },
  PageContainerMeasureProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: [],
  },
  PageContainerPresetProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: [],
  },
  PageContainerProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: [
      "TitleProp",
      "SubtitleProp",
      "StatusProp",
      "ExtraProp",
      "FooterProp",
      "BreadcrumbProp",
      "DensityProp",
      "PageContainerVariantProp",
      {
        field: "toolbar",
        local: true,
        reason:
          "FIXED chrome band between the page header and the scrolling body (filter strip, status bar, channel workflow rail). Distinct from ExtraProp (header actions, inside the title row) and FooterProp (action bar after the body): it is the only slot that stays OUT of the `fill` scroll viewport while sharing the header/body gutters and measure, so a consumer never hand-lays `position: sticky` page chrome.",
      },
      {
        field: "headerLoading",
        local: true,
        reason:
          "Pending state of the TITLE BAND only (skeleton title/subtitle + aria-busy on the header). Named for the BAND it skeletonises, so it can never be read as a page-wide loading flag (that is DataState's job); breadcrumbs and `extra` come from the route and stay live while the record resolves.",
      },
      {
        field: "headerLayout",
        local: true,
        reason:
          "Header ARRANGEMENT of the title band vs the extra slot below the 640px step (stack | responsive-inline) — orthogonal to PageContainerVariantProp, which selects the page shell layout.",
      },
      {
        field: "headerScale",
        local: true,
        reason:
          "What the page's top row IS — a document title or the surface's own chrome (document | chrome) — which selects the title's type step via --page-title-font-size-chrome AND opens the page flush with the frame via --page-pad-block-start-chrome (chrome sits on the edge; a document title gets the page's top margin). A fourth orthogonal axis: PageContainerVariantProp owns chrome WEIGHT (ghost drops the divider and header pad), headerLayout owns the header ARRANGEMENT, measure owns the inline cap; none of them can say that the h1 is a channel name rather than a headline.",
      },
      {
        field: "measure",
        local: true,
        reason:
          "Bounded page MEASURE shared by the header and body (default | narrow | medium), backed by --page-measure-*. A third orthogonal axis: PageContainerVariantProp owns page CHROME, this owns the inline cap, so a quiet ghost page can also be measure-bounded.",
      },
    ],
  },
  FlexDirectionProp: { group: "layout", file: "components/layout.prop.ts", vocabulary: [] },
  FlexAlignProp: { group: "layout", file: "components/layout.prop.ts", vocabulary: [] },
  FlexJustifyProp: { group: "layout", file: "components/layout.prop.ts", vocabulary: [] },
  FlexProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: [
      {
        field: "as",
        local: true,
        reason:
          "Closed tag seam (div | span) so a Flex stays valid HTML inside a phrasing-only parent such as the <button> a TabsTrigger renders — same shape as ListRow's `as` (gh#354).",
      },
      { field: "direction", local: true, reason: "Flex-specific axis control." },
      "GapProp",
      { field: "align", local: true, reason: "Flex-specific align-items keyword subset." },
      { field: "justify", local: true, reason: "Flex-specific justify-content keyword subset." },
      { field: "wrap", local: true, reason: "Flex-specific boolean shorthand for flex-wrap." },
      "BreakpointProp",
      {
        field: "hideBelow",
        local: true,
        reason:
          "Responsive region visibility at a canonical breakpoint step — the public alternative to a page-local media query (gh#252).",
      },
      {
        field: "hideFrom",
        local: true,
        reason: "Inverse of hideBelow — keeps a compact-only region off the wide layout.",
      },
    ],
  },
  ResponsiveGridFlowProp: { group: "layout", file: "components/layout.prop.ts", vocabulary: [] },
  ResponsiveGridColumnsProp: { group: "layout", file: "components/layout.prop.ts", vocabulary: [] },
  ResponsiveGridPresetProp: { group: "layout", file: "components/layout.prop.ts", vocabulary: [] },
  MasterDetailRailWidthProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: [],
  },
  MasterDetailRailProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: [],
  },
  MasterDetailMasterViewportProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: [],
  },
  MasterDetailProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: [
      "ChildrenProp",
      "BreakpointProp",
      "IdProp",
      {
        field: "master",
        local: true,
        reason: "Semantic selectable-collection slot paired with the detail children slot.",
      },
      {
        field: "rail",
        local: true,
        reason: "Semantic selector for which region owns the fixed track (master | detail).",
      },
      {
        field: "railWidth",
        local: true,
        reason: "Token-owned 300px/320px rail geometry preset.",
      },
      {
        field: "masterViewport",
        local: true,
        reason:
          "Token-owned bounded-collection preset (auto | compact | standard) for the master region's scroll viewport — geometry, not a raw pixel measure.",
      },
      {
        field: "collapseBelow",
        local: true,
        reason: "Per-instance override of the --master-detail-collapse-below stacking threshold.",
      },
      {
        field: "masterLabel",
        local: true,
        reason: "Accessible name for the master region landmark.",
      },
      {
        field: "detailLabel",
        local: true,
        reason: "Accessible name for the detail region landmark.",
      },
      {
        field: "detailId",
        local: true,
        reason: "Id of the detail region so master controls can wire aria-controls and focus.",
      },
    ],
  },
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
  AuthShellProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: [
      "ChildrenProp",
      "ClassNameProp",
      {
        field: "variant",
        local: true,
        reason: "Auth-shell geometry preset; canonical selects the shared DXS token contract.",
      },
      {
        field: "density",
        local: true,
        reason: "Auth-specific vertical-density scope for card descendants.",
      },
      {
        field: "measure",
        local: true,
        reason: "Auth-shell content-slot measure; wide is the split brand-panel login.",
      },
      "ActionProp",
      "AuthShellPresetProp",
    ],
  },
  MobileShellProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: [
      "ChildrenProp",
      "ClassNameProp",
      "ActionProp",
      "MobileShellHeightProp",
      "MobileShellWidthProp",
      {
        field: "header",
        local: true,
        reason:
          "MobileShell app-bar band — the screen title row; it absorbs the top safe-area inset when no statusBar precedes it.",
      },
      {
        field: "statusBar",
        local: true,
        reason:
          "MobileShell OS status-bar band — standalone/PWA chrome or a device-frame preview; owns the top safe-area inset.",
      },
      {
        field: "tabBar",
        local: true,
        reason:
          "MobileShell bottom navigation band — tiling equal-width destinations; owns the home-indicator inset.",
      },
    ],
  },
  SeparatorProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: [
      "OrientationProp",
      "LabelProp",
      "TextAlignProp",
      "TextToneProp",
      "ClassNameProp",
      {
        field: "labelAlign",
        local: true,
        reason:
          "Placement of the label ON the rule (which half is short), not the text alignment of a block — it reads the shared TextAlignProp start|center|end vocabulary so it stays logical under RTL.",
      },
      {
        field: "decorative",
        local: true,
        reason:
          "Radix Separator a11y fork: role=none vs a real role=separator. A `label` flips the default to false because the text is content, not decoration.",
      },
    ],
  },
  AuthDividerProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: ["LabelProp", "ClassNameProp"],
  },
  AuthFooterProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: [
      "ClassNameProp",
      {
        field: "product",
        local: true,
        reason:
          "Consumer-owned host/product identity slot of the legal line, not a page TitleProp.",
      },
      {
        field: "terms",
        local: true,
        reason: "Consumer-owned Terms link/text slot — the library never invents legal navigation.",
      },
      {
        field: "privacy",
        local: true,
        reason:
          "Consumer-owned Privacy link/text slot — the library never invents legal navigation.",
      },
      {
        field: "locale",
        local: true,
        reason:
          "Optional consumer-owned locale control slot (an AppSettingPicker), not a locale value.",
      },
    ],
  },
  AuthIdentityProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: [
      "TitleProp",
      "ClassNameProp",
      {
        field: "requester",
        local: true,
        reason:
          "Authoritative requesting-client context for a delegated auth flow (device grant / consent).",
      },
    ],
  },
  AuthAccountSummaryProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: ["DisabledProp", "ClassNameProp"],
    local: ["email", "avatarSrc", "avatarFallback", "actionLabel", "onAction"],
  },
  AccountChipProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: ["DisabledProp", "ClassNameProp"],
    local: ["email", "avatarSrc", "avatarFallback", "actionLabel", "onAction"],
  },
  CenteredShellProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: [
      "ChildrenProp",
      "ClassNameProp",
      "CenteredShellWidthProp",
      "CenteredShellAlignProp",
      "CenteredShellPresetProp",
    ],
  },
  ErrorSurfaceMaintenanceProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: [
      {
        field: "start",
        local: true,
        reason:
          "ISO 8601 instant starting the maintenance window; formatted via Intl.DateTimeFormat and emitted as the <time dateTime> value.",
      },
      {
        field: "end",
        local: true,
        reason: "ISO 8601 instant ending the window; omitted for an open-ended outage.",
      },
      {
        field: "timeZone",
        local: true,
        reason:
          "IANA time zone id the window is presented in — explicit so SSR and client output cannot diverge.",
      },
      {
        field: "progress",
        local: true,
        reason:
          "Server-sent 0–100 completion of the maintenance window; deriving it from the client clock would break hydration.",
      },
    ],
  },
  ErrorSurfaceProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: [
      "ErrorSurfaceModeProp",
      "ErrorSurfaceStatusProp",
      "TitleProp",
      "DescriptionProp",
      "ActionProp",
      "IconProp",
      "HeadingLevelProp",
      "FooterProp",
      "CenteredShellWidthProp",
      "IdProp",
      "ClassNameProp",
      {
        field: "tone",
        local: true,
        reason:
          "Reuses the EmptyStateToneProp union verbatim (the surface renders an EmptyState) — a status-derived default the consumer may override, not a new tone vocabulary.",
      },
      {
        field: "requestId",
        local: true,
        reason:
          "Support correlation id for the failure, rendered as a mono/tabular metadata row — an identifier, not a LabelProp.",
      },
      {
        field: "permission",
        local: true,
        reason:
          "The permission/role the viewer is missing (403). The localized label is the surface's; the value is the bare permission name.",
      },
      {
        field: "organization",
        local: true,
        reason:
          "The organization/tenant the failed request was scoped to — disambiguates a wrong-workspace 403 from a missing-role 403.",
      },
      {
        field: "maintenance",
        local: true,
        reason:
          "ErrorSurfaceMaintenanceProp timing/progress slot (ISO 8601 + IANA), formatted with Intl.DateTimeFormat.",
      },
      {
        field: "brand",
        local: true,
        reason:
          "system-mode brand slot above the status code (a Logo); the application shell already shows the brand.",
      },
    ],
  },
  LegalDocumentSectionProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: [
      "IdProp",
      "TitleProp",
      {
        field: "content",
        local: true,
        reason:
          "Consumer-owned legal body for one section — a content slot, not the ChildrenProp of the shell itself.",
      },
    ],
  },
  LegalDocumentShellProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: [
      "TitleProp",
      "IdProp",
      "ClassNameProp",
      {
        field: "version",
        local: true,
        reason: "Document version identifier interpolated into a localized 'Version {version}'.",
      },
      {
        field: "effectiveDate",
        local: true,
        reason: "ISO 8601 date input formatted via Intl.DateTimeFormat in the active locale.",
      },
      {
        field: "summary",
        local: true,
        reason: "Plain-language document summary slot, distinct from a page SubtitleProp.",
      },
      {
        field: "contentsLabel",
        local: true,
        reason:
          "Accessible name + visible caption of the contents nav landmark (landmark-unique override).",
      },
      {
        field: "sections",
        local: true,
        reason: "Ordered LegalDocumentSectionProp[] driving both the contents list and the body.",
      },
      {
        field: "activeSection",
        local: true,
        reason:
          "Controlled active-section id — the X / defaultX / onXChange family (like open/onOpenChange); 'value' would be meaningless on a document shell.",
      },
      {
        field: "defaultActiveSection",
        local: true,
        reason: "Uncontrolled initial active-section id.",
      },
      {
        field: "onActiveSectionChange",
        local: true,
        reason: "Active-section change handler (anchor activation · hash deep link · scroll spy).",
      },
      {
        field: "documentNavigation",
        local: true,
        reason: "Rail slot for a switcher across the legal document set.",
      },
      {
        field: "footerAction",
        local: true,
        reason: "Document-footer slot for accept / download / print actions.",
      },
    ],
  },
  SidebarProductProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: ["LabelProp"],
  },
  SidebarBadgeToneProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: [],
  },
  SidebarItemProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: [
      "IdProp",
      "LabelProp",
      "DisabledProp",
      "ChildrenProp",
      {
        field: "badgeTone",
        local: true,
        reason:
          "Emphasis of the row's count pill (neutral | destructive) — an Extract<> subset of the shared ToneProp vocabulary, not a new one. It is `badgeTone` rather than `tone` because the item ALSO has `disabled`/`active` row states: a bare `tone` on a nav row would read as the row's colour, and the axis only ever recolours the badge. Mirrors the existing `badge`/`badgeLabel` pairing on OrgSwitcherOrganization.",
      },
    ],
  },
  SidebarRenderItemProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: ["ClassNameProp", "ChildrenProp"],
  },
  SidebarLinkProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: ["ClassNameProp", "ChildrenProp", "OnClickProp"],
  },
  SidebarLinkComponentProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: [
      {
        field: "linkComponent",
        local: true,
        reason:
          "Component type alias for a framework router Link driven by SidebarLinkProp (gh#213).",
      },
    ],
  },
  SidebarSectionProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: ["LabelProp"],
  },
  AppLauncherApp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: ["IdProp", "LabelProp", "IconProp"],
  },
  AppLauncherGroup: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: ["LabelProp"],
  },
  AppLauncherLabels: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: ["LabelProp"],
  },
  AppLauncherProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: [
      "OpenProp",
      "OnOpenChangeProp",
      "OnValueChangeProp",
      "ErrorProp",
      "PendingProp",
      "ClassNameProp",
    ],
  },
  OrgSwitcherOrganization: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: ["IdProp", "LabelProp", "DisabledProp"],
  },
  OrgSwitcherLabels: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: ["LabelProp"],
  },
  OrgSwitcherProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: ["ValueProp", "OnValueChangeProp", "DisabledProp", "ClassNameProp"],
  },
  SidebarProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: ["IdProp", "OnValueChangeProp", "ChildrenProp"],
  },
  TopbarProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: ["ChildrenProp"],
  },
  TopbarItemProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: [
      "ChildrenProp",
      "ClassNameProp",
      { field: "asChild", local: true, reason: "Radix Slot passthrough — merges onto the child" },
    ],
  },
  NavListProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: ["IdProp", "ClassNameProp"],
  },
  ButtonProp: {
    group: "general",
    file: "components/general.prop.ts",
    vocabulary: [
      "TextAlignProp",
      "ButtonVariantProp",
      "SizeProp",
      "ShapeProp",
      "AsChildProp",
      "DisabledProp",
      "OnClickProp",
      "PendingProp",
    ],
  },
  RevealProp: {
    group: "general",
    file: "components/general.prop.ts",
    vocabulary: [
      "ChildrenProp",
      "RevealDelayProp",
      "AsChildProp",
      "ClassNameProp",
      {
        field: "delay",
        local: true,
        reason: "Reveal stagger ordinal — RevealDelayProp vocabulary.",
      },
    ],
  },
  ActivityProp: {
    group: "general",
    file: "components/general.prop.ts",
    vocabulary: [
      "ActivityVariantProp",
      "SizeProp",
      "TextToneProp",
      "LabelProp",
      "ChildrenProp",
      "ActivityAnnounceProp",
      "ClassNameProp",
      {
        field: "announce",
        local: true,
        reason:
          "Ambient live-region opt-in — ActivityAnnounceProp vocabulary; deliberately NOT a boolean so the value names the politeness level.",
      },
    ],
  },
  FloatButtonTypeProp: {
    group: "general",
    file: "components/general.prop.ts",
    vocabulary: [],
  },
  FloatButtonShapeProp: {
    group: "general",
    file: "components/general.prop.ts",
    vocabulary: [],
  },
  FloatButtonTriggerProp: {
    group: "general",
    file: "components/general.prop.ts",
    vocabulary: [],
  },
  FloatButtonPlacementProp: {
    group: "general",
    file: "components/general.prop.ts",
    vocabulary: [],
  },
  FloatButtonBadgeProp: {
    group: "general",
    file: "components/general.prop.ts",
    vocabulary: [
      {
        field: "count",
        local: true,
        reason:
          "Ant Badge's count/dot/overflowCount/showZero/color quartet, ported whole. The corner mark is FloatButton's own; there is no Badge-count primitive in this library to borrow a vocabulary from.",
      },
    ],
  },
  FloatButtonTooltipProp: {
    group: "general",
    file: "components/general.prop.ts",
    vocabulary: [
      "ChildrenProp",
      {
        field: "side",
        local: true,
        reason:
          "TooltipContent's own placement axis, re-exposed so the object form of `tooltip` can reach it without importing the overlay's types.",
      },
    ],
  },
  FloatButtonProp: {
    group: "general",
    file: "components/general.prop.ts",
    vocabulary: [
      "ChildrenProp",
      "DescriptionProp",
      "DisabledProp",
      "ClassNameProp",
      {
        field: "shape",
        local: true,
        reason:
          "antd's circle/square, which is neither the control ShapeProp (default|pill|sharp) nor AvatarShapeProp (documented as an ENTITY mark). `square` is the only shape antd lets carry text.",
      },
      {
        field: "type",
        local: true,
        reason:
          "antd's word for the FILL, kept verbatim so an antd call site compiles unchanged. This library says `variant` everywhere else; `htmlType` carries the native button type, exactly as antd resolves the collision.",
      },
      {
        field: "href",
        local: true,
        reason: "The native anchor href — antd renders an <a> when it is present.",
      },
    ],
  },
  FloatButtonGroupProp: {
    group: "general",
    file: "components/general.prop.ts",
    vocabulary: [
      "ChildrenProp",
      "OpenProp",
      "OnOpenChangeProp",
      {
        field: "trigger",
        local: true,
        reason:
          "antd's click|hover, and its ABSENCE is the switch between a plain stack and a menu — so it can carry no default and no shared vocabulary.",
      },
      {
        field: "placement",
        local: true,
        reason:
          "antd's top|left|right|bottom for the menu's direction. Physical words kept verbatim so an antd call site compiles; the stylesheet resolves them through inset-inline-*, so the rendered side still flips under dir=rtl.",
      },
      {
        field: "closeIcon",
        local: true,
        reason:
          "The glyph the TRIGGER swaps to while the menu is open — a second icon slot on one control, which IconProp (a single glyph) cannot express.",
      },
    ],
  },
  FloatButtonBackTopProp: {
    group: "general",
    file: "components/general.prop.ts",
    vocabulary: [
      "OnClickProp",
      {
        field: "target",
        local: true,
        reason:
          "antd's lazy scroll-container getter. A FUNCTION, not an element, because the container may not exist on the first render — and it is what lets BackTop watch a shell's own scroll region instead of the document.",
      },
      {
        field: "visibilityHeight",
        local: true,
        reason:
          "antd's scroll threshold in px — a measurement of the reader's position, not a size tier.",
      },
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
  TypographyProp: {
    group: "general",
    file: "components/general.prop.ts",
    vocabulary: [
      "ClassNameProp",
      "ChildrenProp",
      {
        field: "component",
        local: true,
        reason:
          "antd `component` — the rendered element. An ALIAS of `as`, kept so antd code pastes in unchanged; `as` wins when both are passed.",
      },
    ],
  },
  TypographyBlockProp: {
    group: "general",
    file: "components/general.prop.ts",
    vocabulary: [
      "TypographyTypeProp",
      "TypographyActionsConfigProp",
      "TypographyCopyConfigProp",
      "TypographyEditConfigProp",
      "TypographyEllipsisConfigProp",
      "DisabledProp",
    ],
  },
  TypographyTitleProp: {
    group: "general",
    file: "components/general.prop.ts",
    vocabulary: [
      "TitleLevelProp",
      "TextToneProp",
      "TextAlignProp",
      "FontWeightProp",
      "TypographyEllipsisConfigProp",
      "ClassNameProp",
    ],
  },
  ParagraphProp: {
    group: "general",
    file: "components/general.prop.ts",
    vocabulary: ["TypographyEllipsisConfigProp", "TextToneProp", "TextSizeProp", "ClassNameProp"],
  },
  LinkProp: {
    group: "general",
    file: "components/general.prop.ts",
    vocabulary: ["TypographyEllipsisConfigProp", "TextToneProp", "TextSizeProp", "ClassNameProp"],
  },
  InputProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: ["PlaceholderProp", "ValueProp", "DisabledProp"],
  },
  TextareaProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: [
      "PlaceholderProp",
      "DisabledProp",
      "ValueProp",
      "DefaultValueProp",
      "OnChangeProp",
      "IdProp",
      "ClassNameProp",
    ],
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
    vocabulary: ["FormLayoutProp", "WidthProp", "BreakpointProp", "DensityProp", "ErrorBagProp"],
  },
  FormFieldProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: [
      "IdProp",
      "NameProp",
      "LabelProp",
      "RequiredProp",
      "HelperProp",
      "ErrorProp",
      "FormLayoutProp",
      "WidthProp",
    ],
  },
  FormErrorsProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: ["ErrorBagProp", "TitleProp", "ClassNameProp"],
  },
  FormErrorsProviderProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: ["ErrorBagProp"],
  },
  SearchInputProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: ["LabelProp", "PlaceholderProp", "DisabledProp", "ClassNameProp", "IdProp"],
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
  CalendarProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: ["ControlWidthProp"],
  },
  SliderMarksProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: [],
  },
  SliderTooltipProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: [],
  },
  SliderMarkProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: [],
  },
  SliderRangeConfigProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: [],
  },
  ControlCountProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: [],
  },
  RadioOptionTypeProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: [],
  },
  RadioButtonStyleProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: [],
  },
  CalendarFooterProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: [
      {
        field: "onClose",
        local: true,
        reason:
          "Fired by the Close footer action; the picker that embeds the Calendar closes its popover. Not a value change.",
      },
    ],
    local: ["showToday", "showClose"],
  },
  PickerChromeProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: [
      "OpenProp",
      "DefaultOpenProp",
      "OnOpenChangeProp",
      "ControlVariantProp",
      "SizeProp",
    ],
  },
  PickerDateFormatProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: [],
  },
  DatePickerBaseProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: ["PlaceholderProp", "DisabledProp", "ClassNameProp", "IdProp", "NameProp"],
  },
  TimeRangePickerProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: ["ValueProp", "DefaultValueProp", "OnValueChangeProp", "PlaceholderProp"],
  },
  DatePickerProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: ["ValueProp", "OnValueChangeProp", "PlaceholderProp", "DisabledProp", "IdProp"],
  },
  CalendarCellRenderProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: [],
  },
  TimePickerDisabledTimeProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: [],
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
  SearchSelectBaseProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: [
      "PlaceholderProp",
      "EmptyMessageProp",
      "DisabledProp",
      "NameProp",
      "IdProp",
      "ClassNameProp",
      "OpenProp",
      "OnOpenChangeProp",
      "SizeProp",
      "DefaultOpenProp",
      "ControlStatusProp",
      "ControlVariantProp",
      "AllowClearProp",
      "NotFoundContentProp",
      "PopupMatchWidthProp",
      "PendingProp",
    ],
    note: "Internal — everything on `<Select options>` except the value shape; use Select.",
  },
  SearchSelectSingleProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: ["ValueProp", "DefaultValueProp", "OnValueChangeProp"],
    note: "Internal — the single-select value shape of `<Select options>`; use Select.",
  },
  SearchSelectMultipleProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: [
      "ValueProp",
      "DefaultValueProp",
      "OnValueChangeProp",
      "MaxTagCountProp",
      "MaxTagPlaceholderProp",
    ],
    note: 'Internal — the `mode="multiple"` value shape of `<Select options>`; use Select.',
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
      "OpenProp",
      "OnOpenChangeProp",
      "SizeProp",
      "DefaultOpenProp",
      "ControlStatusProp",
      "ControlVariantProp",
      "AllowClearProp",
      "NotFoundContentProp",
      "PopupMatchWidthProp",
      "PendingProp",
    ],
    note: "Internal — the searchable engine behind `<Select options showSearch>` (not public API); use Select.",
  },
  SelectFieldNamesProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: ["LabelProp", "ValueProp", "DisabledProp"],
    note: "antd `fieldNames` for `<Select options>` — the spelling Cascader and TreeSelect already take.",
  },
  SelectOptionGroupProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: ["LabelProp", "DisabledProp"],
    note: "antd's nested option GROUP (`{ label, options }`); flattens to the `group` a flat row carries.",
  },
  SelectOptionInputProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: [],
    note: "What `<Select options>` accepts: a row, a group, or a foreign row read through `fieldNames`.",
  },
  SelectLabeledValueProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: ["ValueProp", "LabelProp"],
    note: "antd `labelInValue` — the value carries its own label for a screen with no option list yet.",
  },
  SelectPlacementProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: [],
    note: "antd `placement` on the LOGICAL inline axis, as DropdownMenuPlacementProp already spells it.",
  },
  SelectShowSearchProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: ["OnSearchChangeProp"],
    note: "antd `showSearch`'s object form. `filterOption(input, option)` here takes antd's argument order.",
  },
  SelectLabelInValueSingleProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: ["ValueProp", "DefaultValueProp", "OnValueChangeProp"],
    note: "Internal — the `labelInValue` single shape of `<Select options>`; use Select.",
  },
  SelectLabelInValueMultipleProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: [
      "ValueProp",
      "DefaultValueProp",
      "OnValueChangeProp",
      "MaxTagCountProp",
      "MaxTagPlaceholderProp",
    ],
    note: "Internal — the `labelInValue` multiple/tags shape of `<Select options>`; use Select.",
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
      "OpenProp",
      "OnOpenChangeProp",
      "SizeProp",
      "DefaultOpenProp",
      "ControlStatusProp",
      "ControlVariantProp",
      "AllowClearProp",
      "NotFoundContentProp",
      "PopupMatchWidthProp",
      "PendingProp",
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
      "DefaultOpenProp",
      "ControlStatusProp",
      "ControlVariantProp",
      "AllowClearProp",
      "NotFoundContentProp",
      "PopupMatchWidthProp",
      "PendingProp",
      "MaxTagCountProp",
      "MaxTagPlaceholderProp",
      "SizeProp",
      "OnSearchChangeProp",
      "OpenProp",
      "OnOpenChangeProp",
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
      "DefaultOpenProp",
      "ControlStatusProp",
      "ControlVariantProp",
      "AllowClearProp",
      "NotFoundContentProp",
      "PopupMatchWidthProp",
      "PendingProp",
      "MaxTagCountProp",
      "MaxTagPlaceholderProp",
      "SizeProp",
      "OnSearchChangeProp",
      "OpenProp",
      "OnOpenChangeProp",
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
    vocabulary: [
      "IconProp",
      "TitleProp",
      "DescriptionProp",
      "ActionProp",
      "ToneProp",
      "HeadingLevelProp",
    ],
  },
  EmptyStateToneProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: [],
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
  AvatarProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: ["AvatarShapeProp", "LabelProp", "ChildrenProp", "ClassNameProp"],
  },
  AvatarAppearanceProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: [],
  },
  AvatarPresenceProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: [],
  },
  BadgeProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: [
      {
        field: "as",
        local: true,
        reason:
          "Closed tag seam (div | span) so a chip stays valid HTML inside a phrasing-only parent such as the <button> a TabsTrigger renders — same shape as ListRow's `as` (gh#354).",
      },
      "BadgeVariantProp",
      "ShapeProp",
      "ToneProp",
      "ChildrenProp",
      "ClassNameProp",
      {
        field: "color",
        local: true,
        reason:
          "The entity's OWN colour as a CSS colour string — DATA a person picked in a settings screen (a status, an issue type, a tag), a third axis beside `variant` (structure) and `tone` (meaning). No vocabulary type fits: ToneProp is the closed semantic set, and this value is open by definition. Washed into --badge-tint-surface rather than filled, because no foreground clears WCAG AA against every colour a picker can produce.",
      },
    ],
  },
  DataTableProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: [
      "ColumnDefProp",
      "DensityProp",
      "SortStateProp",
      "SelectedIdsProp",
      "GetRowLabelProp",
      "HandlerProp",
      "TablePresetProp",
      "TableColumnPriorityProp",
      "BreakpointProp",
      "ColumnFixedProp",
      "ColumnFilterItemProp",
      "ColumnFilterStateProp",
      "ColumnSorterProp",
      "TableRowSelectionProp",
      "TableExpandableProp",
      "TableSummaryProp",
      "TableScrollProp",
      "TableStickyProp",
      "OnRowProp",
      "TablePaginationProp",
      "SortDirectionProp",
      "OnColumnFilterChangeProp",
    ],
  },
  ListRowDensityProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: [],
  },
  ListRowProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: [
      "TitleProp",
      "DescriptionProp",
      "ClassNameProp",
      {
        field: "density",
        local: true,
        reason:
          "ListRow-local density subset (default | compact) — the compact inline-actions geometry (#246). No `comfortable` step, and unrelated to PageDensityProp/TableDensityProp.",
      },
      {
        field: "overflow",
        local: true,
        reason:
          "Row-local overflow resolution for the title/description column (truncate | wrap, #224).",
      },
    ],
  },
  CredentialRevealProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: [
      "LabelProp",
      "SizeProp",
      "ToneProp",
      "OnValueChangeProp",
      "HandlerProp",
      "ClassNameProp",
      "IdProp",
    ],
  },
  QrCodeProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: ["ValueProp", "LabelProp", "SizeProp", "ClassNameProp", "IdProp"],
  },
  ScrollAreaAnchorProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: [
      {
        field: "anchor",
        local: true,
        reason:
          'Edge the scrolling viewport sticks to as content grows ("none" | "bottom"). A closed union, not a boolean pair — the third edge ("top", for an inverted feed) is a value, not another flag.',
      },
    ],
  },
  ScrollAreaOrientationProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: [
      {
        field: "orientation",
        local: true,
        reason:
          'Axes that scroll ("vertical" | "horizontal" | "both"). Not the shared OrientationProp: that union has no "both". Radix derives the viewport\'s inline overflowX/overflowY from which scrollbars are mounted, so an axis left out is CLIPPED.',
      },
    ],
  },
  ScrollAreaProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: [
      {
        field: "orientation",
        local: true,
        reason: "See ScrollAreaOrientationProp, the scrolling-axis vocabulary.",
      },
      "OnValueChangeProp",
      {
        field: "viewportRef",
        local: true,
        reason:
          "Ref to the SCROLLING element (the Radix viewport), which the component's own `ref` cannot reach — the root is overflow:hidden.",
      },
      {
        field: "anchor",
        local: true,
        reason: "See ScrollAreaAnchorProp — the sticky edge vocabulary.",
      },
      {
        field: "anchorOffset",
        local: true,
        reason:
          'Per-instance override of --scroll-area-anchor-offset: how close to the bottom still counts as "following".',
      },
      {
        field: "onAnchoredChange",
        local: true,
        reason:
          'Pinned-state change handler (boolean), so the consumer can render its own focusable "jump to newest" affordance.',
      },
    ],
  },
  ChartSeriesProp: {
    group: "data-display",
    file: "components/charts.prop.ts",
    vocabulary: [
      "LabelProp",
      { field: "dataKey", local: true, reason: "Accessor key into each datum for this series." },
      {
        field: "color",
        local: true,
        reason: "Per-series colour override (defaults to --chart-N).",
      },
    ],
  },
  LineChartProp: {
    group: "data-display",
    file: "components/charts.prop.ts",
    vocabulary: [
      "LabelProp",
      "DescriptionProp",
      "SizeProp",
      "EmptyMessageProp",
      "ClassNameProp",
      "IdProp",
      { field: "data", local: true, reason: "Chart row data (category + value per series)." },
      { field: "series", local: true, reason: "Plotted series descriptors." },
      { field: "categoryKey", local: true, reason: "Accessor key for the x-axis category." },
      { field: "height", local: true, reason: "Explicit canvas height px (overrides size tier)." },
      {
        field: "showCaption",
        local: true,
        reason: "Paint the caption; false keeps it sr-only so the accessible name survives.",
      },
      { field: "showLegend", local: true, reason: "Chart-specific legend toggle." },
      { field: "showGrid", local: true, reason: "Chart-specific grid toggle." },
      {
        field: "numberFormat",
        local: true,
        reason: "Intl.NumberFormat options for ticks/tooltips.",
      },
      { field: "curved", local: true, reason: "Smooth (monotone) line rendering." },
    ],
  },
  BarChartProp: {
    group: "data-display",
    file: "components/charts.prop.ts",
    vocabulary: [
      "LabelProp",
      "DescriptionProp",
      "SizeProp",
      "EmptyMessageProp",
      "ClassNameProp",
      "IdProp",
      { field: "data", local: true, reason: "Chart row data (category + value per series)." },
      { field: "series", local: true, reason: "Plotted series descriptors." },
      { field: "categoryKey", local: true, reason: "Accessor key for the category axis." },
      { field: "height", local: true, reason: "Explicit canvas height px (overrides size tier)." },
      {
        field: "showCaption",
        local: true,
        reason: "Paint the caption; false keeps it sr-only so the accessible name survives.",
      },
      { field: "showLegend", local: true, reason: "Chart-specific legend toggle." },
      { field: "showGrid", local: true, reason: "Chart-specific grid toggle." },
      {
        field: "numberFormat",
        local: true,
        reason: "Intl.NumberFormat options for ticks/tooltips.",
      },
      { field: "stacked", local: true, reason: "Stack series into one bar." },
      { field: "horizontal", local: true, reason: "Category axis on the left." },
    ],
  },
  CompactBarTrendProp: {
    group: "data-display",
    file: "components/charts.prop.ts",
    vocabulary: [
      "LabelProp",
      "DescriptionProp",
      "SizeProp",
      "FooterProp",
      "EmptyMessageProp",
      "ClassNameProp",
      "IdProp",
      { field: "data", local: true, reason: "Chart row data (one bar per row)." },
      { field: "categoryKey", local: true, reason: "Accessor key for the bar's tick label." },
      { field: "valueKey", local: true, reason: "Accessor key for the plotted numeric value." },
      {
        field: "emphasizedIndex",
        local: true,
        reason: "Index of the highlighted 'current' bar (negative counts from the end).",
      },
      {
        field: "showCaption",
        local: true,
        reason: "Paint the caption; false keeps it sr-only so the accessible name survives.",
      },
      {
        field: "showCategoryLabels",
        local: true,
        reason: "Chart-specific tick-label toggle.",
      },
      {
        field: "numberFormat",
        local: true,
        reason: "Intl.NumberFormat options for the text alternative.",
      },
      { field: "ref", local: true, reason: "Forwarded ref to the <figure> element." },
    ],
  },
  AreaChartProp: {
    group: "data-display",
    file: "components/charts.prop.ts",
    vocabulary: [
      "LabelProp",
      "DescriptionProp",
      "SizeProp",
      "EmptyMessageProp",
      "ClassNameProp",
      "IdProp",
      { field: "data", local: true, reason: "Chart row data (category + value per series)." },
      { field: "series", local: true, reason: "Plotted series descriptors." },
      { field: "categoryKey", local: true, reason: "Accessor key for the x-axis category." },
      { field: "height", local: true, reason: "Explicit canvas height px (overrides size tier)." },
      {
        field: "showCaption",
        local: true,
        reason: "Paint the caption; false keeps it sr-only so the accessible name survives.",
      },
      { field: "showLegend", local: true, reason: "Chart-specific legend toggle." },
      { field: "showGrid", local: true, reason: "Chart-specific grid toggle." },
      {
        field: "numberFormat",
        local: true,
        reason: "Intl.NumberFormat options for ticks/tooltips.",
      },
      { field: "stacked", local: true, reason: "Stack series areas." },
      { field: "curved", local: true, reason: "Smooth (monotone) area rendering." },
    ],
  },
  PieChartProp: {
    group: "data-display",
    file: "components/charts.prop.ts",
    vocabulary: [
      "LabelProp",
      "DescriptionProp",
      "SizeProp",
      "EmptyMessageProp",
      "ClassNameProp",
      "IdProp",
      { field: "data", local: true, reason: "Chart row data (one slice per row)." },
      { field: "dataKey", local: true, reason: "Accessor key for the slice value." },
      { field: "nameKey", local: true, reason: "Accessor key for the slice category label." },
      {
        field: "colors",
        local: true,
        reason: "Per-slice colour overrides (defaults to --chart-N).",
      },
      { field: "height", local: true, reason: "Explicit canvas height px (overrides size tier)." },
      {
        field: "showCaption",
        local: true,
        reason: "Paint the caption; false keeps it sr-only so the accessible name survives.",
      },
      { field: "showLegend", local: true, reason: "Chart-specific legend toggle." },
      { field: "numberFormat", local: true, reason: "Intl.NumberFormat options for tooltips." },
      { field: "donut", local: true, reason: "Hollow-centre donut rendering." },
    ],
  },
  DialogProp: {
    group: "feedback",
    file: "components/feedback.prop.ts",
    vocabulary: [
      "OpenProp",
      "DefaultOpenProp",
      "OnOpenChangeProp",
      "ConfirmVariantProp",
      "ChildrenProp",
      {
        field: "modal",
        local: true,
        reason:
          "Radix-era spelling kept; RAC's Modal always locks scroll, so false no longer disables it.",
      },
    ],
  },
  DialogContentProp: {
    group: "feedback",
    file: "components/feedback.prop.ts",
    vocabulary: [
      "ConfirmVariantProp",
      "ClassNameProp",
      "ChildrenProp",
      {
        field: "showCloseButton",
        local: true,
        reason: 'Corner ✕ opt-out; defaults to false under variant="destructive".',
      },
      { field: "showClose", local: true, reason: "shadcn-era spelling of showCloseButton." },
      {
        field: "overlayClassName",
        local: true,
        reason: "Class for the scrim the surface owns — RAC nests overlay > modal > dialog.",
      },
    ],
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
      {
        field: "challenge",
        local: true,
        reason: "Semantic alias of confirmPhrase — the typed challenge token (e.g. an org slug).",
      },
      "HandlerProp",
      {
        field: "stepUp",
        local: true,
        reason: "Step-up re-auth (passkey/2FA) gate resolved before confirm fires.",
      },
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
  BannerProp: {
    group: "feedback",
    file: "components/feedback.prop.ts",
    vocabulary: ["ToneProp", "IconProp", "OnValueChangeProp", "ClassNameProp", "ChildrenProp"],
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
  SheetResponsiveProp: { group: "feedback", file: "components/feedback.prop.ts", vocabulary: [] },
  SkeletonRowsProp: { group: "feedback", file: "components/feedback.prop.ts", vocabulary: [] },
  SkeletonProp: {
    group: "feedback",
    file: "components/feedback.prop.ts",
    vocabulary: ["ClassNameProp", "ChildrenProp"],
  },
  SkeletonAvatarProp: {
    group: "feedback",
    file: "components/feedback.prop.ts",
    vocabulary: ["SizeProp", "ClassNameProp"],
  },
  SkeletonButtonProp: {
    group: "feedback",
    file: "components/feedback.prop.ts",
    vocabulary: ["SizeProp", "ShapeProp", "ClassNameProp"],
  },
  SkeletonFormProp: {
    group: "feedback",
    file: "components/feedback.prop.ts",
    vocabulary: ["ClassNameProp"],
  },
  SkeletonInputProp: {
    group: "feedback",
    file: "components/feedback.prop.ts",
    vocabulary: ["SizeProp", "ClassNameProp"],
  },
  SkeletonNodeProp: {
    group: "feedback",
    file: "components/feedback.prop.ts",
    vocabulary: ["ChildrenProp", "ClassNameProp"],
  },
  SkeletonImageProp: {
    group: "feedback",
    file: "components/feedback.prop.ts",
    vocabulary: ["ClassNameProp"],
  },
  SkeletonArticleProp: {
    group: "feedback",
    file: "components/feedback.prop.ts",
    vocabulary: [
      "ChildrenProp",
      "ClassNameProp",
      {
        field: "title",
        local: true,
        reason:
          "antd's Skeleton `title` is the presence/measure of the HEADING LINE, not the string TitleProp names — `false` drops the line and `{ width }` re-measures it.",
      },
    ],
  },
  ToolbarProp: {
    group: "navigation",
    file: "components/navigation.prop.ts",
    vocabulary: [
      "OnClearFiltersProp",
      "HasActiveFiltersProp",
      "StickyProp",
      "ActionsProp",
      "PendingProp",
      "DisabledProp",
      "ErrorProp",
      "ClassNameProp",
      "ChildrenProp",
    ],
  },
  FilterBarOverflowProp: {
    group: "navigation",
    file: "components/navigation.prop.ts",
    vocabulary: [],
  },
  FilterBarSearchProp: {
    group: "navigation",
    file: "components/navigation.prop.ts",
    vocabulary: ["PlaceholderProp", "IdProp", "DisabledProp"],
  },
  FilterBarFilterProp: {
    group: "navigation",
    file: "components/navigation.prop.ts",
    vocabulary: ["LabelProp", "PlaceholderProp", "DisabledProp"],
  },
  FilterBarChipProp: {
    group: "navigation",
    file: "components/navigation.prop.ts",
    vocabulary: ["DisabledProp"],
  },
  ToolbarGroupProp: {
    group: "navigation",
    file: "components/navigation.prop.ts",
    vocabulary: ["LabelProp", "IdProp", "ClassNameProp", "ChildrenProp"],
  },
  PaginationProp: {
    group: "navigation",
    file: "components/navigation.prop.ts",
    vocabulary: ["ValueProp", "OnValueChangeProp", "DisabledProp", "ClassNameProp", "SizeProp"],
  },
  PaginationSizeProp: {
    group: "navigation",
    file: "components/navigation.prop.ts",
    vocabulary: [],
  },
  DropdownMenuPlacementProp: {
    group: "navigation",
    file: "components/navigation.prop.ts",
    vocabulary: [],
  },
  DropdownMenuTriggerActionProp: {
    group: "navigation",
    file: "components/navigation.prop.ts",
    vocabulary: [],
  },
  PaginationAlignProp: {
    group: "navigation",
    file: "components/navigation.prop.ts",
    vocabulary: [],
  },
  StepsProp: {
    group: "navigation",
    file: "components/navigation.prop.ts",
    vocabulary: ["ValueProp", "DefaultValueProp", "SizeProp", "OnValueChangeProp", "ClassNameProp"],
  },
  InputOTPProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: ["SizeProp", "ControlStatusProp", "ControlVariantProp"],
  },
  InputOTPGroupProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: ["ClassNameProp"],
  },
  InputOTPGroupAppearanceProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: [],
  },
  InputOTPAlignProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: [],
  },
  InputOTPMaskProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: [],
  },
  StepItemProp: {
    group: "navigation",
    file: "components/navigation.prop.ts",
    vocabulary: ["TitleProp", "SubtitleProp", "DescriptionProp", "IconProp", "DisabledProp"],
  },
  StepStatusProp: { group: "navigation", file: "components/navigation.prop.ts", vocabulary: [] },
  StepsSeparatorProp: {
    group: "navigation",
    file: "components/navigation.prop.ts",
    vocabulary: [],
  },
  StepsTypeProp: {
    group: "navigation",
    file: "components/navigation.prop.ts",
    vocabulary: [],
  },
  TabsProp: {
    group: "navigation",
    file: "components/navigation.prop.ts",
    vocabulary: [
      "ValueProp",
      "DefaultValueProp",
      "OnValueChangeProp",
      "ClassNameProp",
      "SizeProp",
      "ExtraProp",
    ],
  },
  TabsVariantProp: {
    group: "navigation",
    file: "components/navigation.prop.ts",
    vocabulary: [],
  },
  TabsPlacementProp: {
    group: "navigation",
    file: "components/navigation.prop.ts",
    vocabulary: [],
  },
  TabsExtraProp: {
    group: "navigation",
    file: "components/navigation.prop.ts",
    vocabulary: ["ExtraProp"],
  },
  TabsOnEditProp: {
    group: "navigation",
    file: "components/navigation.prop.ts",
    vocabulary: ["HandlerProp"],
  },
  TabsOnTabClickProp: {
    group: "navigation",
    file: "components/navigation.prop.ts",
    vocabulary: ["HandlerProp"],
  },
  TabsOverflowProp: {
    group: "navigation",
    file: "components/navigation.prop.ts",
    vocabulary: [],
  },
  TabsAnimatedProp: {
    group: "navigation",
    file: "components/navigation.prop.ts",
    vocabulary: [],
  },
  TabsIndicatorSizeProp: {
    group: "navigation",
    file: "components/navigation.prop.ts",
    vocabulary: [],
  },
  TabsIndicatorProp: {
    group: "navigation",
    file: "components/navigation.prop.ts",
    vocabulary: [
      "TextAlignProp",
      {
        field: "size",
        local: true,
        reason:
          "The LENGTH of the active bar along the strip (Ant Design `indicator.size`), not a control tier — `SizeProp` is the sm/md/lg band and reusing it here would say something false. Values stay a closed named axis (`full` | `label`) so no pixel length or origin-function enters the API.",
      },
    ],
  },
  TabsScrollDirectionProp: {
    group: "navigation",
    file: "components/navigation.prop.ts",
    vocabulary: [],
  },
  TabsOnScrollProp: {
    group: "navigation",
    file: "components/navigation.prop.ts",
    vocabulary: ["HandlerProp"],
  },
  TabItemProp: {
    group: "navigation",
    file: "components/navigation.prop.ts",
    vocabulary: ["ValueProp", "LabelProp", "ChildrenProp", "DisabledProp", "IconProp"],
  },
  FormFieldArrayProp: {
    group: "form",
    file: "components/form.prop.ts",
    vocabulary: ["NameProp", "ChildrenProp", "DisabledProp"],
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
    vocabulary: [
      "SizeProp",
      "ClassNameProp",
      {
        field: "count",
        local: true,
        reason:
          "Counter-pill vocabulary shared VERBATIM with ButtonProp (count/overflowCount/showZero) so a counted filter tab and a counted pressed chip are one vocabulary — gh#312.",
      },
      {
        field: "countLabel",
        local: true,
        reason:
          "Localized unit folded into the accessible name so a counted icon/emoji chip never announces as a bare number.",
      },
    ],
  },
  ToggleGroupItemProp: {
    group: "data-entry",
    file: "components/ui/toggle-group.tsx",
    vocabulary: [
      "SizeProp",
      "ClassNameProp",
      {
        field: "count",
        local: true,
        reason:
          "Per-item counter pill — variant/size come from group context, but the number is per-item data (gh#312).",
      },
    ],
  },
  CommandPaletteProp: {
    group: "data-entry",
    file: "components/data-entry/command-palette.tsx",
    vocabulary: ["OpenProp", "DefaultOpenProp", "OnOpenChangeProp", "OnSearchChangeProp"],
  },
  TwoFactorSetupProp: {
    group: "feedback",
    file: "components/feedback/two-factor-setup.tsx",
    vocabulary: ["OpenProp", "OnOpenChangeProp", "PendingProp"],
  },
  AuthStackProp: {
    group: "layout",
    file: "components/layout/auth-stack.tsx",
    vocabulary: ["ChildrenProp", "ClassNameProp"],
  },
  RatingProp: {
    group: "data-entry",
    file: "components/ui/rating.tsx",
    vocabulary: ["ValueProp", "OnValueChangeProp", "DisabledProp", "ClassNameProp"],
  },
  SegmentedProp: {
    group: "data-entry",
    file: "components/ui/segmented.tsx",
    vocabulary: [
      "ValueProp",
      "DefaultValueProp",
      "OnValueChangeProp",
      "DisabledProp",
      "NameProp",
      "IdProp",
      "ClassNameProp",
    ],
  },
  TagInputProp: {
    group: "data-entry",
    file: "components/ui/tag-input.tsx",
    vocabulary: [
      "ValueProp",
      "OnValueChangeProp",
      "PlaceholderProp",
      "IdProp",
      "ClassNameProp",
      "ControlStatusProp",
      "ControlVariantProp",
      "SizeProp",
      "MaxTagCountProp",
      "MaxTagPlaceholderProp",
    ],
  },
  PasswordInputProp: {
    group: "data-entry",
    file: "components/ui/password-input.tsx",
    vocabulary: ["ClassNameProp"],
  },
  PasswordVisibilityToggleProp: {
    group: "data-entry",
    file: "components/ui/password-input.tsx",
    vocabulary: [],
  },
  PasswordStrengthProp: {
    group: "data-entry",
    file: "components/data-entry/password-strength.tsx",
    vocabulary: ["ValueProp", "ClassNameProp"],
  },
  ProgressProp: {
    group: "data-display",
    file: "components/data-display/progress.tsx",
    vocabulary: ["ValueProp", "LabelProp", "ToneProp", "ClassNameProp"],
  },
  LegendItemProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: ["ToneProp", "LabelProp"],
  },
  LegendProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: ["ClassNameProp"],
  },
  SwatchProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: [
      "ClassNameProp",
      {
        field: "color",
        local: true,
        reason:
          "A CSS colour VALUE a person chose (a brand's primary_color, a tag tint) — DATA, the same axis as Badge's `color`, and deliberately not ToneProp: a tone is a closed set of meanings and this colour means only itself (gh#527).",
      },
      {
        field: "aria-label",
        local: true,
        reason:
          "The sample's accessible NAME, which is what lets a read-only colour be shown with no visible label. Absent, the mark is aria-hidden (Legend's rule) — so colour is never the sole carrier either way.",
      },
    ],
  },
  FeatureStateProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: [],
  },
  FeatureItemProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: [
      "LabelProp",
      "DescriptionProp",
      {
        field: "state",
        local: true,
        reason: "Inclusion axis (included/excluded/limited) — FeatureList's own, not a tone.",
      },
    ],
  },
  FeatureListProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: ["ClassNameProp"],
  },
  DragAxisProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: [],
  },
  DragBoundsProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: [],
  },
  DraggablePanelPlacementProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: [],
  },
  DraggablePanelPositionProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: [
      {
        field: "x",
        local: true,
        reason:
          "react-draggable's inline offset in CSS pixels, on the physical axis the pointer reports.",
      },
      {
        field: "y",
        local: true,
        reason:
          "react-draggable's block offset in CSS pixels, on the physical axis the pointer reports.",
      },
    ],
  },
  DraggablePanelProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: [
      "TitleProp",
      "ChildrenProp",
      "ExtraProp",
      "SizeProp",
      "DisabledProp",
      "ClassNameProp",
      {
        field: "placement",
        local: true,
        reason: "Resting corner, in logical directions so it mirrors under RTL.",
      },
      { field: "axis", local: true, reason: "react-draggable `axis`, ported verbatim." },
      {
        field: "bounds",
        local: true,
        reason:
          "react-draggable `bounds`, trimmed to the forms that survive the RTL and no-DOM-selector rules.",
      },
      { field: "position", local: true, reason: "react-draggable `position` — controlled offset." },
      {
        field: "defaultPosition",
        local: true,
        reason: "react-draggable `defaultPosition` — uncontrolled starting offset.",
      },
      {
        field: "onPositionChange",
        local: true,
        reason: "Reports the clamped offset; the library never persists it (gh#560).",
      },
      {
        field: "onClose",
        local: true,
        reason: "Presence renders the title-bar close control — antd Modal's onCancel.",
      },
    ],
  },
  ThumbnailSizeProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: ["SizeProp"],
  },
  ThumbnailProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: [
      "SizeProp",
      "ClassNameProp",
      {
        field: "alt",
        local: true,
        reason: "The native img alt contract, made required so it cannot be forgotten.",
      },
      { field: "src", local: true, reason: "The native img src attribute." },
    ],
  },
  CodeBlockProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: ["ChildrenProp", "SizeProp", "ClassNameProp"],
  },
  ProseProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: ["SizeProp", "ClassNameProp", "ChildrenProp"],
  },
  TimelineProp: {
    group: "data-display",
    file: "components/data-display/timeline.tsx",
    vocabulary: ["ClassNameProp"],
  },
  TimelineGridColumnProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: [
      "IdProp",
      "LabelProp",
      "DescriptionProp",
      {
        field: "current",
        local: true,
        reason:
          "Marks the column as now/today — it carries the tint and hosts the grid's now marker.",
      },
    ],
  },
  TimelineGridEventProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: [
      "IdProp",
      "TitleProp",
      "DescriptionProp",
      {
        field: "columnId",
        local: true,
        reason: "Id of the column the event belongs to (see TimelineGridColumnProp.id).",
      },
      {
        field: "start",
        local: true,
        reason: 'Start clock time in the column\'s own day, "HH:MM" — no date, no timezone.',
      },
      {
        field: "end",
        local: true,
        reason:
          'End clock time, "HH:MM"; at or before start means the event continues into the next day.',
      },
      {
        field: "color",
        local: true,
        reason:
          "The record's own colour, washed into the block exactly like Badge `color` — decorative, never the only signal.",
      },
    ],
  },
  TimelineGridProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: [
      "LabelProp",
      "ClassNameProp",
      "IdProp",
      {
        field: "columns",
        local: true,
        reason: "Consumer-supplied columns in render order (see TimelineGridColumnProp).",
      },
      {
        field: "events",
        local: true,
        reason: "Consumer-supplied events (see TimelineGridEventProp).",
      },
      {
        field: "start",
        local: true,
        reason:
          'First clock time on the axis, "HH:MM"; defaults to the earliest event on the hour so a block can only fall outside a PINNED axis.',
      },
      {
        field: "end",
        local: true,
        reason: 'Last clock time on the axis, "HH:MM"; defaults to the latest event on the hour.',
      },
      {
        field: "interval",
        local: true,
        reason: "Hours between hour rules and axis labels (default 1).",
      },
      {
        field: "now",
        local: true,
        reason: 'Current clock time, "HH:MM" — draws the now marker in the columns marked current.',
      },
      {
        field: "onEventSelect",
        local: true,
        reason:
          "Block click handler carrying the event; its presence turns every block into a real button.",
      },
    ],
  },
  ChatBubblePlacementProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: [
      {
        field: "placement",
        local: true,
        reason:
          'Side of the conversation a message sits on ("start" | "end"), spelled on the LOGICAL inline axis so a feed flips under dir="rtl" with no per-locale branch.',
      },
    ],
  },
  ChatBubbleVariantProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: [
      {
        field: "variant",
        local: true,
        reason:
          "Structural treatment of the message body (filled | borderless | outlined). Status colour stays on `tone`; Ant Design X's `shadow` is absent because this system has no drop shadows.",
      },
    ],
  },
  ChatBubbleToneProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: ["ToneProp"],
  },
  ChatBubbleTypingProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: [
      {
        field: "typing",
        local: true,
        reason:
          "Stream-in animation: `true` or `{ step, interval }`. Dropped entirely under prefers-reduced-motion, which renders the full text at once (WCAG 2.3.3).",
      },
    ],
  },
  ChatBubbleProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: [
      "ChildrenProp",
      "SizeProp",
      "ToneProp",
      "PendingProp",
      "ClassNameProp",
      "IdProp",
      {
        field: "placement",
        local: true,
        reason: "See ChatBubblePlacementProp, the conversation-side vocabulary.",
      },
      {
        field: "variant",
        local: true,
        reason: "See ChatBubbleVariantProp, the message-body treatment vocabulary.",
      },
      {
        field: "avatar",
        local: true,
        reason:
          "The author's mark — a real <Avatar> node. A slot, not a label: the accessible name comes from `header`, so a decorative avatar is aria-hidden at the call site.",
      },
      {
        field: "header",
        local: true,
        reason:
          "Line above the body naming the turn's author. Distinct from TitleProp: it is the bubble's ACCESSIBLE NAME, not a heading in the document outline.",
      },
      {
        field: "footer",
        local: true,
        reason:
          "Line below the body (timestamp, per-message actions). Not FooterProp, which is a page-level action bar.",
      },
      {
        field: "typing",
        local: true,
        reason: "See ChatBubbleTypingProp, the stream-in animation vocabulary.",
      },
    ],
  },
  ChatMessageProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: [
      "IdProp",
      "ChildrenProp",
      {
        field: "role",
        local: true,
        reason:
          'Key into ChatBubbleList\'s `roles` map ("user" | "assistant" | "system" | a product\'s own). A data field, not the ARIA `role` attribute.',
      },
      {
        field: "content",
        local: true,
        reason:
          "The message body. Spelled `content` rather than `children` because a data item in an array is not a JSX child.",
      },
    ],
  },
  ChatBubbleListProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: [
      "LabelProp",
      "ClassNameProp",
      "IdProp",
      {
        field: "items",
        local: true,
        reason: "Consumer-supplied messages in conversation order (see ChatMessageProp).",
      },
      {
        field: "roles",
        local: true,
        reason:
          "Per-role bubble defaults merged UNDER each message's own props, so a feed's shape is declared once instead of on every message.",
      },
      {
        field: "autoScroll",
        local: true,
        reason:
          'Stick-to-bottom while the reader is already at the bottom. Not a generic boolean flag: revoking the pin the moment they scroll up is the behaviour, and it drives the "jump to latest" affordance.',
      },
    ],
  },
  TreeNodeProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: [
      { field: "icon", local: true, reason: "Per-node glyph drawn when Tree's showIcon is on." },
      {
        field: "children",
        local: true,
        reason: "The node's own child nodes — the hierarchy itself, not a slot.",
      },
    ],
  },
  TreeProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: [
      "ValueProp",
      "DefaultValueProp",
      "OnValueChangeProp",
      "DisabledProp",
      "SizeProp",
      "ClassNameProp",
      "IdProp",
    ],
  },
  CardProp: {
    group: "data-display",
    file: "components/data-display/card.tsx",
    vocabulary: ["ToneProp", "ClassNameProp", "ChildrenProp"],
  },
  CardTabItemProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: [
      "LabelProp",
      "DisabledProp",
      {
        field: "key",
        local: true,
        reason:
          "Ant Design `CardTabListType.key`. The tab's identity keeps antd's own spelling per docs/DESIGN-AUTHORITY.md; `ValueProp` is the Tabs component's axis, not the card head's.",
      },
      {
        field: "tab",
        local: true,
        reason:
          "Ant Design `CardTabListType.tab` — the trigger label under antd's name, for the same reason `key` is not `value`.",
      },
    ],
  },
  AttachmentsProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: [
      "DisabledProp",
      "ClassNameProp",
      {
        field: "items",
        local: true,
        reason:
          "Ant Design X / antd Upload `fileList`, kept as `items` so an Ant X call site compiles unchanged.",
      },
      {
        field: "onChange",
        local: true,
        reason:
          "antd Upload's `{ file, fileList }` callback — not the controlled-vocabulary `onValueChange`.",
      },
    ],
  },
  AttachmentsSemanticProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: [],
  },
  AttachmentsOverflowProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: [],
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
  CardTitleProp: {
    group: "data-display",
    file: "components/data-display/card.tsx",
    vocabulary: ["HeadingLevelProp", "ClassNameProp", "ChildrenProp"],
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
    vocabulary: ["TitleProp", "ToneProp", "IconProp", "ClassNameProp"],
  },
  ServiceLauncherCardProp: {
    group: "data-display",
    file: "components/data-display/service-launcher-card.tsx",
    vocabulary: ["TitleProp", "ToneProp", "IconProp", "ClassNameProp", "DisabledProp"],
  },
  ServiceCatalogCtaProp: {
    group: "data-display",
    file: "components/data-display/service-launcher-card.tsx",
    vocabulary: ["TitleProp", "IconProp", "ClassNameProp"],
  },
  ServiceLauncherCardSkeletonProp: {
    group: "data-display",
    file: "components/data-display/service-launcher-card.tsx",
    vocabulary: ["LabelProp", "ClassNameProp"],
  },
  RangeTimelineProp: {
    group: "data-display",
    file: "components/data-display/range-timeline.tsx",
    vocabulary: [
      "LabelProp",
      {
        field: "columns",
        local: true,
        reason: "Labels and positive numeric unit counts define a consumer-supplied axis.",
      },
      {
        field: "bands",
        local: true,
        reason: "Optional grouped labels in the same axis units, such as months above daily ticks.",
      },
      {
        field: "rows",
        local: true,
        reason:
          "Consumer-supplied interval records preserve true inclusive endpoints independently of clipping.",
      },
      {
        field: "today",
        local: true,
        reason: "Optional current position in the same numeric units as the axis.",
      },
      {
        field: "onRangeChange",
        local: true,
        reason:
          "An endpoint movement command, not an internally owned value; the consumer commits its row data.",
      },
    ],
  },
  ResponsiveGridProp: {
    group: "layout",
    file: "components/layout/responsive-grid.tsx",
    vocabulary: ["GapProp", "ClassNameProp", "ChildrenProp"],
  },
  MasterDetailProps: {
    group: "layout",
    file: "components/layout/master-detail.tsx",
    vocabulary: ["ChildrenProp"],
  },
  SplitPaneProp: {
    group: "layout",
    file: "components/layout/split-pane.tsx",
    vocabulary: ["ClassNameProp", "ChildrenProp"],
  },
  PermissionMatrixRoleProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: [
      "IdProp",
      {
        field: "name",
        local: true,
        reason: "Consumer-supplied role display name; a plain string so it can label cells for AT.",
      },
      {
        field: "description",
        local: true,
        reason: "Secondary caption under the role column header.",
      },
      {
        field: "locked",
        local: true,
        reason: "Per-role read-only flag — a locked role keeps ✓/— cells in an editable matrix.",
      },
    ],
  },
  PermissionMatrixPermissionProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: [
      "IdProp",
      {
        field: "name",
        local: true,
        reason: "Consumer-supplied permission display name; plain string for accessible labels.",
      },
      {
        field: "description",
        local: true,
        reason: "Secondary line under the permission name.",
      },
      {
        field: "group",
        local: true,
        reason: "Optional category caption for the permission row.",
      },
    ],
  },
  PermissionMatrixGrantsProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: [
      {
        field: "grants",
        local: true,
        reason:
          "The role×permission grant relation — the grantKey Set from lib/permission-grid or a pair array normalized through the same encoding.",
      },
    ],
  },
  PermissionMatrixProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: [
      "LabelProp",
      "HandlerProp",
      "ClassNameProp",
      "IdProp",
      {
        field: "roles",
        local: true,
        reason: "Consumer-supplied role columns (see PermissionMatrixRoleProp).",
      },
      {
        field: "permissions",
        local: true,
        reason: "Consumer-supplied permission rows (see PermissionMatrixPermissionProp).",
      },
      {
        field: "grants",
        local: true,
        reason: "The grant relation (see PermissionMatrixGrantsProp).",
      },
      {
        field: "onGrantChange",
        local: true,
        reason:
          "Cell toggle handler carrying the (roleId, permissionId, granted) triple; its presence switches the grid from read-only ✓/— to editable checkboxes.",
      },
      {
        field: "readOnly",
        local: true,
        reason: "Forces the read-only grid even when onGrantChange is present (viewer permission).",
      },
      {
        field: "compare",
        local: true,
        reason: "Two role ids compared side by side — the lib/permission-grid ComparePair.",
      },
      {
        field: "diffOnly",
        local: true,
        reason: "差分のみ filter: with compare set, keep only the rows where the two roles differ.",
      },
      {
        field: "loading",
        local: true,
        reason:
          "Read-lifecycle skeleton state mirroring DataTable #216 (precedence loading → denied → error → empty).",
      },
      {
        field: "empty",
        local: true,
        reason: "Custom empty content override, mirroring DataTable's empty slot.",
      },
      {
        field: "error",
        local: true,
        reason: "Read-failure state mirroring DataTable #216 (true = built-in localized message).",
      },
      {
        field: "denied",
        local: true,
        reason: "Permission-denied read state mirroring DataTable #216 — refused, not failed.",
      },
      {
        field: "onRetry",
        local: true,
        reason: "Retry affordance for the built-in error state, mirroring DataTable #216.",
      },
    ],
  },
  BranchScopeModeProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: [
      {
        field: "mode",
        local: true,
        reason: "Closed scope vocabulary: all branches vs an explicit subset.",
      },
    ],
  },
  BranchScopeValueProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: [
      {
        field: "mode",
        local: true,
        reason: "The selected scope mode (see BranchScopeModeProp).",
      },
      {
        field: "branchIds",
        local: true,
        reason: "Checked branch ids, meaningful only when mode = selected.",
      },
    ],
  },
  BranchScopeOptionProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: [
      "IdProp",
      "DisabledProp",
      {
        field: "name",
        local: true,
        reason: "Consumer-supplied branch display name; plain string so it is searchable.",
      },
      {
        field: "description",
        local: true,
        reason: "Secondary line under the branch name.",
      },
    ],
  },
  BranchScopePickerProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: [
      "ValueProp",
      "DefaultValueProp",
      "OnValueChangeProp",
      "DisabledProp",
      "ErrorProp",
      "NameProp",
      "IdProp",
      "ClassNameProp",
      {
        field: "branches",
        local: true,
        reason: "Consumer-supplied selectable branches (see BranchScopeOptionProp).",
      },
      {
        field: "readOnly",
        local: true,
        reason: "Locked view: render the current scope without editable affordances.",
      },
      {
        field: "searchable",
        local: true,
        reason: "Toggle for the built-in branch SearchInput above the checkbox list.",
      },
      {
        field: "loading",
        local: true,
        reason: "Read-lifecycle skeleton state (precedence loading → denied → listError → empty).",
      },
      {
        field: "empty",
        local: true,
        reason: "Custom empty content when there are no branches.",
      },
      {
        field: "listError",
        local: true,
        reason:
          "Branch-collection READ failure — deliberately distinct from ErrorProp `error`, which stays field validation.",
      },
      {
        field: "denied",
        local: true,
        reason: "Permission-denied read state — the branch collection was refused, not failed.",
      },
      {
        field: "allLabel",
        local: true,
        reason: "Override for the localized all-branches radio label.",
      },
      {
        field: "selectedLabel",
        local: true,
        reason: "Override for the localized selected-branches radio label.",
      },
    ],
  },
  ServiceRoleItemProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: [
      "IdProp",
      {
        field: "name",
        local: true,
        reason: "Consumer-supplied role display name; plain string for accessible labels.",
      },
      {
        field: "description",
        local: true,
        reason: "Secondary line under the role name in the master rail.",
      },
      {
        field: "memberCount",
        local: true,
        reason: "Member count caption, pluralized via CLDR categories.",
      },
      {
        field: "locked",
        local: true,
        reason: "System-role flag: lock badge, no delete affordance ever.",
      },
    ],
  },
  ServiceRolePanelProp: {
    group: "layout",
    file: "components/layout.prop.ts",
    vocabulary: [
      "ValueProp",
      "DefaultValueProp",
      "OnValueChangeProp",
      "ChildrenProp",
      "BreakpointProp",
      "IdProp",
      "ClassNameProp",
      {
        field: "roles",
        local: true,
        reason: "Consumer-supplied role collection (see ServiceRoleItemProp).",
      },
      {
        field: "onDeleteRole",
        local: true,
        reason:
          "Confirmed-deletion handler; its presence arms the built-in destructive AlertDialog per non-locked role.",
      },
      {
        field: "readOnly",
        local: true,
        reason: "Locked view: hides every mutating affordance.",
      },
      {
        field: "loading",
        local: true,
        reason: "Read-lifecycle skeleton state (precedence loading → denied → error → empty).",
      },
      {
        field: "empty",
        local: true,
        reason: "Custom empty content when there are no roles.",
      },
      {
        field: "error",
        local: true,
        reason: "Read-failure state (true = built-in localized message, node replaces it).",
      },
      {
        field: "denied",
        local: true,
        reason: "Permission-denied read state — refused, not failed.",
      },
      {
        field: "onRetry",
        local: true,
        reason: "Retry affordance for the built-in error state.",
      },
      {
        field: "masterLabel",
        local: true,
        reason: "Accessible name override for the roles region (localized default otherwise).",
      },
      {
        field: "detailLabel",
        local: true,
        reason: "Accessible name override for the detail region (localized default otherwise).",
      },
      {
        field: "railWidth",
        local: true,
        reason: "Forwarded MasterDetail rail geometry preset.",
      },
      {
        field: "masterViewport",
        local: true,
        reason: "Forwarded MasterDetail bounded-collection preset.",
      },
      {
        field: "collapseBelow",
        local: true,
        reason: "Forwarded MasterDetail stacking threshold override.",
      },
    ],
  },
  ChatComposerSubmitTypeProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: [],
  },
  ChatComposerProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: [
      "ValueProp",
      "DefaultValueProp",
      "OnValueChangeProp",
      "PlaceholderProp",
      "DisabledProp",
      "PendingProp",
      "SizeProp",
      "ControlStatusProp",
      "NameProp",
      "IdProp",
      "ClassNameProp",
    ],
  },
  ChatSuggestionItemProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: ["ValueProp", "LabelProp", "DisabledProp"],
  },
  ChatSuggestionRenderProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: [
      {
        field: "onTrigger",
        local: true,
        reason: "Render-prop callback the composer calls to re-read the caret; not a value change.",
      },
      {
        field: "onKeyDown",
        local: true,
        reason: "Render-prop keydown forwarder — the composer's own DOM handler, not a state axis.",
      },
    ],
  },
  ChatSuggestionProp: {
    group: "data-entry",
    file: "components/data-entry.prop.ts",
    vocabulary: [
      "OnValueChangeProp",
      "OpenProp",
      "DefaultOpenProp",
      "OnOpenChangeProp",
      "ChildrenProp",
      "EmptyMessageProp",
      "IdProp",
      "ClassNameProp",
    ],
  },
  ConversationsItemProp: {
    group: "navigation",
    file: "components/navigation.prop.ts",
    vocabulary: ["LabelProp", "IconProp", "DisabledProp"],
  },
  ConversationsDividerProp: {
    group: "navigation",
    file: "components/navigation.prop.ts",
    vocabulary: [
      {
        field: "type",
        local: true,
        reason: "Ant Design X ItemType discriminant — the literal 'divider', not a styling axis",
      },
      {
        field: "dashed",
        local: true,
        reason: "Ant Design X DividerItemType.dashed — the rule's stroke, local to this row kind",
      },
    ],
  },
  ConversationsEntryProp: {
    group: "navigation",
    file: "components/navigation.prop.ts",
    vocabulary: ["LabelProp", "IconProp", "DisabledProp"],
  },
  ConversationsMenuItemProp: {
    group: "navigation",
    file: "components/navigation.prop.ts",
    vocabulary: ["LabelProp", "IconProp", "DisabledProp", "ToneProp"],
  },
  ConversationsMenuProp: {
    group: "navigation",
    file: "components/navigation.prop.ts",
    vocabulary: ["ActionsProp", "OnClickProp", "LabelProp"],
  },
  ConversationsGroupableProp: {
    group: "navigation",
    file: "components/navigation.prop.ts",
    vocabulary: ["LabelProp", "OpenProp", "DefaultOpenProp", "OnOpenChangeProp"],
  },
  ConversationsCreationProp: {
    group: "navigation",
    file: "components/navigation.prop.ts",
    vocabulary: ["LabelProp", "IconProp", "DisabledProp", "OnClickProp"],
  },
  ConversationsProp: {
    group: "navigation",
    file: "components/navigation.prop.ts",
    vocabulary: [
      "ActionsProp",
      "ValueProp",
      "DefaultValueProp",
      "OnValueChangeProp",
      "LabelProp",
      "IdProp",
      "ClassNameProp",
    ],
  },
  WelcomeVariantProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: ["ControlVariantProp"],
  },
  WelcomeProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: [
      "IconProp",
      "TitleProp",
      "DescriptionProp",
      "ExtraProp",
      "IdProp",
      "ClassNameProp",
    ],
  },
  ActionsVariantProp: {
    group: "general",
    file: "components/general.prop.ts",
    vocabulary: ["ControlVariantProp"],
  },
  ActionsStatusProp: {
    group: "general",
    file: "components/general.prop.ts",
    vocabulary: ["StatusProp"],
  },
  ActionsFeedbackValueProp: {
    group: "general",
    file: "components/general.prop.ts",
    vocabulary: ["ValueProp"],
  },
  ActionsItemsProp: {
    group: "general",
    file: "components/general.prop.ts",
    vocabulary: ["LabelProp", "IconProp", "OnClickProp", "ActionsProp"],
  },
  ActionsProp: {
    group: "general",
    file: "components/general.prop.ts",
    vocabulary: ["ActionsProp", "OnClickProp", "LabelProp", "IdProp", "ClassNameProp"],
  },
  ActionsItemProp: {
    group: "general",
    file: "components/general.prop.ts",
    vocabulary: [
      "StatusProp",
      "IconProp",
      "LabelProp",
      "OnClickProp",
      "DisabledProp",
      "IdProp",
      "ClassNameProp",
    ],
  },
  ThoughtChainStatusProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: ["StatusProp"],
  },
  ThoughtChainLineProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: ["OrientationProp"],
  },
  ThoughtChainVariantProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: ["ControlVariantProp"],
  },
  ThoughtChainItemsProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: ["IconProp", "TitleProp", "DescriptionProp", "FooterProp", "StatusProp"],
  },
  ThoughtChainProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: [
      "OpenProp",
      "DefaultOpenProp",
      "OnOpenChangeProp",
      "LabelProp",
      "IdProp",
      "ClassNameProp",
    ],
  },
  ActionsCopyProp: {
    group: "general",
    file: "components/general.prop.ts",
    vocabulary: ["IconProp", "LabelProp", "HandlerProp", "IdProp", "ClassNameProp"],
  },
  ActionsFeedbackProp: {
    group: "general",
    file: "components/general.prop.ts",
    vocabulary: ["ValueProp", "OnChangeProp", "LabelProp", "IdProp", "ClassNameProp"],
  },
  ThoughtChainItemProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: [
      "TitleProp",
      "DescriptionProp",
      "IconProp",
      "StatusProp",
      "ControlVariantProp",
      "DisabledProp",
      "OnClickProp",
      "IdProp",
      "ClassNameProp",
    ],
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
