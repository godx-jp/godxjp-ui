import { Autocomplete } from "@godxjp/ui/data-entry";

const options = [
  { value: "one", label: "One" },
  { value: "two", label: "Two" },
];

export default function Demo() {
  return (
    <>
      <Autocomplete options={options} placeholder="Autocomplete" />
      <Autocomplete options={options} placeholder="Disabled" disabled />
    </>
  );
}
