---
title: MobileFrame
lang: vi
---

MobileFrame — Primitive bố cục — khung trang, spacing, grid.

## Khi nào dùng

- PageContainer bắt buộc cho mọi trang admin.
- Stack/Inline thay div + flex thủ công.

## Import

```tsx
import { MobileFrame } from "@godxjp/ui/layout";
```

## Props hiển thị & cấu hình

| Prop       | Kiểu                   | Mặc định     | Mô tả                                    | Use case                                                        |
| ---------- | ---------------------- | ------------ | ---------------------------------------- | --------------------------------------------------------------- |
| `title`    | `string`               | **bắt buộc** | Tiêu đề chính.                           | Dialog/PageHeader/EmptyState — dòng heading nổi bật nhất.       |
| `subtitle` | `string`               | —            | Dòng phụ dưới title trang.               | PageContainer: mô tả ngắn trang list/detail.                    |
| `status`   | `string`               | —            | Mã trạng thái domain (string).           | StatusBadge: map sang tone màu.                                 |
| `children` | `ReactNode`            | **bắt buộc** | Nội dung con render bên trong component. | Text, icon, hoặc component con — ví dụ label Badge, body Alert. |
| `navItems` | `MobileFrameNavItem[]` | —            | Prop `navItems`.                         | Tham chiếu type trong source `src/props/` hoặc component.       |

## Props hành động (events & callbacks)

Không có props trong nhóm này.

## Ghi chú

- Props có tiền tố `on` là **callbacks** — gắn handler để phản hồi user.
- Sub-components compose theo thứ tự trong demo — không dùng lẻ ngoài family trừ khi API cho phép.
- Các prop DOM khác (không liệt kê) vẫn hỗ trợ qua spread HTML attributes.
- Demo live bên dưới minh họa variants/states; **View code** để copy snippet.
