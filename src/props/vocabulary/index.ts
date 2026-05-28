/** Barrel — all vocabulary prop types. */

export type {
  ClassNameProp,
  ChildrenProp,
  IdProp,
  OpenProp,
  OnOpenChangeProp,
  HandlerProp,
  PendingProp,
  RequiredProp,
  DisabledProp,
  LabelProp,
  HelperProp,
  ErrorProp,
  PlaceholderProp,
  NameProp,
  ValueProp,
  OnChangeProp,
  OnClickProp,
  AsChildProp,
} from "./shared.prop";

export type {
  TitleProp,
  SubtitleProp,
  DescriptionProp,
  ExtraProp,
  FooterProp,
  ActionProp,
  IconProp,
  ConfirmLabelProp,
  CancelLabelProp,
  ActionsProp,
} from "./content.prop";

export type {
  PageDensityProp,
  PageContainerVariantProp,
  StackGapProp,
  InlineGapProp,
  TableDensityProp,
  /** @deprecated Alias — use PageDensityProp */
  DensityProp,
  /** @deprecated Alias — use StackGapProp */
  GapProp,
} from "./layout.prop";

export type {
  ButtonVariantProp,
  ButtonSizeProp,
  ConfirmVariantProp,
  StatusToneProp,
  AlertVariantProp,
  SortDirectionProp,
  ColumnAlignProp,
  SortStateProp,
} from "./interaction.prop";

export type { BreadcrumbItemProp, BreadcrumbProp, PageTitleProp } from "./navigation.prop";

export type {
  GetRowIdProp,
  OnRowClickProp,
  ColumnDefProp,
  SelectedIdsProp,
  OnSelectChangeProp,
  OnTableDensityChangeProp,
  OnSortChangeProp,
  OnSearchChangeProp,
  OnClearFiltersProp,
  HasActiveFiltersProp,
} from "./data.prop";
