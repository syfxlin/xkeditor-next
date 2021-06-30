import React from "react";
import { wrappingInputRule } from "prosemirror-inputrules";
import toggleList from "../commands/toggleList";
import Node, { NodeArgs } from "./Node";
import { NodeSpec } from "prosemirror-model";
import { t } from "../i18n";
import { ctrl, shift } from "../menus/block";
import { EmptyAttrs, MenuItems } from "../lib/Extension";
import { List } from "@icon-park/react";

export default class BulletList extends Node<EmptyAttrs, EmptyAttrs> {
  get name() {
    return "bullet_list";
  }

  get schema(): NodeSpec {
    return {
      content: "list_item+",
      group: "block",
      parseDOM: [{ tag: "ul" }],
      toDOM: () => ["ul", 0]
    };
  }

  commands({ type, schema }: NodeArgs) {
    return () => toggleList(type, schema.nodes.list_item);
  }

  keys({ type, schema }: NodeArgs) {
    return {
      "Ctrl-Shift-8": toggleList(type, schema.nodes.list_item)
    };
  }

  inputRules({ type }: NodeArgs) {
    return [wrappingInputRule(/^\s*([-+*])\s$/, type)];
  }

  parseMarkdown() {
    return { block: this.name };
  }

  menuItems(): MenuItems {
    return {
      2: [
        {
          name: this.name,
          title: t("无序列表"),
          icon: List,
          shortcut: `${ctrl} ${shift} 8`,
          keywords: "bulletlist list"
        }
      ]
    };
  }
}
