"use client";

// src/Tiptap.tsx
import {
  useEditor,
  EditorContent,
  Editor,
  useEditorState,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import { Toggle } from "@/components/ui/toggle";
import {
  IconBold as BoldIcon,
  IconCode as CodeIcon,
  IconMaximize as Fullscreen,
  IconHighlight as HighlighterIcon,
  IconPhotoUp as ImagePlus,
  IconItalic as ItalicIcon,
  IconLink as LinkIcon,
  IconList as ListIcon,
  IconListNumbers as ListOrderedIcon,
  IconQuote as Quote,
  IconArrowForwardUp as RedoIcon,
  IconStrikethrough as StrikethroughIcon,
  IconUnderline as UnderlineIcon,
  IconArrowBackUp as UndoIcon,
  IconUnlink as UnlinkIcon,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ReactNode, useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BubbleMenu as TiptapBubbleMenu } from "@tiptap/react/menus";
import { FloatingMenu as TiptapFloatingMenu } from "@tiptap/react/menus";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import CodeBlock from "@tiptap/extension-code-block";
import { uploadFile } from "@/hooks/use-image-upload";
import {
  IconAlignCenter,
  IconAlignJustified,
  IconAlignLeft,
  IconAlignRight,
  IconBoxAlignLeftFilled,
  IconBoxAlignRightFilled,
  IconSourceCode,
  IconSubtitles,
} from "@tabler/icons-react";
import { AdvancedImage } from "@/components/admin/ui/resizable-image";
import { ReactNodeViewRenderer } from "@tiptap/react";
import SimpleCodeBlock from "@/components/admin/ui/simple-code-block";
// editorProps lets me customize the HTML element that Tiptap creates for the editor.
// I add Tailwind’s prose classes so my editor text looks beautiful — with proper heading sizes, spacing, lists, blockquotes, and typography. Without this, the editor looks plain and unstyled

const Tiptap = ({
  content,
  id,
  onChange,
}: {
  content?: string;
  id: string;
  onChange?: (content: string) => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File) => {
    if (!editor) return;

    const res = await uploadFile({
      file,
      maxSize: 2 * 1024 * 1024,
      allowedTypes: ["image/jpeg", "image/png", "image/webp"],
      folder: "posts",
    });

    if (res.success && res.uploadResponse?.url) {
      editor.chain().focus().setImage({ src: res.uploadResponse.url }).run();
    }
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight.configure({ multicolor: true }),
      AdvancedImage,
      Underline,
      Link.configure({ openOnClick: false }),
      Superscript,
      Subscript,
      CodeBlock.extend({
        addNodeView() {
          return ReactNodeViewRenderer(SimpleCodeBlock);
        },
        addKeyboardShortcuts() {
          return {
            Tab: () => {
              this.editor.commands.insertContent("    "); // 4 spaces
              return true;
            },
            "Shift-Tab": () => {
              return true; // Prevent focus shift
            },
          };
        },
      }),
      ,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ], // define your extension array
    editorProps: {
      attributes: {
        class:
          "prose prose-lg dark:prose-invert focus:outline-none max-w-none prose-headings:font-semibold prose-p:leading-relaxed prose-img:rounded-xl prose-img:mx-auto",
      },
    },
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    immediatelyRender: false,
  });

  return (
    <div className="bg-background relative rounded-lg border border-foreground/20 shadow-sm overflow-hidden">
      {editor && (
        <>
          <ToolBar
            editor={editor}
            fileInputRef={fileInputRef}
            handleImageUpload={handleImageUpload}
          />
          <BubbleMenu
            editor={editor}
            fileInputRef={fileInputRef}
            handleImageUpload={handleImageUpload}
          />
          <FloatingMenu
            editor={editor}
            fileInputRef={fileInputRef}
            handleImageUpload={handleImageUpload}
          />
        </>
      )}
      <EditorContent
        editor={editor}
        className="min-h-[300px] px-4 py-3"
        id={id}
      />
      <input
        type="file"
        hidden
        ref={fileInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageUpload(file);
        }}
      />
    </div>
  );
};

export default Tiptap;

function LinkComponent({
  editor,
  children,
}: {
  editor: Editor;
  children: ReactNode;
}) {
  const [linkUrl, setLinkUrl] = useState("");
  const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false);

  const handleSetLink = () => {
    if (linkUrl) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run();
    } else {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    }
    setIsLinkPopoverOpen(false);
    setLinkUrl("");
  };

  return (
    <Popover open={isLinkPopoverOpen} onOpenChange={setIsLinkPopoverOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      {/* // this is the main */}
      {/* trigger point */}
      <PopoverContent className="w-80 p-4">
        <div className="flex flex-col gap-4">
          <h3 className="font-medium">Insert Link</h3>
          <Input
            placeholder="https://example.com"
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSetLink();
              }
            }}
          />
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setIsLinkPopoverOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSetLink}>Save</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

const ToolBar = ({
  editor,
  fileInputRef,
  handleImageUpload,
}: {
  editor: Editor;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleImageUpload: (file: File) => Promise<void>;
}) => {
  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      return {
        isBold: ctx.editor.isActive("bold") ?? false,
        isItalic: ctx.editor.isActive("italic") ?? false,
        iamThapa: ctx.editor.isActive("underline") ?? false,
        isStrike: ctx.editor.isActive("strike") ?? false,
        isCode: ctx.editor.isActive("code") ?? false,
        isHighlight: ctx.editor.isActive("highlight") ?? false,
        isBulletList: ctx.editor.isActive("bulletList") ?? false,
        isOrderedList: ctx.editor.isActive("orderedList") ?? false,
        isBlockquote: ctx.editor.isActive("blockquote") ?? false,
        isLink: ctx.editor.isActive("link") ?? false,
        canRedo: editor.can().redo(),
        canUndo: editor.can().undo(),
        isHeading1: ctx.editor.isActive("heading", { level: 1 }) ?? false,
        isHeading2: ctx.editor.isActive("heading", { level: 2 }) ?? false,
        isHeading3: ctx.editor.isActive("heading", { level: 3 }) ?? false,
        isHeading4: ctx.editor.isActive("heading", { level: 4 }) ?? false,
        isHeading5: ctx.editor.isActive("heading", { level: 5 }) ?? false,
        isHeading6: ctx.editor.isActive("heading", { level: 6 }) ?? false,
        isParagraph: ctx.editor.isActive("paragraph") ?? false,
      };
    },
  });

  const handleHeadingChange = (value: string) => {
    if (value === "paragraph") {
      editor.chain().focus().setParagraph().run();
    } else {
      const level = Number.parseInt(value.replace("heading", "")) as
        | 1
        | 2
        | 3
        | 4
        | 5
        | 6;
      editor.chain().focus().setHeading({ level }).run();
    }
  };

  return (
    <div
      className={
        "bg-background sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b border-foreground/20 p-2"
      }
    >
      <Select
        onValueChange={handleHeadingChange}
        value={
          editorState.isHeading1
            ? "heading1"
            : editorState.isHeading2
              ? "heading2"
              : editorState.isHeading3
                ? "heading3"
                : editorState.isHeading4
                  ? "heading4"
                  : editorState.isHeading5
                    ? "heading5"
                    : editorState.isHeading6
                      ? "heading6"
                      : "paragraph"
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Paragraph" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="paragraph">Paragraph</SelectItem>
          <SelectItem value="heading1">Heading 1</SelectItem>
          <SelectItem value="heading2">Heading 2</SelectItem>
          <SelectItem value="heading3">Heading 3</SelectItem>
          <SelectItem value="heading4">Heading 4</SelectItem>
          <SelectItem value="heading5">Heading 5</SelectItem>
          <SelectItem value="heading6">Heading 6</SelectItem>
        </SelectContent>
      </Select>

      <Toggle
        size="sm"
        pressed={editorState.isBold}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
        aria-label="Toggle bold"
      >
        <BoldIcon className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editorState.isItalic}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        aria-label="Toggle bold"
      >
        <ItalicIcon className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editorState.iamThapa}
        onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
        aria-label="Toggle underline"
      >
        <UnderlineIcon className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editorState.isStrike}
        onPressedChange={() => editor.chain().focus().toggleStrike().run()}
        aria-label="Toggle strikethrough"
      >
        <StrikethroughIcon className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editorState.isHighlight}
        onPressedChange={() =>
          editor.chain().focus().toggleHighlight({ color: "#fdeb80" }).run()
        }
        aria-label="Toggle highlight"
      >
        <HighlighterIcon className="h-4 w-4" />
      </Toggle>
      <div className="bg-border mx-1 h-6 w-px" />
      <Toggle
        size="sm"
        pressed={editorState.isCode}
        onPressedChange={() => editor.chain().focus().toggleCode().run()}
        aria-label="Toggle code"
      >
        <CodeIcon className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive("codeBlock")}
        onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <IconSourceCode />
      </Toggle>
      <div className="bg-border mx-1 h-6 w-px" />
      <Toggle
        size="sm"
        pressed={editorState.isBulletList}
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
        aria-label="Toggle bullet list"
      >
        <ListIcon className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editorState.isOrderedList}
        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
        aria-label="Toggle ordered list"
      >
        <ListOrderedIcon className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editorState.isBlockquote}
        onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
        aria-label="Toggle blockquote"
      >
        <Quote className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive("superscript")}
        onPressedChange={() => editor.chain().focus().toggleSuperscript().run()}
      >
        <span className="text-xs">x²</span>
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive("subscript")}
        onPressedChange={() => editor.chain().focus().toggleSubscript().run()}
      >
        <span className="text-xs">x₂</span>
      </Toggle>
      <div className="bg-border mx-1 h-6 w-px" />
      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: "left" })}
        onPressedChange={() =>
          editor.chain().focus().setTextAlign("left").run()
        }
      >
        <IconAlignLeft />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: "center" })}
        onPressedChange={() =>
          editor.chain().focus().setTextAlign("center").run()
        }
      >
        <IconAlignCenter />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: "right" })}
        onPressedChange={() =>
          editor.chain().focus().setTextAlign("right").run()
        }
      >
        <IconAlignRight />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: "justify" })}
        onPressedChange={() =>
          editor.chain().focus().setTextAlign("justify").run()
        }
      >
        <IconAlignJustified />
      </Toggle>
      <div className="bg-border mx-1 h-6 w-px" />
      <Button
        size="sm"
        variant="ghost"
        className="m-0 p-0 h-fit w-fit ml-1"
        type="button"
        onClick={() => fileInputRef.current?.click()}
      >
        <ImagePlus />
      </Button>
      <Toggle
        size="sm"
        pressed={editor.isActive("image", { class: "full-width" })}
        onPressedChange={() =>
          editor
            .chain()
            .focus()
            .updateAttributes("image", {
              class: editor.isActive("image", { class: "full-width" })
                ? null
                : "full-width",
            })
            .run()
        }
      >
        <Fullscreen />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("image", { class: "float-left" })}
        onPressedChange={() =>
          editor
            .chain()
            .focus()
            .updateAttributes("image", {
              class: editor.isActive("image", { class: "float-left" })
                ? null
                : "float-left",
            })
            .run()
        }
      >
        <IconBoxAlignLeftFilled />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("image", { class: "float-right" })}
        onPressedChange={() =>
          editor
            .chain()
            .focus()
            .updateAttributes("image", {
              class: editor.isActive("image", { class: "float-right" })
                ? null
                : "float-right",
            })
            .run()
        }
      >
        <IconBoxAlignRightFilled />
      </Toggle>
      <Button
        size="sm"
        variant="ghost"
        type="button"
        onClick={() => {
          const caption = prompt("Enter image caption");
          if (caption) {
            editor.chain().focus().updateAttributes("image", { caption }).run();
          }
        }}
      >
        <IconSubtitles />
      </Button>
      <div className="bg-border mx-1 h-6 w-px" />
      {editorState.isLink ? (
        <Toggle
          pressed
          onPressedChange={() =>
            editor.chain().focus().extendMarkRange("link").unsetLink().run()
          }
        >
          <UnlinkIcon className="h-4 w-4" />
        </Toggle>
      ) : (
        <LinkComponent editor={editor}>
          <Toggle size="sm" aria-label="Toggle link">
            <LinkIcon className="h-4 w-4" />
          </Toggle>
        </LinkComponent>
      )}

      <div className="bg-border mx-1 h-6 w-px" />

      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editorState.canUndo}
        aria-label="Undo"
      >
        <UndoIcon className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editorState.canRedo}
        aria-label="Redo"
      >
        <RedoIcon className="h-4 w-4" />
      </Button>
    </div>
  );
};

function BubbleMenu({
  editor,
  fileInputRef,
  handleImageUpload,
}: {
  editor: Editor;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleImageUpload: (file: File) => Promise<void>;
}) {
  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      return {
        isBold: ctx.editor.isActive("bold") ?? false,
        isItalic: ctx.editor.isActive("italic") ?? false,
        isUnderline: ctx.editor.isActive("underline") ?? false,
        isHighlight: ctx.editor.isActive("highlight") ?? false,
        isStrike: ctx.editor.isActive("strike") ?? false,
        isCode: ctx.editor.isActive("code") ?? false,
        isBulletList: ctx.editor.isActive("bulletList") ?? false,
        isOrderedList: ctx.editor.isActive("orderedList") ?? false,
        isBlockquote: ctx.editor.isActive("blockquote") ?? false,
        isLink: ctx.editor.isActive("link") ?? false,
      };
    },
  });

  return (
    <TiptapBubbleMenu
      editor={editor}
      className="bg-background flex items-center rounded-md border shadow-md relative z-200"
    >
      <Toggle
        size="sm"
        pressed={editorState.isBold}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
        aria-label="Toggle bold"
      >
        <BoldIcon className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editorState.isItalic}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        aria-label="Toggle bold"
      >
        <ItalicIcon className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editorState.isUnderline}
        onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
        aria-label="Toggle underline"
      >
        <UnderlineIcon className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editorState.isStrike}
        onPressedChange={() => editor.chain().focus().toggleStrike().run()}
        aria-label="Toggle strikethrough"
      >
        <StrikethroughIcon className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editorState.isHighlight}
        onPressedChange={() =>
          editor.chain().focus().toggleHighlight({ color: "#fdeb80" }).run()
        }
        aria-label="Toggle highlight"
      >
        <HighlighterIcon className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editorState.isCode}
        onPressedChange={() => editor.chain().focus().toggleCode().run()}
        aria-label="Toggle code"
      >
        <CodeIcon className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("codeBlock")}
        onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <IconSourceCode />
      </Toggle>
      <div className="bg-border mx-1 h-6 w-px" />

      <Toggle
        size="sm"
        pressed={editorState.isBulletList}
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
        aria-label="Toggle bullet list"
      >
        <ListIcon className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editorState.isOrderedList}
        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
        aria-label="Toggle ordered list"
      >
        <ListOrderedIcon className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editorState.isBlockquote}
        onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
        aria-label="Toggle blockquote"
      >
        <Quote className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive("superscript")}
        onPressedChange={() => editor.chain().focus().toggleSuperscript().run()}
      >
        <span className="text-xs">x²</span>
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive("subscript")}
        onPressedChange={() => editor.chain().focus().toggleSubscript().run()}
      >
        <span className="text-xs">x₂</span>
      </Toggle>
      <div className="bg-border mx-1 h-6 w-px" />
      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: "left" })}
        onPressedChange={() =>
          editor.chain().focus().setTextAlign("left").run()
        }
      >
        <IconAlignLeft />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: "center" })}
        onPressedChange={() =>
          editor.chain().focus().setTextAlign("center").run()
        }
      >
        <IconAlignCenter />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: "right" })}
        onPressedChange={() =>
          editor.chain().focus().setTextAlign("right").run()
        }
      >
        <IconAlignRight />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: "justify" })}
        onPressedChange={() =>
          editor.chain().focus().setTextAlign("justify").run()
        }
      >
        <IconAlignJustified />
      </Toggle>
      <div className="bg-border mx-1 h-6 w-px" />
      <Button
        size="sm"
        variant="ghost"
        className="m-0 p-0 h-fit w-fit mr-1"
        type="button"
        onClick={() => fileInputRef.current?.click()}
      >
        <ImagePlus />
      </Button>
      <Toggle
        size="sm"
        pressed={editor.isActive("image", { class: "full-width" })}
        onPressedChange={() =>
          editor
            .chain()
            .focus()
            .updateAttributes("image", {
              class: editor.isActive("image", { class: "full-width" })
                ? null
                : "full-width",
            })
            .run()
        }
      >
        <Fullscreen />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("image", { class: "float-left" })}
        onPressedChange={() =>
          editor
            .chain()
            .focus()
            .updateAttributes("image", {
              class: editor.isActive("image", { class: "float-left" })
                ? null
                : "float-left",
            })
            .run()
        }
      >
        <IconBoxAlignLeftFilled />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("image", { class: "float-right" })}
        onPressedChange={() =>
          editor
            .chain()
            .focus()
            .updateAttributes("image", {
              class: editor.isActive("image", { class: "float-right" })
                ? null
                : "float-right",
            })
            .run()
        }
      >
        <IconBoxAlignRightFilled />
      </Toggle>
      <Button
        size="sm"
        variant="ghost"
        type="button"
        onClick={() => {
          const caption = prompt("Enter image caption");
          if (caption) {
            editor.chain().focus().updateAttributes("image", { caption }).run();
          }
        }}
      >
        <IconSubtitles />
      </Button>
      <div className="bg-border mx-1 h-6 w-px" />
      {editorState.isLink ? (
        <Toggle
          pressed
          onPressedChange={() =>
            editor.chain().focus().extendMarkRange("link").unsetLink().run()
          }
        >
          <UnlinkIcon className="h-4 w-4" />
        </Toggle>
      ) : (
        <LinkComponent editor={editor}>
          <Toggle size="sm" aria-label="Toggle link">
            <LinkIcon className="h-4 w-4" />
          </Toggle>
        </LinkComponent>
      )}
    </TiptapBubbleMenu>
  );
}

function FloatingMenu({
  editor,
  fileInputRef,
  handleImageUpload,
}: {
  editor: Editor;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleImageUpload: (file: File) => Promise<void>;
}) {
  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      return {
        isBold: ctx.editor.isActive("bold") ?? false,
        isItalic: ctx.editor.isActive("italic") ?? false,
        isUnderline: ctx.editor.isActive("underline") ?? false,
        isHighlight: ctx.editor.isActive("highlight") ?? false,
        isStrike: ctx.editor.isActive("strike") ?? false,
        isCode: ctx.editor.isActive("code") ?? false,
        isBulletList: ctx.editor.isActive("bulletList") ?? false,
        isOrderedList: ctx.editor.isActive("orderedList") ?? false,
        isBlockquote: ctx.editor.isActive("blockquote") ?? false,
        isLink: ctx.editor.isActive("link") ?? false,
      };
    },
  });

  return (
    <TiptapFloatingMenu
      editor={editor}
      className="bg-background flex items-center rounded-md border shadow-md relative z-200"
    >
      <Toggle
        size="sm"
        pressed={editorState.isBold}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
        aria-label="Toggle bold"
      >
        <BoldIcon className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editorState.isItalic}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        aria-label="Toggle bold"
      >
        <ItalicIcon className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editorState.isUnderline}
        onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
        aria-label="Toggle underline"
      >
        <UnderlineIcon className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editorState.isStrike}
        onPressedChange={() => editor.chain().focus().toggleStrike().run()}
        aria-label="Toggle strikethrough"
      >
        <StrikethroughIcon className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editorState.isHighlight}
        onPressedChange={() =>
          editor.chain().focus().toggleHighlight({ color: "#fdeb80" }).run()
        }
        aria-label="Toggle highlight"
      >
        <HighlighterIcon className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editorState.isCode}
        onPressedChange={() => editor.chain().focus().toggleCode().run()}
        aria-label="Toggle code"
      >
        <CodeIcon className="h-4 w-4" />
      </Toggle>

      <div className="bg-border mx-1 h-6 w-px" />

      <Toggle
        size="sm"
        pressed={editorState.isBulletList}
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
        aria-label="Toggle bullet list"
      >
        <ListIcon className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editorState.isOrderedList}
        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
        aria-label="Toggle ordered list"
      >
        <ListOrderedIcon className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editorState.isBlockquote}
        onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
        aria-label="Toggle blockquote"
      >
        <Quote className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("superscript")}
        onPressedChange={() => editor.chain().focus().toggleSuperscript().run()}
      >
        <span className="text-xs">x²</span>
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive("subscript")}
        onPressedChange={() => editor.chain().focus().toggleSubscript().run()}
      >
        <span className="text-xs">x₂</span>
      </Toggle>
      <div className="bg-border mx-1 h-6 w-px" />
      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: "left" })}
        onPressedChange={() =>
          editor.chain().focus().setTextAlign("left").run()
        }
      >
        <IconAlignLeft />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: "center" })}
        onPressedChange={() =>
          editor.chain().focus().setTextAlign("center").run()
        }
      >
        <IconAlignCenter />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: "right" })}
        onPressedChange={() =>
          editor.chain().focus().setTextAlign("right").run()
        }
      >
        <IconAlignRight />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: "justify" })}
        onPressedChange={() =>
          editor.chain().focus().setTextAlign("justify").run()
        }
      >
        <IconAlignJustified />
      </Toggle>
      <div className="bg-border mx-1 h-6 w-px" />
      <Button
        size="sm"
        variant="ghost"
        className="m-0 p-0 h-fit w-fit mr-1"
        type="button"
        onClick={() => fileInputRef.current?.click()}
      >
        <ImagePlus />
      </Button>
      <Toggle
        size="sm"
        pressed={editor.isActive("image", { class: "full-width" })}
        onPressedChange={() =>
          editor
            .chain()
            .focus()
            .updateAttributes("image", {
              class: editor.isActive("image", { class: "full-width" })
                ? null
                : "full-width",
            })
            .run()
        }
      >
        <Fullscreen />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("image", { class: "float-left" })}
        onPressedChange={() =>
          editor
            .chain()
            .focus()
            .updateAttributes("image", {
              class: editor.isActive("image", { class: "float-left" })
                ? null
                : "float-left",
            })
            .run()
        }
      >
        <IconBoxAlignLeftFilled />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("image", { class: "float-right" })}
        onPressedChange={() =>
          editor
            .chain()
            .focus()
            .updateAttributes("image", {
              class: editor.isActive("image", { class: "float-right" })
                ? null
                : "float-right",
            })
            .run()
        }
      >
        <IconBoxAlignRightFilled />
      </Toggle>
      <Button
        size="sm"
        variant="ghost"
        type="button"
        onClick={() => {
          const caption = prompt("Enter image caption");
          if (caption) {
            editor.chain().focus().updateAttributes("image", { caption }).run();
          }
        }}
      >
        <IconSubtitles />
      </Button>
      <div className="bg-border mx-1 h-6 w-px" />
      {editorState.isLink ? (
        <Toggle
          pressed
          onPressedChange={() =>
            editor.chain().focus().extendMarkRange("link").unsetLink().run()
          }
        >
          <UnlinkIcon className="h-4 w-4" />
        </Toggle>
      ) : (
        <LinkComponent editor={editor}>
          <Toggle size="sm" aria-label="Toggle link">
            <LinkIcon className="h-4 w-4" />
          </Toggle>
        </LinkComponent>
      )}
    </TiptapFloatingMenu>
  );
}
