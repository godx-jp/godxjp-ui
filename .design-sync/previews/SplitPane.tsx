import { useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, SplitPane, Text } from "@godxjp/ui";

const MESSAGES = [
  { author: "Tanaka", at: "09:12", body: "Invoices for May are ready for approval." },
  { author: "Sato", at: "09:20", body: "Acme's total differs from last month." },
  { author: "Suzuki", at: "09:31", body: "Breakdown is in the thread." },
];

export function Default() {
  return (
    <SplitPane
      asideLabel="Invoice detail"
      aside={
        <Card>
          <CardHeader>
            <CardTitle level={3}>INV-0241</CardTitle>
          </CardHeader>
          <CardContent>
            <Text tone="muted">
              The aside is a fixed rail — 20rem, 22rem or 30rem — beside a main column that keeps
              the remaining width.
            </Text>
          </CardContent>
        </Card>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle level={3}>#general</CardTitle>
        </CardHeader>
        <CardContent>
          {MESSAGES.map((message) => (
            <div key={message.author} style={{ marginBottom: 12 }}>
              <Text weight="medium">{message.author}</Text>{" "}
              <Text size="xs" tone="muted">
                {message.at}
              </Text>
              <div>
                <Text tone="muted">{message.body}</Text>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </SplitPane>
  );
}

export function CollapsibleRail() {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <Button size="sm" variant={open ? "default" : "outline"} onClick={() => setOpen(!open)}>
        {open ? "Close thread" : "Open thread"}
      </Button>
      <div style={{ marginTop: 12 }}>
        <SplitPane
          asideLabel="Thread"
          aside={
            open ? (
              <Card>
                <CardHeader>
                  <CardTitle level={3}>Thread</CardTitle>
                </CardHeader>
                <CardContent>
                  <Text tone="muted">
                    `aside={null}` closes the rail: no aside element, one full-width column, no gap.
                    The wrappers stay mounted, so the main column is not remounted and keeps its
                    scroll position.
                  </Text>
                </CardContent>
              </Card>
            ) : null
          }
        >
          <Card>
            <CardHeader>
              <CardTitle level={3}>#general</CardTitle>
            </CardHeader>
            <CardContent>
              <Text tone="muted">
                Toggling the rail above never remounts this column — the alternative, dropping
                SplitPane at the call site, changes the tree depth and does.
              </Text>
            </CardContent>
          </Card>
        </SplitPane>
      </div>
    </div>
  );
}
