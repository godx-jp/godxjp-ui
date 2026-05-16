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
export type { ButtonProps, ButtonVariant, ButtonSize } from "./Button"

export { Card, CardHeader, CardTitle, CardSubtitle, CardContent } from "./Card"
export type { CardProps, CardSize, CardVariant, CardSubtitleProps } from "./Card"

export { Input, Textarea } from "./Input"
export type { InputProps, TextareaProps, InputSize, InputStatus, TextareaResize } from "./Input"

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
