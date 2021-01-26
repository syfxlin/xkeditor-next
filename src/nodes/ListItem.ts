import {
  liftListItem,
  sinkListItem,
  splitListItem
} from "prosemirror-schema-list";
import Node, { NodeArgs } from "./Node";
import { Node as ProseMirrorNode, NodeSpec } from "prosemirror-model";
import { MarkdownSerializerState } from "../lib/markdown/serializer";

export default class ListItem extends Node {
  get name() {
    return "list_item";
  }

  get schema(): NodeSpec {
    return {
      content: "paragraph block*",
      defining: true,
      draggable: true,
      parseDOM: [{ tag: "li" }],
      toDOM: () => ["li", 0]
    };
  }

  keys({ type }: NodeArgs) {
    return {
      Enter: splitListItem(type),
      Tab: sinkListItem(type),
      "Shift-Tab": liftListItem(type),
      "Mod-]": sinkListItem(type),
      "Mod-[": liftListItem(type)
    };
  }

  toMarkdown(state: MarkdownSerializerState, node: ProseMirrorNode) {
    state.renderContent(node);
  }

  parseMarkdown() {
    return { block: "list_item" };
  }
}
