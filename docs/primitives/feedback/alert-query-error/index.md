---
title: AlertQueryError
lang: vi
---

AlertQueryError — Primitive phản hồi — thông báo, xác nhận, trạng thái tải.

## Khi nào dùng

- Alert/Toast cho thông báo không chặn luồng.
- Dialog/Sheet cho hành động cần xác nhận hoặc form modal.

## Import

```tsx
import { AlertQueryError } from "@godxjp/ui/feedback";
```

## Props hiển thị & cấu hình

| Prop    | Kiểu      | Mặc định     | Mô tả                     | Use case                                 |
| ------- | --------- | ------------ | ------------------------- | ---------------------------------------- |
| `error` | `unknown` | **bắt buộc** | Thông báo lỗi validation. | FormField: hiển thị khi Zod/RHF báo lỗi. |

## Props hành động (events & callbacks)

| Prop      | Kiểu                          | Mặc định | Mô tả                  | Use case                                            |
| --------- | ----------------------------- | -------- | ---------------------- | --------------------------------------------------- |
| `onRetry` | `() => void`, `Promise<void>` | —        | Thử lại khi lỗi query. | AlertQueryError, DataState error — gọi `refetch()`. |

## Thuộc tính DOM & accessibility

| Prop        | Kiểu     | Mặc định | Mô tả                        | Use case                                            |
| ----------- | -------- | -------- | ---------------------------- | --------------------------------------------------- |
| `className` | `string` | —        | CSS class bổ sung trên root. | Fine-tune layout; tránh override token trừ khi cần. |

## Ghi chú

- Props có tiền tố `on` là **callbacks** — gắn handler để phản hồi user.
- Sub-components compose theo thứ tự trong demo — không dùng lẻ ngoài family trừ khi API cho phép.
- Các prop DOM khác (không liệt kê) vẫn hỗ trợ qua spread HTML attributes.
- Demo live bên dưới minh họa variants/states; **View code** để copy snippet.
