import React from "react";
import Mark, { MarkArgs } from "./Mark";
import { MarkSpec } from "prosemirror-model";
import markInputRule from "../lib/markInputRule";
import { toggleMark } from "prosemirror-commands";
import { PluginSimple } from "markdown-it";
import markPlugin from "../lib/markdown/mark";
import { EmptyAttrs, ToolbarItems } from "../lib/Extension";
import { t } from "../i18n";
import { ctrl, shift } from "../menus/block";
import isMarkActive from "../queries/isMarkActive";
import { ArrowRightDown } from "@icon-park/react/es";

export default class Sub extends Mark<EmptyAttrs, EmptyAttrs> {
  get name() {
    return "sub";
  }

  get schema(): MarkSpec {
    return {
      parseDOM: [{ tag: "sub" }],
      toDOM: () => ["sub", 0]
    };
  }

  inputRules({ type }: MarkArgs) {
    return [markInputRule(/(?:~)([^~]+)(?:~)$/, type)];
  }

  keys({ type }: MarkArgs) {
    return {
      "Mod-Shift-b": toggleMark(type)
    };
  }

  toMarkdown() {
    return {
      open: "~",
      close: "~",
      mixable: true,
      expelEnclosingWhitespace: true
    };
  }

  parseMarkdown() {
    return { mark: this.name };
  }

  markdownPlugin(): PluginSimple {
    return markPlugin({ delim: "~", mark: this.name });
  }

  toolbarItems({ type }: MarkArgs): ToolbarItems {
    return {
      default: {
        2: [
          {
            name: this.name,
            title: t("下标"),
            shortcut: `${ctrl} ${shift} B`,
            icon: ArrowRightDown,
            active: isMarkActive(type),
            priority: 3
          }
        ]
      }
    };
  }
}
