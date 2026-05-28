---
title: Tabs
lang: vi
---

Tabs — Primitive điều hướng — menu, tab, breadcrumb, phân trang.

## Khi nào dùng

- PageHeader + Breadcrumb cho context trang.
- Tabs khi chia nội dung cùng entity.

## Import

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@godxjp/ui/navigation";
```

## Tabs — component chính

## Props hiển thị & cấu hình

Không có props trong nhóm này.

## Props hành động (events & callbacks)

Không có props trong nhóm này.

## Sub-components

### TabsContent

Panel nội dung tab.

**Use case:** Mount khi tab active.

#### Props hiển thị & cấu hình

Không có props trong nhóm này.

#### Props hành động (events & callbacks)

Không có props trong nhóm này.

### TabsList

Thanh tab triggers.

**Use case:** Chứa các `TabsTrigger`.

#### Props hiển thị & cấu hình

Không có props trong nhóm này.

#### Props hành động (events & callbacks)

Không có props trong nhóm này.

### TabsTrigger

Nút chọn tab.

**Use case:** `value` khớp `TabsContent value`.

#### Props hiển thị & cấu hình

Không có props trong nhóm này.

#### Props hành động (events & callbacks)

Không có props trong nhóm này.

## Ghi chú

- Props có tiền tố `on` là **callbacks** — gắn handler để phản hồi user.
- Sub-components compose theo thứ tự trong demo — không dùng lẻ ngoài family trừ khi API cho phép.
- Các prop DOM khác (không liệt kê) vẫn hỗ trợ qua spread HTML attributes.
- Demo live bên dưới minh họa variants/states; **View code** để copy snippet.
