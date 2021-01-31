import { wrappingInputRule } from "prosemirror-inputrules";
import toggleWrap from "../commands/toggleWrap";
import { InfoIcon, StarredIcon, WarningIcon } from "outline-icons";
import * as React from "react";
import ReactDOM from "react-dom";
import Node, { NodeArgs, NodeMenuItem } from "./Node";
import { Node as ProseMirrorNode, NodeSpec } from "prosemirror-model";
import { PluginSimple } from "markdown-it";
import { Command } from "../lib/Extension";
import { MarkdownSerializerState } from "../lib/markdown/serializer";
import Token from "markdown-it/lib/token";
import { blockPlugin } from "../lib/markdown/container";
import { t } from "../i18n";

export default class Notice extends Node {
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
      toDOM: node => {
        const select = document.createElement("select");
        select.addEventListener("change", this.handleStyleChange);

        this.styleOptions.forEach(([key, label]) => {
          const option = document.createElement("option");
          option.value = key;
          option.innerText = label;
          option.selected = node.attrs.style === key;
          select.appendChild(option);
        });

        let component;

        if (node.attrs.style === "tip") {
          component = <StarredIcon color="currentColor" />;
        } else if (node.attrs.style === "warning") {
          component = <WarningIcon color="currentColor" />;
        } else {
          component = <InfoIcon color="currentColor" />;
        }

        const icon = document.createElement("div");
        icon.className = "icon";
        ReactDOM.render(component, icon);

        return [
          "div",
          { class: `notice-block ${node.attrs.style}` },
          icon,
          ["div", { contentEditable: "false" }, select],
          ["div", 0]
        ];
      }
    };
  }

  commands({ type }: NodeArgs): Command {
    return attrs => toggleWrap(type, attrs);
  }

  handleStyleChange = (event: any) => {
    const { view } = this.editor;
    const { tr } = view.state;
    const element = event.target;
    const { top, left } = element.getBoundingClientRect();
    const result = view.posAtCoords({ top, left });

    if (result) {
      const transaction = tr.setNodeMarkup(result.inside, undefined, {
        style: element.value
      });
      view.dispatch(transaction);
    }
  };

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

  menuItems(): NodeMenuItem[] {
    return [
      {
        name: this.name,
        title: t("提示框（信息）"),
        icon: InfoIcon,
        keywords: "notice card information",
        attrs: { style: "info" }
      },
      {
        name: this.name,
        title: t("提示框（警告）"),
        icon: WarningIcon,
        keywords: "notice card error",
        attrs: { style: "warning" }
      },
      {
        name: this.name,
        title: t("提示框（提醒）"),
        icon: StarredIcon,
        keywords: "notice card suggestion",
        attrs: { style: "tip" }
      }
    ];
  }
}
