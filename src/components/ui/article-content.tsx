"use client";

import parse, {
  Element,
  Text,
  HTMLReactParserOptions,
  DOMNode,
} from "html-react-parser";
import { CodeBlock } from "@/components/admin/ui/code-block";

interface ArticleContentProps {
  html: string;
}

export function ArticleContent({ html }: ArticleContentProps) {
  const options: HTMLReactParserOptions = {
    replace: (domNode) => {
      // Look for <pre> tags
      if (domNode instanceof Element && domNode.name === "pre") {
        // Try to find a nested <code> tag (standard HTML output for most editors)
        const codeNode = domNode.children.find(
          (child) => child instanceof Element && child.name === "code",
        ) as Element | undefined;

        // Fallback to the <pre> content if there is no <code> tag
        const contentNodes = codeNode ? codeNode.children : domNode.children;

        // Recursively extract all text content from inside the code block safely
        let rawText = "";
        const extractText = (nodes: DOMNode[]) => {
          for (const node of nodes) {
            if (node instanceof Text) {
              rawText += node.data;
            } else if ("children" in node && Array.isArray(node.children)) {
              extractText(node.children as DOMNode[]);
            }
          }
        };

        extractText(contentNodes as DOMNode[]);

        // Render our beautiful custom Code Block instead of the standard HTML!
        return <CodeBlock code={rawText} />;
      }
    },
  };

  return (
    <div className="w-full prose prose-neutral dark:prose-invert prose-base md:prose-lg prose-headings:font-bold prose-a:text-primary hover:prose-a:text-primary/80 prose-img:rounded-xl">
      {/* Fallback to empty string in case HTML is undefined during hydration */}
      {parse(html || "", options)}
    </div>
  );
}
