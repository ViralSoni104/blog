import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";

type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

interface PremiumToastProps {
  message: string;
  image?: string | null;
  actionLabel?: string;
  onAction?: () => void;
  // 💡 Use the proper Sonner type instead of 'any'
  position?: ToastPosition;
}

export const premiumToast = ({
  message,
  image,
  actionLabel,
  onAction,
  position = "bottom-right", // Default fallback
}: PremiumToastProps) => {
  const toastId = Math.random().toString(36).substring(2, 9);

  return toast.custom(
    (t) => (
      <div className="flex items-stretch w-[350px] h-[52px] bg-white border border-border rounded-md shadow-lg overflow-hidden pointer-events-auto">
        {/* LEFT: Thumbnail */}
        <div className="relative w-20 shrink-0 bg-muted border-r border-border/50">
          {image ? (
            <Image
              src={image}
              alt="thumbnail"
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="size-1.5 rounded-full bg-primary/20" />
            </div>
          )}
        </div>

        {/* CENTER: Text */}
        <div className="flex-1 flex items-center px-4 py-2">
          <p className="text-[13px] font-medium leading-tight tracking-tight text-black line-clamp-2">
            {message}
          </p>
        </div>

        {/* RIGHT: Action Button */}
        {actionLabel && (
          <div className="flex items-center pr-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onAction?.();
                toast.dismiss(t);
              }}
              className="px-3 text-[12px] font-bold text-black bg-white border border-1 hover:text-black border-muted-foreground/30 hover:bg-primary/5 rounded-md transition-colors uppercase tracking-wider"
            >
              {actionLabel}
            </Button>
          </div>
        )}
      </div>
    ),
    {
      id: toastId,
      duration: 4000,
      position: position, // 💡 This correctly targets the specific area of the screen
    },
  );
};
