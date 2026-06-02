import {
  Alert,
  AlertActions,
  AlertContent,
  AlertDescription,
  AlertTitle,
} from "@godxjp/ui/feedback";

export default function Demo() {
  return (
    <>
      <Alert>
        <AlertTitle>Default</AlertTitle>
        <AlertContent>
          <AlertDescription>AlertDescription</AlertDescription>
        </AlertContent>
      </Alert>
      <Alert tone="warning">
        <AlertTitle>Warning</AlertTitle>
        <AlertContent>
          <AlertDescription>AlertDescription</AlertDescription>
          <AlertActions>AlertActions</AlertActions>
        </AlertContent>
      </Alert>
      <Alert tone="success">
        <AlertTitle>Success</AlertTitle>
      </Alert>
      <Alert tone="destructive">
        <AlertTitle>Destructive</AlertTitle>
      </Alert>
    </>
  );
}
