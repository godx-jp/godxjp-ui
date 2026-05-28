---
title: Toast
lang: vi
---

Toast — Primitive phản hồi — thông báo, xác nhận, trạng thái tải.

## Khi nào dùng

- Alert/Toast cho thông báo không chặn luồng.
- Dialog/Sheet cho hành động cần xác nhận hoặc form modal.

## Import

```tsx
import { Toaster } from "@godxjp/ui/feedback";
```

## Components

### Toaster

Mount point Sonner toast.

**Use case:** Đặt một lần ở App root.

#### Props hiển thị & cấu hình

Không có props trong nhóm này.

#### Props hành động (events & callbacks)

Không có props trong nhóm này.

## Ghi chú

- Props có tiền tố `on` là **callbacks** — gắn handler để phản hồi user.
- Sub-components compose theo thứ tự trong demo — không dùng lẻ ngoài family trừ khi API cho phép.
- Các prop DOM khác (không liệt kê) vẫn hỗ trợ qua spread HTML attributes.
- Demo live bên dưới minh họa variants/states; **View code** để copy snippet.
