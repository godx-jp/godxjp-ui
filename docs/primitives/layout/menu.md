---
title: Menu
lang: vi
---

Menu — Primitive bố cục — khung trang, spacing, grid.

## Khi nào dùng

- PageContainer bắt buộc cho mọi trang admin.
- Stack/Inline thay div + flex thủ công.

## Import

```tsx
import { Menu } from "@godxjp/ui/layout";
```

## Props hiển thị & cấu hình

| Prop    | Kiểu            | Mặc định     | Mô tả                | Use case                         |
| ------- | --------------- | ------------ | -------------------- | -------------------------------- |
| `items` | `MenuSection[]` | **bắt buộc** | Mảng item để render. | KeyValueGrid, Steps, Breadcrumb. |

## Props hành động (events & callbacks)

Không có props trong nhóm này.

## Ghi chú

- Props có tiền tố `on` là **callbacks** — gắn handler để phản hồi user.
- Sub-components compose theo thứ tự trong demo — không dùng lẻ ngoài family trừ khi API cho phép.
- Các prop DOM khác (không liệt kê) vẫn hỗ trợ qua spread HTML attributes.
- Demo live bên dưới minh họa variants/states; **View code** để copy snippet.
