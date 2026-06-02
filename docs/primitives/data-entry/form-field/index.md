---
title: FormField
lang: vi
---

FormField — Primitive nhập liệu — form control và lựa chọn giá trị.

## Khi nào dùng

- Luôn bọc trong FormField khi có label/validation.
- Dùng controlled (`value` + `onChange`) hoặc uncontrolled (`defaultValue`) tùy form library.

## Import

```tsx
import { FormField } from "@godxjp/ui/data-entry";
```

## Props hiển thị & cấu hình

| Prop         | Kiểu        | Mặc định     | Mô tả                                                                  | Use case                                                        |
| ------------ | ----------- | ------------ | ---------------------------------------------------------------------- | --------------------------------------------------------------- |
| `label`      | `ReactNode` | **bắt buộc** | Nhãn mô tả — thường là dòng phụ, font nhỏ.                             | StatCard: tên chỉ số KPI; FormField: tên field.                 |
| `required`   | `boolean`   | —            | Field bắt buộc.                                                        | FormField: hiện dấu \* và validate Zod.                         |
| `helper`     | `ReactNode` | —            | Text gợi ý dưới field.                                                 | FormField: format mã, giới hạn ký tự.                           |
| `error`      | `ReactNode` | —            | Thông báo lỗi validation.                                              | FormField: hiển thị khi Zod/RHF báo lỗi.                        |
| `labelAddon` | `ReactNode` | —            | Optional control rendered inline after the label (e.g. a help button). | Xem demo và source component để biết ngữ cảnh cụ thể.           |
| `children`   | `ReactNode` | **bắt buộc** | Nội dung con render bên trong component.                               | Text, icon, hoặc component con — ví dụ label Badge, body Alert. |

## Props hành động (events & callbacks)

Không có props trong nhóm này.

## Thuộc tính DOM & accessibility

| Prop        | Kiểu     | Mặc định     | Mô tả                          | Use case                                            |
| ----------- | -------- | ------------ | ------------------------------ | --------------------------------------------------- |
| `id`        | `string` | **bắt buộc** | DOM id — liên kết label/input. | FormField `htmlFor` + Input `id`.                   |
| `className` | `string` | —            | CSS class bổ sung trên root.   | Fine-tune layout; tránh override token trừ khi cần. |

## Ghi chú

- Props có tiền tố `on` là **callbacks** — gắn handler để phản hồi user.
- Sub-components compose theo thứ tự trong demo — không dùng lẻ ngoài family trừ khi API cho phép.
- Các prop DOM khác (không liệt kê) vẫn hỗ trợ qua spread HTML attributes.
- Demo live bên dưới minh họa variants/states; **View code** để copy snippet.
