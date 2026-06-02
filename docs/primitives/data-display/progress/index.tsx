import { Progress } from "@godxjp/ui/data-display";

export default function Demo() {
  return (
    <>
      <Progress value={42} label="42%" />
      <Progress value={72} variant="warning" label="warning" />
      <Progress value={100} variant="success" label="success" />
    </>
  );
}
