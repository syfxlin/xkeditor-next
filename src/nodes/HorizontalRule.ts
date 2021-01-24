import { InputRule } from "prosemirror-inputrules";
import Node, { NodeArgs } from "./Node";
import { Node as ProsemirrorNode, NodeSpec } from "prosemirror-model";
import { Command, Dispatcher } from "../lib/Extension";
import { MarkdownSerializerState } from "../lib/markdown/serializer";

export default class HorizontalRule extends Node {
  get name() {
    return "hr";
  }

  get schema(): NodeSpec {
    return {
      group: "block",
      parseDOM: [{ tag: "hr" }],
      toDOM() {
        return ["hr"];
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
      "Mod-_": (state, dispatch) => {
        dispatch?.(
          state.tr.replaceSelectionWith(type.create()).scrollIntoView()
        );
        return true;
      }
    };
  }

  inputRules({ type }: NodeArgs) {
    return [
      new InputRule(/^(?:---|___\s|\*\*\*\s)$/, (state, match, start, end) => {
        const { tr } = state;

        if (match[0]) {
          tr.replaceWith(start - 1, end, type.create({}));
        }

        return tr;
      })
    ];
  }

  toMarkdown(state: MarkdownSerializerState, node: ProsemirrorNode) {
    state.write(node.attrs.markup || "\n---");
    state.closeBlock(node);
  }

  parseMarkdown() {
    return { node: "hr" };
  }
}
