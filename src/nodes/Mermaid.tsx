import { NodeArgs } from "./Node";
import { NodeSpec } from "prosemirror-model";
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
import { PluginSimple } from "markdown-it";
import { blockPlugin } from "../lib/markdown/container";
import { usePromise } from "react-use";
import { t } from "../i18n";
import toggleBlockType from "../commands/toggleBlockType";
import { ChartGraph } from "@icon-park/react";
import debounce from "lodash/debounce";
import styled from "styled-components";

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
          tag: `pre[data-type="${this.name}"]`,
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
      toDOM: () => ["pre", { "data-type": this.name }, ["code", 0]]
    });
  }

  component(): React.FC<ComponentProps> {
    const render = debounce(async (mounted, element, content: string) => {
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
        mermaid.initialize({
          startOnLoad: false,
          theme: props.editor.props.dark ? "dark" : "default"
        });
        render(mounted, ref.current, props.node.textContent);
      }, [
        props.node.attrs.mode,
        props.node.textContent,
        ref.current,
        props.editor.props.dark
      ]);
      return (
        <MonacoNode {...props} language={"mermaid"}>
          <MermaidWrapper ref={ref} />
        </MonacoNode>
      );
    };
  }

  keys(): Record<string, Dispatcher> {
    return nodeKeys(node => node.type.name === this.name);
  }

  inputRules({ type }: NodeArgs): InputRule[] {
    return [textblockTypeInputRule(/^:::\s?mermaid$/, type, { mode: "edit" })];
  }

  commands({ type, schema }: NodeArgs): Record<string, Command> | Command {
    return () =>
      toggleBlockType(type, schema.nodes.paragraph, { mode: "edit" });
  }

  parseMarkdown() {
    return {
      block: this.name
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

const MermaidWrapper = styled.div`
  svg {
    max-height: 100%;
  }
`;
