import Mark, { MarkArgs } from "./Mark";
import { MarkSpec } from "prosemirror-model";
import markInputRule from "../lib/markInputRule";
import { toggleMark } from "prosemirror-commands";
import { PluginSimple } from "markdown-it";
import markPlugin from "../lib/markdown/mark";

export default class Sup extends Mark {
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

  toMarkdown() {
    return {
      open: "^",
      close: "^",
      mixable: true,
      expelEnclosingWhitespace: true
    };
  }

  parseMarkdown() {
    return { mark: this.name };
  }

  markdownPlugin(): PluginSimple {
    return markPlugin({ delim: "^", mark: this.name });
  }
}
