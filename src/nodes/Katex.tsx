import Node, { NodeArgs } from "./Node";
import { Node as ProsemirrorNode, NodeSpec } from "prosemirror-model";
import { InputRule } from "prosemirror-inputrules";
import { MarkdownSerializerState } from "../lib/markdown/serializer";
import { PluginSimple } from "markdown-it";
import nodeInputRule from "../lib/nodeInputRule";
import { TokenConfig } from "prosemirror-markdown";
// @ts-ignore
import katexPlugin from "@iktakahiro/markdown-it-katex";
import { render } from "katex";
import "katex/dist/katex.min.css";

export default class Katex extends Node {
  get name() {
    return "katex";
  }

  get schema(): NodeSpec {
    return {
      content: "text*",
      marks: "",
      group: "block",
      code: true,
      defining: true,
      draggable: true,
      selectable: true,
      parseDOM: [
        {
          tag: "math"
        },
        {
          tag: `[data-type=${this.name}]`
        },
        {
          tag: "span.katex",
          contentElement: node =>
            (node as HTMLElement).querySelector(
              'annotation[encoding="application/x-tex"]'
            ) || node
        }
      ],
      toDOM: node => {
        const tex = document.createElement("span");
        render(node.textContent, tex, {
          throwOnError: false
        });
        return ["p", { "data-type": this.name }, tex];
      }
    };
  }

  inputRules({ type }: NodeArgs): InputRule[] {
    return [nodeInputRule(/\$\$([^$]+)\$\$/, type, 1)];
  }

  toMarkdown(state: MarkdownSerializerState, node: ProsemirrorNode) {
    state.write("$$");
    state.text(node.textContent);
    state.write("$$");
    state.closeBlock(node);
  }

  parseMarkdown(): TokenConfig {
    return {
      block: "katex",
      noCloseToken: true
    };
  }

  get markdownToken(): string {
    return "math_block";
  }

  markdownPlugin(): PluginSimple {
    return katexPlugin;
  }
}
