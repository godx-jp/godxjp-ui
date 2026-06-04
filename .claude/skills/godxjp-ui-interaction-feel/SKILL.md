---
name: godxjp-ui-interaction-feel
description: >-
  BẮT BUỘC đọc khi xây/sửa/audit BẤT KỲ component có state hoặc tương tác (select, tree, cascader,
  calendar/range, combobox, checkbox-group, stepper, async list…). Đây là catalog các hành vi UX
  TINH TẾ mà người dùng MẶC ĐỊNH mong đợi — thứ phân biệt "chạy được" với "thấy đúng". Mỗi pattern:
  kỳ vọng · cách hỏng thường gặp · cách verify. Dùng kèm Audit Evidence Ledger (godxjp-ui-example-page).
---

# Interaction feel — những hành vi "đúng cảm giác", không chỉ "chạy được"

Một control **render đúng** chưa đủ. Nó phải **phản hồi trạng thái một cách trung thực** dưới
click/gõ/hover/tab thật. Hầu hết lỗi UX ở đây **không lộ trên screenshot tĩnh** — phải tự tay drive
trong browser thật (Chrome DevTools MCP) và đọc console.

> **Luật cốt lõi — Trung thực trạng thái (state truthfulness):** mọi affordance hiển thị (checkbox,
> badge đếm, highlight, nhãn, ô đang mở) phải phản ánh ĐÚNG trạng thái thật. Một affordance "chết"
> (luôn trống dù có dữ liệu), hay chỉ phản ánh MỘT PHẦN sự thật, là lỗi — kể cả khi không có exception.

Mỗi mục dưới đây là một bug THẬT đã gặp ở repo này. Đọc như một danh sách "phải tự kiểm", không phải
lý thuyết.

---

## 1. Chọn phân cấp (tree / cascader) — cha phải tổng hợp trạng thái con

- **Kỳ vọng:** trong cây có checkbox, một node CHA phản ánh các lá con của nó:
  **chọn hết con → cha `checked`; chọn một phần → cha `indeterminate` (gạch −); không con nào → trống.**
  Lá disabled/`disableCheckbox` **không tính vào mẫu số** (không bao giờ chọn được → không được chặn cha
  hiện đủ).
- **Cách hỏng:** checkbox cha "chết" — luôn trống dù con đã chọn (vì trong multiple mode cha không
  path-select được, click cha chỉ expand). Người dùng nhìn cây không biết nhánh nào đang có chọn.
- **Verify:** chọn 1/2 con → cha gạch ngang; chọn 2/2 → cha tick; bỏ hết → cha trống. (Cascader: đã fix
  bằng `aggregateCheckState` + `CheckboxVisual indeterminate`.)
- **Ghi chú phạm vi:** nếu model là "chọn path độc lập" (value = `string[][]`) thì cha là **chỉ báo
  read-only**, click cha vẫn expand (điều hướng); KHÔNG biến click-cha thành toggle-all trừ khi tách
  được vùng click (mà không lồng `<button>` trong `<button>` — xem §8).

## 2. Chọn nhiều bước / range — reset-on-complete, không kẹt

- **Kỳ vọng:** khi một selection nhiều bước (date **range**, multi có giới hạn, wizard) đã HOÀN TẤT,
  thao tác kế tiếp phải cho **bắt đầu lại từ đầu**, không sửa lén một đầu mút.
- **Cách hỏng:** range đã đủ (from+to), click ngày mới chỉ co/giãn quanh `from` cũ → không đặt lại được
  ngày bắt đầu (react-day-picker mặc định `resetOnSelect:false`).
- **Verify / fix:** seed một range đầy → click ngày khác phải mở range MỚI từ ngày đó. Dùng
  `resetOnSelect:true`. [[feedback_no_partial_verification]]

## 3. Giá trị-khi-nghỉ phải nhìn thấy ngay khi mở

- **Kỳ vọng:** mở một control đã có value (calendar/dropdown/cascader/combobox) phải **nhảy tới đúng
  value** — calendar mở đúng tháng (`defaultMonth`), cascader **expand sẵn cả path** + highlight lá,
  dropdown scroll tới item đang chọn.
- **Cách hỏng:** mở ra hiện tháng hôm nay / cột gốc thu gọn → giá trị đang giữ bị giấu, người dùng phải
  dò lại từ đầu.
- **Verify:** mở control khi đã có sẵn value → value đó nằm trong tầm nhìn, ở trạng thái highlight.

## 4. Hover-intent — đừng huỷ trạng thái khi chuột "đi ngang"

- **Kỳ vọng:** với mở-rộng-theo-hover (cascader cột, menu con), khi chuột di chuyển HƯỚNG TỚI cột/menu
  sâu hơn, các cấp đã mở phải **giữ nguyên** để với tới được.
- **Cách hỏng:** `onMouseLeave` ở mỗi cột collapse cột sâu hơn ngay khi chuột rời → lá depth-3 không
  bao giờ click được (chuột vừa rời col2 là col3 biến mất).
- **Verify / fix:** lái expansion bằng `onMouseEnter` từng node (cha mở, lá truncate sâu hơn); **không**
  collapse trên column mouseleave. Hover tới tận lá sâu nhất rồi click — phải chọn được.

## 5. Đúng độ chi tiết của "không khả dụng": disabled vs disableCheckbox vs read-only

- **Kỳ vọng:** phân biệt rõ — `disabled` (cả node: không chọn, vẫn có thể là không điều hướng được),
  `disableCheckbox` (CHỈ ô chọn bị khoá, node vẫn navigate vào con được), read-only-có-value (hiển thị
  giá trị, ẩn nút clear).
- **Cách hỏng:** bỏ qua `disableCheckbox` → vẫn tick được dù cờ nói không; hoặc disable nhầm cả node
  khi chỉ định khoá ô chọn.
- **Verify:** cờ nào honor cờ đó. Nhất quán với component họ hàng (TreeSelect honor `disableCheckbox`
  → Cascader cũng phải). Disabled trigger phải **không mở** được (click không phản hồi).

## 6. Tóm tắt/đếm/nhãn phải nói SỰ THẬT — và nói bằng NGÔN NGỮ NGƯỜI

- **Kỳ vọng:** badge "選択数: N", "選択パス: …", chip tóm tắt phải khớp value thật; và hiện **nhãn**
  (`営業費用 / 販売費`) chứ KHÔNG phải mã value (`operating › selling`). Resolve qua cây / callback
  node-đã-giải, không `value.join()`.
- **Cách hỏng:** đếm sai sau toggle; readout in mã máy; số nhiều sai ("1 items").
- **Verify:** mỗi lần thay đổi selection, đối chiếu badge/summary với thao tác vừa làm.

## 7. Trạng thái async/rỗng/lỗi phải có affordance THẬT

- **Kỳ vọng:** đang tải → spinner/skeleton + disable thao tác đang chờ; rỗng → `EmptyState` đàng hoàng
  (không phải mảng xám); lỗi → thông điệp + cách thử lại. Optimistic update thì phải reconcile khi fail.
- **Cách hỏng:** no-op resolve tức thì (spinner không kịp hiện); danh sách rỗng để trống trơn.
- **Verify:** thêm delay thật vào demo `queryFn`/`uploadFn` để thấy trạng thái chờ; ép nhánh rỗng/lỗi.

## 8. Cấu trúc DOM của control tương tác — không lồng control trong control

- **Kỳ vọng:** một `<button>` (hay control tương tác) **không** chứa `<button>`/input/checkbox tương
  tác khác — invalid HTML + hydration error, và phá ngữ nghĩa bàn phím.
- **Cách hỏng:** nút clear `<button>` nằm trong trigger `<button>`; Radix `Checkbox` (vốn là `<button>`)
  đặt trong row `<button role=option>`.
- **Verify / fix:** **mở console — cảnh báo `<button> in <button>` / hydration là FINDING.** Tách control
  con ra ngoài (overlay sibling `pointer-events-none`/`-auto`), hoặc thay bằng glyph trang trí không
  tương tác (span). Selection nằm ở control bao ngoài.

## 9. Trả focus + không bẫy focus

- **Kỳ vọng:** đóng popover/dialog/sheet → focus quay về trigger; Esc đóng; Tab không lọt ra sau overlay;
  không positive tabindex.
- **Verify:** mở bằng bàn phím → thao tác → Esc → focus về đúng trigger.

---

## Cách dùng skill này

1. **Trước khi build/sửa** một control có state: đọc lướt 9 mục, chọn mục liên quan, thiết kế cho ĐÚNG
   ngay từ đầu.
2. **Khi audit:** mỗi mục là một dòng bằng chứng trong **Audit Evidence Ledger**
   (`godxjp-ui-example-page`). Drive thật, mở console, đối chiếu affordance ↔ trạng thái thật.
3. **Khi phát hiện một hành vi tinh tế MỚI** chưa có ở đây → bổ sung ngay một mục (kỳ vọng · cách hỏng ·
   verify), để lần sau bắt được bằng thiết kế.

Quan hệ: bổ trợ **godxjp-ui-component §2e** (correctness gate) và **godxjp-ui-best-ux** (taste). Skill
kia hỏi "đúng/đủ không"; skill này hỏi "**có ĐÚNG CẢM GIÁC không**".
