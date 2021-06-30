import { setBlockType } from "prosemirror-commands";
import Node, { NodeArgs } from "./Node";
import { NodeSpec } from "prosemirror-model";
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

  parseMarkdown() {
    return { block: this.name };
  }
}
