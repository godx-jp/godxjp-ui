import * as React from "react";
import { describe, it } from "vitest";

import { Input } from "../input";
import { Textarea } from "../textarea";
import { NumberInput } from "../number-input";
import { Radio } from "../radio";
import { Rating } from "../rating";
import { Segmented } from "../segmented";
import { Slider } from "../slider";
import { Switch } from "../switch";
import { expectNoA11yViolations } from "@/test/a11y";

/**
 * Every NEW state these props introduce, checked against axe. A prop that adds a node — a counter,
 * an addon, a value bubble, an ON/OFF word, a half-star hit area — is a prop that can add a
 * violation, and each of those nodes had to make a call about what assistive tech should hear.
 */
const OPTIONS = [
  { value: "day", label: "日" },
  { value: "week", label: "週" },
  { value: "month", label: "月" },
];

describe("antd parity — a11y of the new states", () => {
  it("Input with prefix, suffix, addons and a counter", async () => {
    await expectNoA11yViolations(
      <Input
        aria-label="URL"
        prefix={<span>¥</span>}
        suffix={<span>円</span>}
        addonBefore="https://"
        addonAfter=".com"
        count={{ max: 20 }}
        defaultValue="example"
      />,
    );
  });

  it("Input in each status and each variant", async () => {
    await expectNoA11yViolations(
      <div>
        <Input aria-label="エラー" status="error" />
        <Input aria-label="警告" status="warning" />
        <Input aria-label="塗り" variant="filled" />
        <Input aria-label="枠なし" variant="borderless" />
      </div>,
    );
  });

  it("Textarea with a counter and autoSize", async () => {
    await expectNoA11yViolations(
      <Textarea aria-label="備考" autoSize={{ minRows: 2, maxRows: 6 }} count={{ max: 140 }} />,
    );
  });

  it("NumberInput without controls, in a warning state", async () => {
    await expectNoA11yViolations(
      <NumberInput aria-label="数量" controls={false} status="warning" defaultValue={3} />,
    );
  });

  it("Radio.Group drawn as a solid button bar", async () => {
    await expectNoA11yViolations(
      <Radio.Group
        aria-label="期間"
        options={OPTIONS}
        optionType="button"
        buttonStyle="solid"
        defaultValue="week"
      />,
    );
  });

  it("Segmented as a vertical block bar", async () => {
    await expectNoA11yViolations(
      <Segmented aria-label="表示" options={OPTIONS} block vertical defaultValue="day" />,
    );
  });

  it("Switch mid-flight, with ON/OFF words", async () => {
    await expectNoA11yViolations(
      <Switch aria-label="公開" loading checkedChildren="有効" unCheckedChildren="無効" />,
    );
  });

  it("Rating with halves, custom characters and per-step tooltips", async () => {
    await expectNoA11yViolations(
      <Rating
        aria-label="評価"
        count={3}
        allowHalf
        tooltips={["不満", "普通", "満足"]}
        defaultValue={2.5}
      />,
    );
  });

  it("Slider with marks, dots and a value bubble", async () => {
    await expectNoA11yViolations(
      <Slider
        aria-label="価格帯"
        range
        min={0}
        max={100}
        step={25}
        dots
        marks={{ 0: "0", 50: "半分", 100: "100" }}
        tooltip={{ formatter: (value) => `${value}%` }}
        defaultValue={[25, 75]}
      />,
    );
  });
});
