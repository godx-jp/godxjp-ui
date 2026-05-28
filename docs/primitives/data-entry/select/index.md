---
title: Select
lang: vi
---

Select — Primitive nhập liệu — form control và lựa chọn giá trị.

## Khi nào dùng

- Luôn bọc trong FormField khi có label/validation.
- Dùng controlled (`value` + `onChange`) hoặc uncontrolled (`defaultValue`) tùy form library.

## Import

```tsx
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@godxjp/ui/data-entry";
```

## Select — component chính

## Props hiển thị & cấu hình

Không có props trong nhóm này.

## Props hành động (events & callbacks)

Không có props trong nhóm này.

## Sub-components

### SelectContent

Panel options.

**Use case:** Portal — z-index cao.

#### Props hiển thị & cấu hình

Không có props trong nhóm này.

#### Props hành động (events & callbacks)

Không có props trong nhóm này.

### SelectGroup

Nhóm options trong Select.

**Use case:** Label nhóm — optional separator.

#### Props hiển thị & cấu hình

Không có props trong nhóm này.

#### Props hành động (events & callbacks)

Không có props trong nhóm này.

### SelectItem

SelectItem — phần con của compound primitive.

**Use case:** Import cùng package với component cha; compose theo thứ tự trong demo.

#### Props hiển thị & cấu hình

Không có props trong nhóm này.

#### Props hành động (events & callbacks)

Không có props trong nhóm này.

### SelectLabel

SelectLabel — phần con của compound primitive.

**Use case:** Import cùng package với component cha; compose theo thứ tự trong demo.

#### Props hiển thị & cấu hình

Không có props trong nhóm này.

#### Props hành động (events & callbacks)

Không có props trong nhóm này.

### SelectSeparator

SelectSeparator — phần con của compound primitive.

**Use case:** Import cùng package với component cha; compose theo thứ tự trong demo.

#### Props hiển thị & cấu hình

Không có props trong nhóm này.

#### Props hành động (events & callbacks)

Không có props trong nhóm này.

### SelectTrigger

Nút mở dropdown select.

**Use case:** Hiển thị giá trị đang chọn.

#### Props hiển thị & cấu hình

Không có props trong nhóm này.

#### Props hành động (events & callbacks)

Không có props trong nhóm này.

### SelectValue

Hiển thị label đã chọn.

**Use case:** Placeholder khi chưa chọn.

#### Props hiển thị & cấu hình

Không có props trong nhóm này.

#### Props hành động (events & callbacks)

Không có props trong nhóm này.

## Ghi chú

- Props có tiền tố `on` là **callbacks** — gắn handler để phản hồi user.
- Sub-components compose theo thứ tự trong demo — không dùng lẻ ngoài family trừ khi API cho phép.
- Các prop DOM khác (không liệt kê) vẫn hỗ trợ qua spread HTML attributes.
- Demo live bên dưới minh họa variants/states; **View code** để copy snippet.
