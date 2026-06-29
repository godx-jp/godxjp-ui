import { Avatar, AvatarImage, AvatarFallback } from "@godxjp/ui";

export function Group() {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
      <Avatar>
        <AvatarImage src="https://i.pravatar.cc/80?img=12" alt="Tanaka" />
        <AvatarFallback>TA</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src="https://i.pravatar.cc/80?img=32" alt="Suzuki" />
        <AvatarFallback>SU</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>YM</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>+5</AvatarFallback>
      </Avatar>
    </div>
  );
}
