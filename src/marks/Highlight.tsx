import React from "react";
import { toggleMark } from "prosemirror-commands";
import markInputRule from "../lib/markInputRule";
import Mark, { MarkArgs } from "./Mark";
import { MarkSpec } from "prosemirror-model";
import { PluginSimple } from "markdown-it";
import markPlugin from "../lib/markdown/mark";
import { EmptyAttrs, ToolbarItems } from "../lib/Extension";
import { t } from "../i18n";
import { ctrl } from "../menus/block";
import isMarkActive from "../queries/isMarkActive";
import { HighLight } from "@icon-park/react";

export default class Highlight extends Mark<EmptyAttrs, EmptyAttrs> {
  get name() {
    return "mark";
  }

  get schema(): MarkSpec {
    return {
      parseDOM: [{ tag: "mark" }],
      toDOM: () => ["mark"]
    };
  }

  inputRules({ type }: MarkArgs) {
    return [markInputRule(/(?:==)([^=]+)(?:==)$/, type)];
  }

  keys({ type }: MarkArgs) {
    return {
      "Mod-h": toggleMark(type)
    };
  }

  toMarkdown() {
    return {
      open: "==",
      close: "==",
      mixable: true,
      expelEnclosingWhitespace: true
    };
  }

  parseMarkdown() {
    return { mark: this.name };
  }

  markdownPlugin(): PluginSimple {
    return markPlugin({ delim: "==", mark: this.name });
  }

  toolbarItems({ type }: MarkArgs): ToolbarItems {
    return {
      default: {
        1: [
          {
            name: this.name,
            title: t("高亮"),
            shortcut: `${ctrl} H`,
            icon: HighLight,
            active: isMarkActive(type),
            priority: 4
          }
        ]
      }
    };
  }
}
