import MonacoNode, { MonacoNodeAttrs } from "../components/MonacoNode";
import { NodeArgs } from "./Node";
import {
  Command,
  Dispatcher,
  EmptyAttrs,
  MenuItems,
  MonacoAttrs
} from "../lib/Extension";
import { Node as ProseMirrorNode, NodeSpec } from "prosemirror-model";
import { mergeSpec, nodeKeys } from "../utils/editor";
import { InputRule, textblockTypeInputRule } from "prosemirror-inputrules";
import toggleBlockType from "../commands/toggleBlockType";
import { MarkdownSerializerState } from "../lib/markdown/serializer";
import { PluginSimple } from "markdown-it";
import { blockPlugin } from "../lib/markdown/container";
import { t } from "../i18n";
import { ChartGraph } from "@icon-park/react";
import ReactNode from "./ReactNode";
import { ComponentProps } from "../lib/ComponentView";
import React, { useEffect, useState } from "react";
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

  component(): React.FC<ComponentProps> | typeof React.Component {
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
          <PlantUmlWrapper>
            <img
              src={`http://www.plantuml.com/plantuml/svg/${encode}`}
              alt={props.node.textContent}
            />
          </PlantUmlWrapper>
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

  toMarkdown(state: MarkdownSerializerState, node: ProseMirrorNode) {
    state.write("\n:::plantuml\n");
    state.renderContent(node);
    state.ensureNewLine();
    state.write(":::");
    state.closeBlock(node);
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

const PlantUmlWrapper = styled.div`
  display: flex;
  justify-content: center;
`;
