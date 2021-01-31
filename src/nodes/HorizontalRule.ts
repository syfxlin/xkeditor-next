import { InputRule } from "prosemirror-inputrules";
import Node, { NodeArgs, NodeMenuItem } from "./Node";
import { Node as ProseMirrorNode, NodeSpec } from "prosemirror-model";
import { Command, Dispatcher } from "../lib/Extension";
import { MarkdownSerializerState } from "../lib/markdown/serializer";
import { HorizontalRuleIcon } from "outline-icons";
import { mod } from "../menus/block";
import { t } from "../i18n";

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

  toMarkdown(state: MarkdownSerializerState, node: ProseMirrorNode) {
    state.write(node.attrs.markup || "\n---");
    state.closeBlock(node);
  }

  parseMarkdown() {
    return { node: this.name };
  }

  menuItems(): NodeMenuItem[] {
    return [
      {
        name: this.name,
        title: t("分割线"),
        icon: HorizontalRuleIcon,
        shortcut: `${mod} _`,
        keywords: "horizontal rule break line"
      }
    ];
  }
}
