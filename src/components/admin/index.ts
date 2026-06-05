// Backward-compatible admin barrel.
export type { BreadcrumbItemProp as BreadcrumbItem } from "../../props/vocabulary/navigation.prop";
export type {
  PageContainerProp,
  PageContainerProp as PageContainerProps,
} from "../../props/components/layout.prop";

export { PageContainer } from "../layout/page-container";
export { Flex } from "../layout";
export type { FlexProp } from "../../props/components/layout.prop";

export { EmptyState } from "../data-display/empty-state";
export { Badge } from "../data-display/badge";
export { FormField } from "../data-entry/form-field";
export { Field } from "../data-entry/field";
export { Descriptions } from "../data-display/descriptions";
export { SkeletonRows, SkeletonTable, SkeletonDetail, SkeletonStat } from "../feedback/skeleton";
// Query/router adapters intentionally NOT re-exported here — import from "@godxjp/ui/query"
// so the root @godxjp/ui surface stays runtime-neutral (issue #83 / check-core-isolation).
export {
  Alert,
  AlertTitle,
  AlertContent,
  AlertDescription,
  AlertActions,
  AlertQueryError,
} from "../feedback/alert";
export { SearchInput } from "../data-entry/search-input";
export {
  Upload,
  collectUploadCommitActions,
  createUploadItem,
  useUploadDraft,
} from "../data-entry/upload";
export { Cascader } from "../data-entry/cascader";
export { TreeSelect } from "../data-entry/tree-select";
export { Transfer } from "../data-entry/transfer";
export { Pagination, Steps, Tabs, TabsContent, TabsList, TabsTrigger } from "../navigation";
export { Toolbar, ToolbarGroup } from "../navigation/filter-bar";
export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  AlertDialog,
} from "../feedback/dialog";
export { DataTable } from "../data-display/data-table";
export type { ColumnDef, Density } from "../data-display/data-table";
export { Toaster } from "../feedback/sonner";
export { toast, useToast } from "../feedback/use-toast";
export type { LegacyToastOptions } from "../feedback/use-toast";
export { useDebouncedValue, useTimeoutFlag } from "../../lib/hooks";
export { formatDate, formatBytes, formatCurrency, shortId, humanError } from "../../lib/format";
