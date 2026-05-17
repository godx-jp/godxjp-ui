// Screen components — drop-in pages styled with the design tokens.
//
// Each screen is self-contained: takes a small props payload + emits
// callbacks for navigation. Consumers compose them inside their own
// route tree, e.g.:
//
//   <Route path="dashboard" element={<DashboardScreen product={p} />} />
//   <Route path="plans" element={<PlansScreen onOpenPlan={openPlan} />} />
//   <Route path="plans/:id" element={<PlanDetailScreen ... />} />
//
// Per MUST RULE #11 these are the canonical pages for the GoDX
// workspace surface. A service may extend them or replace one with a
// service-specific equivalent, but the visual + interaction shape
// stays consistent across the system.
export { DashboardScreen } from "./DashboardScreen";
export type { DashboardScreenProps } from "./DashboardScreen";
export { ProjectsListScreen } from "./ProjectsListScreen";
export type { ProjectsListScreenProps } from "./ProjectsListScreen";
export { PlansScreen } from "./PlansScreen";
export type { PlansScreenProps } from "./PlansScreen";
export { IssuesScreen } from "./IssuesScreen";
export type { IssuesScreenProps } from "./IssuesScreen";
export { WikiScreen } from "./WikiScreen";
export type { WikiScreenProps } from "./WikiScreen";
export { IdeasScreen } from "./IdeasScreen";
export { PlanDetailScreen } from "./PlanDetailScreen";
export type { PlanDetailScreenProps } from "./PlanDetailScreen";
export { IssueDetailScreen } from "./IssueDetailScreen";
export type { IssueDetailScreenProps } from "./IssueDetailScreen";
