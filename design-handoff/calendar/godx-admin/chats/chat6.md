# Google Calendar Landing Page

_Started 2026-05-16 12:44 UTC_

---

## User

mình có cả dịch vụ như google calendar nữa giúp mình tạo trang dành cho google calrnder nhé !

## User

xong chưa

## Assistant

## Assistant

_[tool: list_files]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: grep]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: list_files]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: grep]_

_[tool: update_todos]_

Tôi sẽ tạo một sản phẩm Lịch (Calendar) cho hệ thống Famgia — theo đúng pattern của các service khác trong project (godx, chat, console, me), giữ phong cách thiết kế Nhật (shibumi/ma) và là thiết kế gốc của Famgia (không sao chép UI Google).

Plan: 5 artboards trên 1 design canvas — Tuần / Tháng / Ngày+Agenda / Modal tạo sự kiện / Tìm giờ họp.

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: update_todos]_

_[tool: done]_

_[tool: fork_verifier_agent]_

Đã xong — mình tạo **暦 Koyomi**, service Lịch riêng cho hệ thống Famgia, không phải copy Google Calendar (vì lý do bản quyền) mà là thiết kế gốc cùng tông với godx / kintai / chat / me. File chính: **`calendar.html`**.

**6 artboards trên một design canvas:**
- **A · Tuần** — view chính, đầy đủ events, đường giờ "now", multi-lane khi trùng giờ
- **B · Tháng** — grid 6×7, event chip + all-day pill, ngày hôm nay highlight
- **C · Ngày + Event detail panel** — kèm panel chi tiết với attendees, RSVP, mô tả
- **D · Lịch trình (Agenda)** — list 2 tuần, compact, hợp mobile
- **E · Modal Tạo sự kiện** — full form: when/where/attendees/repeat + sidebar quyền & thông báo
- **F · Tìm khung giờ** — grid availability 7 người, slot bận/tạm/rảnh, gợi ý "best time"

**Hệ thống design dùng:**
- Sticker **暦** + accent màu **浅葱 (asagi teal)** — tách biệt với kintai (tím), task (xanh), payslip (xanh lá), tax (cam)
- Mỗi calendar có màu riêng lấy từ palette 和色 (wa-iro) đã có sẵn: ruri, gunjo, wakatake, akane, shu...
- Tích hợp dữ liệu giả lập với các tenant đang có trong project: godx-admin, Famgia, Betoya, Tempo
- Locale mặc định **vi**, đầy đủ vi/ja/en

**Tweaks (góc dưới):** density · theme · bắt đầu tuần (T2/CN) · ẩn/hiện sự kiện đã từ chối · 5 màu nhận diện 暦 · ngôn ngữ.

Bước tiếp theo có thể làm: thêm trang Settings (kết nối lịch ngoài, working hours, RSVP defaults), trang Inbox lời mời, hoặc embed mini-calendar plugin cho các service khác (giống `chat-plugin`).

