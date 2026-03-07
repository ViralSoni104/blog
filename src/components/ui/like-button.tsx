"use client";

import { m, useAnimation } from "framer-motion";
import { IconHeart } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Static "random-looking" paths for particles
const PARTICLE_PATHS = [
  { x: 15, y: -25, delay: 0.02 },
  { x: -15, y: -22, delay: 0.08 },
  { x: 20, y: 10, delay: 0.05 },
  { x: -22, y: 12, delay: 0.01 },
  { x: 5, y: -30, delay: 0.07 },
  { x: -5, y: 25, delay: 0.03 },
];

interface AnimatedLikeButtonProps {
  isLiked: boolean;
  likes: number;
  onClick: () => void;
}

export function AnimatedLikeButton({
  isLiked,
  likes,
  onClick,
}: AnimatedLikeButtonProps) {
  const controls = useAnimation();

  const handleClick = () => {
    if (!isLiked) {
      // Trigger the YouTube "Pop" animation
      controls.start({
        scale: [1, 1.4, 0.9, 1.1, 1],
        transition: { duration: 0.4, ease: "easeOut" },
      });
    }
    onClick();
  };

  return (
    <div className="relative flex items-center">
      {/* Particle Burst - Only shows when turning 'Liked' */}
      {isLiked && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {PARTICLE_PATHS.map((p) => (
            <m.span
              key={`particle-${p.x}-${p.y}`}
              initial={{ scale: 0.95, opacity: 1, x: 0, y: 0 }}
              animate={{
                scale: [0, 1, 0],
                x: [0, p.x],
                y: [0, p.y],
                opacity: [1, 1, 0],
              }}
              transition={{ duration: 0.5, delay: p.delay }}
              className="absolute size-1 rounded-full bg-red-500"
            />
          ))}
        </div>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        className={cn(
          "rounded-full gap-2 transition-colors duration-300 relative z-10",
          isLiked && "text-red-500 bg-red-500/10 hover:bg-red-500/20",
        )}
      >
        <m.div animate={controls}>
          <IconHeart size={20} className={cn(isLiked && "fill-current")} />
        </m.div>
        <span className="font-mono text-xs tabular-nums">{likes}</span>
      </Button>
    </div>
  );
}
