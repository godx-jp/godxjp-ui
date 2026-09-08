# @godxjp/ui

> **Tệp này do gói `@godxjp/ui` sở hữu và bị GHI ĐÈ mỗi lần nâng cấp.**
> Đừng sửa ở đây — luật của riêng kho thuộc về một tệp khác trong `.ai/rules/`,
> và index sẽ nạp cả hai. (Khác với `.claude/skills/.../SKILL.md`, nơi mục §8
> trở đi là của kho và được giữ lại.)

Đây là **danh sách kiểm** bắn mỗi lần chạm một tệp UI. Lý do đầy đủ nằm ở
`docs/CONSUMER-RULES.md` (10 luật) và, với kho chuột bạch, ở
`.claude/skills/godx-ui-guinea-pig/SKILL.md`.

## Trước khi viết bố cục: TRA, đừng dựng

Hỏi MCP `godxjp-ui` (`search_components`, `get_component`). Đo được trong một
ngày: năm thứ cần đều ĐÃ CÓ và vẫn bị dựng lại bằng thứ khác —

| Cần | Đã có |
|---|---|
| đường kẻ chạm mép Card | `<CardContent flush>` |
| header có kẻ khi thân là danh sách flush | `<CardHeader banded>` |
| một hàng LÀ liên kết (thay cho nút rời) | `<ListRow asChild>` |
| kẻ ô từng ngày trong lịch | `<Calendar bordered>` |
| dải giữa hai vùng, tự kẻ theo VỊ TRÍ | `<CardBar>` |

Lỗi không phải "đoán sai tên prop" mà là **cho rằng nó không tồn tại nên không
hỏi**.

## Catalog chở PROP, không chở LUẬT BỐ CỤC

`CardBar` trong manifest có đúng một prop (`extra`) — không dòng nào nói nó tự
kẻ theo vị trí (đầu: kẻ dưới · cuối: kẻ trên · giữa: cả hai). Luật ấy chỉ nằm
trong chú thích `node_modules/@godxjp/ui/src/styles/card-layout.css`.

**Làm bố cục trong một component của DS → mở tệp `*-layout.css` của nó ra đọc.**

## Card không lồng Card

Một `<Card>` trong `<Card>` cho hai mép bo cách nhau 16px và hai lớp padding
chồng lên. Cần viền cho thứ bên trong thì tìm trục của chính nó
(`Calendar bordered`), đừng bọc thêm một mặt phẳng nữa.

Cùng lý do: đừng xếp `<Alert>` thành danh sách trong Card — mỗi Alert là một mặt
phẳng, và `Alert` còn phát `role="alert"` nên cả danh sách sẽ tự đọc to lên khi
tải trang. Danh sách là `ListRow`.

## Màu chữ đọc tầng CHỮ, không đọc tầng TÔ

`--success/--warning/--info/--destructive` là màu **TÔ** (nền badge, thanh, viền
alert). Chữ đọc `--text-success/-warning/-info/-error`.

Đo được: `Text tone="warning"` đọc nhầm tầng cho **1,74:1**; đúng tầng cho
**5,90:1**. Cùng `tone` ấy trong `Badge` vẫn đạt 5,52:1 — nên cùng một prop
hiện đọc được ở chỗ này và không đọc được ở chỗ kia, trên cùng một màn hình.

## Audit xanh ≠ chạy đúng

`ui-audit` xanh chỉ nghĩa là **không có gì cấm** bạn. Đo được: một consumer viết
`modifiers` + `modifiersClassNames` cho màu cuối tuần — audit xanh, tsc xanh,
build xanh, và **số màu chữ trên cả lưới vẫn là 1**, vì class rơi vào `<td>` còn
`<button>` tự đặt màu.

Một API chết im lặng trông y hệt một API đang chạy. **Mở trang và đo** mới biết.
