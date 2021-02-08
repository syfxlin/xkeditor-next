import { wrappingInputRule } from "prosemirror-inputrules";
import toggleWrap from "../commands/toggleWrap";
import React from "react";
import { NodeArgs } from "./Node";
import { Node as ProseMirrorNode, NodeSpec } from "prosemirror-model";
import { PluginSimple } from "markdown-it";
import { Command, EmptyAttrs, MenuItems } from "../lib/Extension";
import { MarkdownSerializerState } from "../lib/markdown/serializer";
import Token from "markdown-it/lib/token";
import { blockPlugin } from "../lib/markdown/container";
import { t } from "../i18n";
import { Caution, Info, TipsOne } from "@icon-park/react";
import ReactNode from "./ReactNode";
import { ComponentProps } from "../lib/ReactNodeView";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

type NoticeAttrs = {
  style: "info" | "warning" | "tip";
};

export default class Notice extends ReactNode<EmptyAttrs, NoticeAttrs> {
  get styleOptions() {
    return Object.entries({
      info: t("信息"),
      warning: t("警告"),
      tip: t("提示")
    });
  }

  get name() {
    return "notice";
  }

  get schema(): NodeSpec {
    return {
      attrs: {
        style: {
          default: "info"
        }
      },
      content: "block+",
      group: "block",
      defining: true,
      draggable: true,
      parseDOM: [
        {
          tag: "div.notice-block",
          preserveWhitespace: "full",
          contentElement: "div:last-child",
          getAttrs: node => ({
            style: (node as HTMLElement).className.includes("tip")
              ? "tip"
              : (node as HTMLElement).className.includes("warning")
              ? "warning"
              : undefined
          })
        }
      ],
      toDOM: node => ["div", { class: `notice-block ${node.attrs.style}` }, 0]
    };
  }

  component(): React.FC<ComponentProps> {
    const icons = {
      info: <Info />,
      warning: <Caution />,
      tip: <TipsOne />
    };
    return ({ node, updateAttrs, forwardRef }) => {
      const attrs = node.attrs as NoticeAttrs;
      const { t } = useTranslation();
      return (
        <div className={`notice-block ${attrs.style}`}>
          <Icon>{icons[attrs.style]}</Icon>
          <div contentEditable={false} className={"toolbar"}>
            <select
              value={attrs.style}
              onChange={e => updateAttrs({ style: e.target.value })}
            >
              <option value={"info"}>{t("信息")}</option>
              <option value={"warning"}>{t("警告")}</option>
              <option value={"tip"}>{t("提示")}</option>
            </select>
          </div>
          <div ref={forwardRef} />
        </div>
      );
    };
  }

  commands({ type }: NodeArgs): Command {
    return attrs => toggleWrap(type, attrs);
  }

  inputRules({ type }: NodeArgs) {
    return [wrappingInputRule(/^:::\s?notice$/, type)];
  }

  toMarkdown(state: MarkdownSerializerState, node: ProseMirrorNode) {
    state.write("\n:::notice " + (node.attrs.style || "info") + "\n");
    state.renderContent(node);
    state.ensureNewLine();
    state.write(":::");
    state.closeBlock(node);
  }

  parseMarkdown() {
    return {
      block: this.name,
      getAttrs: (tok: Token) => ({ style: tok.info })
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
      4: [
        {
          name: this.name,
          title: t("提示框（信息）"),
          icon: Info,
          keywords: "notice card information",
          attrs: { style: "info" }
        },
        {
          name: this.name,
          title: t("提示框（警告）"),
          icon: Caution,
          keywords: "notice card error warning",
          attrs: { style: "warning" }
        },
        {
          name: this.name,
          title: t("提示框（提醒）"),
          icon: TipsOne,
          keywords: "notice card suggestion tip",
          attrs: { style: "tip" }
        }
      ]
    };
  }
}

const Icon = styled.span`
  padding-right: 16px;
`;
