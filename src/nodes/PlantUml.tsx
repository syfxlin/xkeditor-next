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
import { ChartGraph } from "@icon-park/react";
import ReactNode from "./ReactNode";
import { ComponentProps } from "../lib/ComponentView";
import React, { ComponentType, useEffect, useState } from "react";
import plantumlEncoder from "plantuml-encoder";
import debounce from "lodash/debounce";
import styled from "styled-components";

type PlantUmlAttrs = MonacoNodeAttrs;

export default class PlantUml extends ReactNode<
  EmptyAttrs,
  MonacoAttrs<PlantUmlAttrs>
> {
  get name() {
    return "plantuml";
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
      (content: string, setEncode: (encode: string) => void) => {
        setEncode(plantumlEncoder.encode(content));
      },
      700
    );
    return props => {
      const [encode, setEncode] = useState("");
      useEffect(() => {
        render(props.node.textContent, setEncode);
      }, [props.node.textContent, props.node.attrs.mode]);
      return (
        <MonacoNode {...props} language={"mermaid"}>
          <PlantUmlWrapper
            dark={props.editor.props.dark}
            url={`http://www.plantuml.com/plantuml/svg/${encode}`}
          />
        </MonacoNode>
      );
    };
  }

  keys(): Record<string, Dispatcher> {
    return nodeKeys(node => node.type.name === this.name);
  }

  inputRules({ type }: NodeArgs): InputRule[] {
    return [textblockTypeInputRule(/^:::\s?plantuml$/, type, { mode: "edit" })];
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
          title: t("PlantUml 图"),
          icon: ChartGraph,
          keywords: "plantuml uml"
        }
      ]
    };
  }
}

const PlantUmlWrapper = styled.div<{ dark: boolean | undefined; url: string }>`
  width: 100%;
  background-image: url(${props => props.url});
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  filter: ${props => (props.dark ? "invert(1)" : "none")};
`;
