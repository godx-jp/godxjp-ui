# Screen-reader evidence runbook (#171)

> **Bằng chứng này chỉ con người tạo ra được.** Axe, DOM assertion và accessibility-tree
> snapshot **không phải** bằng chứng screen-reader. Không ai — kể cả tự động hoá hay AI — được
> điền một bản ghi `pass` mà không thực sự nghe VoiceOver/NVDA đọc. Bịa bản ghi = nói dối trong
> thư viện a11y nền → ship component hỏng cho người mù nhưng nhãn "đã kiểm". **Tuyệt đối cấm.**

Tài liệu này hướng dẫn người kiểm thử (QA / a11y engineer) tạo bằng chứng screen-reader **thật**
cho từng owner frame, để chuyển ledger từ `screenReader: untested` → `pass`. Đây là phần **duy
nhất** của contract không tự động hoá được: `#171`.

## Vì sao untested là trạng thái HỢP LỆ (không phải lỗi)

Gate `check:screen-reader-evidence` (`scripts/check-screen-reader-evidence.mjs`) **chỉ** đòi bản
ghi bằng chứng cho owner nào ledger đã đánh `screenReader.status === "pass"`. Khi export còn
`untested`, `screen-reader-evidence.json` giữ `records: []` và gate **xanh**. Nghĩa là:

- Merge **không bị chặn** bởi export chưa test AT.
- Không được phép "làm cho xanh" bằng cách khai `pass` giả — gate sẽ đòi 12 field + transcript thật.
- Tiến độ #171 = số owner có bằng chứng thật, tăng dần theo người test, **không** theo deadline code.

## Tổ hợp AT bắt buộc (policy trong `screen-reader-evidence.json`)

Mỗi owner cần được kiểm trên các tổ hợp phù hợp với hành vi của nó:

| Tổ hợp | Khi nào |
|---|---|
| **VoiceOver + Safari** (macOS hiện hành) | mọi owner tương tác |
| **NVDA + Firefox** (Windows hiện hành) | mọi owner tương tác |
| **NVDA + Chrome** (Windows hiện hành) | composite phức tạp + live region (toast, async, combobox, tree, table) |

## Quy trình cho 1 owner frame

1. **Lấy danh sách cần test.** Owner còn `untested` = worklist. Liệt kê từ ledger:
   ```sh
   node scripts/check-frame-coverage.mjs \
     | node -e 'const l=JSON.parse(require("fs").readFileSync(0));\
       for(const e of l.entries) if(e.dimensions.screenReader.status!=="pass") console.log(e.owner, e.frameUrl||"")'
   ```
2. **Mở frame** ở URL của owner (preview build) trên đúng OS/AT/browser của tổ hợp.
3. **Bật screen reader** và thực hiện **journey** thật của component (không chỉ focus tĩnh): mở/đóng,
   chọn, gõ, xoá, điều hướng bàn phím, lỗi, trạng thái async/live-region — đúng cái người dùng làm.
4. **Ghi lại máy đọc ra gì** — `transcript`: chép **nguyên văn** chuỗi announcement AT phát ra ở
   mỗi bước (role + name + state + thay đổi). Đây là dữ liệu cốt lõi; đừng diễn giải, chép thật.
5. **Quay màn hình có tiếng** (hoặc log AT) → upload → lấy `evidenceUrl` (link xem lại được).
6. **Kết luận** `verdict`:
   - `pass` — AT đọc đúng role/name/state + mọi thay đổi được thông báo, không sót/không sai.
   - `fail` — thiếu/sai announcement (ghi rõ trong transcript). **Fail vẫn phải ghi bản ghi** để
     làm bằng chứng defect; đừng để `pass` giả.
7. **Chỉ khi `verdict: pass`** mới được đổi ledger owner đó sang `screenReader: pass` (xem cách đổi
   trong `docs/FRAME-A11Y-CI.md`). `fail` → giữ `untested`/mở issue defect, KHÔNG `pass`.

## Lược đồ bản ghi (mỗi field BẮT BUỘC, non-empty — gate kiểm)

Thêm vào mảng `records` của `screen-reader-evidence.json`:

```jsonc
{
  "owner": "<đúng owner id trong ledger>",
  "operatingSystem": "macOS 15.5",
  "assistiveTechnology": "VoiceOver",
  "assistiveTechnologyVersion": "macOS 15.5 build 24F74",
  "browser": "Safari",
  "browserVersion": "18.5",
  "locale": "en-US",
  "frameUrl": "<URL frame đã test>",
  "journey": "mở combobox → gõ lọc → chọn item bằng phím → xoá",
  "transcript": "\"Country, combo box, collapsed\" … \"Japan, 1 of 3\" … \"Japan, selected\"",
  "evidenceUrl": "https://<link recording có tiếng>",
  "testedAt": "2026-07-13",
  "verdict": "pass"
}
```

Gate `check:screen-reader-evidence` sẽ fail nếu: owner `pass` mà thiếu bản ghi; bản ghi thiếu bất
kỳ field nào ở trên; `verdict` không phải `pass`/`fail`; ledger khai `pass` từ bản ghi `verdict != pass`;
hoặc bản ghi trỏ owner không tồn tại. → Không có đường tắt điền giả.

## Definition of done cho #171

- Mỗi public owner tương tác có ≥1 bản ghi `pass` thật trên các tổ hợp AT bắt buộc áp dụng cho nó.
- Mọi `fail` đã có issue defect liên kết + owner giữ `untested`/không `pass`.
- `node scripts/check-screen-reader-evidence.mjs` xanh (số passing owner == số bản ghi hợp lệ).

## Không được làm

- Điền `transcript`/`evidenceUrl` bịa hoặc suy từ DOM/ARIA-tree.
- Đánh ledger `pass` khi chưa nghe AT thật.
- Dùng axe/accessibility-tree snapshot thay cho announcement thật (chúng đã có ở dimension khác,
  **không** thoả #171).
