import { chromium } from "playwright";
import { readFileSync, readdirSync, writeFileSync, mkdirSync, statSync } from "node:fs";
const dir = process.argv[2];
const ids = readdirSync(`${dir}/svg`).map((f) => f.slice(0, -4));
const b = await chromium.launch();
const p = await b.newPage();
for (const [sub, src, size] of [
  ["png/512", ".square", 512],
  ["png/256", "svg", 256],
]) {
  mkdirSync(`${dir}/${sub}`, { recursive: true });
  for (const id of ids) {
    const svg = readFileSync(`${dir}/${src}/${id}.svg`, "utf8");
    const r = await p.evaluate(
      async ([svg, size]) => {
        const img = new Image();
        img.src = "data:image/svg+xml;base64," + btoa(svg);
        await img.decode();
        const c = document.createElement("canvas");
        c.width = c.height = size;
        const x = c.getContext("2d");
        x.drawImage(img, 0, 0, size, size);
        const d = x.getImageData(0, 0, size, size).data;
        let minAlpha = 255;
        for (let i = 3; i < d.length; i += 4) minAlpha = Math.min(minAlpha, d[i]);
        return { url: c.toDataURL("image/png"), minAlpha };
      },
      [svg, size],
    );
    const file = `${dir}/${sub}/${id}.png`;
    writeFileSync(file, Buffer.from(r.url.split(",")[1], "base64"));
    if (size === 512)
      console.log(
        `${id}.png 512 minAlpha=${r.minAlpha} ${Math.round(statSync(file).size / 1024)}KB`,
      );
  }
}
await b.close();
