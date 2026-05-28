import { Toaster, toast, useToast } from "@godxjp/ui/feedback";

export default function Demo() {
  const legacyToast = useToast();

  return (
    <>
      <button
        type="button"
        onClick={() => {
          toast.success("Toast success");
          legacyToast.toast({ title: "Legacy toast", variant: "success" });
        }}
      >
        Show toast
      </button>
      <Toaster />
    </>
  );
}
