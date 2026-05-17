// Public surface for the atomic primitive layer.
//
// Per cardinal rule 27 the primitive sources live under
// `src/components/<group>/<Name>.tsx` (six groups: general / layout /
// data-display / data-entry / feedback / navigation) — this barrel
// re-exports them so the published import path
// `@godxjp/ui/components/primitives` stays stable for consumers.
//
// Each component is a thin wrapper around a canonical CSS class from
// `@godxjp/ui/tokens` — the visual contract stays mastered in CSS
// variables + class names, and React adds ergonomics (props, refs,
// ARIA, Radix wiring).
//
// Don't add a primitive that re-encodes a token in Tailwind utilities.
// If a new atom is needed, add the CSS class to tokens.css first, then
// wrap it here. See BRAND.md "Forbidden patterns" for the full rule.

export { cn } from "../cn"

// ── Layout primitives (Ant-Design-shaped: Row/Col/Flex/Space) ────
export { Row, Col, Flex, Space, useRowGutter } from "../layout";
export type {
  RowProps,
  ColProps,
  FlexProps,
  SpaceProps,
  GutterValue,
  Breakpoint,
  Justify,
  Align,
  FlexGap,
  FlexJustify,
  FlexAlign,
  SpaceSize,
} from "../layout";

export { Badge } from "../data-display/Badge"
export type { BadgeProps, BadgeVariant } from "../data-display/Badge"

export { Button } from "../general/Button"
export type { ButtonProps, ButtonVariant, ButtonSize } from "../general/Button"

export { Card, CardHeader, CardTitle, CardSubtitle, CardBody, CardFooter, CardContent } from "../data-display/Card"
export type {
  CardProps,
  CardHeaderProps,
  CardBodyProps,
  CardFooterProps,
  CardSubtitleProps,
  CardPadding,
  CardTone,
  CardAccent,
  CardBand,
} from "../data-display/Card"

export { Input, Textarea } from "../data-entry/Input"
export type { InputProps, TextareaProps, InputSize, InputStatus, TextareaResize } from "../data-entry/Input"

export { InputPassword } from "../data-entry/InputPassword"
export type { InputPasswordProps } from "../data-entry/InputPassword"

export { InputSearch } from "../data-entry/InputSearch"
export type { InputSearchProps } from "../data-entry/InputSearch"

export { InputNumber } from "../data-entry/InputNumber"
export type { InputNumberProps } from "../data-entry/InputNumber"

export {
  Form,
  FormField,
  FormItem,
  useFormContext,
} from "../data-entry/Form"
export type {
  FormProps,
  FormFieldProps,
  FormFieldRenderArg,
  FormItemProps,
} from "../data-entry/Form"

export { Transfer } from "../data-entry/Transfer"
export type { TransferProps, TransferItem, TransferSize } from "../data-entry/Transfer"

export { Field, FieldLabel, FieldHelp, FieldCount, FieldRowHelp } from "../data-entry/Field"
export type {
  FieldProps,
  FieldLabelProps,
  FieldHelpProps,
  FieldHelpTone,
  FieldCountProps,
} from "../data-entry/Field"

export { LocaleTabs } from "../data-entry/LocaleTabs"
export type { LocaleTabsProps, LocaleTabItem, LocaleTabStatus } from "../data-entry/LocaleTabs"

export { Checklist } from "../data-entry/Checklist"
export type { ChecklistProps, ChecklistItem } from "../data-entry/Checklist"

export { Spinner } from "../feedback/Spinner"
export type { SpinnerProps, SpinnerSize, SpinnerTone } from "../feedback/Spinner"

export { IconButton } from "../data-display/IconButton"
export type { IconButtonProps, IconButtonVariant, IconButtonSize } from "../data-display/IconButton"

export { PageHeader } from "../data-display/PageHeader"
export type { PageHeaderProps, PageHeaderVariant } from "../data-display/PageHeader"

export { SegmentedControl, SegmentedControlButton } from "../data-display/SegmentedControl"
export type {
  SegmentedControlProps,
  SegmentedControlVariant,
  SegmentedControlSize,
  SegmentedControlItem,
  SegmentedControlButtonProps,
} from "../data-display/SegmentedControl"

export { Label } from "../data-entry/Label"

export { Tabs, TabsList, TabsTrigger, TabsContent } from "../navigation/Tabs"
export type {
  TabsProps,
  TabsVariant,
  TabsOrientation,
  TabsPlacement,
} from "../navigation/Tabs"

export { Avatar } from "../data-display/Avatar"
export type { AvatarProps, AvatarShape, AvatarSize, AvatarSizeToken } from "../data-display/Avatar"

export { Statistic } from "../data-display/Statistic"
export type { StatisticProps } from "../data-display/Statistic"

export { Empty } from "../data-display/Empty"
export type { EmptyProps } from "../data-display/Empty"

export { Tag } from "../data-display/Tag"
export type { TagProps, TagPresetColor } from "../data-display/Tag"

export { Alert } from "../feedback/Alert"
export type { AlertProps, AlertColor, AlertVariant } from "../feedback/Alert"

export { Result } from "../feedback/Result"
export type { ResultProps, ResultColor } from "../feedback/Result"

export {
  Typography,
  Title as TypographyTitle,
  Paragraph as TypographyParagraph,
  Text as TypographyText,
  Link as TypographyLink,
} from "../general/Typography"
export type {
  TypographyColor,
  TypographyTruncate,
  TypographyCommonProps,
  TitleSize,
  TitleProps,
  ParagraphProps,
  TextProps,
  LinkProps,
} from "../general/Typography"

export { Descriptions } from "../data-display/Descriptions"
export type { DescriptionsProps, DescriptionsItemProps } from "../data-display/Descriptions"

export { Separator } from "../data-display/Separator"

export {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "../data-display/Popover"

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuTrigger,
} from "../navigation/DropdownMenu"

export { Calendar } from "../data-display/Calendar"

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "../feedback/Dialog"

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
} from "../feedback/Sheet"
export type { SheetContentProps, SheetSide } from "../feedback/Sheet"

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../feedback/AlertDialog"

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectIcon,
  SelectItem,
  SelectLabel,
  SelectPortal,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "../data-entry/Select"

export { Switch } from "../data-entry/Switch"

export { Checkbox } from "../data-entry/Checkbox"

export { CheckboxGroup } from "../data-entry/CheckboxGroup"
export type { CheckboxGroupProps, CheckboxOption } from "../data-entry/CheckboxGroup"

export { Radio, RadioGroup } from "../data-entry/Radio"
export type { RadioProps, RadioGroupProps, RadioOption } from "../data-entry/Radio"

export { Slider } from "../data-entry/Slider"
export type { SliderProps } from "../data-entry/Slider"

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
} from "../data-display/Table"
export type { TableProps, TableDensity } from "../data-display/Table"

export { TimeInput } from "../data-entry/TimeInput"
export type { TimeInputProps } from "../data-entry/TimeInput"

export {
  Combobox,
  ComboboxAnchor,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "../data-entry/combobox"
export type { ComboboxContentProps } from "../data-entry/combobox"

export { Toaster, toast } from "../feedback/toaster"
export type { ToasterProps } from "../feedback/toaster"

export { Skeleton } from "../feedback/Skeleton"
export type { SkeletonProps } from "../feedback/Skeleton"

export { Watermark } from "../feedback/Watermark"
export type { WatermarkProps } from "../feedback/Watermark"

export { Popconfirm } from "../feedback/Popconfirm"
export type { PopconfirmProps } from "../feedback/Popconfirm"

export { Breadcrumb, BreadcrumbItem, BreadcrumbSep } from "../navigation/Breadcrumb"
export type { BreadcrumbProps, BreadcrumbItemProps } from "../navigation/Breadcrumb"

export { Anchor, AnchorLink } from "../navigation/Anchor"
export type {
  AnchorProps,
  AnchorLinkProps,
  AnchorItem,
  AnchorOrientation,
} from "../navigation/Anchor"

export { Menu, MenuItem, MenuGroup, MenuDivider } from "../navigation/Menu"
export type {
  MenuProps,
  MenuItemProps,
  MenuGroupProps,
  MenuOrientation,
} from "../navigation/Menu"

export { Pagination } from "../navigation/Pagination"
export type {
  PaginationProps,
  PaginationSize,
  PaginationVariant,
  PaginationJustify,
} from "../navigation/Pagination"

export { Steps, Step } from "../navigation/Steps"
export type {
  StepsProps,
  StepProps,
  StepsOrientation,
  StepColor,
} from "../navigation/Steps"

export { Progress } from "../feedback/Progress"
export type {
  ProgressProps,
  ProgressVariant,
  ProgressColor,
  ProgressSize,
} from "../feedback/Progress"

// ── Calendar / scheduling primitives ─────────────────────────────
// `MiniMonth`, `EventBlock`, `TimeGrid` family, `AvailabilityRow`, etc.
// Mirror discipline: each atom is a thin wrapper over a `.cal-*` /
// `.tg-*` class in shell.css; no service-specific defaults per
// cardinal rule #19.
export * from "../data-display/calendar/index"

// ── Date / time pickers — React Aria + @internationalized/date ──
// DateField, TimeField (segmented inputs), DatePicker, DateRangePicker
// (trigger + popover + Calendar / RangeCalendar). Mirrors the
// dxs-kintai design-system patterns A-E.
export { DateField, TimeField, DatePicker, DateRangePicker } from "../data-entry/DateTimePicker"
export type {
  DateFieldProps,
  TimeFieldProps,
  DatePickerProps,
  DateRangePickerProps,
} from "../data-entry/DateTimePicker"

// ── Combobox-flavoured Data Entry primitives ─────────────────────
// AutoComplete: filtered text input over Combobox.
// Cascader: nested column navigation (Popover + horizontal columns).
// TreeSelect: recursive tree Select (Popover + expandable nodes,
// single or multi select).
export { AutoComplete } from "../data-entry/AutoComplete"
export type { AutoCompleteProps, AutoCompleteOption } from "../data-entry/AutoComplete"

export { Cascader } from "../data-entry/Cascader"
export type { CascaderProps, CascaderOption } from "../data-entry/Cascader"

export { TreeSelect } from "../data-entry/TreeSelect"
export type { TreeSelectProps, TreeSelectOption } from "../data-entry/TreeSelect"

export { ColorPicker } from "../data-entry/ColorPicker"
export type { ColorPickerProps, ColorPickerSize } from "../data-entry/ColorPicker"

export { Rate } from "../data-entry/Rate"
export type { RateProps, RateSize } from "../data-entry/Rate"

export { Carousel, CarouselSlide } from "../data-display/Carousel"
export type { CarouselProps, CarouselSlideProps } from "../data-display/Carousel"

export { Collapse, CollapsePanel } from "../data-display/Collapse"
export type { CollapseProps, CollapsePanelProps } from "../data-display/Collapse"

export { List, ListItem } from "../data-display/List"
export type { ListProps, ListItemProps } from "../data-display/List"

export { Image } from "../data-display/Image"
export type { ImageProps } from "../data-display/Image"

export { QRCode } from "../data-display/QRCode"
export type { QRCodeProps } from "../data-display/QRCode"

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  TooltipPortal,
  SimpleTooltip,
} from "../data-display/Tooltip"
export type { TooltipContentProps, SimpleTooltipProps } from "../data-display/Tooltip"

export { Timeline, TimelineItem } from "../data-display/Timeline"
export type {
  TimelineProps,
  TimelineItemProps,
  TimelineVariant,
  TimelineColor,
} from "../data-display/Timeline"

export { Tree } from "../data-display/Tree"
export type { TreeProps, TreeNode } from "../data-display/Tree"

export { Tour } from "../data-display/Tour"
export type {
  TourProps,
  TourStep,
  TourPlacement,
  TourLabels,
} from "../data-display/Tour"
