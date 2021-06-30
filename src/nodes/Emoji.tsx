import { NodeSpec } from "prosemirror-model";
import { InputRule } from "prosemirror-inputrules";
import Node, { NodeArgs } from "./Node";
import nodeInputRule from "../lib/nodeInputRule";
import { TokenConfig } from "prosemirror-markdown";
import { EmptyAttrs } from "../lib/Extension";
import { PluginSimple } from "markdown-it";
// @ts-ignore
import emojiPlugin from "../lib/markdown/emoji";
import { EmojiConvertor } from "emoji-js";

const emoji = new EmojiConvertor();
emoji.replace_mode = "unified";

export default class Emoji extends Node<EmptyAttrs, EmptyAttrs> {
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
      toDOM: (node) => [
        "span",
        { "data-type": this.name },
        emoji.replace_colons(`:${node.textContent}:`),
      ],
    };
  }

  inputRules({ type }: NodeArgs): InputRule[] {
    return [nodeInputRule(/(?::)([^:]+)(?::)$/, type)];
  }

  parseMarkdown(): TokenConfig {
    return { block: this.name, noCloseToken: true };
  }

  markdownPlugin(): PluginSimple {
    return emojiPlugin;
  }
}
