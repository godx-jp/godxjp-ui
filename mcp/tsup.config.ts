import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node18",
  dts: true,
  // MCP = data-catalog CLI chạy runtime; minify bundle (JSON data nén tốt) + bỏ sourcemap
  // (1MB thừa, không dùng lúc chạy) → gói npm nhẹ hơn nhiều, install nhanh. Không đổi hành vi.
  minify: true,
  sourcemap: false,
  clean: true,
  banner: { js: "#!/usr/bin/env node" },
});
