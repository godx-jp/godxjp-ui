/* global React, ReactDOM */
/* eslint-disable react/prop-types */

// ── Icons (lucide-style, 1.5 stroke) ─────────────────────────────────
const Icon = ({ d, size = 16, fill = "none" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {typeof d === "string" ? <path d={d} /> : d}
  </svg>
);

const I = {
  home: (s) => <Icon size={s} d="M3 11l9-8 9 8M5 10v10h14V10" />,
  folder: (s) => <Icon size={s} d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />,
  users: (s) => <Icon size={s} d={<><circle cx="9" cy="8" r="3"/><path d="M3 20v-1a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v1"/><path d="M16 4a3 3 0 0 1 0 6"/><path d="M21 20v-1a4 4 0 0 0-3-3.87"/></>} />,
  terminal: (s) => <Icon size={s} d={<><path d="M4 6h16v12H4z"/><path d="M7 10l3 2-3 2"/><path d="M12 14h5"/></>} />,
  bot: (s) => <Icon size={s} d={<><rect x="4" y="6" width="16" height="12" rx="2"/><path d="M12 2v4"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M9 17h6"/></>} />,
  code: (s) => <Icon size={s} d={<><path d="M8 6l-5 6 5 6"/><path d="M16 6l5 6-5 6"/></>} />,
  globe: (s) => <Icon size={s} d={<><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18"/><path d="M12 3a14 14 0 0 0 0 18"/></>} />,
  database: (s) => <Icon size={s} d={<><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></>} />,
  mail: (s) => <Icon size={s} d={<><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></>} />,
  book: (s) => <Icon size={s} d={<><path d="M4 4h12a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3V4z"/><path d="M4 17a3 3 0 0 1 3-3h12"/></>} />,
  kanban: (s) => <Icon size={s} d={<><rect x="3" y="3" width="6" height="14" rx="1"/><rect x="11" y="3" width="6" height="9" rx="1"/><rect x="19" y="3" width="2" height="6" rx="1" fill="currentColor"/></>} />,
  lightbulb: (s) => <Icon size={s} d={<><path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 1 4 10.5c-.7.7-1 1.5-1 2.5H9c0-1-.3-1.8-1-2.5A6 6 0 0 1 12 3z"/></>} />,
  search: (s) => <Icon size={s} d={<><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></>} />,
  bell: (s) => <Icon size={s} d={<><path d="M6 8a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6z"/><path d="M10 19a2 2 0 0 0 4 0"/></>} />,
  settings: (s) => <Icon size={s} d={<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></>} />,
  chevronLeft: (s) => <Icon size={s} d="M15 18l-6-6 6-6" />,
  chevronRight: (s) => <Icon size={s} d="M9 18l6-6-6-6" />,
  chevronDown: (s) => <Icon size={s} d="M6 9l6 6 6-6" />,
  plus: (s) => <Icon size={s} d="M12 5v14M5 12h14" />,
  check: (s) => <Icon size={s} d="M5 12l5 5L20 7" />,
  x: (s) => <Icon size={s} d="M6 6l12 12M18 6L6 18" />,
  external: (s) => <Icon size={s} d={<><path d="M14 5h5v5"/><path d="M19 5l-9 9"/><path d="M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/></>} />,
  copy: (s) => <Icon size={s} d={<><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></>} />,
  play: (s) => <Icon size={s} d="M6 4l14 8-14 8z" fill="currentColor" />,
  square: (s) => <Icon size={s} d="M6 6h12v12H6z" fill="currentColor" />,
  refresh: (s) => <Icon size={s} d={<><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/></>} />,
  power: (s) => <Icon size={s} d={<><path d="M12 3v9"/><path d="M5.6 7.6a8 8 0 1 0 12.8 0"/></>} />,
  arrowUp: (s) => <Icon size={s} d="M12 19V5M5 12l7-7 7 7" />,
  arrowDown: (s) => <Icon size={s} d="M12 5v14M5 12l7 7 7-7" />,
  branch: (s) => <Icon size={s} d={<><circle cx="6" cy="3" r="2"/><circle cx="6" cy="21" r="2"/><circle cx="18" cy="6" r="2"/><path d="M6 5v14"/><path d="M18 8v2a4 4 0 0 1-4 4H6"/></>} />,
  pr: (s) => <Icon size={s} d={<><circle cx="6" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/><path d="M6 8v8"/><path d="M18 16V9a3 3 0 0 0-3-3h-2"/></>} />,
  shield: (s) => <Icon size={s} d="M12 3l8 4v6c0 4-3 7-8 8-5-1-8-4-8-8V7l8-4z" />,
  zap: (s) => <Icon size={s} d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />,
  doc: (s) => <Icon size={s} d={<><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/></>} />,
  more: (s) => <Icon size={s} d={<><circle cx="5" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="19" cy="12" r="1.5" fill="currentColor"/></>} />,
  filter: (s) => <Icon size={s} d="M3 5h18l-7 9v6l-4-2v-4z" />,
  pin: (s) => <Icon size={s} d={<><path d="M12 2v8"/><path d="M9 10h6l-1 8h-4z"/><path d="M12 18v4"/></>} />,
  hash: (s) => <Icon size={s} d={<><path d="M4 9h16M4 15h16M10 3l-2 18M16 3l-2 18"/></>} />,
  sparkles: (s) => <Icon size={s} d="M12 3l1.8 4.7L18 9.5l-4.2 1.8L12 16l-1.8-4.7L6 9.5l4.2-1.8z" />,
  pencil: (s) => <Icon size={s} d={<><path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 6l3 3"/></>} />,
  trash: (s) => <Icon size={s} d={<><path d="M4 7h16"/><path d="M10 11v6M14 11v6"/><path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13"/><path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/></>} />,
  upload: (s) => <Icon size={s} d="M12 19V5M5 12l7-7 7 7M5 21h14" />,
  download: (s) => <Icon size={s} d="M12 5v14M5 12l7 7 7-7M5 21h14" />,
  link: (s) => <Icon size={s} d={<><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 1 0-5.7-5.7l-1.5 1.5"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 1 0 5.7 5.7l1.5-1.5"/></>} />,
  layers: (s) => <Icon size={s} d="M12 2l10 6-10 6L2 8l10-6zM2 14l10 6 10-6M2 11l10 6 10-6" />,
};


// Normalize: each I.* must work BOTH as a JSX component (<I.foo size={14}/>) and as a direct call (I.foo(14)).
// The original definitions take a numeric arg `s` — when used in JSX, React calls them with props={size:N}, breaking the SVG.
(function () {
  const _orig = { ...I };
  for (const k of Object.keys(_orig)) {
    const fn = _orig[k];
    I[k] = function IconWrap(arg) {
      const size = typeof arg === "number" ? arg : (arg && typeof arg === "object" && arg.size) || 16;
      return fn(size);
    };
  }
  window.I = I;
})();

window.I = I;
window.Icon = Icon;

// ── Tiny utilities ───────────────────────────────────────────────────
const cx = (...xs) => xs.filter(Boolean).join(" ");
window.cx = cx;

const Sparkline = ({ data, height = 32, color }) => {
  const w = 100, h = height;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return [x, y];
  });
  const line = pts.map(([x,y],i) => (i===0?`M${x},${y}`:`L${x},${y}`)).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={color ? { color } : undefined}>
      <path className="area" d={area} />
      <path className="line" d={line} />
    </svg>
  );
};
window.Sparkline = Sparkline;

const Donut = ({ value, size = 64, stroke = 8, color = "var(--primary)" }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - value / 100);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="donut">
      <circle cx={size/2} cy={size/2} r={r} stroke="var(--surface-3)" strokeWidth={stroke} fill="none" />
      <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x="50%" y="50%" textAnchor="middle" dy="0.35em" fontSize="13" fontWeight="500" fill="var(--foreground)">{value}%</text>
    </svg>
  );
};
window.Donut = Donut;

// Status pill helpers
const Badge = ({ kind = "neutral", children, dot = true }) => (
  <span className={`badge badge-${kind}`}>
    {dot && <span className="dot" />}
    {children}
  </span>
);
window.Badge = Badge;

const Avatar = ({ name, brand }) => {
  const initials = (name || "?").split(/\s+/).map(s => s[0]).slice(0,2).join("").toUpperCase();
  return <span className={cx("avatar", brand && "brand")}>{initials}</span>;
};
window.Avatar = Avatar;
