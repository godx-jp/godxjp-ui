---
title: Textarea
lang: vi
---

Textarea — Primitive nhập liệu — form control và lựa chọn giá trị.

## Khi nào dùng

- Luôn bọc trong FormField khi có label/validation.
- Dùng controlled (`value` + `onChange`) hoặc uncontrolled (`defaultValue`) tùy form library.

## Import

```tsx
import { Textarea } from "@godxjp/ui/data-entry";
```

## Props hiển thị & cấu hình

| Prop          | Kiểu      | Mặc định | Mô tả                            | Use case                                    |
| ------------- | --------- | -------- | -------------------------------- | ------------------------------------------- |
| `value`       | `string`  | —        | Giá trị controlled.              | Textarea form dài — sync RHF.               |
| `placeholder` | `string`  | —        | Placeholder khi chưa có giá trị. | Input/Select: gợi ý format hoặc hành động.  |
| `rows`        | `number`  | —        | Số dòng hiển thị.                | Ghi chú ngắn vs mô tả dài.                  |
| `disabled`    | `boolean` | —        | Vô hiệu hóa tương tác.           | Chưa đủ điều kiện submit; đang pending API. |

## Props hành động (events & callbacks)

| Prop       | Kiểu                       | Mặc định | Mô tả                             | Use case                                   |
| ---------- | -------------------------- | -------- | --------------------------------- | ------------------------------------------ |
| `onChange` | `(e: ChangeEvent) => void` | —        | Xử lý khi giá trị input thay đổi. | Controlled Input/Select — sync state form. |

## Thuộc tính DOM & accessibility

| Prop        | Kiểu     | Mặc định | Mô tả                        | Use case                                            |
| ----------- | -------- | -------- | ---------------------------- | --------------------------------------------------- |
| `className` | `string` | —        | CSS class bổ sung trên root. | Fine-tune layout; tránh override token trừ khi cần. |

## Ghi chú

- Props có tiền tố `on` là **callbacks** — gắn handler để phản hồi user.
- Sub-components compose theo thứ tự trong demo — không dùng lẻ ngoài family trừ khi API cho phép.
- Các prop DOM khác (không liệt kê) vẫn hỗ trợ qua spread HTML attributes.
- Demo live bên dưới minh họa variants/states; **View code** để copy snippet.
