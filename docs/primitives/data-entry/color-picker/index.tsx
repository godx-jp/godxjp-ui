import { ColorPicker } from "@godxjp/ui/data-entry";

export default function Demo() {
  return (
    <>
      <ColorPicker value="#2563eb" onChange={() => undefined} />
      <ColorPicker value="#16a34a" onChange={() => undefined} disabled />
    </>
  );
}
