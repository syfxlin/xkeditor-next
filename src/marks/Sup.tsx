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
import { ArrowRightUp } from "@icon-park/react/es";

export default class Sup extends Mark<EmptyAttrs, EmptyAttrs> {
  get name() {
    return "sup";
  }

  get schema(): MarkSpec {
    return {
      parseDOM: [{ tag: "sup" }],
      toDOM: () => ["sup", 0]
    };
  }

  inputRules({ type }: MarkArgs) {
    return [markInputRule(/(?:\^)([^^]+)(?:\^)$/, type)];
  }

  keys({ type }: MarkArgs) {
    return {
      "Mod-Shift-p": toggleMark(type)
    };
  }

  parseMarkdown() {
    return { mark: this.name };
  }

  markdownPlugin(): PluginSimple {
    return markPlugin({ delim: "^", mark: this.name });
  }

  toolbarItems({ type }: MarkArgs): ToolbarItems {
    return {
      default: {
        2: [
          {
            name: this.name,
            title: t("上标"),
            shortcut: `${ctrl} ${shift} P`,
            icon: ArrowRightUp,
            active: isMarkActive(type),

            priority: 2
          }
        ]
      }
    };
  }
}
