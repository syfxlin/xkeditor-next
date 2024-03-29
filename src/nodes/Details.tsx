import { NodeSpec } from "prosemirror-model";
import toggleWrap from "../commands/toggleWrap";
import { wrappingInputRule } from "prosemirror-inputrules";
import { PluginSimple } from "markdown-it";
import ReactNode from "./ReactNode";
import React, { useCallback } from "react";
import { ComponentProps } from "../lib/ComponentView";
import { NodeArgs } from "./Node";
import { Command, EmptyAttrs, MenuItems } from "../lib/Extension";
import Token from "markdown-it/lib/token";
import { blockPlugin } from "../lib/markdown/container";
import { t } from "../i18n";
import { ViewGridDetail } from "@icon-park/react";

type DetailsAttrs = {
  open: boolean;
  summary: null | string;
};

export default class Details extends ReactNode<EmptyAttrs, DetailsAttrs> {
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
    return ({ node, forwardRef, updateAttrs }) => {
      const handleToggle = useCallback(() => {
        updateAttrs({
          open: !node.attrs.open
        });
      }, [node, updateAttrs]);
      return (
        <details open={node.attrs.open} onDoubleClick={handleToggle}>
          {node.attrs.summary && <summary>{node.attrs.summary}</summary>}
          <div ref={forwardRef} />
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
          icon: ViewGridDetail,
          keywords: "details summary"
        }
      ]
    };
  }
}
