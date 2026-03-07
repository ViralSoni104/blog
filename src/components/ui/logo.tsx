import { cn } from "@/lib/utils";

export default function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("font-extrabold tracking-tighter", className)}>
      Dev
      <span className="text-primary">
        Logs<span className="animate-pulse">.</span>
      </span>
    </div>
  );
}
