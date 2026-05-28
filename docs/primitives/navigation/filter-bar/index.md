---
title: FilterBar
lang: vi
---

FilterBar — Primitive điều hướng — menu, tab, breadcrumb, phân trang.

## Khi nào dùng

- PageHeader + Breadcrumb cho context trang.
- Tabs khi chia nội dung cùng entity.

## Import

```tsx
import { FilterBar, FilterGroup } from "@godxjp/ui/navigation";
```

## FilterBar — component chính

## Props hiển thị & cấu hình

| Prop               | Kiểu        | Mặc định     | Mô tả                                    | Use case                                                        |
| ------------------ | ----------- | ------------ | ---------------------------------------- | --------------------------------------------------------------- |
| `hasActiveFilters` | `boolean`   | —            | Any filter active flag                   | Xem demo và source component để biết ngữ cảnh cụ thể.           |
| `children`         | `ReactNode` | **bắt buộc** | Nội dung con render bên trong component. | Text, icon, hoặc component con — ví dụ label Badge, body Alert. |

## Props hành động (events & callbacks)

| Prop      | Kiểu         | Mặc định | Mô tả                                  | Use case                                                         |
| --------- | ------------ | -------- | -------------------------------------- | ---------------------------------------------------------------- |
| `onClear` | `() => void` | —        | Callback khi sự kiện `onClear` xảy ra. | Gắn handler để phản hồi tương tác user — xem demo live bên dưới. |

## Thuộc tính DOM & accessibility

| Prop        | Kiểu     | Mặc định | Mô tả                        | Use case                                            |
| ----------- | -------- | -------- | ---------------------------- | --------------------------------------------------- |
| `className` | `string` | —        | CSS class bổ sung trên root. | Fine-tune layout; tránh override token trừ khi cần. |

## Sub-components

### FilterGroup

Nhóm filter trong FilterBar.

**Use case:** Label + slot controls con.

#### Props hiển thị & cấu hình

| Prop       | Kiểu        | Mặc định     | Mô tả                                      | Use case                                                        |
| ---------- | ----------- | ------------ | ------------------------------------------ | --------------------------------------------------------------- |
| `label`    | `ReactNode` | **bắt buộc** | Nhãn mô tả — thường là dòng phụ, font nhỏ. | CardStat: tên chỉ số KPI; FormField: tên field.                 |
| `children` | `ReactNode` | **bắt buộc** | Nội dung con render bên trong component.   | Text, icon, hoặc component con — ví dụ label Badge, body Alert. |

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
