import { Alert, AlertTitle, AlertDescription } from "@godxjp/ui";

export function Tones() {
  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 460 }}>
      <Alert tone="info">
        <AlertTitle>Scheduled maintenance</AlertTitle>
        <AlertDescription>The portal will be read-only on Sunday 02:00–04:00 JST.</AlertDescription>
      </Alert>
      <Alert tone="success">
        <AlertTitle>Timesheet submitted</AlertTitle>
        <AlertDescription>Your June timesheet was sent to your manager for approval.</AlertDescription>
      </Alert>
      <Alert tone="warning">
        <AlertTitle>Approval pending</AlertTitle>
        <AlertDescription>3 correction requests are waiting for your review.</AlertDescription>
      </Alert>
      <Alert tone="destructive">
        <AlertTitle>Submission failed</AlertTitle>
        <AlertDescription>Could not reach the server. Check your connection and retry.</AlertDescription>
      </Alert>
    </div>
  );
}

export function Dismissable() {
  return (
    <Alert tone="info" onDismiss={() => {}} style={{ maxWidth: 460 }}>
      <AlertTitle>Tip</AlertTitle>
      <AlertDescription>You can export any table to CSV from the view options menu.</AlertDescription>
    </Alert>
  );
}
