/**
 * The ONE module in `@godxjp/ui` that touches the optional `recharts` peer.
 *
 * WHY IT EXISTS (gh#409 · 6). `recharts` is declared optional in `peerDependenciesMeta`, so a
 * bundler that cannot resolve it substitutes an empty stub, and EVERY named import of that stub
 * becomes its own `[MISSING_EXPORT]` diagnostic. A consumer who had not installed recharts got 18
 * of them, spread across `dist/components/charts/**`, none of which said what to install.
 *
 * Reading the peer through a NAMESPACE import removes those bindings — there is no named export
 * left to be missing. ONE named import is kept on purpose: it is what still fails the BUILD (a
 * silent build followed by a blank page at load is worse than a red build), and because the
 * bundler prints the offending SOURCE LINE, its local alias is written as the remedy — so the
 * single remaining diagnostic reads
 *
 *   [MISSING_EXPORT] "ResponsiveContainer" is not exported by
 *     "__vite-optional-peer-dep:recharts:@godxjp/ui".
 *     ╭─[ …/dist/components/charts/recharts-peer.js:3:10 ]
 *   3 │ import { ResponsiveContainer as install_recharts_or_use_charts_compact_bar_trend } from "recharts";
 *
 * which names the package, the fix, and the alternative that needs no peer at all.
 *
 * `assertRechartsPeer` covers the bundlers that resolve a missing optional peer to a silent empty
 * object instead of a throwing stub: there the first chart to render says what is missing.
 *
 * Do NOT `import … from "recharts"` anywhere else in the library.
 */
import * as peer from "recharts";
// eslint-disable-next-line camelcase -- the ALIAS is the error message: see the block above.
import { ResponsiveContainer as install_recharts_or_use_charts_compact_bar_trend } from "recharts";

/** What a consumer has to do. Kept as one string so the message cannot drift between call sites. */
export const RECHARTS_PEER_MESSAGE =
  '@godxjp/ui charts need the optional peer dependency "recharts" (^2.13.0 || ^3.0.0), which is ' +
  "not installed. Install it — `pnpm add recharts` / `npm i recharts` — or, for a dependency-free " +
  'trend mark, import { CompactBarTrend } from "@godxjp/ui/charts/compact-bar-trend".';

/**
 * Throw the remedy instead of an `undefined is not a component` render error. Called by each
 * recharts-backed chart before it renders anything.
 */
export function assertRechartsPeer(): void {
  if (typeof install_recharts_or_use_charts_compact_bar_trend === "undefined") {
    throw new Error(RECHARTS_PEER_MESSAGE);
  }
}

export const {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} = peer;
