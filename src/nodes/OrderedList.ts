import { wrappingInputRule } from "prosemirror-inputrules";
import toggleList from "../commands/toggleList";
import Node, { NodeArgs } from "./Node";
import { Node as ProseMirrorNode, NodeSpec } from "prosemirror-model";
import { MarkdownSerializerState } from "../lib/markdown/serializer";
import { t } from "../i18n";
import { OrderedListIcon } from "outline-icons";
import { ctrl, shift } from "../menus/block";
import { MenuItems } from "../lib/Extension";

export default class OrderedList extends Node {
  get name() {
    return "ordered_list";
  }

  get schema(): NodeSpec {
    return {
      attrs: {
        order: {
          default: 1
        }
      },
      content: "list_item+",
      group: "block",
      parseDOM: [
        {
          tag: "ol",
          getAttrs: node => ({
            order: (node as HTMLOListElement).hasAttribute("start")
              ? parseInt(
                  (node as HTMLOListElement).getAttribute("start") || "1",
                  10
                )
              : 1
          })
        }
      ],
      toDOM: node =>
        node.attrs.order === 1
          ? ["ol", 0]
          : ["ol", { start: node.attrs.order }, 0]
    };
  }

  commands({ type, schema }: NodeArgs) {
    return () => toggleList(type, schema.nodes.list_item);
  }

  keys({ type, schema }: NodeArgs) {
    return {
      "Ctrl-Shift-9": toggleList(type, schema.nodes.list_item)
    };
  }

  inputRules({ type }: NodeArgs) {
    return [
      wrappingInputRule(
        /^(\d+)\.\s$/,
        type,
        match => ({ order: +match[1] }),
        (match, node) => node.childCount + node.attrs.order === +match[1]
      )
    ];
  }

  toMarkdown(state: MarkdownSerializerState, node: ProseMirrorNode) {
    const start = node.attrs.order || 1;
    const maxW = `${start + node.childCount - 1}`.length;
    const space = state.repeat(" ", maxW + 2);

    state.renderList(node, space, (i: number) => {
      const nStr = `${start + i}`;
      return state.repeat(" ", maxW - nStr.length) + nStr + ". ";
    });
  }

  parseMarkdown() {
    return { block: this.name };
  }

  menuItems(): MenuItems {
    return {
      ordered_list: {
        name: this.name,
        title: t("有序列表"),
        icon: OrderedListIcon,
        shortcut: `${ctrl} ${shift} 9`,
        keywords: "orderedlist list"
      }
    };
  }
}
