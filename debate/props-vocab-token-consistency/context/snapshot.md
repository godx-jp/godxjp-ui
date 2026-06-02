# Current vocabulary + tokens snapshot (verify against source; do not take as complete)

## Vocabulary prop types (src/props/vocabulary/, 57 total)
ActionProp ActionsProp AlertVariantProp AsChildProp BreadcrumbItemProp BreadcrumbProp ButtonSizeProp ButtonVariantProp CancelLabelProp ChildrenProp ClassNameProp ColumnAlignProp ColumnDefProp ConfirmLabelProp ConfirmVariantProp DensityProp DescriptionProp DisabledProp EmptyMessageProp ErrorProp ExtraProp FooterProp GapProp GetRowIdProp HandlerProp HasActiveFiltersProp HelperProp IconProp IdProp InlineGapProp LabelProp NameProp OnChangeProp OnClearFiltersProp OnClickProp OnOpenChangeProp OnRowClickProp OnSearchChangeProp OnSelectChangeProp OnSortChangeProp OnTableDensityChangeProp OpenProp PageContainerVariantProp PageDensityProp PageTitleProp PendingProp PlaceholderProp RequiredProp SelectedIdsProp SortDirectionProp SortStateProp StackGapProp StatusToneProp SubtitleProp TableDensityProp TitleProp ValueProp 

## Smells spotted by the moderator (candidates, verify):
- DUP gap: GapProp + InlineGapProp + StackGapProp (3 names, 1 concept)
- DUP variant: ButtonVariantProp + AlertVariantProp + ConfirmVariantProp + PageContainerVariantProp (no generic VariantProp)
- DUP density: DensityProp + PageDensityProp + TableDensityProp (+ OnTableDensityChangeProp)
- DUP title: TitleProp + PageTitleProp
- tone vs variant inconsistency: StatusToneProp vs *VariantProp
- MISSING standard controlled-input vocab: value/defaultValue/onValueChange, open/defaultOpen/onOpenChange (only ValueProp/OnChangeProp/OpenProp/OnOpenChangeProp exist)
- many ad-hoc on* handlers: OnChange/OnClick/OnRowClick/OnSearchChange/OnSelectChange/OnSortChange/OnClearFilters (+ generic HandlerProp)

## Token files (src/tokens/, src/styles/theme.css)
src/tokens/: base.css foundation.css primitives  src/tokens/primitives: badge.css card.css control.css feedback.css layout.css navigation.css table.css 

## Token smells (candidates):
- DOMAIN tokens (rule #19 violation): --tracking-yamato, --tracking-seller, --tracking-internal (leftover from removed CodeBadge)
- raw palette scales: --gray-* (10), --blue-* (5) mixed with semantic tokens
- semantic colors look consistent: primary/secondary/destructive/success/warning/info/muted/card/popover + each -foreground
- spacing: --space-* (10 steps)
