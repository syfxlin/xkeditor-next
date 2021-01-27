import { wrappingInputRule } from "prosemirror-inputrules";
import toggleList from "../commands/toggleList";
import Node, { NodeArgs } from "./Node";
import { Node as ProseMirrorNode, NodeSpec } from "prosemirror-model";
import { MarkdownSerializerState } from "../lib/markdown/serializer";

export default class BulletList extends Node {
  get name() {
    return "bullet_list";
  }

  get schema(): NodeSpec {
    return {
      content: "list_item+",
      group: "block",
      parseDOM: [{ tag: "ul" }],
      toDOM: () => ["ul", 0]
    };
  }

  commands({ type, schema }: NodeArgs) {
    return () => toggleList(type, schema.nodes.list_item);
  }

  keys({ type, schema }: NodeArgs) {
    return {
      "Shift-Ctrl-8": toggleList(type, schema.nodes.list_item)
    };
  }

  inputRules({ type }: NodeArgs) {
    return [wrappingInputRule(/^\s*([-+*])\s$/, type)];
  }

  toMarkdown(state: MarkdownSerializerState, node: ProseMirrorNode) {
    state.renderList(node, "  ", () => (node.attrs.bullet || "*") + " ");
  }

  parseMarkdown() {
    return { block: this.name };
  }
}
