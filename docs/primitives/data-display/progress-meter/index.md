---
title: Overview
lang: vi
---

ProgressMeter — Primitive hiển thị dữ liệu — chỉ đọc, không nhập liệu.

## Khi nào dùng

- Dùng để trình bày thông tin đã có (số liệu, trạng thái, bảng, danh sách).
- Không thay thế form input — kết hợp với Data Entry khi cần chỉnh sửa.

## Import

```tsx
import { ProgressMeter } from "@godxjp/ui/data-display";
```

## Props hiển thị & cấu hình

| Prop    | Kiểu                | Mặc định     | Mô tả                                      | Use case                                                       |
| ------- | ------------------- | ------------ | ------------------------------------------ | -------------------------------------------------------------- |
| `value` | `number`            | **bắt buộc** | Giá trị hiển thị chính.                    | CardStat: số KPI; Select controlled: option đang chọn.         |
| `label` | `string`            | —            | Nhãn mô tả — thường là dòng phụ, font nhỏ. | CardStat: tên chỉ số KPI; FormField: tên field.                |
| `tone`  | `ProgressMeterTone` | —            | Tông màu semantic.                         | StatusBadge: success/warning/destructive theo business status. |

## Props hành động (events & callbacks)

Không có props trong nhóm này.

## Ghi chú

- Props có tiền tố `on` là **callbacks** — gắn handler để phản hồi user.
- Sub-components compose theo thứ tự trong demo — không dùng lẻ ngoài family trừ khi API cho phép.
- Các prop DOM khác (không liệt kê) vẫn hỗ trợ qua spread HTML attributes.
- Demo live bên dưới minh họa variants/states; **View code** để copy snippet.
