import { Node as ProsemirrorNode, NodeSpec } from "prosemirror-model";
import toggleWrap from "../commands/toggleWrap";
import { wrappingInputRule } from "prosemirror-inputrules";
import { PluginSimple } from "markdown-it";
import customFence from "markdown-it-container";
import ReactNode from "./ReactNode";
import React from "react";
import { ComponentProps } from "../lib/ComponentView";
import { NodeArgs } from "./Node";
import { MarkdownSerializerState } from "../lib/markdown/serializer";
import { Command } from "../lib/Extension";
import Token from "markdown-it/lib/token";

export default class Details extends ReactNode {
  get name() {
    return "container_details";
  }

  get schema(): NodeSpec {
    return {
      attrs: {
        open: {
          default: false
        },
        summary: {
          default: null
        }
      },
      content: "block+",
      group: "block",
      defining: true,
      draggable: true,
      parseDOM: [
        {
          tag: "details",
          getAttrs: node => {
            const dom = node as HTMLElement;
            const summaryEle = dom.querySelector("summary");
            let summary: null | string = null;
            if (summaryEle) {
              summary = summaryEle.textContent;
              summaryEle.remove();
            }
            return {
              summary
            };
          }
        }
      ],
      toDOM: node => {
        if (node.attrs.summary !== null) {
          return ["details", ["summary", node.attrs.summary], 0];
        } else {
          return ["details", 0];
        }
      }
    };
  }

  component(props: ComponentProps): React.ReactElement {
    const { node, contentRef } = props;
    const handleToggle = ({ node, updateAttrs }: ComponentProps) => () => {
      updateAttrs({
        open: !node.attrs.open
      });
    };
    return (
      <details open={node.attrs.open} onToggle={handleToggle(props)}>
        {node.attrs.summary && <summary>{node.attrs.summary}</summary>}
        <div ref={contentRef} />
      </details>
    );
  }

  commands({ type }: NodeArgs): Command {
    return attrs =>
      toggleWrap(type, {
        ...attrs,
        open: true
      });
  }

  inputRules({ type }: NodeArgs) {
    return [wrappingInputRule(/^:::details$/, type, { open: true })];
  }

  toMarkdown(state: MarkdownSerializerState, node: ProsemirrorNode) {
    state.write(
      "\n:::details" +
        (node.attrs.summary ? " " + node.attrs.summary : "") +
        "\n"
    );
    state.renderContent(node);
    state.write(":::");
    state.closeBlock(node);
  }

  parseMarkdown() {
    return {
      block: "container_details",
      getAttrs: (tok: Token) => ({
        summary: tok.info.replace("details", "") || null
      })
    };
  }

  markdownPlugin(): PluginSimple {
    return md =>
      // @ts-ignore
      customFence(md, "details", {
        marker: ":",
        validate: params => params.startsWith("details")
      });
  }
}
