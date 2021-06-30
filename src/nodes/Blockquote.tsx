import React from "react";
import { wrappingInputRule } from "prosemirror-inputrules";
import Node, { NodeArgs } from "./Node";
import toggleWrap from "../commands/toggleWrap";
import { NodeSpec } from "prosemirror-model";
import { EmptyAttrs, MenuItems } from "../lib/Extension";
import { t } from "../i18n";
import { mod } from "../menus/block";
import { Quote } from "@icon-park/react";

export default class Blockquote extends Node<EmptyAttrs, EmptyAttrs> {
  get name() {
    return "blockquote";
  }

  get schema(): NodeSpec {
    return {
      content: "block+",
      group: "block",
      defining: true,
      parseDOM: [{ tag: "blockquote" }],
      toDOM: () => ["blockquote", 0]
    };
  }

  inputRules({ type }: NodeArgs) {
    return [wrappingInputRule(/^\s*>\s$/, type)];
  }

  commands({ type }: NodeArgs) {
    return () => toggleWrap(type);
  }

  keys({ type }: NodeArgs) {
    return {
      "Mod-]": toggleWrap(type)
    };
  }

  parseMarkdown() {
    return { block: this.name };
  }

  menuItems(): MenuItems {
    return {
      3: [
        {
          name: this.name,
          title: t("引用"),
          icon: Quote,
          shortcut: `${mod} ]`,
          keywords: "blockquote quote"
        }
      ]
    };
  }
}
