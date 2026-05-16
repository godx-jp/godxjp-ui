// Public surface for the atomic primitive layer. Each component is a
// thin wrapper around a canonical CSS class from `@godxjp/ui/tokens` —
// the visual contract stays mastered in CSS variables + class names,
// and React adds ergonomics (props, refs, ARIA, Radix wiring).
//
// Don't add a primitive that re-encodes a token in Tailwind utilities.
// If a new atom is needed, add the CSS class to tokens.css first, then
// wrap it here. See BRAND.md "Forbidden patterns" for the full rule.

export { cn } from "./cn"

// ── Layout primitives (Ant-Design-shaped: Row/Col/Flex/Space) ────
export { Row, Col, Flex, Space, useRowGutter } from "./layout";
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
} from "./layout";

export { Badge } from "./Badge"
export type { BadgeProps, BadgeVariant } from "./Badge"

export { Button } from "./Button"
export type { ButtonProps, ButtonVariant, ButtonSize, ButtonTone } from "./Button"

export { Card, CardHeader, CardTitle, CardSubtitle, CardContent } from "./Card"
export type { CardProps, CardSize, CardVariant, CardSubtitleProps } from "./Card"

export { Input, Textarea } from "./Input"
export type { InputProps, TextareaProps, InputSize, InputStatus, TextareaResize } from "./Input"

export { InputPassword } from "./InputPassword"
export type { InputPasswordProps } from "./InputPassword"

export { InputSearch } from "./InputSearch"
export type { InputSearchProps } from "./InputSearch"

export { Field, FieldLabel, FieldHelp, FieldCount, FieldRowHelp } from "./Field"
export type {
  FieldProps,
  FieldLabelProps,
  FieldHelpProps,
  FieldHelpTone,
  FieldCountProps,
} from "./Field"

export { LocaleTabs } from "./LocaleTabs"
export type { LocaleTabsProps, LocaleTabItem, LocaleTabStatus } from "./LocaleTabs"

export { Checklist } from "./Checklist"
export type { ChecklistProps, ChecklistItem } from "./Checklist"

export { Spinner } from "./Spinner"
export type { SpinnerProps, SpinnerSize, SpinnerTone } from "./Spinner"

export { IconButton } from "./IconButton"
export type { IconButtonProps, IconButtonVariant, IconButtonSize } from "./IconButton"

export { PageHeader } from "./PageHeader"
export type { PageHeaderProps, PageHeaderVariant } from "./PageHeader"

export { SegmentedControl, SegmentedControlButton } from "./SegmentedControl"
export type {
  SegmentedControlProps,
  SegmentedControlVariant,
  SegmentedControlSize,
  SegmentedControlItem,
  SegmentedControlButtonProps,
} from "./SegmentedControl"

export { Label } from "./Label"

export { Tabs, TabsList, TabsTrigger, TabsContent } from "./Tabs"
export type { TabsProps, TabsVariant } from "./Tabs"

export { Avatar } from "./Avatar"
export type { AvatarProps, AvatarShape, AvatarSize, AvatarSizeToken } from "./Avatar"

export { Statistic } from "./Statistic"
export type { StatisticProps } from "./Statistic"

export { Empty } from "./Empty"
export type { EmptyProps } from "./Empty"

export { Tag } from "./Tag"
export type { TagProps, TagPresetColor } from "./Tag"

export { Descriptions } from "./Descriptions"
export type { DescriptionsProps, DescriptionsItemProps } from "./Descriptions"

export { Separator } from "./Separator"

export {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "./Popover"

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
} from "./DropdownMenu"

export { Calendar } from "./Calendar"

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
} from "./Dialog"

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
} from "./Sheet"
export type { SheetContentProps, SheetSide } from "./Sheet"

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
} from "./AlertDialog"

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
} from "./Select"

export { Switch } from "./Switch"

export { Checkbox } from "./Checkbox"

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
} from "./Table"
export type { TableProps, TableDensity } from "./Table"

export { TimeInput } from "./TimeInput"
export type { TimeInputProps } from "./TimeInput"

export {
  Combobox,
  ComboboxAnchor,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "./combobox"
export type { ComboboxContentProps } from "./combobox"

export { Toaster, toast } from "./toaster"
export type { ToasterProps } from "./toaster"

export { Skeleton } from "./Skeleton"
export type { SkeletonProps } from "./Skeleton"

export { Breadcrumb, BreadcrumbItem, BreadcrumbSep } from "./Breadcrumb"
export type { BreadcrumbProps, BreadcrumbItemProps } from "./Breadcrumb"

// ── Calendar / scheduling primitives ─────────────────────────────
// `MiniMonth`, `EventBlock`, `TimeGrid` family, `AvailabilityRow`, etc.
// Mirror discipline: each atom is a thin wrapper over a `.cal-*` /
// `.tg-*` class in shell.css; no service-specific defaults per
// cardinal rule #19.
export * from "./calendar/index"

// ── Date / time pickers — React Aria + @internationalized/date ──
// DateField, TimeField (segmented inputs), DatePicker, DateRangePicker
// (trigger + popover + Calendar / RangeCalendar). Mirrors the
// dxs-kintai design-system patterns A-E.
export { DateField, TimeField, DatePicker, DateRangePicker } from "./DateTimePicker"
export type {
  DateFieldProps,
  TimeFieldProps,
  DatePickerProps,
  DateRangePickerProps,
} from "./DateTimePicker"
