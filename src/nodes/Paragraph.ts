import { setBlockType } from "prosemirror-commands";
import Node, { NodeArgs } from "./Node";
import { Node as ProseMirrorNode, NodeSpec } from "prosemirror-model";
import { MarkdownSerializerState } from "../lib/markdown/serializer";
import { EmptyAttrs } from "../lib/Extension";

export default class Paragraph extends Node<EmptyAttrs, EmptyAttrs> {
  get name() {
    return "paragraph";
  }

  get schema(): NodeSpec {
    return {
      content: "inline*",
      group: "block",
      parseDOM: [{ tag: "p" }],
      toDOM() {
        return ["p", 0];
      }
    };
  }

  keys({ type }: NodeArgs) {
    return {
      "Ctrl-Shift-0": setBlockType(type)
    };
  }

  commands({ type }: NodeArgs) {
    return () => setBlockType(type);
  }

  toMarkdown(state: MarkdownSerializerState, node: ProseMirrorNode) {
    // render empty paragraphs as hard breaks to ensure that newlines are
    // persisted between reloads (this breaks from markdown tradition)
    if (
      node.textContent.trim() === "" &&
      node.childCount === 0 &&
      // @ts-ignore
      !state.inTable
    ) {
      state.write("\\\n");
    } else {
      state.renderInline(node);
      state.closeBlock(node);
    }
  }

  parseMarkdown() {
    return { block: this.name };
  }
}
