import { RadioGroupRoot, RadioItem } from "@godxjp/ui/data-entry";

export default function Demo() {
  return (
    <RadioGroupRoot defaultValue="a">
      <RadioItem value="a" />
      <RadioItem value="b" />
      <RadioItem value="c" disabled />
    </RadioGroupRoot>
  );
}
