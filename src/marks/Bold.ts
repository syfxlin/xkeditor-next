import { toggleMark } from "prosemirror-commands";
import markInputRule from "../lib/markInputRule";
import Mark, { MarkArgs } from "./Mark";
import { MarkSpec } from "prosemirror-model";

export default class Bold extends Mark {
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
}
