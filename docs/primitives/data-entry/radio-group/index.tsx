import { Radio } from "@godxjp/ui/data-entry";

const options = [
  { value: "a", label: "Option A" },
  { value: "b", label: "Option B", description: "Description" },
  { value: "c", label: "Disabled", disabled: true },
];

export default function Demo() {
  return (
    <>
      <Radio.Group defaultValue="a" options={options} />
      <Radio.Group orientation="horizontal" options={options} />
    </>
  );
}
