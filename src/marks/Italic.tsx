import React from "react";
import { toggleMark } from "prosemirror-commands";
import markInputRule from "../lib/markInputRule";
import Mark, { MarkArgs } from "./Mark";
import { MarkSpec } from "prosemirror-model";
import { EmptyAttrs, ToolbarItems } from "../lib/Extension";
import { t } from "../i18n";
import { ctrl } from "../menus/block";
import isMarkActive from "../queries/isMarkActive";
import { TextItalic } from "@icon-park/react";

export default class Italic extends Mark<EmptyAttrs, EmptyAttrs> {
  get name() {
    return "em";
  }

  get schema(): MarkSpec {
    return {
      parseDOM: [
        { tag: "i" },
        { tag: "em" },
        // @ts-ignore
        { style: "font-style", getAttrs: value => value === "italic" }
      ],
      toDOM: () => ["em"]
    };
  }

  inputRules({ type }: MarkArgs) {
    return [
      markInputRule(/(?:^|[^_])(_([^_]+)_)$/, type),
      markInputRule(/(?:^|[^*])(\*([^*]+)\*)$/, type)
    ];
  }

  keys({ type }: MarkArgs) {
    return {
      "Mod-i": toggleMark(type)
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
            title: t("斜体"),
            shortcut: `${ctrl} I`,
            icon: TextItalic,
            active: isMarkActive(type),
            priority: 2
          }
        ]
      }
    };
  }
}
