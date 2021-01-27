import { toggleMark } from "prosemirror-commands";
import markInputRule from "../lib/markInputRule";
import Mark, { MarkArgs } from "./Mark";
import { MarkSpec } from "prosemirror-model";

export default class Italic extends Mark {
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

  toMarkdown() {
    return {
      open: "*",
      close: "*",
      mixable: true,
      expelEnclosingWhitespace: true
    };
  }

  parseMarkdown() {
    return { mark: this.name };
  }
}
