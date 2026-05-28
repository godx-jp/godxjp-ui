export * from "./vocabulary";
export * from "./components";
export {
  VOCABULARY_REGISTRY,
  COMPONENT_PROP_REGISTRY,
  PROP_ALIASES_FORBIDDEN,
  type VocabularyPropName,
  type ComponentPropName,
} from "./registry";

// Backward-compatible re-exports (migrate to *Prop names)
export type { PageContainerProp as PageContainerProps } from "./components/layout.prop";
export type { StackProp as StackProps } from "./components/layout.prop";
export type { InlineProp as InlineProps } from "./components/layout.prop";
export type { ButtonProp as ButtonProps } from "./components/general.prop";
export type { BreadcrumbItemProp as BreadcrumbItem } from "./vocabulary/navigation.prop";
export type { ColumnDefProp as ColumnDef } from "./vocabulary/data.prop";
