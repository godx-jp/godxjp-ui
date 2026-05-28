---
title: Overview
lang: vi
---

Bảng dữ liệu với sort, select, density.

## Khi nào dùng

- Server pagination: parent giữ page state, truyền `data`.
- `onRowClick` navigate detail; `selectable` cho bulk delete.

## Import

```tsx
import { DataTable } from "@godxjp/ui/data-display";
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
