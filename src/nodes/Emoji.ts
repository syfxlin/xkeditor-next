import { Node as ProseMirrorNode, NodeSpec } from "prosemirror-model";
import { InputRule } from "prosemirror-inputrules";
import { PluginSimple } from "markdown-it";
import markPlugin from "../lib/markdown/mark";
import { EmojiConvertor } from "emoji-js";
import Node, { NodeArgs } from "./Node";
import nodeInputRule from "../lib/nodeInputRule";
import { TokenConfig } from "prosemirror-markdown";
import { MarkdownSerializerState } from "../lib/markdown/serializer";

const emoji = new EmojiConvertor();
emoji.replace_mode = "unified";

export default class Emoji extends Node {
  get name() {
    return "emoji";
  }

  get schema(): NodeSpec {
    return {
      inline: true,
      group: "inline",
      marks: "",
      content: "text*",
      parseDOM: [{ tag: `span[data-type="${this.name}"]` }],
      toDOM: node => [
        "span",
        { "data-type": this.name },
        emoji.replace_colons(`:${node.textContent}:`)
      ]
    };
  }

  inputRules({ type }: NodeArgs): InputRule[] {
    return [nodeInputRule(/(?::)([^:]+)(?::)$/, type)];
  }

  toMarkdown(state: MarkdownSerializerState, node: ProseMirrorNode) {
    state.write(":");
    state.text(node.textContent);
    state.write(":");
  }

  parseMarkdown(): TokenConfig {
    return { block: this.name };
  }

  markdownPlugin(): PluginSimple {
    return markPlugin({ delim: ":", mark: this.name });
  }
}
