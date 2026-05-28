---
title: MutationFeedback
lang: vi
---

MutationFeedback — Primitive trạng thái React Query — loading, lỗi, refetch.

## Khi nào dùng

- DataState bọc nội dung phụ thuộc API.
- MutationFeedback sau create/update/delete.

## Import

```tsx
import { MutationFeedback } from "@godxjp/ui/query";
```

## Props hiển thị & cấu hình

| Prop        | Kiểu           | Mặc định     | Mô tả                                   | Use case                                                  |
| ----------- | -------------- | ------------ | --------------------------------------- | --------------------------------------------------------- |
| `mutation`  | `MutationLike` | **bắt buộc** | Prop `mutation`.                        | Tham chiếu type trong source `src/props/` hoặc component. |
| `showRetry` | `boolean`      | —            | Prop `showRetry`.                       | Tham chiếu type trong source `src/props/` hoặc component. |
| `pending`   | `ReactNode`    | —            | Đang xử lý — disable nút, hiện spinner. | DialogConfirm onConfirm async; MutationFeedback.          |

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
