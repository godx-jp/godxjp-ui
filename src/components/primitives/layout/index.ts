// @godxjp/ui — layout primitives (Ant-Design-shaped).
//
// One concept, one component:
//
//   <Row>    + <Col>    — 24-column responsive grid
//   <Flex>             — flex container, prop-driven config
//   <Space>            — inline group with prop-driven gap + optional split

export { Row, useRowGutter } from "./Row";
export type {
  RowProps,
  GutterValue,
  Breakpoint,
  Justify,
  Align,
} from "./Row";

export { Col } from "./Col";
export type { ColProps } from "./Col";

export { Flex } from "./Flex";
export type { FlexProps, FlexGap, FlexJustify, FlexAlign } from "./Flex";

export { Space } from "./Space";
export type { SpaceProps, SpaceSize } from "./Space";
