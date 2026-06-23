import type { AreaChartProp } from "../../props/components/charts.prop";
import { CartesianChart } from "./chart-cartesian";

export type {
  AreaChartProp,
  AreaChartProp as AreaChartProps,
} from "../../props/components/charts.prop";

/**
 * Area chart — magnitude over an ordered category axis. `stacked` accumulates
 * series; `curved` smooths the line. Import from the tree-shaken
 * `@godxjp/ui/charts` entry; requires the `recharts` optional peer.
 */
export function AreaChart(props: AreaChartProp) {
  return <CartesianChart kind="area" {...props} />;
}
