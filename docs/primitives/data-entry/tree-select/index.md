---
title: TreeSelect
lang: vi
---

TreeSelect — Primitive nhập liệu — form control và lựa chọn giá trị.

## Khi nào dùng

- Luôn bọc trong FormField khi có label/validation.
- Dùng controlled (`value` + `onChange`) hoặc uncontrolled (`defaultValue`) tùy form library.

## Import

```tsx
import { TreeSelect } from "@godxjp/ui/data-entry";
```

## Props hiển thị & cấu hình

Không có props trong nhóm này.

## Props hành động (events & callbacks)

Không có props trong nhóm này.

## Ghi chú

- Props có tiền tố `on` là **callbacks** — gắn handler để phản hồi user.
- Sub-components compose theo thứ tự trong demo — không dùng lẻ ngoài family trừ khi API cho phép.
- Các prop DOM khác (không liệt kê) vẫn hỗ trợ qua spread HTML attributes.
- Demo live bên dưới minh họa variants/states; **View code** để copy snippet.
