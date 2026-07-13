#!/usr/bin/env bash
# setup-runner-deps.sh — chuẩn bị self-hosted runner (famgia-linux, AlmaLinux 10) cho frame CI.
#
# Chạy MỘT LẦN trên mỗi runner host (hoặc sau khi rebuild host). Idempotent.
#   ssh satoshi@<runner-host> 'bash -s' < .github/setup-runner-deps.sh
#
# Vì sao cần: các job frame render trong Chromium (Playwright). Trên AlmaLinux:
#   • `playwright install --with-deps` KHÔNG dùng được (--with-deps = apt, chỉ Debian/Ubuntu)
#     → workflow dùng `playwright install chromium` (không --with-deps); system libs Chromium
#     (libnss3/atk/gbm/asound…) đã có sẵn trên AlmaLinux 10.
#   • Font: baseline geometry/axe chụp với Noto Sans CJK (Nhật) + Arabic/Hebrew (RTL). Thiếu →
#     glyph fallback rộng khác → geometry regression giả (navigation-pagination, tabs-rtl).
set -euo pipefail

echo "== cài font Noto (CJK Nhật + Arabic + Hebrew) cho frame render =="
# Tên gói theo AlmaLinux 10 (một số chỉ có trên EPEL/CRB — đã bật sẵn trên famgia-linux).
for pkg in \
  google-noto-sans-cjk-ttc-fonts \
  google-noto-sans-cjk-fonts \
  google-noto-sans-arabic-vf-fonts \
  google-noto-sans-hebrew-vf-fonts \
  langpacks-ja \
  vlgothic-fonts; do
  sudo dnf install -y "$pkg" 2>/dev/null && echo "  ✓ $pkg" || echo "  – $pkg (bỏ qua: không có trong repo)"
done

sudo fc-cache -f
echo "== verify font CJK/RTL =="
fc-list | grep -iE "CJK JP|Arabic|Hebrew" | head -3 || { echo "❌ thiếu font CJK/RTL — frame geometry sẽ lệch baseline"; exit 1; }

echo "== verify Chromium launch (không cần --with-deps) =="
tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT
( cd "$tmp" && npm i -s playwright >/dev/null 2>&1 && npx playwright install chromium >/dev/null 2>&1 \
  && node -e 'import("playwright").then(async({chromium})=>{const b=await chromium.launch();await b.close();console.log("  ✓ Chromium launch OK")})' )

echo "✅ runner sẵn sàng cho frame CI (font + Chromium). Xem .github/SELF-HOSTED-RUNNER.md."
