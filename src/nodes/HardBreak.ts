import Node, { NodeArgs } from "./Node";
import { isInTable } from "prosemirror-tables";
import { NodeSpec } from "prosemirror-model";
import { PluginSimple } from "markdown-it";
import breakPlugin from "../lib/markdown/breaks";
import { Command, Dispatcher } from "../lib/Extension";
import { MarkdownSerializerState } from "../lib/markdown/serializer";

export default class HardBreak extends Node {
  get name() {
    return "br";
  }

  get schema(): NodeSpec {
    return {
      inline: true,
      group: "inline",
      selectable: false,
      parseDOM: [{ tag: "br" }],
      toDOM() {
        return ["br"];
      }
    };
  }

  commands({ type }: NodeArgs): Command {
    return () => (state, dispatch) => {
      dispatch?.(state.tr.replaceSelectionWith(type.create()).scrollIntoView());
      return true;
    };
  }

  keys({ type }: NodeArgs): Record<string, Dispatcher> {
    return {
      "Shift-Enter": (state, dispatch) => {
        if (!isInTable(state)) return false;
        dispatch?.(
          state.tr.replaceSelectionWith(type.create()).scrollIntoView()
        );
        return true;
      }
    };
  }

  toMarkdown(state: MarkdownSerializerState) {
    state.write(" \\n ");
  }

  parseMarkdown() {
    return { node: "br" };
  }

  markdownPlugin(): PluginSimple {
    return breakPlugin;
  }
}
