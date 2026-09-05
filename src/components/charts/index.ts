/** Charts entry — `@godxjp/ui/charts`. */
export { LineChart } from "./line-chart";
export type { LineChartProp, LineChartProps } from "./line-chart";
export { BarChart } from "./bar-chart";
export type { BarChartProp, BarChartProps } from "./bar-chart";
/**
 * Dependency-free compact trend. Consumers without recharts should use the isolated
 * `@godxjp/ui/charts/compact-bar-trend` entry so this barrel does not link peer-backed charts.
 */
export { CompactBarTrend } from "./compact-bar-trend";
export type { CompactBarTrendProp, CompactBarTrendProps } from "./compact-bar-trend";
export { AreaChart } from "./area-chart";
export type { AreaChartProp, AreaChartProps } from "./area-chart";
export { PieChart } from "./pie-chart";
export type { PieChartProp, PieChartProps } from "./pie-chart";
export type { ChartSeriesProp, ChartDatum } from "../../props/components/charts.prop";
export { CHART_COLORS } from "./chart-frame";
