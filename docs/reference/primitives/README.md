---
title: "Primitives reference"
diataxis: index
library: "@godxjp/ui"
library_version: 3.0.0
last-updated: 2026-05-17
audience: [developer, agent]
lang: en
status: published
---

# Primitives reference

Each file documents one exported primitive: its props, variants,
accessibility behavior, and composition patterns. All primitives
are production-stable in v3.0.0.

Import all primitives from `@godxjp/ui` (root barrel) or
`@godxjp/ui/components/primitives`. Per cardinal rule 27 every
primitive source file lives under `src/components/<group>/<Name>.tsx`
where `<group>` is one of `general` / `layout` / `data-display` /
`data-entry` / `feedback` / `navigation`.

| Component | Import name(s) | Group | Backing |
|---|---|---|---|
| [AlertDialog](./AlertDialog.md) | `AlertDialog`, `AlertDialogTrigger`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogFooter`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogAction`, `AlertDialogCancel` | feedback | `@radix-ui/react-alert-dialog` |
| [Avatar](./Avatar.md) | `Avatar` | data-display | — |
| [Badge](./Badge.md) | `Badge` | data-display | — |
| [Breadcrumb](./Breadcrumb.md) | `Breadcrumb`, `BreadcrumbItem`, `BreadcrumbSep` | navigation | — |
| [Button](./Button.md) | `Button` | general | `@radix-ui/react-slot` (asChild) |
| [Calendar](./Calendar.md) | `Calendar` | data-display | `react-aria-components` + `@internationalized/date` |
| [Card](./Card.md) | `Card`, `CardHeader`, `CardTitle`, `CardSubtitle`, `CardContent`, `CardBody`, `CardFooter` | data-display | — |
| [Checkbox](./Checkbox.md) | `Checkbox` | data-entry | `@radix-ui/react-checkbox` |
| [Combobox](./Combobox.md) | `Combobox`, `ComboboxTrigger`, `ComboboxContent`, `ComboboxInput`, `ComboboxItem`, `ComboboxEmpty` | data-entry | `cmdk` + Popover |
| [Dialog](./Dialog.md) | `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`, `DialogClose` | feedback | `@radix-ui/react-dialog` |
| [DropdownMenu](./DropdownMenu.md) | `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuSeparator`, `DropdownMenuLabel` | navigation | `@radix-ui/react-dropdown-menu` |
| [Input / Textarea](./Input.md) | `Input`, `Textarea` | data-entry | — |
| [Label](./Label.md) | `Label` | data-entry | `@radix-ui/react-label` |
| [Popover](./Popover.md) | `Popover`, `PopoverTrigger`, `PopoverContent` | data-display | `@radix-ui/react-popover` |
| [Select](./Select.md) | `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`, `SelectLabel`, `SelectSeparator`, `SelectGroup`, `SelectValue` | data-entry | `@radix-ui/react-select` |
| [Separator](./Separator.md) | `Separator` | data-display | `@radix-ui/react-separator` |
| [Sheet](./Sheet.md) | `Sheet`, `SheetTrigger`, `SheetContent`, `SheetHeader`, `SheetFooter`, `SheetTitle`, `SheetDescription`, `SheetClose` | feedback | `@radix-ui/react-dialog` |
| [Skeleton](./Skeleton.md) | `Skeleton` | feedback | — |
| [Switch](./Switch.md) | `Switch` | data-entry | `@radix-ui/react-switch` |
| [Table](./Table.md) | `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`, `TableCaption` | data-display | — |
| [Tabs](./Tabs.md) | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` | navigation | `@radix-ui/react-tabs` |
| [TimeInput](./TimeInput.md) | `TimeInput` | data-entry | `react-aria-components` |
| [Toaster](./Toaster.md) | `Toaster`, `toast` | feedback | `sonner` |

> Reference pages for the additional 38 primitives (Alert, Anchor,
> AutoComplete, Carousel, Cascader, CheckboxGroup, Checklist, Col,
> Collapse, ColorPicker, DateTimePicker, Descriptions, Empty, Field,
> Flex, Form, Grid, IconButton, Image, InputNumber, InputPassword,
> InputSearch, List, LocaleTabs, Masonry, Menu, PageHeader,
> Pagination, Popconfirm, Progress, QRCode, Radio, Rate, Result,
> Row, SegmentedControl, Slider, Space, Spinner, Statistic, Steps,
> Tag, Textarea, Timeline, Tooltip, Tour, Transfer, Tree, TreeSelect,
> Typography, Watermark) are tracked as a follow-on backfill.
