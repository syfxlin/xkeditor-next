import { NodeArgs } from "./Node";
import { Node as ProseMirrorNode, NodeSpec } from "prosemirror-model";
import { mergeSpec, nodeKeys } from "../utils/editor";
import {
  Command,
  Dispatcher,
  EmptyAttrs,
  MenuItems,
  MonacoAttrs
} from "../lib/Extension";
import { InputRule, textblockTypeInputRule } from "prosemirror-inputrules";
import ReactNode from "./ReactNode";
import { ComponentProps } from "../lib/ComponentView";
import React, { useEffect, useRef } from "react";
import MonacoNode, { MonacoNodeAttrs } from "../components/MonacoNode";
import mermaid from "mermaid";
import { MarkdownSerializerState } from "../lib/markdown/serializer";
import { PluginSimple } from "markdown-it";
import { blockPlugin } from "../lib/markdown/container";
import { usePromise } from "react-use";
import { t } from "../i18n";
import toggleBlockType from "../commands/toggleBlockType";
import { ChartGraph } from "@icon-park/react";
import debounce from "lodash/debounce";

type MermaidAttrs = MonacoNodeAttrs;

export default class Mermaid extends ReactNode<
  EmptyAttrs,
  MonacoAttrs<MermaidAttrs>
> {
  get name() {
    return "mermaid";
  }

  get schema(): NodeSpec {
    return mergeSpec({
      attrs: {
        mode: {
          default: "preview"
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
    const render = debounce(async (mounted, element, content) => {
      await mounted(
        new Promise<void>(resolve => {
          try {
            if (element) {
              mermaid.render(
                this.name,
                content,
                svgCode => {
                  if (element) {
                    element.innerHTML = svgCode;
                  }
                },
                element
              );
            }
          } catch (e) {
            console.log(e);
          }
          resolve();
        })
      );
    }, 700);
    return props => {
      const ref = useRef<HTMLDivElement>(null);
      const mounted = usePromise();
      useEffect(() => {
        if (props.node.attrs.mode === "edit") {
          return;
        }
        render(mounted, ref.current, props.node.textContent);
      }, [props.node.attrs.mode, props.node.textContent, ref.current]);
      return (
        <MonacoNode {...props} language={"mermaid"}>
          <div ref={ref} style={{ height: "100%" }} />
        </MonacoNode>
      );
    };
  }

  keys(): Record<string, Dispatcher> {
    return nodeKeys(node => node.type.name === "mermaid");
  }

  inputRules({ type }: NodeArgs): InputRule[] {
    return [textblockTypeInputRule(/^:::\s?mermaid$/, type, { mode: "edit" })];
  }

  commands({ type, schema }: NodeArgs): Record<string, Command> | Command {
    return () =>
      toggleBlockType(type, schema.nodes.paragraph, { mode: "edit" });
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

  menuItems(): MenuItems {
    return {
      3: [
        {
          name: this.name,
          title: t("Mermaid 图"),
          icon: ChartGraph,
          keywords: "mermaid graph"
        }
      ]
    };
  }
}
