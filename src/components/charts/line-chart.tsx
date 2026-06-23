import type { LineChartProp } from "../../props/components/charts.prop";
import { CartesianChart } from "./chart-cartesian";

export type {
  LineChartProp,
  LineChartProp as LineChartProps,
} from "../../props/components/charts.prop";

/**
 * Line chart — trends over an ordered category axis (one or more series).
 * Import from the tree-shaken `@godxjp/ui/charts` entry; requires the `recharts`
 * optional peer dependency.
 */
export function LineChart(props: LineChartProp) {
  return <CartesianChart kind="line" {...props} />;
}
