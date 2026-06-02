import type { InlineProp } from "../../props/components/layout.prop";
import { Flex } from "./flex";

export type { InlineProp, InlineProp as InlineProps } from "../../props/components/layout.prop";

/** @deprecated Use Flex with direction="row" and wrap. */
export function Inline({ gap = "sm", ...props }: InlineProp) {
  return <Flex direction="row" wrap gap={gap} align="center" {...props} />;
}
