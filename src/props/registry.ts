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
      "AuthShellPresetProp",
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
      "OpenProp",
      "OnOpenChangeProp",
      "SizeProp",
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
      "OpenProp",
      "OnOpenChangeProp",
      "SizeProp",
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
    vocabulary: ["BadgeVariantProp", "ShapeProp", "ToneProp", "ChildrenProp", "ClassNameProp"],
  },
  DataTableProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: [
      "ColumnDefProp",
      "DensityProp",
      "SortStateProp",
      "SelectedIdsProp",
      "HandlerProp",
      "TablePresetProp",
      "TableColumnPriorityProp",
      "BreakpointProp",
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
  ScrollAreaProp: {
    group: "data-display",
    file: "components/data-display.prop.ts",
    vocabulary: [
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
      { field: "showLegend", local: true, reason: "Chart-specific legend toggle." },
      { field: "numberFormat", local: true, reason: "Intl.NumberFormat options for tooltips." },
      { field: "donut", local: true, reason: "Hollow-centre donut rendering." },
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
    vocabulary: ["ValueProp", "OnValueChangeProp", "DisabledProp", "ClassNameProp"],
  },
  StepsProp: {
    group: "navigation",
    file: "components/navigation.prop.ts",
    vocabulary: ["ValueProp", "DefaultValueProp", "SizeProp", "OnValueChangeProp", "ClassNameProp"],
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
