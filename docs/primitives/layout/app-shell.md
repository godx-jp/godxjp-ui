---
title: AppShell
lang: vi
---

AppShell — Primitive bố cục — khung trang, spacing, grid.

## Khi nào dùng

- PageContainer bắt buộc cho mọi trang admin.
- Stack/Inline thay div + flex thủ công.

## Import

```tsx
import { AppShell } from "@godxjp/ui/layout";
```

## Props hiển thị & cấu hình

| Prop               | Kiểu        | Mặc định     | Mô tả                                    | Use case                                                        |
| ------------------ | ----------- | ------------ | ---------------------------------------- | --------------------------------------------------------------- |
| `sidebar`          | `ReactNode` | **bắt buộc** | Slot sidebar — menu điều hướng chính.    | AppShell: `<Sidebar sections={...} />`.                         |
| `children`         | `ReactNode` | **bắt buộc** | Nội dung con render bên trong component. | Text, icon, hoặc component con — ví dụ label Badge, body Alert. |
| `topbar`           | `ReactNode` | —            | Slot topbar — product bar, user menu.    | AppShell: logo, search, profile.                                |
| `topbarLeft`       | `ReactNode` | —            | Prop `topbarLeft`.                       | Tham chiếu type trong source `src/props/` hoặc component.       |
| `topbarRight`      | `ReactNode` | —            | Prop `topbarRight`.                      | Tham chiếu type trong source `src/props/` hoặc component.       |
| `logo`             | `ReactNode` | —            | Logo product trong shell.                | AppShell topbar trái.                                           |
| `breadcrumb`       | `ReactNode` | —            | Đường dẫn breadcrumb.                    | PageContainer/AppShell: vị trí hiện tại trong IA.               |
| `footer`           | `ReactNode` | —            | Thanh action dưới cùng trang hoặc card.  | PageContainer: Save/Cancel; Dialog: nút xác nhận.               |
| `sidebarCollapsed` | `boolean`   | —            | Sidebar thu gọn.                         | Responsive / user toggle menu.                                  |

## Props hành động (events & callbacks)

Không có props trong nhóm này.

## Ghi chú

- Props có tiền tố `on` là **callbacks** — gắn handler để phản hồi user.
- Sub-components compose theo thứ tự trong demo — không dùng lẻ ngoài family trừ khi API cho phép.
- Các prop DOM khác (không liệt kê) vẫn hỗ trợ qua spread HTML attributes.
- Demo live bên dưới minh họa variants/states; **View code** để copy snippet.
