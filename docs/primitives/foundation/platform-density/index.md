---
title: Platform Density
lang: vi
---

PlatformDensity — primitive UI từ @godxjp/ui.

## Khi nào dùng

- Xem demo live bên dưới để biết variants và states hỗ trợ.

## Import

```tsx
import {
  Alert,
  AlertContent,
  AlertDescription,
  AlertTitle,
  Badge,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardStat,
  CardTitle,
  DataTable,
  EmptyState,
  StatusBadge,
  type ColumnDef,
  Input,
  SearchInput,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
  Inline,
  PageContainer,
  ResponsiveGrid,
  SplitPane,
  Stack,
  FilterBar,
  FilterGroup,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@godxjp/ui/navigation";
```

## Components

### Alert

Alert — phần con của compound primitive.

**Use case:** Import cùng package với component cha; compose theo thứ tự trong demo.

#### Props hiển thị & cấu hình

| Prop       | Kiểu                                           | Mặc định | Mô tả                                         | Use case                                                                 |
| ---------- | ---------------------------------------------- | -------- | --------------------------------------------- | ------------------------------------------------------------------------ |
| `variant`  | `default`, `destructive`, `warning`, `success` | —        | Biến thể giao diện semantic.                  | Button/Badge/Alert — chọn tone phù hợp ngữ cảnh (primary, destructive…). |
| `icon`     | `IconProp`, `false`                            | —        | Icon Lucide hoặc `false` để ẩn icon mặc định. | EmptyState, Alert — tăng nhận diện trạng thái.                           |
| `children` | `ReactNode`                                    | —        | Nội dung con render bên trong component.      | Text, icon, hoặc component con — ví dụ label Badge, body Alert.          |

#### Props hành động (events & callbacks)

| Prop        | Kiểu                          | Mặc định | Mô tả                             | Use case                              |
| ----------- | ----------------------------- | -------- | --------------------------------- | ------------------------------------- |
| `onDismiss` | `() => void`, `Promise<void>` | —        | Xử lý khi user đóng alert/banner. | Alert có nút X — lưu dismissed state. |

#### Thuộc tính DOM & accessibility

| Prop        | Kiểu     | Mặc định | Mô tả                        | Use case                                            |
| ----------- | -------- | -------- | ---------------------------- | --------------------------------------------------- |
| `className` | `string` | —        | CSS class bổ sung trên root. | Fine-tune layout; tránh override token trừ khi cần. |

### AlertContent

Wrapper nội dung alert.

**Use case:** Bọc Description + Actions.

#### Props hiển thị & cấu hình

| Prop       | Kiểu        | Mặc định | Mô tả                                    | Use case                                                        |
| ---------- | ----------- | -------- | ---------------------------------------- | --------------------------------------------------------------- |
| `children` | `ReactNode` | —        | Nội dung con render bên trong component. | Text, icon, hoặc component con — ví dụ label Badge, body Alert. |

#### Props hành động (events & callbacks)

Không có props trong nhóm này.

#### Thuộc tính DOM & accessibility

| Prop        | Kiểu     | Mặc định | Mô tả                        | Use case                                            |
| ----------- | -------- | -------- | ---------------------------- | --------------------------------------------------- |
| `className` | `string` | —        | CSS class bổ sung trên root. | Fine-tune layout; tránh override token trừ khi cần. |

### AlertDescription

Body text alert.

**Use case:** Chi tiết lỗi, hướng dẫn khắc phục.

#### Props hiển thị & cấu hình

| Prop       | Kiểu        | Mặc định | Mô tả                                    | Use case                                                        |
| ---------- | ----------- | -------- | ---------------------------------------- | --------------------------------------------------------------- |
| `children` | `ReactNode` | —        | Nội dung con render bên trong component. | Text, icon, hoặc component con — ví dụ label Badge, body Alert. |

#### Props hành động (events & callbacks)

Không có props trong nhóm này.

#### Thuộc tính DOM & accessibility

| Prop        | Kiểu     | Mặc định | Mô tả                        | Use case                                            |
| ----------- | -------- | -------- | ---------------------------- | --------------------------------------------------- |
| `className` | `string` | —        | CSS class bổ sung trên root. | Fine-tune layout; tránh override token trừ khi cần. |

### AlertTitle

Tiêu đề alert.

**Use case:** Dòng đậm đầu banner — tóm tắt lỗi/thông báo.

#### Props hiển thị & cấu hình

| Prop       | Kiểu        | Mặc định | Mô tả                                    | Use case                                                        |
| ---------- | ----------- | -------- | ---------------------------------------- | --------------------------------------------------------------- |
| `children` | `ReactNode` | —        | Nội dung con render bên trong component. | Text, icon, hoặc component con — ví dụ label Badge, body Alert. |

#### Props hành động (events & callbacks)

Không có props trong nhóm này.

#### Thuộc tính DOM & accessibility

| Prop        | Kiểu     | Mặc định | Mô tả                        | Use case                                            |
| ----------- | -------- | -------- | ---------------------------- | --------------------------------------------------- |
| `className` | `string` | —        | CSS class bổ sung trên root. | Fine-tune layout; tránh override token trừ khi cần. |

### Badge

Badge — phần con của compound primitive.

**Use case:** Import cùng package với component cha; compose theo thứ tự trong demo.

#### Props hiển thị & cấu hình

| Prop       | Kiểu        | Mặc định | Mô tả                                    | Use case                                                        |
| ---------- | ----------- | -------- | ---------------------------------------- | --------------------------------------------------------------- |
| `children` | `ReactNode` | —        | Nội dung con render bên trong component. | Text, icon, hoặc component con — ví dụ label Badge, body Alert. |

#### Props hành động (events & callbacks)

| Prop        | Kiểu                         | Mặc định | Mô tả                 | Use case                                |
| ----------- | ---------------------------- | -------- | --------------------- | --------------------------------------- |
| `onClick`   | `(e: MouseEvent) => void`    | —        | Xử lý khi user click. | Button submit; row click; dismiss icon. |
| `onKeyDown` | `(e: KeyboardEvent) => void` | —        | Phím bấm.             | Enter submit; Escape đóng dialog.       |

#### Thuộc tính DOM & accessibility

| Prop         | Kiểu     | Mặc định | Mô tả                          | Use case                                            |
| ------------ | -------- | -------- | ------------------------------ | --------------------------------------------------- |
| `className`  | `string` | —        | CSS class bổ sung trên root.   | Fine-tune layout; tránh override token trừ khi cần. |
| `id`         | `string` | —        | DOM id — liên kết label/input. | FormField `htmlFor` + Input `id`.                   |
| `role`       | `string` | —        | ARIA role.                     | Accessibility khi semantic HTML không đủ.           |
| `tabIndex`   | `number` | —        | Thứ tự focus keyboard.         | Custom interactive div.                             |
| `aria-label` | `string` | —        | Nhãn cho screen reader.        | Icon-only button không có text visible.             |

### Card

Card — phần con của compound primitive.

**Use case:** Import cùng package với component cha; compose theo thứ tự trong demo.

#### Props hiển thị & cấu hình

| Prop       | Kiểu                 | Mặc định  | Mô tả                                    | Use case                                                                 |
| ---------- | -------------------- | --------- | ---------------------------------------- | ------------------------------------------------------------------------ |
| `children` | `ReactNode`          | —         | Nội dung con render bên trong component. | Text, icon, hoặc component con — ví dụ label Badge, body Alert.          |
| `size`     | `default`, `compact` | `default` | Kích thước preset.                       | Button sm trong table; Card compact cho KPI row.                         |
| `accent`   | `CardAccent`         | —         | Prop `accent`.                           | Tham chiếu type trong source `src/props/` hoặc component.                |
| `variant`  | `CardVariant`        | —         | Biến thể giao diện semantic.             | Button/Badge/Alert — chọn tone phù hợp ngữ cảnh (primary, destructive…). |
| `density`  | `CardDensity`        | —         | Mật độ spacing (page hoặc table).        | PageContainer compact trên mobile; DataTable row height.                 |

#### Props hành động (events & callbacks)

| Prop        | Kiểu                         | Mặc định | Mô tả                 | Use case                                |
| ----------- | ---------------------------- | -------- | --------------------- | --------------------------------------- |
| `onClick`   | `(e: MouseEvent) => void`    | —        | Xử lý khi user click. | Button submit; row click; dismiss icon. |
| `onKeyDown` | `(e: KeyboardEvent) => void` | —        | Phím bấm.             | Enter submit; Escape đóng dialog.       |

#### Thuộc tính DOM & accessibility

| Prop         | Kiểu     | Mặc định | Mô tả                          | Use case                                            |
| ------------ | -------- | -------- | ------------------------------ | --------------------------------------------------- |
| `className`  | `string` | —        | CSS class bổ sung trên root.   | Fine-tune layout; tránh override token trừ khi cần. |
| `id`         | `string` | —        | DOM id — liên kết label/input. | FormField `htmlFor` + Input `id`.                   |
| `role`       | `string` | —        | ARIA role.                     | Accessibility khi semantic HTML không đủ.           |
| `tabIndex`   | `number` | —        | Thứ tự focus keyboard.         | Custom interactive div.                             |
| `aria-label` | `string` | —        | Nhãn cho screen reader.        | Icon-only button không có text visible.             |

### CardAction

Slot action góc header (menu, nút).

**Use case:** Pair với `CardHeader className="flex flex-row items-start justify-between"`.

#### Props hiển thị & cấu hình

| Prop       | Kiểu        | Mặc định | Mô tả                                    | Use case                                                        |
| ---------- | ----------- | -------- | ---------------------------------------- | --------------------------------------------------------------- |
| `children` | `ReactNode` | —        | Nội dung con render bên trong component. | Text, icon, hoặc component con — ví dụ label Badge, body Alert. |

#### Props hành động (events & callbacks)

| Prop        | Kiểu                         | Mặc định | Mô tả                 | Use case                                |
| ----------- | ---------------------------- | -------- | --------------------- | --------------------------------------- |
| `onClick`   | `(e: MouseEvent) => void`    | —        | Xử lý khi user click. | Button submit; row click; dismiss icon. |
| `onKeyDown` | `(e: KeyboardEvent) => void` | —        | Phím bấm.             | Enter submit; Escape đóng dialog.       |

#### Thuộc tính DOM & accessibility

| Prop         | Kiểu     | Mặc định | Mô tả                          | Use case                                            |
| ------------ | -------- | -------- | ------------------------------ | --------------------------------------------------- |
| `className`  | `string` | —        | CSS class bổ sung trên root.   | Fine-tune layout; tránh override token trừ khi cần. |
| `id`         | `string` | —        | DOM id — liên kết label/input. | FormField `htmlFor` + Input `id`.                   |
| `role`       | `string` | —        | ARIA role.                     | Accessibility khi semantic HTML không đủ.           |
| `tabIndex`   | `number` | —        | Thứ tự focus keyboard.         | Custom interactive div.                             |
| `aria-label` | `string` | —        | Nhãn cho screen reader.        | Icon-only button không có text visible.             |

### CardContent

Body chính của card.

**Use case:** `flush`: table full-bleed; `solo`: không header phía trên; `tight`: sát header/tabs.

#### Props hiển thị & cấu hình

| Prop       | Kiểu        | Mặc định | Mô tả                                           | Use case                                                        |
| ---------- | ----------- | -------- | ----------------------------------------------- | --------------------------------------------------------------- |
| `children` | `ReactNode` | —        | Nội dung con render bên trong component.        | Text, icon, hoặc component con — ví dụ label Badge, body Alert. |
| `flush`    | `boolean`   | —        | Full-bleed — bỏ padding ngang.                  | CardContent: table; CardFooter: action bar sát mép.             |
| `tight`    | `boolean`   | —        | Không gap sau header.                           | CardContent sát tabs/toolbar.                                   |
| `solo`     | `boolean`   | —        | Không có header phía trên — padding top đầy đủ. | CardStat, KPI tile chỉ có body.                                 |

#### Props hành động (events & callbacks)

| Prop        | Kiểu                         | Mặc định | Mô tả                 | Use case                                |
| ----------- | ---------------------------- | -------- | --------------------- | --------------------------------------- |
| `onClick`   | `(e: MouseEvent) => void`    | —        | Xử lý khi user click. | Button submit; row click; dismiss icon. |
| `onKeyDown` | `(e: KeyboardEvent) => void` | —        | Phím bấm.             | Enter submit; Escape đóng dialog.       |

#### Thuộc tính DOM & accessibility

| Prop         | Kiểu     | Mặc định | Mô tả                          | Use case                                            |
| ------------ | -------- | -------- | ------------------------------ | --------------------------------------------------- |
| `className`  | `string` | —        | CSS class bổ sung trên root.   | Fine-tune layout; tránh override token trừ khi cần. |
| `id`         | `string` | —        | DOM id — liên kết label/input. | FormField `htmlFor` + Input `id`.                   |
| `role`       | `string` | —        | ARIA role.                     | Accessibility khi semantic HTML không đủ.           |
| `tabIndex`   | `number` | —        | Thứ tự focus keyboard.         | Custom interactive div.                             |
| `aria-label` | `string` | —        | Nhãn cho screen reader.        | Icon-only button không có text visible.             |

### CardDescription

Dòng mô tả phụ trong header.

**Use case:** CardStat: render `label` KPI; card thường: subtitle ngắn.

#### Props hiển thị & cấu hình

| Prop       | Kiểu        | Mặc định | Mô tả                                    | Use case                                                        |
| ---------- | ----------- | -------- | ---------------------------------------- | --------------------------------------------------------------- |
| `children` | `ReactNode` | —        | Nội dung con render bên trong component. | Text, icon, hoặc component con — ví dụ label Badge, body Alert. |

#### Props hành động (events & callbacks)

| Prop        | Kiểu                         | Mặc định | Mô tả                 | Use case                                |
| ----------- | ---------------------------- | -------- | --------------------- | --------------------------------------- |
| `onClick`   | `(e: MouseEvent) => void`    | —        | Xử lý khi user click. | Button submit; row click; dismiss icon. |
| `onKeyDown` | `(e: KeyboardEvent) => void` | —        | Phím bấm.             | Enter submit; Escape đóng dialog.       |

#### Thuộc tính DOM & accessibility

| Prop         | Kiểu     | Mặc định | Mô tả                          | Use case                                            |
| ------------ | -------- | -------- | ------------------------------ | --------------------------------------------------- |
| `className`  | `string` | —        | CSS class bổ sung trên root.   | Fine-tune layout; tránh override token trừ khi cần. |
| `id`         | `string` | —        | DOM id — liên kết label/input. | FormField `htmlFor` + Input `id`.                   |
| `role`       | `string` | —        | ARIA role.                     | Accessibility khi semantic HTML không đủ.           |
| `tabIndex`   | `number` | —        | Thứ tự focus keyboard.         | Custom interactive div.                             |
| `aria-label` | `string` | —        | Nhãn cho screen reader.        | Icon-only button không có text visible.             |

### CardFooter

Footer card — actions hoặc summary.

**Use case:** `separated`: border-top + band actions; `flush`: full-bleed action bar.

#### Props hiển thị & cấu hình

| Prop        | Kiểu        | Mặc định | Mô tả                                    | Use case                                                        |
| ----------- | ----------- | -------- | ---------------------------------------- | --------------------------------------------------------------- |
| `children`  | `ReactNode` | —        | Nội dung con render bên trong component. | Text, icon, hoặc component con — ví dụ label Badge, body Alert. |
| `separated` | `boolean`   | —        | Viền tách section (thường border-top).   | CardFooter action band Save/Cancel.                             |
| `flush`     | `boolean`   | —        | Full-bleed — bỏ padding ngang.           | CardContent: table; CardFooter: action bar sát mép.             |

#### Props hành động (events & callbacks)

| Prop        | Kiểu                         | Mặc định | Mô tả                 | Use case                                |
| ----------- | ---------------------------- | -------- | --------------------- | --------------------------------------- |
| `onClick`   | `(e: MouseEvent) => void`    | —        | Xử lý khi user click. | Button submit; row click; dismiss icon. |
| `onKeyDown` | `(e: KeyboardEvent) => void` | —        | Phím bấm.             | Enter submit; Escape đóng dialog.       |

#### Thuộc tính DOM & accessibility

| Prop         | Kiểu     | Mặc định | Mô tả                          | Use case                                            |
| ------------ | -------- | -------- | ------------------------------ | --------------------------------------------------- |
| `className`  | `string` | —        | CSS class bổ sung trên root.   | Fine-tune layout; tránh override token trừ khi cần. |
| `id`         | `string` | —        | DOM id — liên kết label/input. | FormField `htmlFor` + Input `id`.                   |
| `role`       | `string` | —        | ARIA role.                     | Accessibility khi semantic HTML không đủ.           |
| `tabIndex`   | `number` | —        | Thứ tự focus keyboard.         | Custom interactive div.                             |
| `aria-label` | `string` | —        | Nhãn cho screen reader.        | Icon-only button không có text visible.             |

### CardHeader

Vùng header card — title, description, actions.

**Use case:** `banded={true}`: nền muted + border-bottom như section band.

#### Props hiển thị & cấu hình

| Prop       | Kiểu        | Mặc định | Mô tả                                    | Use case                                                        |
| ---------- | ----------- | -------- | ---------------------------------------- | --------------------------------------------------------------- |
| `children` | `ReactNode` | —        | Nội dung con render bên trong component. | Text, icon, hoặc component con — ví dụ label Badge, body Alert. |
| `banded`   | `boolean`   | —        | Header/footer có nền muted + viền band.  | CardHeader/CardFooter — tách section rõ ràng.                   |

#### Props hành động (events & callbacks)

| Prop        | Kiểu                         | Mặc định | Mô tả                 | Use case                                |
| ----------- | ---------------------------- | -------- | --------------------- | --------------------------------------- |
| `onClick`   | `(e: MouseEvent) => void`    | —        | Xử lý khi user click. | Button submit; row click; dismiss icon. |
| `onKeyDown` | `(e: KeyboardEvent) => void` | —        | Phím bấm.             | Enter submit; Escape đóng dialog.       |

#### Thuộc tính DOM & accessibility

| Prop         | Kiểu     | Mặc định | Mô tả                          | Use case                                            |
| ------------ | -------- | -------- | ------------------------------ | --------------------------------------------------- |
| `className`  | `string` | —        | CSS class bổ sung trên root.   | Fine-tune layout; tránh override token trừ khi cần. |
| `id`         | `string` | —        | DOM id — liên kết label/input. | FormField `htmlFor` + Input `id`.                   |
| `role`       | `string` | —        | ARIA role.                     | Accessibility khi semantic HTML không đủ.           |
| `tabIndex`   | `number` | —        | Thứ tự focus keyboard.         | Custom interactive div.                             |
| `aria-label` | `string` | —        | Nhãn cho screen reader.        | Icon-only button không có text visible.             |

### CardStat

Semantic 3px left-edge accent stripe. _/ type CardAccent = "primary" | "success" | "warning" | "info" | "attention" | "destructive"; /\*\* Surface fill — plain card, muted band, borderless outline, or emphasized featured ring. _/ type CardVariant = "default" | "muted" | "outline" | "featured"; /** Padding density — base 16px · tight 12px · cozy 20px. \*/ type CardDensity = "tight" | "cozy"; const cardVariants = cva("group/card border", { variants: { size: { default: "", compact: "", }, }, defaultVariants: { size: "default" }, }); export type CardProps = React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants> & { size?: CardSize; accent?: CardAccent; variant?: CardVariant; density?: CardDensity; }; export const Card = React.forwardRef<HTMLDivElement, CardProps>( ({ className, size = "default", accent, variant, density, ...props }, ref) => ( <div ref={ref} className={cn(cardVariants({ size }), className)} data-slot="card" data-size={size === "compact" ? "compact" : undefined} data-accent={accent} data-variant={variant && variant !== "default" ? variant : undefined} data-density={density} {...props} /> ), ); Card.displayName = "Card"; /** Full-bleed cover media — first child; header below uses section top (φ⁰), not shell. _/ export type CardCoverProps = React.HTMLAttributes<HTMLDivElement>; export const CardCover = React.forwardRef<HTMLDivElement, CardCoverProps>(({ className, ...props }, ref) => ( <div ref={ref} data-slot="card-cover" className={cn("ui-card-cover", className)} {...props} /> )); CardCover.displayName = "CardCover"; export type CardHeaderProps = React.HTMLAttributes<HTMLDivElement> & { /\*\* Muted background + border-bottom — section band (mirror footer `separated`). _/ banded?: boolean; }; export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>( ({ className, banded, ...props }, ref) => ( <div ref={ref} data-slot="card-header" data-banded={banded ? "" : undefined} className={cn(banded && "ui-card-header--banded", className)} {...props} /> ), ); CardHeader.displayName = "CardHeader"; export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>( ({ className, children, ...props }, ref) => ( <h3 ref={ref} data-slot="card-title" className={className} {...props}> {children} </h3> ), ); CardTitle.displayName = "CardTitle"; export const CardDescription = React.forwardRef< HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement> >(({ className, ...props }, ref) => ( <p ref={ref} data-slot="card-description" className={className} {...props} /> )); CardDescription.displayName = "CardDescription"; export type CardContentProps = React.HTMLAttributes<HTMLDivElement> & { /** Edge-to-edge body (tables, tabs list). Horizontal padding removed. \*/ flush?: boolean; /** No gap after header — pair with tabs / flush toolbar. _/ tight?: boolean; /\*\* No header above — top padding matches card shell. _/ solo?: boolean; }; export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>( ({ className, flush, tight, solo, ...props }, ref) => ( <div ref={ref} data-slot="card-content" data-flush={flush ? "" : undefined} data-tight={tight ? "" : undefined} data-solo={solo ? "" : undefined} className={className} {...props} /> ), ); CardContent.displayName = "CardContent"; export type CardFooterProps = React.HTMLAttributes<HTMLDivElement> & { /** Top border + symmetric action band — form Save/Cancel, table summary. \*/ separated?: boolean; /** Full-bleed footer (Ant Design `actions` bar). _/ flush?: boolean; }; export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>( ({ className, separated, flush, ...props }, ref) => ( <div ref={ref} data-slot="card-footer" data-separated={separated ? "" : undefined} data-flush={flush ? "" : undefined} className={className} {...props} /> ), ); CardFooter.displayName = "CardFooter"; export type CardStatProps = React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants> & { label: React.ReactNode; value: React.ReactNode; hint?: React.ReactNode; /\*\* Optional compact trend text beside the value. Avoid badge-like deltas. _/ delta?: React.ReactNode; /** KPI layout: stacked = design default, inline = label left / value right. \*/ layout?: "stacked" | "inline"; /** Align the metric group. \*/ align?: "start" | "end"; }; /\*\* KPI / stat tile — token-driven layout aligned to Agent Portal KPI cards.

**Use case:** Dùng cùng component cha — xem demo và cấu trúc JSX bên dưới.

#### Props hiển thị & cấu hình

| Prop     | Kiểu                 | Mặc định     | Mô tả                                                                    | Use case                                               |
| -------- | -------------------- | ------------ | ------------------------------------------------------------------------ | ------------------------------------------------------ |
| `label`  | `ReactNode`          | **bắt buộc** | Nhãn mô tả — thường là dòng phụ, font nhỏ.                               | CardStat: tên chỉ số KPI; FormField: tên field.        |
| `value`  | `ReactNode`          | **bắt buộc** | Giá trị hiển thị chính.                                                  | CardStat: số KPI; Select controlled: option đang chọn. |
| `hint`   | `ReactNode`          | —            | Gợi ý phụ dưới giá trị chính.                                            | CardStat: so sánh kỳ trước, đơn vị, context thêm.      |
| `delta`  | `ReactNode`          | —            | Thay đổi tương đối (±%) hiển thị cạnh value.                             | KPI tăng/giảm — ví dụ `+12%` màu success.              |
| `layout` | `stacked`, `inline`  | —            | KPI layout: stacked = design default, inline = label left / value right. | Xem demo và source component để biết ngữ cảnh cụ thể.  |
| `align`  | `start`, `end`       | —            | Align the metric group.                                                  | Xem demo và source component để biết ngữ cảnh cụ thể.  |
| `size`   | `default`, `compact` | `default`    | Kích thước preset.                                                       | Button sm trong table; Card compact cho KPI row.       |

#### Props hành động (events & callbacks)

| Prop        | Kiểu                         | Mặc định | Mô tả                 | Use case                                |
| ----------- | ---------------------------- | -------- | --------------------- | --------------------------------------- |
| `onClick`   | `(e: MouseEvent) => void`    | —        | Xử lý khi user click. | Button submit; row click; dismiss icon. |
| `onKeyDown` | `(e: KeyboardEvent) => void` | —        | Phím bấm.             | Enter submit; Escape đóng dialog.       |

#### Thuộc tính DOM & accessibility

| Prop         | Kiểu     | Mặc định | Mô tả                          | Use case                                            |
| ------------ | -------- | -------- | ------------------------------ | --------------------------------------------------- |
| `className`  | `string` | —        | CSS class bổ sung trên root.   | Fine-tune layout; tránh override token trừ khi cần. |
| `id`         | `string` | —        | DOM id — liên kết label/input. | FormField `htmlFor` + Input `id`.                   |
| `role`       | `string` | —        | ARIA role.                     | Accessibility khi semantic HTML không đủ.           |
| `tabIndex`   | `number` | —        | Thứ tự focus keyboard.         | Custom interactive div.                             |
| `aria-label` | `string` | —        | Nhãn cho screen reader.        | Icon-only button không có text visible.             |

### CardTitle

Heading `<h3>` trong card.

**Use case:** Tiêu đề card; CardStat dùng cho số KPI (`text-2xl`).

#### Props hiển thị & cấu hình

| Prop       | Kiểu        | Mặc định | Mô tả                                    | Use case                                                        |
| ---------- | ----------- | -------- | ---------------------------------------- | --------------------------------------------------------------- |
| `children` | `ReactNode` | —        | Nội dung con render bên trong component. | Text, icon, hoặc component con — ví dụ label Badge, body Alert. |

#### Props hành động (events & callbacks)

| Prop        | Kiểu                         | Mặc định | Mô tả                 | Use case                                |
| ----------- | ---------------------------- | -------- | --------------------- | --------------------------------------- |
| `onClick`   | `(e: MouseEvent) => void`    | —        | Xử lý khi user click. | Button submit; row click; dismiss icon. |
| `onKeyDown` | `(e: KeyboardEvent) => void` | —        | Phím bấm.             | Enter submit; Escape đóng dialog.       |

#### Thuộc tính DOM & accessibility

| Prop         | Kiểu     | Mặc định | Mô tả                          | Use case                                            |
| ------------ | -------- | -------- | ------------------------------ | --------------------------------------------------- |
| `className`  | `string` | —        | CSS class bổ sung trên root.   | Fine-tune layout; tránh override token trừ khi cần. |
| `id`         | `string` | —        | DOM id — liên kết label/input. | FormField `htmlFor` + Input `id`.                   |
| `role`       | `string` | —        | ARIA role.                     | Accessibility khi semantic HTML không đủ.           |
| `tabIndex`   | `number` | —        | Thứ tự focus keyboard.         | Custom interactive div.                             |
| `aria-label` | `string` | —        | Nhãn cho screen reader.        | Icon-only button không có text visible.             |

### DataTable

DataTable — phần con của compound primitive.

**Use case:** Import cùng package với component cha; compose theo thứ tự trong demo.

#### Props hiển thị & cấu hình

Không có props trong nhóm này.

#### Props hành động (events & callbacks)

Không có props trong nhóm này.

### EmptyState

EmptyState — phần con của compound primitive.

**Use case:** Import cùng package với component cha; compose theo thứ tự trong demo.

#### Props hiển thị & cấu hình

| Prop          | Kiểu                                          | Mặc định     | Mô tả                                         | Use case                                                  |
| ------------- | --------------------------------------------- | ------------ | --------------------------------------------- | --------------------------------------------------------- |
| `icon`        | `React.ComponentType<{ className?: string }>` | —            | Icon Lucide hoặc `false` để ẩn icon mặc định. | EmptyState, Alert — tăng nhận diện trạng thái.            |
| `title`       | `ReactNode`                                   | **bắt buộc** | Tiêu đề chính.                                | Dialog/PageHeader/EmptyState — dòng heading nổi bật nhất. |
| `description` | `ReactNode`                                   | —            | Nội dung mô tả chi tiết.                      | Dialog/EmptyState/Alert — body text giải thích.           |
| `action`      | `ReactNode`                                   | —            | Slot CTA (thường là Button).                  | EmptyState: nút tạo mới / thử lại.                        |

#### Props hành động (events & callbacks)

Không có props trong nhóm này.

#### Thuộc tính DOM & accessibility

| Prop        | Kiểu     | Mặc định | Mô tả                        | Use case                                            |
| ----------- | -------- | -------- | ---------------------------- | --------------------------------------------------- |
| `className` | `string` | —        | CSS class bổ sung trên root. | Fine-tune layout; tránh override token trừ khi cần. |

### StatusBadge

StatusBadge — phần con của compound primitive.

**Use case:** Import cùng package với component cha; compose theo thứ tự trong demo.

#### Props hiển thị & cấu hình

Không có props trong nhóm này.

#### Props hành động (events & callbacks)

Không có props trong nhóm này.

### Input

Input — phần con của compound primitive.

**Use case:** Import cùng package với component cha; compose theo thứ tự trong demo.

#### Props hiển thị & cấu hình

| Prop           | Kiểu      | Mặc định | Mô tả                                        | Use case                                         |
| -------------- | --------- | -------- | -------------------------------------------- | ------------------------------------------------ |
| `value`        | `string`  | —        | Giá trị controlled.                          | Form sync — bắt buộc kèm `onChange`.             |
| `defaultValue` | `string`  | —        | Giá trị khởi tạo (uncontrolled).             | Input/RadioGroup khi không cần controlled state. |
| `placeholder`  | `string`  | —        | Placeholder khi chưa có giá trị.             | Input/Select: gợi ý format hoặc hành động.       |
| `name`         | `string`  | —        | Tên field form (`name` HTML / RHF register). | Input trong form controlled.                     |
| `disabled`     | `boolean` | —        | Vô hiệu hóa tương tác.                       | Chưa đủ điều kiện submit; đang pending API.      |

#### Props hành động (events & callbacks)

| Prop        | Kiểu                         | Mặc định | Mô tả                                | Use case                                   |
| ----------- | ---------------------------- | -------- | ------------------------------------ | ------------------------------------------ |
| `onChange`  | `(e: ChangeEvent) => void`   | —        | Xử lý khi giá trị input thay đổi.    | Controlled Input/Select — sync state form. |
| `onFocus`   | `(e: FocusEvent) => void`    | —        | Input/button nhận focus.             | Validate on blur; analytics.               |
| `onBlur`    | `(e: FocusEvent) => void`    | —        | Rời focus — thường trigger validate. | RHF `mode: onBlur`.                        |
| `onKeyDown` | `(e: KeyboardEvent) => void` | —        | Phím bấm.                            | Enter submit; Escape đóng dialog.          |

#### Thuộc tính DOM & accessibility

| Prop        | Kiểu      | Mặc định | Mô tả                        | Use case                                            |
| ----------- | --------- | -------- | ---------------------------- | --------------------------------------------------- |
| `readOnly`  | `boolean` | —        | Chỉ đọc, vẫn submit được.    | Hiển thị mã đơn đã tạo — khác disabled.             |
| `className` | `string`  | —        | CSS class bổ sung trên root. | Fine-tune layout; tránh override token trừ khi cần. |

### SearchInput

SearchInput — phần con của compound primitive.

**Use case:** Import cùng package với component cha; compose theo thứ tự trong demo.

#### Props hiển thị & cấu hình

Không có props trong nhóm này.

#### Props hành động (events & callbacks)

Không có props trong nhóm này.

### Select

Select — phần con của compound primitive.

**Use case:** Import cùng package với component cha; compose theo thứ tự trong demo.

#### Props hiển thị & cấu hình

Không có props trong nhóm này.

#### Props hành động (events & callbacks)

Không có props trong nhóm này.

### SelectContent

Panel options.

**Use case:** Portal — z-index cao.

#### Props hiển thị & cấu hình

Không có props trong nhóm này.

#### Props hành động (events & callbacks)

Không có props trong nhóm này.

### SelectGroup

Nhóm options trong Select.

**Use case:** Label nhóm — optional separator.

#### Props hiển thị & cấu hình

Không có props trong nhóm này.

#### Props hành động (events & callbacks)

Không có props trong nhóm này.

### SelectItem

SelectItem — phần con của compound primitive.

**Use case:** Import cùng package với component cha; compose theo thứ tự trong demo.

#### Props hiển thị & cấu hình

Không có props trong nhóm này.

#### Props hành động (events & callbacks)

Không có props trong nhóm này.

### SelectTrigger

Nút mở dropdown select.

**Use case:** Hiển thị giá trị đang chọn.

#### Props hiển thị & cấu hình

Không có props trong nhóm này.

#### Props hành động (events & callbacks)

Không có props trong nhóm này.

### SelectValue

Hiển thị label đã chọn.

**Use case:** Placeholder khi chưa chọn.

#### Props hiển thị & cấu hình

Không có props trong nhóm này.

#### Props hành động (events & callbacks)

Không có props trong nhóm này.

### Button

Button — phần con của compound primitive.

**Use case:** Import cùng package với component cha; compose theo thứ tự trong demo.

#### Props hiển thị & cấu hình

| Prop       | Kiểu                                                                 | Mặc định | Mô tả                                                    | Use case                                                                 |
| ---------- | -------------------------------------------------------------------- | -------- | -------------------------------------------------------- | ------------------------------------------------------------------------ |
| `variant`  | `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`    | —        | Biến thể giao diện semantic.                             | Button/Badge/Alert — chọn tone phù hợp ngữ cảnh (primary, destructive…). |
| `size`     | `default`, `xs`, `sm`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg` | —        | Kích thước preset.                                       | Button sm trong table; Card compact cho KPI row.                         |
| `asChild`  | `boolean`                                                            | —        | Radix polymorphism — merge props vào child thay wrapper. | Button asChild + Link router — giữ semantics `<a>`.                      |
| `disabled` | `boolean`                                                            | —        | Vô hiệu hóa tương tác.                                   | Chưa đủ điều kiện submit; đang pending API.                              |

#### Props hành động (events & callbacks)

| Prop      | Kiểu                                         | Mặc định | Mô tả                 | Use case                                |
| --------- | -------------------------------------------- | -------- | --------------------- | --------------------------------------- |
| `onClick` | `React.MouseEventHandler<HTMLButtonElement>` | —        | Xử lý khi user click. | Button submit; row click; dismiss icon. |

### Inline

Inline — phần con của compound primitive.

**Use case:** Import cùng package với component cha; compose theo thứ tự trong demo.

#### Props hiển thị & cấu hình

| Prop  | Kiểu                   | Mặc định | Mô tả                                   | Use case                                   |
| ----- | ---------------------- | -------- | --------------------------------------- | ------------------------------------------ |
| `gap` | `xs`, `sm`, `md`, `lg` | —        | Khoảng cách giữa items (token spacing). | Stack vertical gap; Inline horizontal gap. |

#### Props hành động (events & callbacks)

Không có props trong nhóm này.

### PageContainer

PageContainer — phần con của compound primitive.

**Use case:** Import cùng package với component cha; compose theo thứ tự trong demo.

#### Props hiển thị & cấu hình

| Prop           | Kiểu                                  | Mặc định     | Mô tả                                                      | Use case                                                                 |
| -------------- | ------------------------------------- | ------------ | ---------------------------------------------------------- | ------------------------------------------------------------------------ |
| `title`        | `ReactNode`                           | **bắt buộc** | Tiêu đề chính.                                             | Dialog/PageHeader/EmptyState — dòng heading nổi bật nhất.                |
| `subtitle`     | `ReactNode`                           | —            | Dòng phụ dưới title trang.                                 | PageContainer: mô tả ngắn trang list/detail.                             |
| `extra`        | `ReactNode`                           | —            | Khu vực action góc phải header trang (Ant Design `extra`). | PageContainer: nút Create, Export cạnh title.                            |
| `footer`       | `ReactNode`                           | —            | Thanh action dưới cùng trang hoặc card.                    | PageContainer: Save/Cancel; Dialog: nút xác nhận.                        |
| `breadcrumb`   | `BreadcrumbItemProp[]`                | —            | Đường dẫn breadcrumb.                                      | PageContainer/AppShell: vị trí hiện tại trong IA.                        |
| `density`      | `compact`, `default`, `comfortable`   | —            | Mật độ spacing (page hoặc table).                          | PageContainer compact trên mobile; DataTable row height.                 |
| `variant`      | `default`, `narrow`, `flush`, `ghost` | —            | Biến thể giao diện semantic.                               | Button/Badge/Alert — chọn tone phù hợp ngữ cảnh (primary, destructive…). |
| `stickyFooter` | `boolean`                             | —            | Pin footer trang xuống viewport khi scroll.                | Form dài — luôn thấy nút Save.                                           |
| `children`     | `ReactNode`                           | —            | Nội dung con render bên trong component.                   | Text, icon, hoặc component con — ví dụ label Badge, body Alert.          |

#### Props hành động (events & callbacks)

Không có props trong nhóm này.

#### Thuộc tính DOM & accessibility

| Prop        | Kiểu     | Mặc định | Mô tả                        | Use case                                            |
| ----------- | -------- | -------- | ---------------------------- | --------------------------------------------------- |
| `className` | `string` | —        | CSS class bổ sung trên root. | Fine-tune layout; tránh override token trừ khi cần. |

### ResponsiveGrid

ResponsiveGrid — phần con của compound primitive.

**Use case:** Import cùng package với component cha; compose theo thứ tự trong demo.

#### Props hiển thị & cấu hình

| Prop       | Kiểu          | Mặc định     | Mô tả                                    | Use case                                                        |
| ---------- | ------------- | ------------ | ---------------------------------------- | --------------------------------------------------------------- |
| `columns`  | `2`, `3`, `4` | —            | Số cột layout.                           | KeyValueGrid: 1–3 cột; DataTable column defs.                   |
| `children` | `ReactNode`   | **bắt buộc** | Nội dung con render bên trong component. | Text, icon, hoặc component con — ví dụ label Badge, body Alert. |

#### Props hành động (events & callbacks)

Không có props trong nhóm này.

### SplitPane

SplitPane — phần con của compound primitive.

**Use case:** Import cùng package với component cha; compose theo thứ tự trong demo.

#### Props hiển thị & cấu hình

| Prop         | Kiểu        | Mặc định     | Mô tả                                    | Use case                                                        |
| ------------ | ----------- | ------------ | ---------------------------------------- | --------------------------------------------------------------- |
| `children`   | `ReactNode` | **bắt buộc** | Nội dung con render bên trong component. | Text, icon, hoặc component con — ví dụ label Badge, body Alert. |
| `aside`      | `ReactNode` | **bắt buộc** | Prop `aside`.                            | Tham chiếu type trong source `src/props/` hoặc component.       |
| `asideWidth` | `sm`, `md`  | —            | Prop `asideWidth`.                       | Tham chiếu type trong source `src/props/` hoặc component.       |

#### Props hành động (events & callbacks)

Không có props trong nhóm này.

### Stack

Stack — phần con của compound primitive.

**Use case:** Import cùng package với component cha; compose theo thứ tự trong demo.

#### Props hiển thị & cấu hình

| Prop  | Kiểu                         | Mặc định | Mô tả                                   | Use case                                   |
| ----- | ---------------------------- | -------- | --------------------------------------- | ------------------------------------------ |
| `gap` | `xs`, `sm`, `md`, `lg`, `xl` | —        | Khoảng cách giữa items (token spacing). | Stack vertical gap; Inline horizontal gap. |

#### Props hành động (events & callbacks)

Không có props trong nhóm này.

### FilterBar

FilterBar — phần con của compound primitive.

**Use case:** Import cùng package với component cha; compose theo thứ tự trong demo.

#### Props hiển thị & cấu hình

| Prop               | Kiểu        | Mặc định     | Mô tả                                    | Use case                                                        |
| ------------------ | ----------- | ------------ | ---------------------------------------- | --------------------------------------------------------------- |
| `hasActiveFilters` | `boolean`   | —            | Any filter active flag                   | Xem demo và source component để biết ngữ cảnh cụ thể.           |
| `children`         | `ReactNode` | **bắt buộc** | Nội dung con render bên trong component. | Text, icon, hoặc component con — ví dụ label Badge, body Alert. |

#### Props hành động (events & callbacks)

| Prop      | Kiểu         | Mặc định | Mô tả                                  | Use case                                                         |
| --------- | ------------ | -------- | -------------------------------------- | ---------------------------------------------------------------- |
| `onClear` | `() => void` | —        | Callback khi sự kiện `onClear` xảy ra. | Gắn handler để phản hồi tương tác user — xem demo live bên dưới. |

#### Thuộc tính DOM & accessibility

| Prop        | Kiểu     | Mặc định | Mô tả                        | Use case                                            |
| ----------- | -------- | -------- | ---------------------------- | --------------------------------------------------- |
| `className` | `string` | —        | CSS class bổ sung trên root. | Fine-tune layout; tránh override token trừ khi cần. |

### FilterGroup

Nhóm filter trong FilterBar.

**Use case:** Label + slot controls con.

#### Props hiển thị & cấu hình

| Prop       | Kiểu        | Mặc định     | Mô tả                                      | Use case                                                        |
| ---------- | ----------- | ------------ | ------------------------------------------ | --------------------------------------------------------------- |
| `label`    | `ReactNode` | **bắt buộc** | Nhãn mô tả — thường là dòng phụ, font nhỏ. | CardStat: tên chỉ số KPI; FormField: tên field.                 |
| `children` | `ReactNode` | **bắt buộc** | Nội dung con render bên trong component.   | Text, icon, hoặc component con — ví dụ label Badge, body Alert. |

#### Props hành động (events & callbacks)

Không có props trong nhóm này.

#### Thuộc tính DOM & accessibility

| Prop        | Kiểu     | Mặc định | Mô tả                        | Use case                                            |
| ----------- | -------- | -------- | ---------------------------- | --------------------------------------------------- |
| `className` | `string` | —        | CSS class bổ sung trên root. | Fine-tune layout; tránh override token trừ khi cần. |

### Tabs

Tabs — phần con của compound primitive.

**Use case:** Import cùng package với component cha; compose theo thứ tự trong demo.

#### Props hiển thị & cấu hình

Không có props trong nhóm này.

#### Props hành động (events & callbacks)

Không có props trong nhóm này.

### TabsContent

Panel nội dung tab.

**Use case:** Mount khi tab active.

#### Props hiển thị & cấu hình

Không có props trong nhóm này.

#### Props hành động (events & callbacks)

Không có props trong nhóm này.

### TabsList

Thanh tab triggers.

**Use case:** Chứa các `TabsTrigger`.

#### Props hiển thị & cấu hình

Không có props trong nhóm này.

#### Props hành động (events & callbacks)

Không có props trong nhóm này.

### TabsTrigger

Nút chọn tab.

**Use case:** `value` khớp `TabsContent value`.

#### Props hiển thị & cấu hình

Không có props trong nhóm này.

#### Props hành động (events & callbacks)

Không có props trong nhóm này.

## Ghi chú

- Props có tiền tố `on` là **callbacks** — gắn handler để phản hồi user.
- Sub-components compose theo thứ tự trong demo — không dùng lẻ ngoài family trừ khi API cho phép.
- Các prop DOM khác (không liệt kê) vẫn hỗ trợ qua spread HTML attributes.
- Demo live bên dưới minh họa variants/states; **View code** để copy snippet.
