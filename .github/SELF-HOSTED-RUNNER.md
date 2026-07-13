# Frame CI trên self-hosted runner (famgia-linux)

Các workflow **Frame contracts** (`frame-contracts.yml`) + **Frame a11y & coverage**
(`frame-a11y.yml`) chạy trên runner self-hosted của org `godx-jp`
(`famgia-linux-01` / `-r3` / `-r4`, label `[self-hosted, Linux, X64]`, AlmaLinux 10) —
KHÔNG dùng `ubuntu-latest` (tốn phí + chậm). Tài liệu này ghi lại mọi khác biệt so với
GitHub-hosted đã phải xử lý, để lần đụng CI/onboard runner sau tra được ngay.

## Setup 1 lần mỗi runner host
```sh
ssh satoshi@<runner-host> 'bash -s' < .github/setup-runner-deps.sh
```
Cài font + verify Chromium. Idempotent — chạy lại sau khi rebuild host.

## 5 khác biệt so với ubuntu-latest (đều từng làm CI đỏ)

1. **Public repo bị chặn self-hosted (gốc lớn nhất).** `godxjp-ui` là **public**; GitHub mặc
   định CHẶN public repo dùng self-hosted runner (bảo mật — fork PR chạy code lạ trên hạ tầng
   mình). Triệu chứng: job **queued mãi**, 0 dispatch, dù runner online/idle/label khớp.
   → Bật `allows_public_repositories=true` trên runner group **VÀ** đặt fork-PR approval =
   `all_external_contributors` (mọi PR fork phải duyệt tay → chặn RCE):
   ```sh
   gh api --method PATCH orgs/godx-jp/actions/runner-groups/1 -F allows_public_repositories=true
   gh api --method PUT repos/godx-jp/godxjp-ui/actions/permissions/fork-pr-contributor-approval \
     -f approval_policy=all_external_contributors
   ```
   (Đổi setting mất ~1 phút để lan; job queued CŨ không được route lại — push commit mới.)

2. **`playwright install --with-deps` FAIL trên AlmaLinux.** `--with-deps` = `apt-get`
   (chỉ Debian/Ubuntu). AlmaLinux = dnf → bước này lỗi. → workflow dùng `playwright install
   chromium` (không `--with-deps`); system libs Chromium (libnss3/atk/gbm/asound) đã có sẵn
   trên AlmaLinux 10 (verify: `node -e "chromium.launch()"` OK).

3. **pnpm/action-setup race (3 runner chung `$HOME`).** Mặc định `dest: ~/setup-pnpm` CỐ ĐỊNH
   → nhiều job concurrent cùng ghi/đọc → `ENOENT setup-pnpm/package.json`. → mọi step
   `pnpm/action-setup` set `dest: ${{ runner.temp }}/setup-pnpm` (unique mỗi job).

4. **Preview server port va chạm (chung host).** `frame-harness.mjs` `ensurePreviewServer`
   thấy port đã "reachable" thì **tái dùng server của job khác**; job đó xong `cleanup()` giết
   server → job đang chạy mất server (`ERR_CONNECTION_REFUSED`). GitHub-hosted mỗi job 1 VM
   nên không lộ. → mỗi job 1 port riêng qua env:
   - `frame-harness.mjs` `DEFAULT_BASE` đọc `PREVIEW_BASE` → frame-a11y đặt verify=6008
     coverage=6018 axe=6028 geometry=6038.
   - `check-data-entry-frame-runtime.mjs` `port` đọc `PREVIEW_PORT` → 3 shard data-entry =
     6011/6021/6031 (matrix).
   - Cả 2 workflow có `concurrency: cancel-in-progress` (chặn run chồng nhau).

5. **Font → geometry/axe lệch baseline.** Baseline chụp trên môi trường có Noto Sans CJK
   (Nhật) + Arabic/Hebrew (RTL). AlmaLinux thiếu → glyph fallback rộng khác → regression giả
   (`navigation-tabs-rtl@320`, `navigation-pagination@768`). → cài font (mục setup). Frame nào
   còn lệch ~1px thuần do hinting/subpixel (dù cùng Noto CJK) thì baseline chụp theo **canonical
   env = runner** (regen `node scripts/frame-geometry.mjs --update-baseline` TRÊN runner).

## Quy tắc khi thêm script render mới
- Đọc port từ env (`PREVIEW_BASE`/`PREVIEW_PORT`), KHÔNG hardcode — chung host là đụng.
- Nếu tạo baseline geometry/visual mới: regen TRÊN runner (không phải máy local Mac/khác) để
  khớp môi trường CI thật.
