import { Steps } from "@godxjp/ui";

const items = [
  { title: "Submit", description: "Employee files the request" },
  { title: "Review", description: "Manager checks the details" },
  { title: "Approve", description: "Final sign-off" },
];

export function Horizontal() {
  return (
    <div style={{ maxWidth: 520 }}>
      <Steps items={items} value={1} />
    </div>
  );
}

export function Dot() {
  return (
    <div style={{ maxWidth: 520 }}>
      <Steps items={items} value={2} type="dot" />
    </div>
  );
}
