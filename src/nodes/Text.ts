import Node from "./Node";
import { MarkdownSerializerState } from "../lib/markdown/serializer";
import { Node as ProseMirrorNode } from "prosemirror-model";
import { EmptyAttrs } from "../lib/Extension";

export default class Text extends Node<EmptyAttrs, EmptyAttrs> {
  get name() {
    return "text";
  }

  get schema() {
    return {
      group: "inline"
    };
  }

  toMarkdown(state: MarkdownSerializerState, node: ProseMirrorNode) {
    state.text(node.text);
  }
}
