# Cái gì đáng đưa vào @godxjp/ui

Một design system hỏng theo hai hướng ngược nhau, và cả hai đều hỏng thật:

- **Quá hẹp** — thiếu prop, nên consumer buộc phải lách bằng class hoặc mã màu
  gõ tay. Đây là hướng đang hỏng: một lượt kiểm trên godx-chat (08/09/2026) ra
  **51 lỗi, 42 trong đó đến từ ĐÚNG MỘT prop còn thiếu** (đệm trên primitive bố
  cục).
- **Quá rộng** — nhận mọi yêu cầu, thành một đống prop không ai nhớ, và mỗi
  prop là một mảnh DOM nội bộ bị đóng băng thành API công khai.

Tài liệu này là bộ lọc giữa hai hướng đó. Nó cố tình viết thành câu hỏi **trả
lời được bằng có/không**, không phải nguyên tắc để cảm nhận.

---

## Ba câu hỏi — phải ĐỦ CẢ BA

### 1. Có phải consumer KHÔNG CÓ nước đi hợp lệ nào không?

Không phải "bất tiện". Là **bất khả**: mọi prop và token đang có đều không nói
được điều cần nói, và mọi đường còn lại đều bị `ui-audit` chặn.

- ✅ Thiết kế cần 12px giữa hai phần tử trên một HÀNG. Thang bậc tên đọc trục
  dọc nên `md` = 16px; làm tròn thì lệch bố cục; viết `gap: 12px` thì
  `no-arbitrary-spacing` chặn. **Không có nước đi.** → gh#401, đã vá.
- ❌ "Viết `<Flex gap={3}>` dài hơn `gap-3`." Có nước đi, chỉ là dài hơn.

Cách kiểm: viết ra đoạn mã bạn _muốn_ viết, chạy `ui-audit` lên nó. Nếu nó
xanh, bạn đã có nước đi.

### 2. Nó thuộc về HÌNH DẠNG của component, hay thuộc về NỘI DUNG của một màn?

Design system sở hữu hình dạng. Màn hình sở hữu nội dung.

- ✅ `Flex` không có đệm. Mọi hàng/cột trong mọi ứng dụng đều có thể cần đệm.
- ✅ `TableHead` không có trục căn lề. Mọi bảng có cột số đều cần.
- ❌ "Bảng quản trị thành viên cần cột vai trò rộng 8rem." Đó là màn hình ấy.
- ❌ "Dashboard cần bốn thẻ chỉ số xếp ngang." Đó là bố cục của một trang.

Câu hỏi phụ khi phân vân: **consumer thứ hai có gặp không?** Nếu câu trả lời là
"chắc là không" thì gần như luôn là nội dung, không phải hình dạng.

### 3. Diễn đạt được thành một TRỤC CÓ TÊN không?

Một prop phải gọi được **ý định**, không chỉ mở một lỗ.

- ✅ `pad={{ blockStart: 3 }}` — trục logic, bậc thang, đọc ra nghĩa.
- ❌ `styles={{ body: {...}, header: {...} }}` — không phải một trục; nó là một
  lỗ tự do, và nó đóng băng tên khe DOM nội bộ thành API công khai. Xem mục
  "Không đáng" bên dưới.

---

## Bốn dấu hiệu MẠNH — một cái là đủ để ưu tiên làm ngay

Ba câu trên quyết định _có thuộc về đây không_. Bốn dấu hiệu này quyết định
_làm trước hay sau_.

### a. Nó chặn một yêu cầu TIẾP CẬN

Không thương lượng, làm trước.
Ví dụ đã gặp: vòng tiêu điểm của Input là 1px (antd hạ xuống có chủ ý), không
đạt WCAG 2.4.11 vốn đòi vùng chỉ báo tương đương đường 2px. Và `FormRoot` không
có móc `onInvalid`, nên không đưa được tiêu điểm về trường lỗi đầu tiên — WCAG
3.3.1 / 2.4.3.

### b. Nó hỏng IM LẶNG

Không lỗi biên dịch, không test đỏ, không cảnh báo — chỉ sai.
Ví dụ đã gặp: `AppShell` nhận cả `logo` lẫn `topbar` nhưng `resolvedTopbar` trả
thẳng `topbar`, nên `logo` **không bao giờ được vẽ**. godx-chat truyền cả hai
suốt nhiều tháng và không ai phát hiện.

Lớp lỗi này đắt gấp nhiều lần lớp lỗi ồn ào, vì nó không có ai báo.

### c. Đếm được

Một khoảng trống đẻ ra N lỗi audit là một khoảng trống có số đo, không phải một
ý kiến. 42 lỗi từ một prop thiếu là một ưu tiên; một lỗi từ một prop thiếu thì
chưa chắc.

### d. Nó BẤT ĐỐI XỨNG với thứ đã có

Nếu trục dọc có `xl` mà trục ngang không có, khoảng trống ấy gần như luôn là
**quên**, không phải quyết định. Sửa cho cân là rẻ và không tranh cãi.

---

## Cái KHÔNG đáng vào — và vì sao

**Bố cục của một màn hình cụ thể.** Nó thuộc về màn hình đó. Nếu ba màn cùng
cần, lúc ấy nó đã thành hình dạng và quay lại câu hỏi 2.

**Một giá trị dùng đúng một lần.** Đừng đẻ prop cho nó — dùng cửa thoát
(`gapRaw`, `padRaw`). Cửa thoát để lại `data-*-raw` trên DOM nên đếm được; khi
số đếm ấy lớn lên, ĐÓ mới là lúc nó thành một trục đáng có tên.

**Lỗ kiểu dáng tự do** (`styles={{ slot }}`, `classNames={{ slot }}`). Nó đóng
băng cấu trúc DOM nội bộ thành API công khai, và audit **không đếm được** nó
(một object style dựng ở đâu cũng được rồi spread vào). Nó cũng ngược hẳn với
`style: 0/289` — lập trường nhất quán hiện nay là cho prop ý định, không cho lỗ
kiểu dáng.

**Gu thẩm mỹ.** "Dùng nhiều khoảng trắng", "hai màu nhấn là đủ", "tránh lưới
bento". Không kiểm chứng được, không cổng nào canh, và khi nó tới tay agent
TRƯỚC luật cứng thì kết quả là mã đẹp mà sai hợp đồng.

**Thứ chỉ tiết kiệm vài dòng ở call site.** Nếu đường hiện tại đã hợp lệ và
đọc được, việc rút ngắn nó không phải việc của design system.

---

## Thêm rồi thì NỢ gì

Một prop mới chưa xong khi nó biên dịch được. Ba việc bắt buộc, và cả ba đều đã
có cổng CI:

1. **Vào catalog.** Chạy `node scripts/gen-component-api-manifest.mjs`.
   `check:component-api-manifest` canh việc này. **Không vào catalog thì agent
   không biết nó tồn tại** — và đó không phải giả thuyết: `pad`/`padRaw` được
   thêm vào gói nhưng catalog phát hành chưa có, nên một agent tra MCP đúng quy
   trình vẫn kết luận "Flex chỉ có gap" và bỏ cuộc trước 21 lỗi mà nó có thể
   sửa.

2. **Có bằng chứng phủ từng nhánh giá trị.** `component-case-evidence.json` +
   `check:frame-coverage-ledger`. Bằng chứng phải trỏ vào test THẬT SỰ chạy qua
   nhánh ấy, không phải một tệp cho có.

3. **Có ví dụ BIÊN DỊCH ĐƯỢC.** Hậu quả đo được khi không kiểm: pattern
   `confirm-destructive` truyền cho `Dialog` một prop `mode` không tồn tại,
   hướng dẫn DataTable dùng `variant="success"` (chính thứ luật
   `status-tone-not-variant` cấm), và ví dụ `Input` gọi một prop
   `onValueChange` không có thật. Agent chép chúng và viết ra mã hỏng.

   Ba chỗ ấy đã sửa, và `check:doc-prop-existence` nay bắt được lớp lỗi đó.
   Lưu ý khi viết tài liệu: cổng ấy đọc mọi đoạn JSX trong `docs/**` như mã
   THẬT, nên **trích dẫn một API sai để làm ví dụ cũng bị bắt**. Mô tả bằng lời
   như đoạn trên, đừng dán một thẻ JSX hoàn chỉnh vào.

---

## Một lợi ích ẩn của việc rời Radix, đo được

`check:doc-prop-existence` canh chiều "mọi prop dùng trong ví dụ đều phải tồn
tại" — chính lớp lỗi khiến agent chép ví dụ rồi viết ra mã hỏng (prop `mode`
trên `Dialog`, prop `onValueChange` trên `Input`). Nhưng nó **bỏ qua mọi
component bọc primitive bên thứ ba**, vì với chúng manifest chỉ là cận dưới:
prop thật nằm trong types của Radix, generator không mở ra được.

Số đo (08/09/2026):

|                                               | component KHÔNG kiểm được |
| --------------------------------------------- | ------------------------- |
| `main`                                        | **139 / 289**             |
| `feat/v20-react-aria` (6 primitive đã chuyển) | **126 / 289**             |

Mỗi primitive rời Radix là `declaredIn` chuyển từ `node_modules` vào `src/`, và
component đó **bước vào vùng kiểm được**. Sáu primitive đầu đã gỡ rào cho 13
component.

Nên đợt đổi nền không chỉ là thay thư viện. Nó là cách duy nhất làm cho 126
component còn lại có thể được canh — và trong số đó có `Dialog`, `Input`,
`Badge`, tức đúng những component mà ví dụ sai đã lọt qua.

## Khi câu trả lời là "không thuộc về đây"

Nói ra ở chỗ gặp nó, bằng mã:

```tsx
/*
 * KHÔNG thuộc về design system: bề rộng này là số đo của riêng màn hình
 * quản trị thành viên, không phải một trục của Table. Nếu màn thứ hai cần
 * cùng thứ, lúc đó mở issue.
 */
```

Một dòng như thế đáng giá hơn một issue mở rồi bỏ đấy — nó nói cho người sau
biết ai đã cân nhắc, và cân nhắc ra sao.
