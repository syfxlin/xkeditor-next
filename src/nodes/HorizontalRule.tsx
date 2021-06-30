import React from "react";
import { InputRule } from "prosemirror-inputrules";
import Node, { NodeArgs } from "./Node";
import { NodeSpec } from "prosemirror-model";
import { Command, Dispatcher, EmptyAttrs, MenuItems } from "../lib/Extension";
import { mod } from "../menus/block";
import { t } from "../i18n";
import { DividingLine } from "@icon-park/react";

export default class HorizontalRule extends Node<EmptyAttrs, EmptyAttrs> {
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

  parseMarkdown() {
    return { node: this.name };
  }

  menuItems(): MenuItems {
    return {
      3: [
        {
          name: this.name,
          title: t("分割线"),
          icon: DividingLine,
          shortcut: `${mod} _`,
          keywords: "horizontal rule break line"
        }
      ]
    };
  }
}
