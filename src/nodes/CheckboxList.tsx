import React from "react";
import { wrappingInputRule } from "prosemirror-inputrules";
import toggleList from "../commands/toggleList";
import Node, { NodeArgs } from "./Node";
import { Node as ProseMirrorNode, NodeSpec } from "prosemirror-model";
import { PluginSimple } from "markdown-it";
import checkboxPlugin from "../lib/markdown/checkboxes";
import { MarkdownSerializerState } from "../lib/markdown/serializer";
import { t } from "../i18n";
import { ctrl, shift } from "../menus/block";
import { EmptyAttrs, MenuItems } from "../lib/Extension";
import { ListCheckbox } from "@icon-park/react";

export default class CheckboxList extends Node<EmptyAttrs, EmptyAttrs> {
  get name() {
    return "checkbox_list";
  }

  get schema(): NodeSpec {
    return {
      group: "block",
      content: "checkbox_item+",
      toDOM: () => ["ul", { class: this.name }, 0],
      parseDOM: [
        {
          tag: `[class="${this.name}"]`
        }
      ]
    };
  }

  keys({ type, schema }: NodeArgs) {
    return {
      "Ctrl-Shift-7": toggleList(type, schema.nodes.checkbox_item)
    };
  }

  commands({ type, schema }: NodeArgs) {
    return () => toggleList(type, schema.nodes.checkbox_item);
  }

  inputRules({ type }: NodeArgs) {
    return [wrappingInputRule(/^-?\s*(\[ \])\s$/i, type)];
  }

  toMarkdown(state: MarkdownSerializerState, node: ProseMirrorNode) {
    state.renderList(node, "  ", () => "- ");
  }

  parseMarkdown() {
    return { block: this.name };
  }

  markdownPlugin(): PluginSimple {
    return checkboxPlugin;
  }

  menuItems(): MenuItems {
    return {
      2: [
        {
          name: this.name,
          title: t("Todo 列表"),
          icon: ListCheckbox,
          keywords: "checklist task todolist",
          shortcut: `${ctrl} ${shift} 7`
        }
      ]
    };
  }
}
