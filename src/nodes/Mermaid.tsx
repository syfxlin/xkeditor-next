import { NodeArgs } from "./Node";
import { Node as ProseMirrorNode, NodeSpec } from "prosemirror-model";
import { mergeSpec, nodeKeys } from "../utils/editor";
import { Dispatcher } from "../lib/Extension";
import { InputRule, textblockTypeInputRule } from "prosemirror-inputrules";
import ReactNode from "./ReactNode";
import { ComponentProps } from "../lib/ComponentView";
import React, { useEffect, useRef } from "react";
import MonacoNode from "../components/MonacoNode";
import mermaid from "mermaid";
import { MarkdownSerializerState } from "../lib/markdown/serializer";
import { PluginSimple } from "markdown-it";
import { loader } from "@monaco-editor/react";
import addMermaidSupport from "../utils/mermaid-language";
import { blockPlugin } from "../lib/markdown/container";

mermaid.initialize({
  startOnLoad: false
});

loader.init().then(monaco => {
  addMermaidSupport(monaco);
});

export default class Mermaid extends ReactNode {
  get name() {
    return "mermaid";
  }

  get schema(): NodeSpec {
    return mergeSpec({
      attrs: {
        isEdit: {
          default: false
        }
      },
      parseDOM: [
        {
          tag: `pre[data-type="mermaid"]`,
          preserveWhitespace: "full",
          contentElement: node => {
            const dom = node as HTMLPreElement;
            if (
              dom.children.length === 1 &&
              dom.children[0].tagName.toLowerCase() === "code"
            ) {
              return dom.children[0];
            }
            return dom;
          }
        }
      ],
      toDOM: () => ["pre", { "data-type": "mermaid" }, ["code", 0]]
    });
  }

  component(): React.FC<ComponentProps> {
    return props => {
      const ref = useRef<HTMLDivElement>(null);
      useEffect(() => {
        try {
          if (ref.current) {
            mermaid.render(
              this.name,
              props.node.textContent,
              svgCode => {
                if (ref.current) {
                  ref.current.innerHTML = svgCode;
                }
              },
              // @ts-ignore
              ref.current
            );
          }
        } catch (e) {
          console.log(e);
        }
      }, [props.node.textContent]);
      return (
        <MonacoNode {...props} height={300} language={"mermaid"}>
          <div ref={ref} style={{ height: "100%" }} />
        </MonacoNode>
      );
    };
  }

  keys(): Record<string, Dispatcher> {
    return nodeKeys(node => node.type.name === "mermaid");
  }

  inputRules({ type }: NodeArgs): InputRule[] {
    return [textblockTypeInputRule(/^:::\s?mermaid$/, type, { isEdit: true })];
  }

  toMarkdown(state: MarkdownSerializerState, node: ProseMirrorNode) {
    state.write("\n:::mermaid\n");
    state.renderContent(node);
    state.ensureNewLine();
    state.write(":::");
    state.closeBlock(node);
  }

  parseMarkdown() {
    return {
      block: "mermaid"
    };
  }

  markdownPlugin(): PluginSimple {
    return md => {
      blockPlugin({
        md,
        name: this.name,
        parseInline: false
      });
    };
  }
}
