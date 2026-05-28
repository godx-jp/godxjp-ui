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
      <Alert variant="warning">
        <AlertTitle>Warning</AlertTitle>
        <AlertContent>
          <AlertDescription>AlertDescription</AlertDescription>
          <AlertActions>AlertActions</AlertActions>
        </AlertContent>
      </Alert>
      <Alert variant="success">
        <AlertTitle>Success</AlertTitle>
      </Alert>
      <Alert variant="destructive">
        <AlertTitle>Destructive</AlertTitle>
      </Alert>
    </>
  );
}
