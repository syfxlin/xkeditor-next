import {
  liftListItem,
  sinkListItem,
  splitListItem
} from "prosemirror-schema-list";
import Node, { NodeArgs } from "./Node";
import { NodeSpec } from "prosemirror-model";
import { EmptyAttrs } from "../lib/Extension";

export default class ListItem extends Node<EmptyAttrs, EmptyAttrs> {
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

  parseMarkdown() {
    return { block: this.name };
  }
}
