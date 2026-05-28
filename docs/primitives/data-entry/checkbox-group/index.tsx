import { CheckboxGroup } from "@godxjp/ui/data-entry";

const options = [
  { value: "a", label: "Option A" },
  { value: "b", label: "Option B", description: "Description" },
  { value: "c", label: "Disabled", disabled: true },
];

export default function Demo() {
  return (
    <>
      <CheckboxGroup defaultValue={["a"]} options={options} />
      <CheckboxGroup orientation="horizontal" options={options} />
    </>
  );
}
