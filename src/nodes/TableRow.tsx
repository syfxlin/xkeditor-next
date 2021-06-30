import Node from "./Node";
import { NodeSpec } from "prosemirror-model";
import { EmptyAttrs } from "../lib/Extension";

export default class TableRow extends Node<EmptyAttrs, EmptyAttrs> {
  get name() {
    return "tr";
  }

  get schema(): NodeSpec {
    return {
      content: "(th | td)*",
      tableRole: "row",
      parseDOM: [{ tag: "tr" }],
      toDOM() {
        return ["tr", 0];
      }
    };
  }

  parseMarkdown() {
    return { block: this.name };
  }
}
