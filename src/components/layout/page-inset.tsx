import type { PageInsetProp } from "../../props/components/layout.prop";
import { PageContainerInset } from "./page-container";

export type {
  PageInsetProp,
  PageInsetProp as PageInsetProps,
} from "../../props/components/layout.prop";

/** @deprecated Use PageContainer.Inset. */
export function PageInset(props: PageInsetProp) {
  return <PageContainerInset {...props} />;
}
