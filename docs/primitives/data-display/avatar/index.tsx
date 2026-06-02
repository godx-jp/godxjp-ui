import { Avatar, AvatarFallback, AvatarImage } from "@godxjp/ui/data-display";

export default function AvatarDemo() {
  return (
    <Avatar>
      <AvatarImage src="https://github.com/godx-jp.png" alt="GodX" />
      <AvatarFallback>GX</AvatarFallback>
    </Avatar>
  );
}
