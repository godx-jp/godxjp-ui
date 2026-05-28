---
title: Overview
lang: vi
---

Placeholder khi chưa có dữ liệu.

## Khi nào dùng

- List rỗng lần đầu — CTA tạo mới trong `action`.
- Filter không match — copy khác default empty.

## Import

```tsx
import { EmptyState } from "@godxjp/ui/data-display";
```

## Props hiển thị & cấu hình

| Prop          | Kiểu                                          | Mặc định     | Mô tả                                         | Use case                                                  |
| ------------- | --------------------------------------------- | ------------ | --------------------------------------------- | --------------------------------------------------------- |
| `icon`        | `React.ComponentType<{ className?: string }>` | —            | Icon Lucide hoặc `false` để ẩn icon mặc định. | EmptyState, Alert — tăng nhận diện trạng thái.            |
| `title`       | `ReactNode`                                   | **bắt buộc** | Tiêu đề chính.                                | Dialog/PageHeader/EmptyState — dòng heading nổi bật nhất. |
| `description` | `ReactNode`                                   | —            | Nội dung mô tả chi tiết.                      | Dialog/EmptyState/Alert — body text giải thích.           |
| `action`      | `ReactNode`                                   | —            | Slot CTA (thường là Button).                  | EmptyState: nút tạo mới / thử lại.                        |

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
