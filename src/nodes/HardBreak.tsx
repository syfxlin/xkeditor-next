import Node, { NodeArgs } from "./Node";
import { isInTable } from "prosemirror-tables";
import { NodeSpec } from "prosemirror-model";
import { PluginSimple } from "markdown-it";
import breakPlugin from "../lib/markdown/breaks";
import { Command, Dispatcher, EmptyAttrs } from "../lib/Extension";

export default class HardBreak extends Node<EmptyAttrs, EmptyAttrs> {
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

  parseMarkdown() {
    return { node: this.name };
  }

  markdownPlugin(): PluginSimple {
    return breakPlugin;
  }
}
