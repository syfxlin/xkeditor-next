import { toggleMark } from "prosemirror-commands";
import markInputRule from "../lib/markInputRule";
import Mark, { MarkArgs } from "./Mark";
import { MarkSpec } from "prosemirror-model";

export default class Strikethrough extends Mark {
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
    return [markInputRule(/~([^~]+)~$/, type)];
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
    return { mark: "strikethrough" };
  }
}
