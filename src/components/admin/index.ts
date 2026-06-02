// Backward-compatible admin barrel.
export type { BreadcrumbItemProp as BreadcrumbItem } from "../../props/vocabulary/navigation.prop";
export type {
  PageContainerProp,
  PageContainerProp as PageContainerProps,
} from "../../props/components/layout.prop";

export { PageHeader } from "../navigation/page-header";
/* eslint-disable-next-line @typescript-eslint/no-deprecated -- backward-compat export */
export type { PageHeaderProp } from "../../props/components/layout.prop";

export { PageContainer } from "../layout/page-container";
export { Stack, Inline } from "../layout";
export type { StackProp, InlineProp } from "../../props/components/layout.prop";

export { EmptyState } from "../data-display/empty-state";
export { Badge } from "../data-display/badge";
export { FormField } from "../data-entry/form-field";
export { Descriptions } from "../data-display/descriptions";
export { SkeletonRows, SkeletonTable, SkeletonDetail, SkeletonCard } from "../feedback/skeleton";
export {
  DataState,
  MutationFeedback,
  QueryRefetchButton,
  InfiniteQueryState,
  flattenItemPages,
  PrefetchLink,
} from "../query";
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
export {
  Pagination,
  Steps,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../navigation";
export { FilterBar, FilterGroup } from "../navigation/filter-bar";
export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogConfirm,
} from "../feedback/dialog";
export { DataTable } from "../data-display/data-table";
export type { ColumnDef, Density } from "../data-display/data-table";
export { Toaster } from "../feedback/sonner";
export { toast, useToast } from "../feedback/use-toast";
export type { LegacyToastOptions } from "../feedback/use-toast";
export { useDebouncedValue, useTimeoutFlag } from "../../lib/hooks";
export { formatDate, formatBytes, formatCurrency, shortId, humanError } from "../../lib/format";
/* eslint-disable @typescript-eslint/no-deprecated -- backward-compatible admin barrel re-exports legacy helpers. */
export { formatDateTime, formatDateLong, formatRelative } from "../../lib/format";
/* eslint-enable @typescript-eslint/no-deprecated */
