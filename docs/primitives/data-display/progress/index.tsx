import { Progress } from "@godxjp/ui/data-display";

export default function Demo() {
  return (
    <>
      <Progress value={42} label="42%" />
      <Progress value={72} tone="warning" label="warning" />
      <Progress value={100} tone="success" label="success" />
    </>
  );
}
