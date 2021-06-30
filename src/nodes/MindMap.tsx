import MonacoNode, { MonacoNodeAttrs } from "../components/MonacoNode";
import { NodeArgs } from "./Node";
import {
  Command,
  Dispatcher,
  EmptyAttrs,
  MenuItems,
  MonacoAttrs
} from "../lib/Extension";
import { NodeSpec } from "prosemirror-model";
import { mergeSpec, nodeKeys } from "../utils/editor";
import { InputRule, textblockTypeInputRule } from "prosemirror-inputrules";
import toggleBlockType from "../commands/toggleBlockType";
import { PluginSimple } from "markdown-it";
import { blockPlugin } from "../lib/markdown/container";
import { t } from "../i18n";
import { MindmapMap } from "@icon-park/react";
import ReactNode from "./ReactNode";
import { ComponentProps } from "../lib/ComponentView";
import React, { ComponentType, useEffect, useRef } from "react";
import { Transformer } from "markmap-lib";
import debounce from "lodash/debounce";
import { usePromise } from "react-use";
import { Markmap } from "markmap-view";
import styled from "styled-components";

const transformer = new Transformer([]);

type MindMapAttrs = MonacoNodeAttrs;

export default class MindMap extends ReactNode<
  EmptyAttrs,
  MonacoAttrs<MindMapAttrs>
> {
  get name() {
    return "mindmap";
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

  component(): ComponentType<ComponentProps> {
    const render = debounce(
      async (mounted, element: SVGSVGElement | null, content: string) => {
        if (!element) {
          return;
        }
        await mounted(
          new Promise<void>(resolve => {
            const { root } = transformer.transform(content);
            element.innerHTML = "";
            Markmap.create(element, undefined, root);
            resolve();
          })
        );
      },
      700
    );
    return props => {
      const ref = useRef<SVGSVGElement>(null);
      const mounted = usePromise();
      useEffect(() => {
        if (props.node.attrs.mode === "edit") {
          return;
        }
        render(mounted, ref.current, props.node.textContent);
      }, [props.node.attrs.mode, props.node.textContent, ref.current]);
      return (
        <MonacoNode {...props} language={"markdown"}>
          <MindMapWrapper ref={ref} />
        </MonacoNode>
      );
    };
  }

  keys(): Record<string, Dispatcher> {
    return nodeKeys(node => node.type.name === this.name);
  }

  inputRules({ type }: NodeArgs): InputRule[] {
    return [textblockTypeInputRule(/^:::\s?mindmap$/, type, { mode: "edit" })];
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
          title: t("MindMap 图"),
          icon: MindmapMap,
          keywords: "mindmap uml"
        }
      ]
    };
  }
}

const MindMapWrapper = styled.svg`
  width: 100%;
  height: 100%;
`;
