import Mark, { MarkArgs } from "./Mark";
import { MarkSpec } from "prosemirror-model";
import markInputRule from "../lib/markInputRule";
import { toggleMark } from "prosemirror-commands";
import { PluginSimple } from "markdown-it";
import markPlugin from "../lib/markdown/mark";

export default class Sub extends Mark {
  get name() {
    return "sub";
  }

  get schema(): MarkSpec {
    return {
      parseDOM: [{ tag: "sub" }],
      toDOM: () => ["sub", 0]
    };
  }

  inputRules({ type }: MarkArgs) {
    return [markInputRule(/(?:~)([^~]+)(?:~)$/, type)];
  }

  keys({ type }: MarkArgs) {
    return {
      "Mod-Shift-b": toggleMark(type)
    };
  }

  toMarkdown() {
    return {
      open: "~",
      close: "~",
      mixable: true,
      expelEnclosingWhitespace: true
    };
  }

  parseMarkdown() {
    return { mark: "sub" };
  }

  markdownPlugin(): PluginSimple {
    return markPlugin({ delim: "~", mark: "sub" });
  }
}
