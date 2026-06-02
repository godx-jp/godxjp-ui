---
title: QueryRefetchButton
lang: vi
---

QueryRefetchButton — Primitive trạng thái React Query — loading, lỗi, refetch.

## Khi nào dùng

- DataState bọc nội dung phụ thuộc API.
- MutationFeedback sau create/update/delete.

## Import

```tsx
import { QueryRefetchButton } from "@godxjp/ui/query";
```

## Props hiển thị & cấu hình

| Prop    | Kiểu               | Mặc định     | Mô tả                                      | Use case                                                  |
| ------- | ------------------ | ------------ | ------------------------------------------ | --------------------------------------------------------- |
| `query` | `QueryRefetchLike` | **bắt buộc** | Prop `query`.                              | Tham chiếu type trong source `src/props/` hoặc component. |
| `label` | `ReactNode`        | —            | Nhãn mô tả — thường là dòng phụ, font nhỏ. | StatCard: tên chỉ số KPI; FormField: tên field.           |

## Props hành động (events & callbacks)

Không có props trong nhóm này.

## Ghi chú

- Props có tiền tố `on` là **callbacks** — gắn handler để phản hồi user.
- Sub-components compose theo thứ tự trong demo — không dùng lẻ ngoài family trừ khi API cho phép.
- Các prop DOM khác (không liệt kê) vẫn hỗ trợ qua spread HTML attributes.
- Demo live bên dưới minh họa variants/states; **View code** để copy snippet.
