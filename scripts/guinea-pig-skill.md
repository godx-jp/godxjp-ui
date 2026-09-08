---
name: godx-ui-guinea-pig
description: "Bắt buộc cho mọi kho là consumer CHUỘT BẠCH của @godxjp/ui. Kích hoạt khi: dựng hay sửa bất kỳ màn hình nào, gặp một prop còn thiếu, định viết class Tailwind để lách, định tự dựng component thay cho thứ DS đã có, chạy ui-audit, hoặc thấy chú thích 'chờ upstream'. Dạy MỘT việc mà không tài liệu nào khác dạy: cách KHÉP VÒNG từ 'app thiếu gì' sang 'DS đã sửa, đã phát hành, app đã nâng, vá tạm đã gỡ'. Không dùng cho consumer thường — chuột bạch có nghĩa vụ sửa ngược lên DS, consumer thường thì không."
---

# Consumer chuột bạch của @godxjp/ui

> Bản gốc của tệp này nằm ở kho `godx-jp/godxjp-ui`. Sửa thì sửa ở đó rồi chép
> sang các consumer, đừng sửa bản chép — kho này đã hỏng đúng kiểu ấy một lần
> với catalog MCP (xem §4).

## 0. Bạn có HAI việc, không phải một

Việc thứ nhất là làm xong màn hình. Việc thứ hai là **để lại design system tốt
hơn lúc bạn gặp nó**. Chuột bạch là kho mà `@godxjp/ui` bị dùng thật lần đầu;
mọi khoảng trống lộ ra ở đây mà không được sửa ngược lên sẽ là khoảng trống
**vĩnh viễn** cho mọi consumer sau.

Vì vậy một bản vá tạm ở đây không phải là "nợ kỹ thuật của app". Nó là hai lần
thất bại: màn hình lệch chuẩn, VÀ khoảng trống bị giấu đi.

Bạn được toàn quyền sửa `@godxjp/ui`. Đó là điều kho này tồn tại để làm.

## 1. Trước khi viết dòng JSX đầu tiên

Định vị bản checkout của DS. Không có thì clone:

```bash
ls ~/Herd/godxjp-ui 2>/dev/null || git clone git@github.com:godx-jp/godxjp-ui.git ~/Herd/godxjp-ui
cd ~/Herd/godxjp-ui && pnpm install       # DS dùng pnpm, consumer thường dùng npm — đừng lẫn
```

Và hỏi MCP `godxjp-ui`, đừng đoán tên prop: `search_components`, `get_component`,
`get_tokens`. **Catalog là nguồn sự thật, không phải trí nhớ của bạn.**

## 2. Kỷ luật — thứ bị cấm kể cả khi "chỉ tạm thôi"

Mười luật ở `docs/CONSUMER-RULES.md` của DS là hàng rào, `ui-audit` cưỡng chế
chúng. Không chép lại ở đây. Ba điều cấm riêng của **chuột bạch**:

1. **Tự dựng component thay cho thứ DS đã có hoặc lẽ ra phải có.** Hộp tự vẽ
   thay `Card`, hàng tự ghép thay `ListRow`, palette tự viết thay
   `CommandPalette`.
2. **Dùng class tiện ích để lách một prop còn thiếu** — `gap-3`, `p-4`,
   `w-[240px]`, `text-muted-foreground`.
3. **Gõ mã màu hex hay số đo ngoài thang token.**

Thước đo, chạy trước mọi lần review:

```bash
node node_modules/@godxjp/ui/scripts/ui-audit.mjs resources/js   # 0 lỗi là mức đạt
```

Một lỗi bạn **không sửa được ở phía consumer** chính là một khoảng trống của DS.
Nó là đầu vào của §3, không phải một ngoại lệ để nới.

## 3. Vòng lặp — sáu bước, và nó phải KHÉP

Đây là phần không tài liệu nào khác có. `design-to-page` và `compose-a-screen`
đều dừng ở `report-bug`; mở issue rồi để đó là hỏng nửa vời.

### Bước 1 — Chứng minh đó là khoảng trống, đừng cảm thấy

Viết ra đúng đoạn mã bạn **muốn** viết, rồi chạy `ui-audit` lên nó.
**Xanh nghĩa là bạn đã có nước đi** — dùng nó, dừng ở đây.

Chỉ khi mọi prop và token hiện có đều không nói được điều cần nói, VÀ mọi đường
còn lại đều bị audit chặn, thì mới là bất khả.

### Bước 2 — Ba câu hỏi, phải đủ cả ba

Đọc `docs/WHAT-BELONGS-HERE.md` của DS. Tóm tắt không thay thế nó:

1. Consumer có thật sự **không có nước đi hợp lệ** nào không? (không phải "bất tiện")
2. Nó thuộc về **hình dạng** của component, hay **nội dung** của một màn?
3. Consumer **khác** có cần không?

Trượt bất kỳ câu nào → dựng ở consumer, và ghi rõ TRONG MÃ vì sao nó không
thuộc về DS.

### Bước 3 — Sửa trong DS, và sửa đủ bốn chỗ

```
src/…            mã
src/…/__tests__/ test (§5)
mcp/src/data/    catalog (§4 — chỗ hay quên nhất, và tốn kém nhất)
docs/            nếu đổi hợp đồng công khai
```

Thứ tự ưu tiên, chỉ tiến khi bước trước thật sự không diễn đạt nổi:
**dùng → ghép → thêm prop vào component đã có → tạo component mới.**
Một prop nữa hơn một component nữa.

### Bước 4 — Kiểm bằng tarball TRƯỚC khi phát hành

Đây là bước làm cho "vừa làm vừa trải nghiệm" thành thật. Đừng phát hành rồi
mới biết mình sửa trượt.

```bash
cd ~/Herd/godxjp-ui
pnpm build && npm pack                    # ra @godxjp-ui-<version>.tgz
cd <kho consumer>
npm install ~/Herd/godxjp-ui/godxjp-ui-<version>.tgz
```

Rồi chạy màn hình thật với bản sửa: `ui-audit` phải sạch **và** đoạn mã bạn
muốn viết ở Bước 1 phải chạy đúng. Nếu kho có bộ trình duyệt, chạy nó.

**Xong việc thì hoàn nguyên `package.json` về bản registry** — đừng để một
tarball đường dẫn máy bạn lọt vào commit. `main` phải `npm ci` được từ registry.

### Bước 5 — Cổng của DS

```bash
# = verify:ci:static + check:frame-contracts + pnpm test, tức ĐÚNG những gì ci.yml chạy.
cd ~/Herd/godxjp-ui && pnpm verify:ci
```

**Không nới, không tắt, không thêm ngoại lệ để lấy màu xanh.** Một cổng đỏ là
một câu hỏi, không phải một chướng ngại. Nếu bạn tin cổng ấy sai thì nói ra và
đưa số đo, đừng lặng lẽ sửa nó.

### Bước 6 — Khép vòng

Phát hành → nâng gói ở consumer → **gỡ vá tạm** → **gỡ mọi chú thích "chờ
upstream"** → **đóng issue**.

Vòng chưa khép thì việc chưa xong. Đợt 07–08/09/2026 mở 18 issue cho godxjp-ui;
#401/#412 và #402 đã vá trên nhánh nhưng issue vẫn mở và consumer vẫn chờ —
đó là hình dạng của thất bại này.

## 4. Nghĩa vụ catalog — chỗ tốn kém nhất khi quên

**Một prop có trong mã nhưng không có trong catalog MCP là một prop KHÔNG TỒN
TẠI** với agent tiếp theo.

Đây không phải suy đoán. Đo được trong phiên 08/09/2026: một agent mới, làm
đúng mọi hướng dẫn (hỏi MCP, không đoán), kết luận _"Flex chỉ có gap"_ trong khi
`pad` và `padRaw` đã nằm trong gói đã cài — vì catalog đã phát hành chưa có
chúng. Nó làm đúng và vẫn ra sai.

Nên sau mỗi lần thêm hay đổi prop:

```bash
node scripts/gen-component-api-manifest.mjs
pnpm check:mcp-sync && pnpm check:mcp-prop-sync && pnpm check:component-api-manifest
```

Và kiểm ví dụ trong `mcp/src/data/{patterns,components}.ts` có **biên dịch được
và qua nổi ui-audit** không. Catalog đã từng dạy: `<Dialog mode="confirm">`
(không có API ấy), `variant="success"` (bị chính audit cấm),
`<Input onValueChange>` (không có prop ấy). Ví dụ sai trong catalog không phải
lỗi chính tả — nó là mã mà agent sau sẽ chép.

## 5. Kỷ luật test của DS — luật, không phải gợi ý

- **Test theo TỪNG component**, và chỉ những component **liên quan** tới nó.
  `Dropdown` = menu + list + button + icon → chỉ quanh chừng đó. Không test lan man.
- **Test của story/example KHÔNG nằm trong CI.** Chúng ở `tests/manual/`, chạy
  bằng tay. CI không tiêu thời gian vào thứ vô bổ.
- Test bám vào **role và nhãn**, không bám class Tailwind — có cổng
  `check:no-tailwind-class-assertions` chặn.

Vì sao role/nhãn: 138 trên 160 selector của bộ Playwright ở consumer bám vào
`getByRole`/`getByLabel`. Chúng không phải nghi thức a11y — chúng là **cái cân
duy nhất** cho biết một lần đổi nền thư viện có làm hỏng UI hay không. Gỡ chúng
là mất cân, không phải tiết kiệm.

## 5b. Một cổng canh được đúng thứ nó CHẠY QUA

Một cổng viết ra mà không nối vào CI là một cổng không tồn tại — y hệt một prop
không có trong catalog (§4). Nhưng "đã nối" chưa đủ, và đợt 08/09/2026 đo được
cả hai nửa của bài học này.

**Nửa thứ nhất — đừng đo bằng cái thước sai.** Bản trước của mục này viết rằng
"25 cổng `check:*` nằm ngoài `verify:ci`", và kết luận từ đó rằng chúng không
chạy. Kiểm lại bằng workflow thì 22 trong 25 cổng ấy VẪN chạy mỗi lần merge hoặc
mỗi đêm — chỉ là ở lane khác. Lý do rất đơn giản và rất dễ vấp: **không workflow
nào chạy `verify:ci`.** `ci.yml` chạy `verify:ci:static` + `check:frame-contracts`

- `pnpm test` chia shard; `ci-browser.yml` chạy `verify:browser` (gồm
  `check:contrast`) và `check:frame-axe`; `ci-browser-full.yml` chạy các sweep rộng
  theo lịch đêm; `release-integrity.yml` chạy `check:release-plan`. Hỏi "cổng này
  có trong `verify:ci` không" là hỏi một script không ai gọi.

Nên đừng tự viết đoạn `node -e` so với `verify:ci`. Hỏi thẳng cổng canh-cổng, nó
đọc workflow rồi mới trả lời:

```bash
pnpm check:gate-coverage --report   # in ra: mỗi check:* chạy ở workflow nào
pnpm check:gate-coverage            # đỏ nếu có cổng không ai chạy và không khai miễn trừ
```

Cổng này nằm trong `verify:ci:static`, nên thêm một `check:` mới mà quên nối vào
đâu là CI đỏ ngay. Muốn để một cổng ngoài lề thì phải khai TƯỜNG MINH kèm lý do
trong `EXEMPT` của `scripts/check-gate-coverage.mjs` — hiện có đúng hai cái, và
cả hai đều là "cần người", không phải "chạy lâu": `check:voiceover-capture` (cần
VoiceOver thật do người bật) và `check:frame-runtime` (chỉ là alias gọi tám cổng
đã chạy riêng trong lane đêm). "Chạy lâu" không phải lý do để miễn trừ — đó là
lý do để nằm trong lane đêm, và lane đêm VẪN được tính là có chạy.

**Nửa thứ hai, và là nguyên nhân thật của lỗi đã lọt.** Một toast
`data-type="success"` với tương phản **1,02:1** — chữ gần như vô hình — phát hành
trong `@godxjp/ui@19.5.0` và bị bắt bởi **test trình duyệt của một consumer**.
Kho DS có sẵn hai thứ đáng lẽ phải bắt được nó, và **cả hai đều đã chạy trong
CI**:

- `scripts/check-contrast.mjs` chạy mỗi lần merge trong job "Contrast + visual
  audit" (55–59s, và tên job nằm trong `REQUIRED_CI_CHECK_RUNS` nên bản phát
  hành không đi qua nổi nếu nó đỏ). Nó xanh — vì danh sách `ROUTES` của nó có 11
  route và **không route nào render một cái toast**.
- `src/components/feedback/__tests__/toast-tone-contrast.test.tsx` chạy trong
  `pnpm test`. Nó xanh — vì nó đọc token trong `src/tokens/**` rồi tính tỉ số
  trên giấy; nó chạy trong jsdom, mà jsdom **không tô màu**, nên nó không nhìn
  thấy màu đã render thật.

Không cổng nào bị tắt. Không cổng nào bị bỏ quên. Cả hai đều xanh và cả hai đều
đúng với thứ chúng đo — chỉ là **không cái nào đo cái đã hỏng**. Đây là dạng
hỏng đắt hơn hẳn dạng "quên nối cổng", vì bảng CI toàn xanh trông y hệt như một
kho thật sự an toàn.

`check:contrast` đã dính đúng dạng này một lần rồi, và vết sẹo còn nằm trong
chú thích của chính nó: danh sách route từng trỏ vào `tiximax-*` sau khi các
route đó bị đổi tên, nên chúng render ra "Showcase not found" và sweep báo trang
rỗng ấy là AA sạch. Lần đó người ta thêm một guard chặn not-found. Lần này là
cùng một hình dạng ở một trục khác: route tồn tại, nhưng bề mặt cần soi thì
không có route nào chạm tới.

Nên khi bạn thêm hay sửa một cổng, hỏi HAI câu chứ không phải một:

1. **Nó có chạy không?** → `pnpm check:gate-coverage --report`.
2. **Nó có đi qua bề mặt tôi vừa đụng không?** → mở chính danh sách đầu vào của
   cổng (`ROUTES` của `check-contrast.mjs`, danh sách frame của `check:frame-axe`,
   `include` của `vitest.config.ts`) và tìm bề mặt ấy trong đó. Cổng xanh trên
   một danh sách không chứa thứ bạn vừa sửa thì nó chưa nói gì về bản sửa của bạn.

Và một hệ quả cho phía consumer: **bộ test trình duyệt của bạn là lớp lưới cuối
cùng của DS.** Hai lỗi tương phản trên do `php artisan test` của consumer bắt
được, không phải do CI thư viện. Đừng bỏ axe ra khỏi bộ trình duyệt chỉ vì "hệ
thống nội bộ" — ở đây nó không đo tuân thủ, nó đo xem DS có phát ra chữ đọc được
hay không.

## 6. Thứ KHÔNG đẩy lên DS

- Bố cục của một trang cụ thể ("dashboard cần bốn thẻ ngang").
- Số đo của một màn ("cột vai trò rộng 8rem").
- Bất cứ thứ gì biết về miền nghiệp vụ của app này.

DS sở hữu **hình dạng**. Màn hình sở hữu **nội dung**. Đẩy nhầm hướng làm DS
phình ra thành thứ không ai nhớ nổi — cũng hỏng như để nó quá hẹp.

## 7. Năm cách hỏng đã đo được — đừng lặp lại

1. **Chẩn đoán bằng mắt rồi sửa.** Một lần đổ lỗi lệch header cho DS; hoá ra là
   heuristic `onChat` của chính consumer. Đo trước, sửa sau.
2. **Làm tròn số đo cho sạch lint.** Thiết kế cần 12px, thang bậc tên có 8 và
   16 — "gần nhất" là một phép đoán, và mỗi khe lệch 4px × n phần tử là cả khối
   trôi. Giữ nguyên literal và mở đường cho DS.
3. **Đọc nhầm nguồn rồi kết luận chắc nịch.** Một lần đọc `.ui-inline-*` trong
   khi thứ đang chạy là `.ui-flex-gap-*`, rồi tuyên bố "đã sửa rồi". Trích đúng
   dòng đang chạy, không phải dòng trông giống.
4. **Chạy audit sai chỗ.** `ui-audit` chỉ báo lỗi khi chạy TRONG cây consumer;
   chạy nó ở `/tmp` ra 0 lỗi và ru ngủ.
5. **Phép thử đột biến không thật sự đột biến.** Một lượt
   `perl -0pi -e 's/data-slot="x"/BROKEN/'` thiếu cờ `/g` chỉ thay lần khớp ĐẦU
   TIÊN — mà lần đầu lại nằm trong một dòng chú thích, nên mã chạy không hề đổi
   và phép kiểm "không đỏ". Suýt kết luận rằng assertion là rỗng. Sau khi phá,
   hãy XÁC NHẬN mình đã phá đúng chỗ (`git diff` một dòng) trước khi tin vào kết
   quả màu.
