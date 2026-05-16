---
diataxis: index
library: "@godxjp/ui"
library_version: 3.0.0
updated: 2026-05-16
audience: [developer, agent]
---

# Primitives reference

Each file documents one exported primitive: its props, variants, accessibility
behavior, and composition patterns. All primitives are production-stable in v3.0.0.

Import all primitives from `@godxjp/ui` (barrel) or `@godxjp/ui/components/primitives`.

| Component | Import name(s) | Radix backing |
|---|---|---|
| [Badge](./Badge.md) | `Badge` | — |
| [Button](./Button.md) | `Button` | `Slot` (asChild) |
| [Card](./Card.md) | `Card`, `CardHeader`, `CardTitle`, `CardSubtitle`, `CardContent` | — |
| [Input / Textarea](./Input.md) | `Input`, `Textarea` | — |
| [Label](./Label.md) | `Label` | `@radix-ui/react-label` |
| [Tabs](./Tabs.md) | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` | `@radix-ui/react-tabs` |
| [Avatar](./Avatar.md) | `Avatar` | — |
| [Separator](./Separator.md) | `Separator` | `@radix-ui/react-separator` |
| [Popover](./Popover.md) | `Popover`, `PopoverTrigger`, `PopoverContent` | `@radix-ui/react-popover` |
| [DropdownMenu](./DropdownMenu.md) | `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuSeparator`, `DropdownMenuLabel` | `@radix-ui/react-dropdown-menu` |
| [Calendar](./Calendar.md) | `Calendar` | `react-day-picker` |
| [TimeInput](./TimeInput.md) | `TimeInput` | — |
| [Dialog](./Dialog.md) | `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`, `DialogClose` | `@radix-ui/react-dialog` |
| [Sheet](./Sheet.md) | `Sheet`, `SheetTrigger`, `SheetContent`, `SheetHeader`, `SheetFooter`, `SheetTitle`, `SheetDescription`, `SheetClose` | `@radix-ui/react-dialog` |
| [AlertDialog](./AlertDialog.md) | `AlertDialog`, `AlertDialogTrigger`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogFooter`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogAction`, `AlertDialogCancel` | `@radix-ui/react-alert-dialog` |
| [Select](./Select.md) | `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`, `SelectLabel`, `SelectSeparator`, `SelectGroup`, `SelectValue` | `@radix-ui/react-select` |
| [Switch](./Switch.md) | `Switch` | `@radix-ui/react-switch` |
| [Checkbox](./Checkbox.md) | `Checkbox` | `@radix-ui/react-checkbox` |
| [Table](./Table.md) | `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`, `TableCaption` | — |
| [Combobox](./Combobox.md) | `Combobox`, `ComboboxTrigger`, `ComboboxContent`, `ComboboxInput`, `ComboboxItem`, `ComboboxEmpty` | `cmdk` + Popover |
| [Toaster](./Toaster.md) | `Toaster`, `toast` | `sonner` |
| [Skeleton](./Skeleton.md) | `Skeleton` | — |
| [Breadcrumb](./Breadcrumb.md) | `Breadcrumb`, `BreadcrumbItem`, `BreadcrumbSep` | — |
