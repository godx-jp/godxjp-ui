import { ShellApp } from "@godxjp/ui/layout";

export default function Demo() {
  return (
    <ShellApp menu={<nav>Menu slot</nav>} breadcrumb={<span>Breadcrumb slot</span>}>
      ShellApp children
    </ShellApp>
  );
}
