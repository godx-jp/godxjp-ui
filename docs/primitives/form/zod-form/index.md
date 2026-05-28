---
title: Overview
lang: vi
---

ZodForm — primitive UI từ @godxjp/ui.

## Khi nào dùng

- Xem demo live bên dưới để biết variants và states hỗ trợ.

## Import

```tsx
import { Input, Button, FormFieldControl, FormRoot } from "@godxjp/ui/form";
```

## Components

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

## Ghi chú

- Props có tiền tố `on` là **callbacks** — gắn handler để phản hồi user.
- Sub-components compose theo thứ tự trong demo — không dùng lẻ ngoài family trừ khi API cho phép.
- Các prop DOM khác (không liệt kê) vẫn hỗ trợ qua spread HTML attributes.
- Demo live bên dưới minh họa variants/states; **View code** để copy snippet.
