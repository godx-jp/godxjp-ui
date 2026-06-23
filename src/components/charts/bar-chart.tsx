import type { BarChartProp } from "../../props/components/charts.prop";
import { CartesianChart } from "./chart-cartesian";

export type {
  BarChartProp,
  BarChartProp as BarChartProps,
} from "../../props/components/charts.prop";

/**
 * Bar chart — compare a value across categories. `stacked` stacks series into one
 * bar; `horizontal` puts the category axis on the left. Import from the
 * tree-shaken `@godxjp/ui/charts` entry; requires the `recharts` optional peer.
 */
export function BarChart(props: BarChartProp) {
  return <CartesianChart kind="bar" {...props} />;
}
