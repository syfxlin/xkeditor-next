import React from "react";
import { toggleMark } from "prosemirror-commands";
import markInputRule from "../lib/markInputRule";
import Mark, { MarkArgs } from "./Mark";
import { MarkSpec } from "prosemirror-model";
import { EmptyAttrs, ToolbarItems } from "../lib/Extension";
import { t } from "../i18n";
import { ctrl } from "../menus/block";
import isMarkActive from "../queries/isMarkActive";
import { Strikethrough as StrikethroughIcon } from "@icon-park/react";

export default class Strikethrough extends Mark<EmptyAttrs, EmptyAttrs> {
  get name() {
    return "strikethrough";
  }

  get schema(): MarkSpec {
    return {
      parseDOM: [
        {
          tag: "s"
        },
        {
          tag: "del"
        },
        {
          tag: "strike"
        }
      ],
      toDOM: () => ["del", 0]
    };
  }

  keys({ type }: MarkArgs) {
    return {
      "Mod-d": toggleMark(type)
    };
  }

  inputRules({ type }: MarkArgs) {
    return [markInputRule(/~~([^~]+)~~$/, type)];
  }

  toMarkdown() {
    return {
      open: "~~",
      close: "~~",
      mixable: true,
      expelEnclosingWhitespace: true
    };
  }

  get markdownToken() {
    return "s";
  }

  parseMarkdown() {
    return { mark: this.name };
  }

  toolbarItems({ type }: MarkArgs): ToolbarItems {
    return {
      default: {
        1: [
          {
            name: this.name,
            title: t("删除线"),
            shortcut: `${ctrl} D`,
            icon: StrikethroughIcon,
            active: isMarkActive(type),
            priority: 3
          }
        ]
      }
    };
  }
}
