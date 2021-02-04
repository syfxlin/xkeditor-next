import React from "react";
import { toggleMark } from "prosemirror-commands";
import markInputRule from "../lib/markInputRule";
import Mark, { MarkArgs } from "./Mark";
import { MarkSpec } from "prosemirror-model";
import { EmptyAttrs, ToolbarItems } from "../lib/Extension";
import { t } from "../i18n";
import isMarkActive from "../queries/isMarkActive";
import { ctrl } from "../menus/block";
import { TextBold } from "@icon-park/react";

export default class Bold extends Mark<EmptyAttrs, EmptyAttrs> {
  get name(): string {
    return "strong";
  }

  get schema(): MarkSpec {
    return {
      parseDOM: [
        { tag: "b" },
        { tag: "strong" },
        {
          style: "font-style",
          // @ts-ignore
          getAttrs: value => value === "bold"
        }
      ],
      toDOM: () => ["strong"]
    };
  }

  inputRules({ type }: MarkArgs) {
    return [markInputRule(/(?:\*\*)([^*]+)(?:\*\*)$/, type)];
  }

  keys({ type }: MarkArgs) {
    return {
      "Mod-b": toggleMark(type)
    };
  }

  toMarkdown() {
    return {
      open: "**",
      close: "**",
      mixable: true,
      expelEnclosingWhitespace: true
    };
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
            title: t("粗体"),
            shortcut: `${ctrl} B`,
            icon: TextBold,
            active: isMarkActive(type),
            priority: 1
          }
        ]
      }
    };
  }
}
