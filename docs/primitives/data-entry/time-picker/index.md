---
title: TimePicker
lang: vi
---

TimePicker — Primitive nhập liệu — form control và lựa chọn giá trị.

## Khi nào dùng

- Luôn bọc trong FormField khi có label/validation.
- Dùng controlled (`value` + `onChange`) hoặc uncontrolled (`defaultValue`) tùy form library.

## Import

```tsx
import { TimePicker } from "@godxjp/ui/data-entry";
```

## Props hiển thị & cấu hình

| Prop           | Kiểu      | Mặc định | Mô tả                                                | Use case                                               |
| -------------- | --------- | -------- | ---------------------------------------------------- | ------------------------------------------------------ |
| `value`        | `string`  | —        | Giá trị hiển thị chính.                              | CardStat: số KPI; Select controlled: option đang chọn. |
| `defaultValue` | `string`  | —        | Giá trị khởi tạo (uncontrolled).                     | Input/RadioGroup khi không cần controlled state.       |
| `placeholder`  | `string`  | —        | Placeholder khi chưa có giá trị.                     | Input/Select: gợi ý format hoặc hành động.             |
| `disabled`     | `boolean` | —        | Vô hiệu hóa tương tác.                               | Chưa đủ điều kiện submit; đang pending API.            |
| `minuteStep`   | `number`  | —        | Minute column step — default 5 (logistics cut-offs). | Xem demo và source component để biết ngữ cảnh cụ thể.  |

## Props hành động (events & callbacks)

| Prop       | Kiểu                      | Mặc định | Mô tả                             | Use case                                   |
| ---------- | ------------------------- | -------- | --------------------------------- | ------------------------------------------ |
| `onChange` | `(value: string) => void` | —        | Xử lý khi giá trị input thay đổi. | Controlled Input/Select — sync state form. |

## Thuộc tính DOM & accessibility

| Prop        | Kiểu     | Mặc định | Mô tả                          | Use case                                            |
| ----------- | -------- | -------- | ------------------------------ | --------------------------------------------------- |
| `className` | `string` | —        | CSS class bổ sung trên root.   | Fine-tune layout; tránh override token trừ khi cần. |
| `id`        | `string` | —        | DOM id — liên kết label/input. | FormField `htmlFor` + Input `id`.                   |

## Ghi chú

- Props có tiền tố `on` là **callbacks** — gắn handler để phản hồi user.
- Sub-components compose theo thứ tự trong demo — không dùng lẻ ngoài family trừ khi API cho phép.
- Các prop DOM khác (không liệt kê) vẫn hỗ trợ qua spread HTML attributes.
- Demo live bên dưới minh họa variants/states; **View code** để copy snippet.
