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
`untested`, `screen-reader-evidence.json` giữ `records: []` và gate **xanh**. Schema v3 vẫn kiểm
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

## Owner cohort registry (7 nhóm của #171)

Bằng chứng ghi theo **owner journey**, không nhân bản theo từng export. `policy.cohorts` trong
`screen-reader-evidence.json` map mỗi owner vào **đúng một** cohort, và mỗi cohort khai
`requiredPhases` — các pha announcement mà một record `pass` BẮT BUỘC phải có. Gate từ chối
record `pass` thiếu bất kỳ pha nào của cohort.

| Cohort (`id`)              | Owner tiêu biểu                                                        | `requiredPhases`                                                                                                          |
| -------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `landmarks-page-structure` | AppShell, AuthShell, Sidebar, Topbar, PageContainer                    | `landmark-navigation`, `focus-entry`, `internal-navigation`                                                               |
| `native-form-controls`     | Input, Textarea, Checkbox, Radio, Switch, Slider, pickers, Upload, OTP | `focus-entry`, `value-change`, `required-announcement`, `help-announcement`, `invalid-announcement`, `error-announcement` |
| `selection-composites`     | Select, Command, Cascader, TreeSelect, Transfer, TagInput              | `focus-entry`, `internal-navigation`, `activation`, `value-change`, `escape-close`, `focus-return`                        |
| `overlays`                 | Dialog, AlertDialog, Sheet, Popover, Tooltip, HoverCard, menus         | `focus-entry`, `internal-navigation`, `escape-close`, `focus-return`                                                      |
| `navigation-composites`    | Tabs, Toolbar, Menubar, NavigationMenu, Pagination, Steps, Breadcrumb  | `focus-entry`, `internal-navigation`, `activation`                                                                        |
| `data-structures`          | DataTable, Table, TreeList, Carousel, charts alternative text          | `focus-entry`, `internal-navigation`, `activation`                                                                        |
| `live-async-feedback`      | Alert, Toaster, DataState, InfiniteQueryState, MutationFeedback        | `loading-announcement`, `success-announcement`, `error-announcement`, `recovery-announcement`                             |

Quy tắc gate:

- **Owner chưa map cohort thì KHÔNG thể rời `untested`.** Owner mới (hoặc owner tĩnh lâu nay) phải
  được thêm vào cohort trong chính PR ghi bằng chứng cho nó.
- `requiredPhases` chỉ được **mở rộng**, không được thu hẹp; baseline 7 cohort được hard-code trong
  `scripts/check-screen-reader-evidence.mjs`.
- Một owner chỉ thuộc **một** cohort; trùng cohort là lỗi gate.

## N/A cho owner tĩnh / trang trí

Owner thật sự không có journey AT (separator trang trí, spacer…) rời `untested` bằng một **N/A đã
review**, không phải bằng `pass`. Thêm vào `policy.notApplicable`:

```jsonc
{
  "target": "InputOTPSeparator",
  "scope": "export", // "export" hoặc "owner"
  "reason": "<≥40 ký tự, nói rõ vì sao KHÔNG tồn tại announcement để ghi>",
  "reviewedBy": "<người review thật>",
  "reviewedIn": "https://<link PR/commit review>",
  "reviewedAt": "2026-07-12T00:00:00Z",
}
```

Gate ép: mọi export mà ledger đánh `not-applicable` phải có entry tương ứng; ngược lại entry
`notApplicable` không khớp ledger nào là lỗi (không được "duyệt trước" N/A hàng loạt). Owner đã nằm
trong một cohort tương tác **không thể** bị waive.

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

## Lược đồ bản ghi v3 (mỗi field BẮT BUỘC, non-empty — gate kiểm)

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
  "entryCommand": "VO-Right cho tới khi tới combobox",
  "journey": "mở combobox → gõ lọc → chọn item bằng phím → Escape → xoá",
  "steps": [
    { "phase": "focus-entry", "command": "VO-Right", "announced": "<nguyên văn AT đọc>" },
    { "phase": "internal-navigation", "command": "Down Arrow", "announced": "<nguyên văn>" },
    { "phase": "activation", "command": "Enter", "announced": "<nguyên văn>" },
    { "phase": "value-change", "command": "Enter", "announced": "<nguyên văn>" },
    { "phase": "escape-close", "command": "Escape", "announced": "<nguyên văn>" },
    { "phase": "focus-return", "command": "—", "announced": "<nguyên văn>" },
  ],
  "transcript": "<transcript nguyên văn của cả lượt chạy>",
  "captureMethod": "voiceover-last-phrase",
  "evidenceUrl": "audit-evidence/screen-reader/select-vo-safari-ja-20260715.m4a",
  "testedAt": "2026-07-15T09:30:00Z",
  "tester": "<người thực sự chạy journey>",
  "verdict": "pass",
}
```

`phase` chỉ nhận: `landmark-navigation`, `focus-entry`, `internal-navigation`, `activation`,
`value-change`, `escape-close`, `focus-return`, `required-announcement`, `help-announcement`,
`invalid-announcement`, `error-announcement`, `loading-announcement`, `success-announcement`,
`recovery-announcement`. Record `pass` phải phủ **đủ** `requiredPhases` của cohort mà owner thuộc về
(bảng ở trên) — đây chính là cách #171 ép "error/help/required/invalid cho form owner" và
"loading/success/error/recovery cho live/async owner".

`captureMethod` chỉ nhận `audio-recording`, `at-speech-log`, `voiceover-last-phrase` hoặc
`nvda-speech-viewer`. `evidenceUrl` phải là HTTPS hoặc artifact relative thực sự tồn tại trong repo.
Record `fail` phải có `defectUrl`. Có thể giữ nhiều lần chạy của cùng owner/tổ hợp/locale để không
mất lịch sử; ledger chỉ PASS khi có ít nhất một lần `pass` thật cho mỗi ô bắt buộc. Gate chặn owner
`pass` nếu thiếu bất kỳ tổ hợp/locale bắt buộc nào. JSON Schema để editor/tooling dùng nằm ở
`screen-reader-evidence.schema.json`.

## Người test nộp bằng chứng ở đâu (checklist)

1. **Artifact ghi âm/speech log** → `audit-evidence/screen-reader/<record-id>.<ext>`
   (`.m4a`/`.mov` cho audio-recording, `.txt` cho NVDA Speech Viewer / VoiceOver log). Hoặc dùng
   link HTTPS nếu file quá lớn cho repo. Đường dẫn relative phải **thực sự tồn tại** — gate kiểm
   bằng `fs.existsSync`.
2. **Bản ghi JSON** → append vào mảng `records` của **`screen-reader-evidence.json`** ở gốc repo.
   Đây là file duy nhất chứa bản ghi; đừng tạo file evidence riêng.
3. **Chỉ khi đủ ma trận** (mọi tổ hợp áp dụng × `ja-JP` + `vi-VN`, tất cả `verdict: pass`) mới sửa
   `frame-coverage.json` để owner đó thành `screenReader: pass`. Sửa trước → gate đỏ.
4. **Chạy gate tại chỗ**:
   ```sh
   pnpm check:screen-reader-evidence
   pnpm vitest run src/screen-reader-evidence.test.ts
   ```
   Gate cũng chạy trong `pnpm check:frame-contracts` → `pnpm verify:release`.
5. **Nếu `fail`**: giữ bản ghi (đừng xoá), thêm `defectUrl` trỏ issue defect, owner **giữ
   `untested`**. Sau khi fix, chạy lại journey và thêm bản ghi `pass` mới (id mới).

## Definition of done cho #171

- Mỗi public owner tương tác được map vào **đúng một** cohort trong `policy.cohorts`.
- Mỗi public owner tương tác có bản ghi `pass` thật cho **mọi tổ hợp áp dụng × ja-JP/vi-VN**, và mỗi
  bản ghi `pass` phủ đủ `requiredPhases` của cohort đó.
- Mọi owner tĩnh/trang trí có entry `policy.notApplicable` đã review (có `reason`, `reviewedBy`,
  `reviewedIn`, `reviewedAt`).
- Mọi `fail` đã có issue defect liên kết + owner giữ `untested`/không `pass`.
- `node scripts/check-screen-reader-evidence.mjs` xanh và không có record bị schema/policy từ chối.

## Không được làm

- Điền `transcript`/`evidenceUrl` bịa hoặc suy từ DOM/ARIA-tree.
- Đánh ledger `pass` khi chưa nghe AT thật.
- Dùng axe/accessibility-tree snapshot thay cho announcement thật (chúng đã có ở dimension khác,
  **không** thoả #171).
