import { mergeAttributes } from "@tiptap/core";
import Image from "@tiptap/extension-image";

export const AdvancedImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),

      class: {
        default: null,
      },

      caption: {
        default: "",
      },

      width: {
        default: null,
      },
    };
  },
  group: "block",

  draggable: true,
  renderHTML({ HTMLAttributes }) {
    const { caption, ...attrs } = HTMLAttributes;

    if (caption) {
      return [
        "figure",
        { class: "editor-figure" },
        ["img", mergeAttributes(this.options.HTMLAttributes, attrs)],
        ["figcaption", { class: "editor-caption" }, caption],
      ];
    }

    return ["img", mergeAttributes(this.options.HTMLAttributes, attrs)];
  },
});
