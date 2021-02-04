import { toggleMark } from "prosemirror-commands";
import markInputRule from "../lib/markInputRule";
import Mark, { MarkArgs } from "./Mark";
import { MarkSpec } from "prosemirror-model";
import { PluginSimple } from "markdown-it";
import underlinesPlugin from "../lib/markdown/underlines";
import { EmptyAttrs } from "../lib/Extension";

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
}
