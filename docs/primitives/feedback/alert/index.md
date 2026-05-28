---
title: Alert
lang: vi
---

Alert — Primitive phản hồi — thông báo, xác nhận, trạng thái tải.

## Khi nào dùng

- Alert/Toast cho thông báo không chặn luồng.
- Dialog/Sheet cho hành động cần xác nhận hoặc form modal.

## Import

```tsx
import {
  Alert,
  AlertActions,
  AlertContent,
  AlertDescription,
  AlertTitle,
} from "@godxjp/ui/feedback";
```

## Alert — component chính

## Props hiển thị & cấu hình

| Prop       | Kiểu                                           | Mặc định | Mô tả                                         | Use case                                                                 |
| ---------- | ---------------------------------------------- | -------- | --------------------------------------------- | ------------------------------------------------------------------------ |
| `variant`  | `default`, `destructive`, `warning`, `success` | —        | Biến thể giao diện semantic.                  | Button/Badge/Alert — chọn tone phù hợp ngữ cảnh (primary, destructive…). |
| `icon`     | `IconProp`, `false`                            | —        | Icon Lucide hoặc `false` để ẩn icon mặc định. | EmptyState, Alert — tăng nhận diện trạng thái.                           |
| `children` | `ReactNode`                                    | —        | Nội dung con render bên trong component.      | Text, icon, hoặc component con — ví dụ label Badge, body Alert.          |

## Props hành động (events & callbacks)

| Prop        | Kiểu                          | Mặc định | Mô tả                             | Use case                              |
| ----------- | ----------------------------- | -------- | --------------------------------- | ------------------------------------- |
| `onDismiss` | `() => void`, `Promise<void>` | —        | Xử lý khi user đóng alert/banner. | Alert có nút X — lưu dismissed state. |

## Thuộc tính DOM & accessibility

| Prop        | Kiểu     | Mặc định | Mô tả                        | Use case                                            |
| ----------- | -------- | -------- | ---------------------------- | --------------------------------------------------- |
| `className` | `string` | —        | CSS class bổ sung trên root. | Fine-tune layout; tránh override token trừ khi cần. |

## Sub-components

### AlertActions

Slot nút/link trong alert.

**Use case:** Retry, Dismiss, link docs.

#### Props hiển thị & cấu hình

| Prop       | Kiểu        | Mặc định | Mô tả                                    | Use case                                                        |
| ---------- | ----------- | -------- | ---------------------------------------- | --------------------------------------------------------------- |
| `children` | `ReactNode` | —        | Nội dung con render bên trong component. | Text, icon, hoặc component con — ví dụ label Badge, body Alert. |

#### Props hành động (events & callbacks)

Không có props trong nhóm này.

#### Thuộc tính DOM & accessibility

| Prop        | Kiểu     | Mặc định | Mô tả                        | Use case                                            |
| ----------- | -------- | -------- | ---------------------------- | --------------------------------------------------- |
| `className` | `string` | —        | CSS class bổ sung trên root. | Fine-tune layout; tránh override token trừ khi cần. |

### AlertContent

Wrapper nội dung alert.

**Use case:** Bọc Description + Actions.

#### Props hiển thị & cấu hình

| Prop       | Kiểu        | Mặc định | Mô tả                                    | Use case                                                        |
| ---------- | ----------- | -------- | ---------------------------------------- | --------------------------------------------------------------- |
| `children` | `ReactNode` | —        | Nội dung con render bên trong component. | Text, icon, hoặc component con — ví dụ label Badge, body Alert. |

#### Props hành động (events & callbacks)

Không có props trong nhóm này.

#### Thuộc tính DOM & accessibility

| Prop        | Kiểu     | Mặc định | Mô tả                        | Use case                                            |
| ----------- | -------- | -------- | ---------------------------- | --------------------------------------------------- |
| `className` | `string` | —        | CSS class bổ sung trên root. | Fine-tune layout; tránh override token trừ khi cần. |

### AlertDescription

Body text alert.

**Use case:** Chi tiết lỗi, hướng dẫn khắc phục.

#### Props hiển thị & cấu hình

| Prop       | Kiểu        | Mặc định | Mô tả                                    | Use case                                                        |
| ---------- | ----------- | -------- | ---------------------------------------- | --------------------------------------------------------------- |
| `children` | `ReactNode` | —        | Nội dung con render bên trong component. | Text, icon, hoặc component con — ví dụ label Badge, body Alert. |

#### Props hành động (events & callbacks)

Không có props trong nhóm này.

#### Thuộc tính DOM & accessibility

| Prop        | Kiểu     | Mặc định | Mô tả                        | Use case                                            |
| ----------- | -------- | -------- | ---------------------------- | --------------------------------------------------- |
| `className` | `string` | —        | CSS class bổ sung trên root. | Fine-tune layout; tránh override token trừ khi cần. |

### AlertTitle

Tiêu đề alert.

**Use case:** Dòng đậm đầu banner — tóm tắt lỗi/thông báo.

#### Props hiển thị & cấu hình

| Prop       | Kiểu        | Mặc định | Mô tả                                    | Use case                                                        |
| ---------- | ----------- | -------- | ---------------------------------------- | --------------------------------------------------------------- |
| `children` | `ReactNode` | —        | Nội dung con render bên trong component. | Text, icon, hoặc component con — ví dụ label Badge, body Alert. |

#### Props hành động (events & callbacks)

Không có props trong nhóm này.

#### Thuộc tính DOM & accessibility

| Prop        | Kiểu     | Mặc định | Mô tả                        | Use case                                            |
| ----------- | -------- | -------- | ---------------------------- | --------------------------------------------------- |
| `className` | `string` | —        | CSS class bổ sung trên root. | Fine-tune layout; tránh override token trừ khi cần. |

## Ghi chú

- Props có tiền tố `on` là **callbacks** — gắn handler để phản hồi user.
- Sub-components compose theo thứ tự trong demo — không dùng lẻ ngoài family trừ khi API cho phép.
- Các prop DOM khác (không liệt kê) vẫn hỗ trợ qua spread HTML attributes.
- Demo live bên dưới minh họa variants/states; **View code** để copy snippet.
