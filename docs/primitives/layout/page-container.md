---
title: PageContainer
lang: vi
---

Wrapper bắt buộc mọi trang admin — title, extra, footer.

## Khi nào dùng

- List page: title + nút Create trong `extra`.
- Detail page: `footer` Save/Cancel sticky.

## Import

```tsx
import { PageContainer } from "@godxjp/ui/layout";
```

## Props hiển thị & cấu hình

| Prop           | Kiểu                                  | Mặc định     | Mô tả                                                      | Use case                                                                 |
| -------------- | ------------------------------------- | ------------ | ---------------------------------------------------------- | ------------------------------------------------------------------------ |
| `title`        | `ReactNode`                           | **bắt buộc** | Tiêu đề chính.                                             | Dialog/PageHeader/EmptyState — dòng heading nổi bật nhất.                |
| `subtitle`     | `ReactNode`                           | —            | Dòng phụ dưới title trang.                                 | PageContainer: mô tả ngắn trang list/detail.                             |
| `extra`        | `ReactNode`                           | —            | Khu vực action góc phải header trang (Ant Design `extra`). | PageContainer: nút Create, Export cạnh title.                            |
| `footer`       | `ReactNode`                           | —            | Thanh action dưới cùng trang hoặc card.                    | PageContainer: Save/Cancel; Dialog: nút xác nhận.                        |
| `breadcrumb`   | `BreadcrumbItemProp[]`                | —            | Đường dẫn breadcrumb.                                      | PageContainer/AppShell: vị trí hiện tại trong IA.                        |
| `density`      | `compact`, `default`, `comfortable`   | —            | Mật độ spacing (page hoặc table).                          | PageContainer compact trên mobile; DataTable row height.                 |
| `variant`      | `default`, `narrow`, `flush`, `ghost` | —            | Biến thể giao diện semantic.                               | Button/Badge/Alert — chọn tone phù hợp ngữ cảnh (primary, destructive…). |
| `stickyFooter` | `boolean`                             | —            | Pin footer trang xuống viewport khi scroll.                | Form dài — luôn thấy nút Save.                                           |
| `children`     | `ReactNode`                           | —            | Nội dung con render bên trong component.                   | Text, icon, hoặc component con — ví dụ label Badge, body Alert.          |

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
