"use client";

import { useState } from "react";
import { IconCopy, IconCheck } from "@tabler/icons-react";
import { cn, copyToClipboard } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
}

export function CodeBlock({ code }: CodeBlockProps) {
  const [isCopied, setIsCopied] = useState(false);

  // Clean up the code string and split it into lines
  const rawCode = code.trim();
  const lines = rawCode.split("\n");

  const copyToClipboardClient = async () => {
    const success = await copyToClipboard(rawCode);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } else {
      setIsCopied(false); // Fallback feedback
    }
  };

  return (
    <div className="relative group my-8 rounded-xl overflow-hidden bg-zinc-950 border border-muted-foreground/30 shadow-2xl">
      {/* 1. Minimal Header */}
      <div className="flex justify-between items-center px-4 py-3 bg-white/[0.02] border-b border-white/5">
        {/* Sleek Monochrome Window Controls */}
        <div className="flex gap-1.5 items-center">
          <div className="size-2.5 rounded-full bg-red-500/80" />
          <div className="size-2.5 rounded-full bg-yellow-500/80" />
          <div className="size-2.5 rounded-full bg-primary/80" />
        </div>

        {/* Icon-Only Copy Button */}
        <button
          onClick={copyToClipboardClient}
          aria-label="Copy code"
          className={cn(
            "flex items-center justify-center p-1.5 rounded-md transition-all duration-200",
            isCopied
              ? "bg-emerald-500/20 text-emerald-400"
              : "text-zinc-400 hover:bg-white/10 hover:text-zinc-200",
          )}
        >
          {isCopied ? <IconCheck size={16} /> : <IconCopy size={16} />}
        </button>
      </div>

      {/* 2. Code Content with Refined Line Numbers */}
      <div className="p-4 overflow-x-auto text-[13px] md:text-sm font-mono leading-relaxed text-zinc-300">
        <div className="flex flex-col">
          {lines
            .map((line, i) => ({
              id: `code-line-${i}`,
              content: line,
              num: i + 1,
            }))
            .map((lineObj) => (
              <div
                key={lineObj.id}
                className="flex px-2 hover:bg-white/5 rounded-sm transition-colors"
              >
                {/* Line Number (No harsh borders, just clean spacing) */}
                <span className="w-8 shrink-0 text-zinc-600 select-none text-right pr-4 mr-2">
                  {lineObj.num}
                </span>

                {/* Actual Code Line */}
                <span className="whitespace-pre">{lineObj.content || " "}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
