import Node, { NodeArgs } from "./Node";
import { Node as ProsemirrorNode, NodeSpec } from "prosemirror-model";
import { InputRule } from "prosemirror-inputrules";
import nodeInputRule from "../lib/nodeInputRule";
import { TokenConfig } from "prosemirror-markdown";
import { MarkdownSerializerState } from "../lib/markdown/serializer";
import { PluginSimple } from "markdown-it";
// @ts-ignore
import katexPlugin from "@iktakahiro/markdown-it-katex";
import { render } from "katex";

export default class KatexInline extends Node {
  get name() {
    return "katex_inline";
  }

  get schema(): NodeSpec {
    return {
      inline: true,
      group: "inline",
      marks: "",
      content: "inline*",
      draggable: true,
      selectable: true,
      parseDOM: [
        {
          tag: "math"
        }
      ],
      toDOM: node => {
        const tex = document.createElement("span");
        render(node.textContent, tex, {
          throwOnError: false
        });
        return ["math", { "data-type": "inline" }, tex];
      }
    };
  }

  inputRules({ type }: NodeArgs): InputRule[] {
    return [nodeInputRule(/\$([^$]+)\$/, type, 1)];
  }

  parseMarkdown(): TokenConfig {
    return {
      block: "katex_inline",
      noCloseToken: true
    };
  }

  toMarkdown(state: MarkdownSerializerState, node: ProsemirrorNode) {
    state.write("$");
    state.text(node.textContent);
    state.write("$");
  }

  get markdownToken(): string {
    return "math_inline";
  }

  markdownPlugin(): PluginSimple {
    return katexPlugin;
  }
}
