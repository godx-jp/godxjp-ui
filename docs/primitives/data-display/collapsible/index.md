---
title: Overview
lang: vi
---

Collapsible — Primitive hiển thị dữ liệu — chỉ đọc, không nhập liệu.

## Khi nào dùng

- Dùng để trình bày thông tin đã có (số liệu, trạng thái, bảng, danh sách).
- Không thay thế form input — kết hợp với Data Entry khi cần chỉnh sửa.

## Import

```tsx
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@godxjp/ui/data-display";
```

## Collapsible — component chính

## Props hiển thị & cấu hình

Không có props trong nhóm này.

## Props hành động (events & callbacks)

Không có props trong nhóm này.

## Sub-components

### CollapsibleContent

CollapsibleContent — phần con của compound primitive.

**Use case:** Import cùng package với component cha; compose theo thứ tự trong demo.

#### Props hiển thị & cấu hình

Không có props trong nhóm này.

#### Props hành động (events & callbacks)

Không có props trong nhóm này.

### CollapsibleTrigger

CollapsibleTrigger — phần con của compound primitive.

**Use case:** Import cùng package với component cha; compose theo thứ tự trong demo.

#### Props hiển thị & cấu hình

Không có props trong nhóm này.

#### Props hành động (events & callbacks)

Không có props trong nhóm này.

## Ghi chú

- Props có tiền tố `on` là **callbacks** — gắn handler để phản hồi user.
- Sub-components compose theo thứ tự trong demo — không dùng lẻ ngoài family trừ khi API cho phép.
- Các prop DOM khác (không liệt kê) vẫn hỗ trợ qua spread HTML attributes.
- Demo live bên dưới minh họa variants/states; **View code** để copy snippet.
