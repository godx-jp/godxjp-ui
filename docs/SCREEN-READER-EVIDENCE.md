# Screen-reader evidence runbook (#171)

> **Bằng chứng này chỉ con người tạo ra được.** Axe, DOM assertion và accessibility-tree
> snapshot **không phải** bằng chứng screen-reader. Không ai — kể cả tự động hoá hay AI — được
> điền một bản ghi `pass` mà không thực sự nghe VoiceOver/NVDA đọc. Bịa bản ghi = nói dối trong
> thư viện a11y nền → ship component hỏng cho người mù nhưng nhãn "đã kiểm". **Tuyệt đối cấm.**

Tài liệu này hướng dẫn người kiểm thử (QA / a11y engineer) tạo bằng chứng screen-reader **thật**
cho từng owner frame, để chuyển ledger từ `screenReader: untested` → `pass`. Đây là phần **duy
nhất** của contract không tự động hoá được: `#171`.

## Vì sao untested là trạng thái HỢP LỆ (không phải lỗi)

Gate `check:screen-reader-evidence` (`scripts/check-screen-reader-evidence.mjs`) **chỉ** đòi đủ
ma trận bằng chứng cho owner nào ledger đã đánh `screenReader.status === "pass"`. Khi export còn
`untested`, `screen-reader-evidence.json` giữ `records: []` và gate **xanh**. Schema v2 vẫn kiểm
mọi record được thêm vào, kể cả record `fail`. Nghĩa là:

- Merge **không bị chặn** bởi export chưa test AT.
- Không được phép "làm cho xanh" bằng cách khai `pass` giả — gate đòi đúng tổ hợp, locale,
  capture method, transcript, timestamp và artifact thật.
- Tiến độ #171 = số owner có bằng chứng thật, tăng dần theo người test, **không** theo deadline code.

## Tổ hợp AT bắt buộc (policy trong `screen-reader-evidence.json`)

Mỗi owner cần được kiểm trên các tổ hợp phù hợp với hành vi của nó:

| Tổ hợp                                   | Khi nào                                                                |
| ---------------------------------------- | ---------------------------------------------------------------------- |
| **VoiceOver + Safari** (macOS hiện hành) | mọi owner tương tác                                                    |
| **NVDA + Firefox** (Windows hiện hành)   | mọi owner tương tác                                                    |
| **NVDA + Chrome** (Windows hiện hành)    | composite phức tạp + live region (toast, async, combobox, tree, table) |

Mỗi tổ hợp áp dụng phải có record riêng cho cả `ja-JP` và `vi-VN`. Danh sách owner phức tạp là
policy có version trong `screen-reader-evidence.json`; khi framework thêm composite/live-region
mới, PR component phải thêm owner đó vào policy này.

## Preflight VoiceOver trên macOS

Trước khi chạy journey, kiểm tra máy có thể lấy **speech thật** từ VoiceOver:

```sh
pnpm check:voiceover-capture
```

Lệnh này không mở Safari, không tổng hợp transcript từ accessibility tree và không tạo record.
Nó chỉ đọc version Safari/VoiceOver, kiểm tra VoiceOver đang chạy và thử API `last phrase`. Nếu
AppleScript control bị khoá, mở **VoiceOver Utility → General → Allow VoiceOver to be controlled
with AppleScript**, bật VoiceOver bằng Command-F5, tương tác với Safari một lần rồi chạy lại.
Chỉ bắt đầu journey khi kết quả có `"ready": true`.

Tham chiếu Apple: [bật AppleScript control trong VoiceOver General settings](https://support.apple.com/en-ca/guide/voiceover/cpvougen/mac)
và [Caption panel hiển thị đúng nội dung VoiceOver đang nói](https://support.apple.com/en-gb/guide/voiceover/unac078/mac).

`voiceover-last-phrase` hợp lệ khi người test lấy phrase sau **từng bước** và lưu log nguyên văn.
Nó không biến một lần đọc cuối cùng thành bằng chứng cho cả journey.

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

## Lược đồ bản ghi v2 (mỗi field BẮT BUỘC, non-empty — gate kiểm)

Thêm vào mảng `records` của `screen-reader-evidence.json`:

```jsonc
{
  "id": "select-vo-safari-ja-20260715",
  "owner": "<đúng owner id trong ledger>",
  "combinationId": "voiceover-safari-macos",
  "operatingSystem": "macOS",
  "operatingSystemVersion": "26.0.1 (25A362)",
  "assistiveTechnology": "VoiceOver",
  "assistiveTechnologyVersion": "10 (993)",
  "browser": "Safari",
  "browserVersion": "26.0.1",
  "locale": "ja-JP",
  "frameUrl": "<URL frame đã test>",
  "journey": "mở combobox → gõ lọc → chọn item bằng phím → xoá",
  "transcript": "\"Country, combo box, collapsed\" … \"Japan, 1 of 3\" … \"Japan, selected\"",
  "captureMethod": "voiceover-last-phrase",
  "evidenceUrl": "https://<link recording có tiếng>",
  "testedAt": "2026-07-15T09:30:00Z",
  "tester": "<người thực sự chạy journey>",
  "verdict": "pass",
}
```

`captureMethod` chỉ nhận `audio-recording`, `at-speech-log`, `voiceover-last-phrase` hoặc
`nvda-speech-viewer`. `evidenceUrl` phải là HTTPS hoặc artifact relative thực sự tồn tại trong repo.
Record `fail` phải có `defectUrl`. Có thể giữ nhiều lần chạy của cùng owner/tổ hợp/locale để không
mất lịch sử; ledger chỉ PASS khi có ít nhất một lần `pass` thật cho mỗi ô bắt buộc. Gate chặn owner
`pass` nếu thiếu bất kỳ tổ hợp/locale bắt buộc nào. JSON Schema để editor/tooling dùng nằm ở
`screen-reader-evidence.schema.json`.

## Definition of done cho #171

- Mỗi public owner tương tác có bản ghi `pass` thật cho **mọi tổ hợp áp dụng × ja-JP/vi-VN**.
- Mọi `fail` đã có issue defect liên kết + owner giữ `untested`/không `pass`.
- `node scripts/check-screen-reader-evidence.mjs` xanh và không có record bị schema/policy từ chối.

## Không được làm

- Điền `transcript`/`evidenceUrl` bịa hoặc suy từ DOM/ARIA-tree.
- Đánh ledger `pass` khi chưa nghe AT thật.
- Dùng axe/accessibility-tree snapshot thay cho announcement thật (chúng đã có ở dimension khác,
  **không** thoả #171).
