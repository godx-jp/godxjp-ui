/**
 * `@godxjp/ui/lab` — opt-in components (v32 #1223, decision B3).
 *
 * Real behaviour and a known pattern, but niche (a website or novelty surface): no consumer should
 * pay their catalog and context cost by default. They ship with the SAME gates as core — tests,
 * a11y, i18n, tokens — and the stylesheet is the core one. The MCP lists them only when asked.
 *
 * Promotion to core: once a component is imported by >= 2 repos. Demotion: never automatic.
 */
export { FloatButton } from "./float-button";
export type {
  FloatButtonBackTopProp,
  FloatButtonBackTopProps,
  FloatButtonBadgeProp,
  FloatButtonGroupProp,
  FloatButtonGroupProps,
  FloatButtonPlacementProp,
  FloatButtonProp,
  FloatButtonProps,
  FloatButtonShapeProp,
  FloatButtonTooltipProp,
  FloatButtonTriggerProp,
  FloatButtonTypeProp,
} from "./float-button";
export { PageCover } from "./page-cover";
export type { PageCoverProp, PageCoverProps } from "./page-cover";
export { DraggablePanel } from "./draggable-panel";
export type {
  DraggablePanelProp,
  DraggablePanelProps,
  DraggablePanelPlacementProp,
  DraggablePanelPositionProp,
  DraggablePanelLabels,
  DragAxisProp,
  DragBoundsProp,
} from "./draggable-panel";
export { LegalDocumentShell } from "./legal-document-shell";
export type {
  LegalDocumentSectionProp,
  LegalDocumentShellProp,
  LegalDocumentShellProps,
} from "./legal-document-shell";
export { Masonry } from "./masonry";
export type {
  MasonryColumnsProp,
  MasonryGapProp,
  MasonryItemProp,
  MasonryLayoutEntryProp,
  MasonryProp,
  MasonryProps,
} from "./masonry";
export { Marquee } from "./marquee";
export type { MarqueeDirectionProp, MarqueeProp, MarqueeProps, MarqueeSpeedProp } from "./marquee";
export { TextDiff, diffText, tokenizeText } from "./text-diff";
export type {
  TextDiffGranularity,
  TextDiffProp,
  TextDiffProps,
  TextDiffSegment,
} from "./text-diff";
export { TimelineGrid } from "./timeline-grid";
export type {
  TimelineGridColumnProp,
  TimelineGridEventProp,
  TimelineGridProp,
  TimelineGridProps,
} from "./timeline-grid";
export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselDots,
  useCarousel,
} from "./carousel";
export type { CarouselApi } from "./carousel";
export { RangeTimeline } from "./range-timeline";
export type { RangeTimelineProps, RangeTimelineRow } from "./range-timeline";
export { OrgChart } from "./org-chart";
export type {
  OrgChartNodeProp,
  OrgChartNodeVariantProp,
  OrgChartProp,
  OrgChartProps,
} from "./org-chart";
export { EmojiPicker } from "./emoji-picker";
export type { EmojiPickerProp, EmojiPickerProps } from "./emoji-picker";
export { SortableList } from "./sortable-list";
export type { SortableListItemProp, SortableListProp, SortableListProps } from "./sortable-list";
export { MegaMenu } from "./mega-menu";
export type {
  MegaMenuProp,
  MegaMenuProps,
  MegaMenuItemProp,
  MegaMenuItemProps,
  MegaMenuPanelProp,
  MegaMenuPanelProps,
  MegaMenuGroupProp,
  MegaMenuGroupProps,
  MegaMenuLinkProp,
  MegaMenuLinkProps,
  MegaMenuLinkComponentProp,
  MegaMenuLinkComponentProps,
  MegaMenuTriggerActionProp,
  MegaMenuTriggerActionProps,
} from "./mega-menu";
export { Anchor } from "./anchor";
export type {
  AnchorContainerProp,
  AnchorDirectionProp,
  AnchorItemProp,
  AnchorProp,
  AnchorProps,
} from "./anchor";
