import { IconLoader2 } from "@tabler/icons-react";

export default function Loading() {
  return (
    <div className="flex items-center justify-center">
      <IconLoader2 className="animate-spin text-muted-foreground size-6" />
    </div>
  );
}
