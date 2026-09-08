/// <reference types="vitest" />
import { defineConfig } from "vitest/config";

import base from "./vitest.config";

/*
|--------------------------------------------------------------------------
| Bộ test CHẠY TAY — không nằm trong CI
|--------------------------------------------------------------------------
|
| `vitest.config.ts` khai `include: ["src/**"]`, nên mọi thứ trong `tests/`
| đã tự nằm ngoài CI. Tệp này chỉ để chạy chúng khi cần.
|
|     pnpm test:manual
|
| ## Cái gì thuộc về đây, và vì sao
|
| Test ở đây kiểm STORY và EXAMPLE — chúng dựng ví dụ trong `docs/` rồi hỏi
| "example có phủ hết khung của component không", "example của chính thư viện
| có vi phạm luật audit không". Đó là câu hỏi về TÀI LIỆU, không phải về hành
| vi của component.
|
| Hệ quả nếu để chúng trong CI: sửa một tệp `docs/` làm đỏ CI của một PR không
| đụng gì tới `src/`, và người sửa mã phải đi chữa một ví dụ. Vòng phản hồi của
| người viết component không nên phụ thuộc vào độ đầy đủ của tài liệu.
|
| ## Cái gì KHÔNG thuộc về đây
|
| Cổng bất biến quét cả kho (token-governance, public-export-contract,
| focus-ring-single-source…) VẪN Ở TRONG CI. Chúng đo được là 1,9 giây cho 233
| test — rẻ, và chúng canh những thứ hỏng im lặng. "Quét cả kho" không đồng
| nghĩa với "vô bổ".
|
| ## Số đo, để lần sau đừng tối ưu nhầm chỗ
|
| Đo 08/09/2026 trên cây này:
|   - 13 tệp quét hệ thống + example :   1,9 s / 233 test
|   - 90 tệp a11y (axe)              :  23,2 s / 351 test
|   - toàn bộ 513 tệp                : ~105-135 s
|
| Chi phí lớn nhất KHÔNG phải test story — mà là số TỆP: mỗi `.test.tsx` dựng
| một jsdom riêng, ~0,47 s/tệp. Kho đã xử lý phần đó bằng `fileParallelism` và
| chia shard trong CI (xem chú thích trong `vitest.config.ts` và `ci.yml`).
| Việc tách thư mục này là để CI KHÔNG ĐỎ VÌ TÀI LIỆU, không phải để nhanh hơn.
*/
/*
 * KHÔNG dùng `mergeConfig`: nó NỐI mảng chứ không ghi đè, nên `include` của bản
 * gốc (`src/**`) vẫn ở lại và bộ "chạy tay" hoá ra chạy cả 513 tệp — đo được
 * 105 s thay vì 2 s. Ghi đè thẳng đúng một khoá.
 */
export default defineConfig({
  ...base,
  test: {
    ...base.test,
    include: ["tests/manual/**/*.test.{ts,tsx}"],
  },
});
