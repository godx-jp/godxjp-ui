---
title: Overview
lang: vi
---

AppProvider — primitive UI từ @godxjp/ui.

## Khi nào dùng

- Xem demo live bên dưới để biết variants và states hỗ trợ.

## Import

```tsx
import {
  AppProvider,
  Inline,
  DateFormatPicker,
  LocalePicker,
  TimeFormatPicker,
  TimezonePicker,
} from "@godxjp/ui/navigation";
```

## Sub-components

### Inline

Inline — phần con của compound primitive.

**Use case:** Import cùng package với component cha; compose theo thứ tự trong demo.

#### Props hiển thị & cấu hình

| Prop  | Kiểu                   | Mặc định | Mô tả                                   | Use case                                   |
| ----- | ---------------------- | -------- | --------------------------------------- | ------------------------------------------ |
| `gap` | `xs`, `sm`, `md`, `lg` | —        | Khoảng cách giữa items (token spacing). | Stack vertical gap; Inline horizontal gap. |

#### Props hành động (events & callbacks)

Không có props trong nhóm này.

### DateFormatPicker

DateFormatPicker — phần con của compound primitive.

**Use case:** Import cùng package với component cha; compose theo thứ tự trong demo.

#### Props hiển thị & cấu hình

| Prop       | Kiểu            | Mặc định | Mô tả                   | Use case                                               |
| ---------- | --------------- | -------- | ----------------------- | ------------------------------------------------------ |
| `disabled` | `boolean`       | —        | Vô hiệu hóa tương tác.  | Chưa đủ điều kiện submit; đang pending API.            |
| `value`    | `AppDateFormat` | —        | Giá trị hiển thị chính. | CardStat: số KPI; Select controlled: option đang chọn. |

#### Props hành động (events & callbacks)

| Prop       | Kiểu                                  | Mặc định | Mô tả                             | Use case                                   |
| ---------- | ------------------------------------- | -------- | --------------------------------- | ------------------------------------------ |
| `onChange` | `(dateFormat: AppDateFormat) => void` | —        | Xử lý khi giá trị input thay đổi. | Controlled Input/Select — sync state form. |

#### Thuộc tính DOM & accessibility

| Prop        | Kiểu     | Mặc định | Mô tả                          | Use case                                            |
| ----------- | -------- | -------- | ------------------------------ | --------------------------------------------------- |
| `className` | `string` | —        | CSS class bổ sung trên root.   | Fine-tune layout; tránh override token trừ khi cần. |
| `id`        | `string` | —        | DOM id — liên kết label/input. | FormField `htmlFor` + Input `id`.                   |

### LocalePicker

LocalePicker — phần con của compound primitive.

**Use case:** Import cùng package với component cha; compose theo thứ tự trong demo.

#### Props hiển thị & cấu hình

| Prop       | Kiểu        | Mặc định | Mô tả                   | Use case                                               |
| ---------- | ----------- | -------- | ----------------------- | ------------------------------------------------------ |
| `disabled` | `boolean`   | —        | Vô hiệu hóa tương tác.  | Chưa đủ điều kiện submit; đang pending API.            |
| `value`    | `AppLocale` | —        | Giá trị hiển thị chính. | CardStat: số KPI; Select controlled: option đang chọn. |

#### Props hành động (events & callbacks)

| Prop       | Kiểu                          | Mặc định | Mô tả                             | Use case                                   |
| ---------- | ----------------------------- | -------- | --------------------------------- | ------------------------------------------ |
| `onChange` | `(locale: AppLocale) => void` | —        | Xử lý khi giá trị input thay đổi. | Controlled Input/Select — sync state form. |

#### Thuộc tính DOM & accessibility

| Prop        | Kiểu     | Mặc định | Mô tả                          | Use case                                            |
| ----------- | -------- | -------- | ------------------------------ | --------------------------------------------------- |
| `className` | `string` | —        | CSS class bổ sung trên root.   | Fine-tune layout; tránh override token trừ khi cần. |
| `id`        | `string` | —        | DOM id — liên kết label/input. | FormField `htmlFor` + Input `id`.                   |

### TimeFormatPicker

TimeFormatPicker — phần con của compound primitive.

**Use case:** Import cùng package với component cha; compose theo thứ tự trong demo.

#### Props hiển thị & cấu hình

| Prop       | Kiểu            | Mặc định | Mô tả                   | Use case                                               |
| ---------- | --------------- | -------- | ----------------------- | ------------------------------------------------------ |
| `disabled` | `boolean`       | —        | Vô hiệu hóa tương tác.  | Chưa đủ điều kiện submit; đang pending API.            |
| `value`    | `AppTimeFormat` | —        | Giá trị hiển thị chính. | CardStat: số KPI; Select controlled: option đang chọn. |

#### Props hành động (events & callbacks)

| Prop       | Kiểu                                  | Mặc định | Mô tả                             | Use case                                   |
| ---------- | ------------------------------------- | -------- | --------------------------------- | ------------------------------------------ |
| `onChange` | `(timeFormat: AppTimeFormat) => void` | —        | Xử lý khi giá trị input thay đổi. | Controlled Input/Select — sync state form. |

#### Thuộc tính DOM & accessibility

| Prop        | Kiểu     | Mặc định | Mô tả                          | Use case                                            |
| ----------- | -------- | -------- | ------------------------------ | --------------------------------------------------- |
| `className` | `string` | —        | CSS class bổ sung trên root.   | Fine-tune layout; tránh override token trừ khi cần. |
| `id`        | `string` | —        | DOM id — liên kết label/input. | FormField `htmlFor` + Input `id`.                   |

### TimezonePicker

TimezonePicker — phần con của compound primitive.

**Use case:** Import cùng package với component cha; compose theo thứ tự trong demo.

#### Props hiển thị & cấu hình

| Prop       | Kiểu                     | Mặc định | Mô tả                                  | Use case                                               |
| ---------- | ------------------------ | -------- | -------------------------------------- | ------------------------------------------------------ |
| `disabled` | `boolean`                | —        | Vô hiệu hóa tương tác.                 | Chưa đủ điều kiện submit; đang pending API.            |
| `value`    | `AppTimezone`            | —        | Giá trị hiển thị chính.                | CardStat: số KPI; Select controlled: option đang chọn. |
| `options`  | `readonly AppTimezone[]` | —        | Danh sách lựa chọn `{ label, value }`. | Select, Radio.Group, Checkbox.Group.                   |

#### Props hành động (events & callbacks)

| Prop       | Kiểu                              | Mặc định | Mô tả                             | Use case                                   |
| ---------- | --------------------------------- | -------- | --------------------------------- | ------------------------------------------ |
| `onChange` | `(timezone: AppTimezone) => void` | —        | Xử lý khi giá trị input thay đổi. | Controlled Input/Select — sync state form. |

#### Thuộc tính DOM & accessibility

| Prop        | Kiểu     | Mặc định | Mô tả                          | Use case                                            |
| ----------- | -------- | -------- | ------------------------------ | --------------------------------------------------- |
| `className` | `string` | —        | CSS class bổ sung trên root.   | Fine-tune layout; tránh override token trừ khi cần. |
| `id`        | `string` | —        | DOM id — liên kết label/input. | FormField `htmlFor` + Input `id`.                   |

## Ghi chú

- Props có tiền tố `on` là **callbacks** — gắn handler để phản hồi user.
- Sub-components compose theo thứ tự trong demo — không dùng lẻ ngoài family trừ khi API cho phép.
- Các prop DOM khác (không liệt kê) vẫn hỗ trợ qua spread HTML attributes.
- Demo live bên dưới minh họa variants/states; **View code** để copy snippet.
