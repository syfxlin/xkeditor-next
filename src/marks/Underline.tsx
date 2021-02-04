import React from "react";
import { toggleMark } from "prosemirror-commands";
import markInputRule from "../lib/markInputRule";
import Mark, { MarkArgs } from "./Mark";
import { MarkSpec } from "prosemirror-model";
import { PluginSimple } from "markdown-it";
import underlinesPlugin from "../lib/markdown/underlines";
import { EmptyAttrs, ToolbarItems } from "../lib/Extension";
import { t } from "../i18n";
import { ctrl } from "../menus/block";
import isMarkActive from "../queries/isMarkActive";
import { TextUnderline } from "@icon-park/react";

export default class Underline extends Mark<EmptyAttrs, EmptyAttrs> {
  get name() {
    return "underline";
  }

  get schema(): MarkSpec {
    return {
      parseDOM: [
        { tag: "u" },
        {
          style: "text-decoration",
          // @ts-ignore
          getAttrs: value => value === "underline"
        }
      ],
      toDOM: () => ["u", 0]
    };
  }

  inputRules({ type }: MarkArgs) {
    return [markInputRule(/(?:__)([^_]+)(?:__)$/, type)];
  }

  keys({ type }: MarkArgs) {
    return {
      "Mod-u": toggleMark(type)
    };
  }

  toMarkdown() {
    return {
      open: "__",
      close: "__",
      mixable: true,
      expelEnclosingWhitespace: true
    };
  }

  parseMarkdown() {
    return { mark: this.name };
  }

  markdownPlugin(): PluginSimple {
    return underlinesPlugin;
  }

  toolbarItems({ type }: MarkArgs): ToolbarItems {
    return {
      default: {
        1: [
          {
            name: this.name,
            title: t("下划线"),
            shortcut: `${ctrl} U`,
            icon: TextUnderline,
            active: isMarkActive(type),
            priority: 2
          }
        ]
      }
    };
  }
}
