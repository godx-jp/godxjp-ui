import { Steps } from "@godxjp/ui/navigation";

export default function Demo() {
  return (
    <Steps
      current={1}
      items={[
        { title: "Finish", status: "finish" },
        { title: "Process", status: "process" },
        { title: "Wait", status: "wait" },
      ]}
    />
  );
}
