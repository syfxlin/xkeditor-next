import { wrappingInputRule } from "prosemirror-inputrules";
import Node, { NodeArgs } from "./Node";
import toggleWrap from "../commands/toggleWrap";
import { Node as ProsemirrorNode, NodeSpec } from "prosemirror-model";
import { MarkdownSerializerState } from "../lib/markdown/serializer";

export default class Blockquote extends Node {
  get name() {
    return "blockquote";
  }

  get schema(): NodeSpec {
    return {
      content: "block+",
      group: "block",
      defining: true,
      parseDOM: [{ tag: "blockquote" }],
      toDOM: () => ["blockquote", 0]
    };
  }

  inputRules({ type }: NodeArgs) {
    return [wrappingInputRule(/^\s*>\s$/, type)];
  }

  commands({ type }: NodeArgs) {
    return () => toggleWrap(type);
  }

  keys({ type }: NodeArgs) {
    return {
      "Ctrl->": toggleWrap(type),
      "Mod-]": toggleWrap(type)
    };
  }

  toMarkdown(state: MarkdownSerializerState, node: ProsemirrorNode) {
    state.wrapBlock("> ", undefined, node, () => state.renderContent(node));
  }

  parseMarkdown() {
    return { block: "blockquote" };
  }
}
