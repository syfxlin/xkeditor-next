import { Node as ProseMirrorNode, NodeSpec } from "prosemirror-model";
import toggleWrap from "../commands/toggleWrap";
import { wrappingInputRule } from "prosemirror-inputrules";
import { PluginSimple } from "markdown-it";
import ReactNode from "./ReactNode";
import React, { useCallback } from "react";
import { ComponentProps } from "../lib/ComponentView";
import { NodeArgs } from "./Node";
import { MarkdownSerializerState } from "../lib/markdown/serializer";
import { Command, MenuItems } from "../lib/Extension";
import Token from "markdown-it/lib/token";
import { blockPlugin } from "../lib/markdown/container";
import { t } from "../i18n";
// @ts-ignore
import { HomeIcon } from "outline-icons";

export default class Details extends ReactNode {
  get name() {
    return "details";
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

  component(): React.FC<ComponentProps> {
    return ({ node, contentRef, updateAttrs }) => {
      const handleToggle = useCallback(() => {
        updateAttrs({
          open: !node.attrs.open
        });
      }, [node, updateAttrs]);
      return (
        <details open={node.attrs.open} onToggle={handleToggle}>
          {node.attrs.summary && <summary>{node.attrs.summary}</summary>}
          <div ref={contentRef} />
        </details>
      );
    };
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

  toMarkdown(state: MarkdownSerializerState, node: ProseMirrorNode) {
    state.write(
      "\n:::details" +
        (node.attrs.summary ? " " + node.attrs.summary : "") +
        "\n"
    );
    state.renderContent(node);
    state.ensureNewLine();
    state.write(":::");
    state.closeBlock(node);
  }

  parseMarkdown() {
    return {
      block: this.name,
      getAttrs: (tok: Token) => ({
        summary: tok.info || null
      })
    };
  }

  markdownPlugin(): PluginSimple {
    return md => {
      blockPlugin({
        md,
        name: this.name
      });
    };
  }

  menuItems(): MenuItems {
    return {
      3: [
        {
          name: this.name,
          title: t("描述"),
          icon: HomeIcon,
          keywords: "details summary"
        }
      ]
    };
  }
}
