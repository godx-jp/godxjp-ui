---
title: TabsItems
lang: vi
---

TabsItems — Primitive điều hướng — menu, tab, breadcrumb, phân trang.

## Khi nào dùng

- PageHeader + Breadcrumb cho context trang.
- Tabs khi chia nội dung cùng entity.

## Import

```tsx
import { TabsItems } from "@godxjp/ui/navigation";
```

## Props hiển thị & cấu hình

| Prop               | Kiểu                      | Mặc định     | Mô tả                            | Use case                                                                 |
| ------------------ | ------------------------- | ------------ | -------------------------------- | ------------------------------------------------------------------------ |
| `items`            | `TabItemProp[]`           | **bắt buộc** | Mảng item để render.             | KeyValueGrid, Steps, Breadcrumb.                                         |
| `value`            | `string`                  | —            | Giá trị hiển thị chính.          | CardStat: số KPI; Select controlled: option đang chọn.                   |
| `defaultValue`     | `string`                  | —            | Giá trị khởi tạo (uncontrolled). | Input/RadioGroup khi không cần controlled state.                         |
| `variant`          | `default`, `line`, `card` | —            | Biến thể giao diện semantic.     | Button/Badge/Alert — chọn tone phù hợp ngữ cảnh (primary, destructive…). |
| `listClassName`    | `string`                  | —            | Root CSS class override          | Xem demo và source component để biết ngữ cảnh cụ thể.                    |
| `contentClassName` | `string`                  | —            | Root CSS class override          | Xem demo và source component để biết ngữ cảnh cụ thể.                    |

## Props hành động (events & callbacks)

| Prop            | Kiểu                    | Mặc định | Mô tả                                         | Use case                               |
| --------------- | ----------------------- | -------- | --------------------------------------------- | -------------------------------------- |
| `onValueChange` | `(key: string) => void` | —        | Radix value thay đổi (Select, Tabs, Switch…). | Controlled tabs — sync URL hoặc state. |

## Thuộc tính DOM & accessibility

| Prop        | Kiểu     | Mặc định | Mô tả                        | Use case                                            |
| ----------- | -------- | -------- | ---------------------------- | --------------------------------------------------- |
| `className` | `string` | —        | CSS class bổ sung trên root. | Fine-tune layout; tránh override token trừ khi cần. |

## Ghi chú

- Props có tiền tố `on` là **callbacks** — gắn handler để phản hồi user.
- Sub-components compose theo thứ tự trong demo — không dùng lẻ ngoài family trừ khi API cho phép.
- Các prop DOM khác (không liệt kê) vẫn hỗ trợ qua spread HTML attributes.
- Demo live bên dưới minh họa variants/states; **View code** để copy snippet.
