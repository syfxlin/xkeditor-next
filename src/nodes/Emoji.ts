import { Node as ProseMirrorNode, NodeSpec } from "prosemirror-model";
import { InputRule } from "prosemirror-inputrules";
import { EmojiConvertor } from "emoji-js";
import Node, { NodeArgs } from "./Node";
import nodeInputRule from "../lib/nodeInputRule";
import { TokenConfig } from "prosemirror-markdown";
import { MarkdownSerializerState } from "../lib/markdown/serializer";
import { EmptyAttrs } from "../lib/Extension";
import { PluginSimple } from "markdown-it";
import emojiPlugin from "markdown-it-emoji";
import emojis from "markdown-it-emoji/lib/data/full.json";

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
      toDOM: node => [
        "span",
        { "data-type": this.name },
        (emojis as { [key: string]: string })[node.textContent] ||
          node.textContent
      ]
    };
  }

  inputRules({ type }: NodeArgs): InputRule[] {
    return [nodeInputRule(/(?::)([^:]+)(?::)$/, type)];
  }

  toMarkdown(state: MarkdownSerializerState, node: ProseMirrorNode) {
    state.text(node.textContent);
  }

  parseMarkdown(): TokenConfig {
    return { block: this.name, noCloseToken: true };
  }

  markdownPlugin(): PluginSimple {
    return emojiPlugin as PluginSimple;
  }
}
