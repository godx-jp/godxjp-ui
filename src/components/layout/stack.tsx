import type { StackProp } from "../../props/components/layout.prop";
import { Flex } from "./flex";

export type { StackProp, StackProp as StackProps } from "../../props/components/layout.prop";

/** @deprecated Use Flex with direction="col". */
export function Stack(props: StackProp) {
  return <Flex direction="col" {...props} />;
}
