"use client";

import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { useState } from "react";
import { IconCheck as Check, IconCopy as Copy } from "@tabler/icons-react";

export default function SimpleCodeBlock({ node }: NodeViewProps) {
  const [copied, setCopied] = useState(false);

  const code = node.textContent;
  const lines = code.split("\n");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <NodeViewWrapper className="relative">
      {/* Copy Button */}
      <button
        onClick={handleCopy}
        type="button"
        className="absolute mt-10 right-3 z-10 flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-xs text-white transition"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? "Copied" : "Copy"}
      </button>

      <div className="overflow-x-auto rounded-xl">
        <pre className="flex text-sm leading-6">
          {/* Line Numbers */}
          <div className="select-none text-right pr-4 pl-4 py-4 text-foreground">
            {lines.map((_, index) => (
              <div key={"line-num-" + index}>{index + 1}</div>
            ))}
          </div>

          {/* Code Content */}
          <code className="mt-3 pr-6 whitespace-pre text-[#e6edf3] !bg-transparent">
            {code}
          </code>
        </pre>
      </div>
    </NodeViewWrapper>
  );
}
