const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({
    executablePath: "/ms-playwright/chromium-1140/chrome-linux/chrome",
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, ignoreHTTPSErrors: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message.slice(0, 200)}`));
  page.on("console", (msg) => { if (msg.type() === "error") errors.push(`console.error: ${msg.text().slice(0, 200)}`); });

  // Verify H3 .ch row design literals.
  await page.goto("https://storybook.local.godx.jp/iframe.html?id=new-primitives-components-data-display-card--h-3-meta-right&viewMode=story&globals=theme:light;accent:blue;density:default;fontSize:base", { waitUntil: "networkidle", timeout: 15000 });
  await page.waitForTimeout(400);
  const h3 = await page.evaluate(() => {
    const header = document.querySelector(".card-header-row.card-header-block");
    const title = document.querySelector(".card-title");
    const meta = document.querySelector(".card-meta");
    const card = document.querySelector(".card");
    if (!header) return { error: "no header-row block" };
    const cs = (el) => el ? getComputedStyle(el) : null;
    return {
      cardBorderRadius: cs(card)?.borderRadius,
      cardBorderColor: cs(card)?.borderColor,
      headerPad: `${cs(header)?.paddingTop}/${cs(header)?.paddingLeft}`,
      headerGap: cs(header)?.gap,
      headerBorderBottomWidth: cs(header)?.borderBottomWidth,
      titleFontSize: cs(title)?.fontSize,
      titleFontWeight: cs(title)?.fontWeight,
      metaFontSize: cs(meta)?.fontSize,
    };
  });
  console.log("=== H3 .ch (expect: pad 10/16, gap 10, title 13/500, meta 11) ===");
  console.log(JSON.stringify(h3, null, 2));

  // Sweep axes on Grid story
  console.log("\n=== Axes sweep on Pattern matrix ===");
  const combos = [
    ["light", "blue",  "default",     "base"],
    ["dark",  "blue",  "default",     "base"],
    ["light", "rose",  "default",     "base"],
    ["light", "blue",  "compact",     "base"],
    ["light", "blue",  "comfortable", "base"],
    ["light", "blue",  "default",     "lg"],
    ["dark",  "amber", "compact",     "xl"],
  ];
  for (const [t, a, d, fs] of combos) {
    await page.goto(`https://storybook.local.godx.jp/iframe.html?id=new-primitives-components-data-display-card--grid&viewMode=story&globals=theme:${t};accent:${a};density:${d};fontSize:${fs}`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(400);
    const probe = await page.evaluate(() => {
      const card = document.querySelector(".card");
      const featured = document.querySelector(".card-accent-featured");
      const band = document.querySelector(".card-band-primary");
      const cs = getComputedStyle(document.documentElement);
      return {
        cardPad: card ? getComputedStyle(card).padding : null,
        featuredBorder: featured ? getComputedStyle(featured).borderColor : null,
        bandBg: band ? getComputedStyle(band).backgroundColor : null,
        primary: cs.getPropertyValue("--primary").trim(),
        densityCard: cs.getPropertyValue("--density-card").trim(),
        htmlFontSize: cs.fontSize,
      };
    });
    console.log(`${t}/${a}/${d}/fs=${fs}: ${JSON.stringify(probe)}`);
  }

  console.log("\n=== ERRORS ===");
  console.log(errors.length === 0 ? "(none)" : errors.join("\n"));
  await browser.close();
})();
