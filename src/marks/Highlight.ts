import { toggleMark } from "prosemirror-commands";
import markInputRule from "../lib/markInputRule";
import Mark, { MarkArgs } from "./Mark";
import { MarkSpec } from "prosemirror-model";
import { PluginSimple } from "markdown-it";
import markPlugin from "../lib/markdown/mark";

export default class Highlight extends Mark {
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
}
