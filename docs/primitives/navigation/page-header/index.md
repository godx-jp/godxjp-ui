---
title: PageHeader
lang: vi
---

PageHeader — Primitive điều hướng — menu, tab, breadcrumb, phân trang.

## Khi nào dùng

- PageHeader + Breadcrumb cho context trang.
- Tabs khi chia nội dung cùng entity.

## Import

```tsx
import { PageHeader } from "@godxjp/ui/navigation";
```

## Props hiển thị & cấu hình

| Prop          | Kiểu                   | Mặc định     | Mô tả                         | Use case                                                  |
| ------------- | ---------------------- | ------------ | ----------------------------- | --------------------------------------------------------- |
| `title`       | `ReactNode`            | **bắt buộc** | Tiêu đề chính.                | Dialog/PageHeader/EmptyState — dòng heading nổi bật nhất. |
| `description` | `ReactNode`            | —            | Nội dung mô tả chi tiết.      | Dialog/EmptyState/Alert — body text giải thích.           |
| `breadcrumb`  | `BreadcrumbItemProp[]` | —            | Đường dẫn breadcrumb.         | PageContainer/AppShell: vị trí hiện tại trong IA.         |
| `actions`     | `ReactNode`            | —            | Top-right actions (Ant extra) | Xem demo và source component để biết ngữ cảnh cụ thể.     |

## Props hành động (events & callbacks)

Không có props trong nhóm này.

## Thuộc tính DOM & accessibility

| Prop        | Kiểu     | Mặc định | Mô tả                        | Use case                                            |
| ----------- | -------- | -------- | ---------------------------- | --------------------------------------------------- |
| `className` | `string` | —        | CSS class bổ sung trên root. | Fine-tune layout; tránh override token trừ khi cần. |

## Ghi chú

- Props có tiền tố `on` là **callbacks** — gắn handler để phản hồi user.
- Sub-components compose theo thứ tự trong demo — không dùng lẻ ngoài family trừ khi API cho phép.
- Các prop DOM khác (không liệt kê) vẫn hỗ trợ qua spread HTML attributes.
- Demo live bên dưới minh họa variants/states; **View code** để copy snippet.
