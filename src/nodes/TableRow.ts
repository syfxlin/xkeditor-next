import Node from "./Node";
import { NodeSpec } from "prosemirror-model";

export default class TableRow extends Node {
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
