// GoDX service icons — one system: 64-grid tile, radius 14, brand gradient, white glyph at stroke 4,
// round caps/joins, glyph inside the 16..48 live area. Original geometry only.
import { writeFileSync, mkdirSync } from "node:fs";
const out = process.argv[2];
mkdirSync(out, { recursive: true });
const G = {
  // 課題管理: a ticked box
  task: `<rect x="17" y="17" width="30" height="30" rx="6"/><path d="M24 32.5l5.5 5.5L40 27"/>`,
  // ページ: a page with a folded corner and two text lines
  content: `<path d="M20 16h14l10 10v22H20z"/><path d="M34 16v10h10"/><path d="M26 34h12M26 41h8"/>`,
  // メディア: a framed picture, sun and hill
  media: `<rect x="16" y="19" width="32" height="26" rx="4"/><circle cx="26" cy="27" r="3"/><path d="M17 41l10-9 7 6 5-4 9 8"/>`,
  // Mailer: an envelope
  "godx-mailer": `<rect x="16" y="20" width="32" height="24" rx="4"/><path d="M17 23l15 11 15-11"/>`,
  // Logger: a console prompt over log lines
  "godx-logger": `<path d="M18 19l7 6-7 6"/><path d="M30 31h15M18 39h27M18 46h18"/>`,
  // 勤怠管理: a clock
  kintai: `<circle cx="32" cy="32" r="15"/><path d="M32 24v8l6 4"/>`,
  // 承認・稟議: a seal stamp
  approval: `<path d="M28 17h8v9h-8z"/><path d="M22 34a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v6H22z"/><path d="M28 26v6M36 26v6"/><path d="M19 47h26"/>`,
  // Chatter: a speech bubble with three dots
  "godx-chatter": `<path d="M18 22a4 4 0 0 1 4-4h20a4 4 0 0 1 4 4v15a4 4 0 0 1-4 4H30l-8 6v-6h0a4 4 0 0 1-4-4z"/><path d="M26 29.5h0M32 29.5h0M38 29.5h0"/>`,
  // Speed HR: a person, with speed lines
  speedhr: `<circle cx="36" cy="24" r="6"/><path d="M25 47v-3a11 11 0 0 1 22 0v3"/><path d="M15 33h7M17 40h5"/>`,
  // レストラン管理 (tempo): a serving cloche on a plate
  tempo: `<path d="M32 18v3"/><path d="M19 40a13 13 0 0 1 26 0z"/><path d="M15 46h34"/>`,
};
const tile = (
  id,
  glyph,
  rx = 14,
) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="${id}">
  <defs><linearGradient id="g" x1="6" y1="4" x2="58" y2="60" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#7A00FF"/><stop offset="0.55" stop-color="#3700A6"/><stop offset="1" stop-color="#0B0F3B"/></linearGradient></defs>
  <rect width="64" height="64" rx="${rx}" fill="url(#g)"/>
  <g fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${glyph}</g>
</svg>
`;
mkdirSync(`${out}/svg`, { recursive: true });
mkdirSync(`${out}/.square`, { recursive: true });
for (const [id, glyph] of Object.entries(G)) {
  writeFileSync(`${out}/svg/${id}.svg`, tile(id, glyph));
  // Full-bleed square for raster export: the catalog crops with object-fit:cover and rounds it itself.
  writeFileSync(`${out}/.square/${id}.svg`, tile(id, glyph, 0));
}
console.log(Object.keys(G).join(" "));
