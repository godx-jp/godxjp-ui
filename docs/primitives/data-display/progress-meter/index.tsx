import { ProgressMeter } from "@godxjp/ui/data-display";

export default function Demo() {
  return (
    <>
      <ProgressMeter value={42} label="42%" />
      <ProgressMeter value={72} tone="warning" label="warning" />
      <ProgressMeter value={100} tone="success" label="success" />
    </>
  );
}
