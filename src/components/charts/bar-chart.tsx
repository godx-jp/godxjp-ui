import type { BarChartProp } from "../../props/components/charts.prop";
import { CartesianChart } from "./chart-cartesian";

export type {
  BarChartProp,
  BarChartProp as BarChartProps,
} from "../../props/components/charts.prop";

/**
 * Bar chart — compare a value across categories. `stacked` stacks series into one bar;
 * `horizontal` puts the category axis on the left.
 */
export function BarChart(props: BarChartProp) {
  return <CartesianChart kind="bar" {...props} />;
}
