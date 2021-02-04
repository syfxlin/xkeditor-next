import { toggleMark } from "prosemirror-commands";
import markInputRule from "../lib/markInputRule";
import Mark, { MarkArgs, MarkSerializerConfig } from "./Mark";
import { MarkSpec, Node } from "prosemirror-model";
import { EmptyAttrs } from "../lib/Extension";

function backticksFor(node: Node, side: -1 | 1) {
  const ticks = /`+/g;
  let match: RegExpMatchArray | null;
  let len = 0;

  if (node.isText) {
    while ((match = ticks.exec(node.text as string))) {
      len = Math.max(len, match[0].length);
    }
  }

  let result = len > 0 && side > 0 ? " `" : "`";
  for (let i = 0; i < len; i++) {
    result += "`";
  }
  if (len > 0 && side < 0) {
    result += " ";
  }
  return result;
}

export default class Code extends Mark<EmptyAttrs, EmptyAttrs> {
  get name() {
    return "code_inline";
  }

  get schema(): MarkSpec {
    return {
      excludes: "_",
      parseDOM: [{ tag: "code" }],
      toDOM: () => ["code", { spellCheck: "false" }]
    };
  }

  inputRules({ type }: MarkArgs) {
    return [markInputRule(/(?:^|[^`])(`([^`]+)`)$/, type)];
  }

  keys({ type }: MarkArgs) {
    // Note: This key binding only works on non-Mac platforms
    // https://github.com/ProseMirror/prosemirror/issues/515
    return {
      "Mod`": toggleMark(type)
    };
  }

  toMarkdown(): MarkSerializerConfig {
    return {
      open: (state, mark, parent, index) => {
        return backticksFor(parent.child(index), -1);
      },
      close: (state, mark, parent, index) => {
        return backticksFor(parent.child(index - 1), 1);
      },
      escape: false
    };
  }

  parseMarkdown() {
    return { mark: this.name };
  }
}
