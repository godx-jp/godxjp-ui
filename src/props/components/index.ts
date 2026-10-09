export type {
  AppLauncherApp,
  AppLauncherGroup,
  AppLauncherLabels,
  AppLauncherProp,
  AppShellProp,
  AuthFooterProp,
  AuthIdentityProp,
  OrgSwitcherLabels,
  OrgSwitcherOrganization,
  OrgSwitcherProp,
  DragAxisProp,
  DragBoundsProp,
  DraggablePanelLabels,
  DraggablePanelPlacementProp,
  DraggablePanelPositionProp,
  DraggablePanelProp,
  PageContainerExtraProp,
  PageContainerProp,
  PageInsetProp,
  SidebarItemProp,
  SidebarProductProp,
  SidebarProp,
  SidebarSectionProp,
  TopbarProp,
} from "./layout.prop";
export type { ButtonProp } from "./general.prop";
export type {
  CommandProp,
  InputProp,
  TextareaProp,
  FormFieldProp,
  SearchInputProp,
  CheckboxProp,
  CheckboxGroupProp,
  ChoiceOptionProp,
  RadioProp,
  RadioGroupProp,
  SwitchProp,
  SliderProp,
  CalendarProp,
  DatePickerProp,
  TimePickerProp,
  ColorPickerProp,
  ColorPickerPresetProp,
  UploadProp,
  UploadFileItemProp,
  UploadVariantProp,
  TreeOptionProp,
  TreeFieldNamesProp,
  CascaderProp,
  TreeSelectProp,
  ShowCheckedStrategyProp,
  TransferProp,
  TransferItemProp,
} from "./data-entry.prop";
export type {
  AvatarProp,
  EmptyStateProp,
  DescriptionsProp,
  DescriptionsItemProp,
  BadgeProp,
  DataTableProp,
  QrCodeProp,
} from "./data-display.prop";
export type {
  ChartDatum,
  ChartSeriesProp,
  LineChartProp,
  BarChartProp,
  AreaChartProp,
  PieChartProp,
} from "./charts.prop";
export type {
  AlertQueryErrorProp,
  AuthExpiryProviderProp,
  AlertProp,
  DialogProp,
  DialogContentProp,
  AlertTitleProp,
  AlertContentProp,
  AlertDescriptionProp,
  AlertActionsProp,
  SheetResponsiveProp,
  SkeletonRowsProp,
} from "./feedback.prop";
export type {
  DataStateProp,
  InfiniteQueryStateProp,
  InfiniteQueryHelpers,
  PrefetchLinkProp,
} from "./query.prop";
export type {
  DropdownMenuPlacementProp,
  DropdownMenuTriggerActionProp,
  PaginationProp,
  PaginationSizeProp,
  PaginationAlignProp,
  StepsProp,
  StepItemProp,
  StepStatusProp,
  StepsTypeProp,
  TabsProp,
  TabItemProp,
  TabsVariantProp,
  TabsPlacementProp,
  TabsExtraProp,
  TabsOnEditProp,
} from "./navigation.prop";
export type {
  AppProviderProp,
  AppContextValue,
  AppSettingKind,
  AppSettingPickerProp,
  AppSettingPickerMenuProp,
  AppSettingPickerCycleProp,
  AppSettingCycleKind,
  ThemeScopeProp,
} from "./app.prop";
export type {
  ZodSchemaProp,
  UseZodFormOptionsProp,
  UseZodFormReturnProp,
  FormRootProp,
  FormFieldControlProp,
  FieldErrorMessageProp,
} from "./form.prop";

/*
 * The conversational family's prop types. Their components live in `@godxjp/chat` since v32
 * (#1223); the types stay here, public, so that package and its consumers name them the same way.
 */
export type {
  ChatBubbleListProp,
  ChatBubbleProp,
  ChatBubbleToneProp,
  ChatBubbleTypingProp,
  ThoughtChainItemProp,
  ThoughtChainProp,
  ThoughtChainStatusProp,
  WelcomeProp,
} from "./data-display.prop";
export type {
  AttachmentsItemProp,
  AttachmentsPlaceholderProp,
  AttachmentsProp,
  AttachmentsRefProp,
  ChatComposerProp,
  ChatSuggestionItemProp,
  ChatSuggestionProp,
} from "./data-entry.prop";
export type {
  ActionsCopyProp,
  ActionsFeedbackProp,
  ActionsItemProp,
  ActionsItemsProp,
  // `ActionsProp` is also the VOCABULARY name of an actions slot; `src/props/index.ts` re-exports
  // both barrels, and a second `ActionsProp` there would drop both. Same rename `IconGlyphProp` made.
  ActionsProp as ActionsBarProp,
} from "./general.prop";
export type {
  ConversationsCreationProp,
  ConversationsEntryProp,
  ConversationsGroupableProp,
  ConversationsItemProp,
  ConversationsMenuProp,
  ConversationsProp,
} from "./navigation.prop";
export type {
  ChatBubblePlacementProp,
  ChatBubbleVariantProp,
  ChatMessageProp,
  ThoughtChainItemsProp,
  ThoughtChainLineProp,
  ThoughtChainVariantProp,
  WelcomeVariantProp,
} from "./data-display.prop";
export type {
  AttachmentsOverflowProp,
  ChatComposerActionComponents,
  ChatComposerFooterProp,
  ChatComposerSubmitTypeProp,
  ChatSuggestionRenderProp,
} from "./data-entry.prop";
export type {
  ActionsFeedbackValueProp,
  ActionsStatusProp,
  ActionsVariantProp,
} from "./general.prop";
export type { ConversationsDividerProp, ConversationsMenuItemProp } from "./navigation.prop";
