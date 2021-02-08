import { Node as ProseMirrorNode, NodeSpec } from "prosemirror-model";
import React from "react";
import { EmptyAttrs } from "../lib/Extension";
import { TokenConfig } from "prosemirror-markdown";
import { PluginSimple } from "markdown-it";
import { inlinePlugin } from "../lib/markdown/container";
import Node, { NodeArgs } from "./Node";
import { MarkdownSerializerState } from "../lib/markdown/serializer";
import { InputRule } from "prosemirror-inputrules";
import nodeInputRule from "../lib/nodeInputRule";

type StyleAttrs = {
  style: string;
};

const STYLE_INPUT_REGEX = /:style\[(?<text>.*?)]\((?<style>.*?)(?=[")])\)/;

const DEFAULT_COLORS: { [key: string]: string } = {
  gray: "rgba(206, 205, 202, 0.5)",
  brown: "rgba(155, 154, 151, 0.4)",
  orange: "rgba(245, 93, 0, 0.2)",
  yellow: "rgba(233, 168, 0, 0.2)",
  green: "rgba(0, 135, 107, 0.2)",
  blue: "rgba(0, 120, 223, 0.2)",
  purple: "rgba(103, 36, 222, 0.2)",
  pink: "rgba(221, 0, 129, 0.2)",
  red: "rgba(255, 0, 26, 0.2)",
  black: "rgb(55, 53, 47)"
};

const convertStyle = (style: string) => {
  if (!style) {
    return style;
  }
  if (style.indexOf(":") === -1) {
    const colors = style.split(",");
    if (colors.length < 2) {
      return `color: ${DEFAULT_COLORS.black}; background: ${DEFAULT_COLORS[
        colors[0]
      ] || colors[0]}`;
    } else {
      return `color: ${DEFAULT_COLORS[colors[0]] ||
        colors[0]}; background: ${DEFAULT_COLORS[colors[1]] || colors[1]}`;
    }
  }
};

export default class Style extends Node<EmptyAttrs, StyleAttrs> {
  get name() {
    return "style";
  }

  get schema(): NodeSpec {
    return {
      inline: true,
      content: "text*",
      marks: "",
      group: "inline",
      selectable: true,
      draggable: true,
      attrs: {
        style: {
          default: ""
        }
      },
      parseDOM: [
        {
          tag: "style[style]",
          getAttrs: node => {
            return {
              style: (node as HTMLSpanElement).style
            };
          }
        }
      ],
      toDOM: node => ["span", { style: convertStyle(node.attrs.style) }, 0]
    };
  }

  inputRules({ type }: NodeArgs): InputRule[] {
    return [
      nodeInputRule(STYLE_INPUT_REGEX, type, 1, match => ({
        style: match[2]
      }))
    ];
  }

  toMarkdown(state: MarkdownSerializerState, node: ProseMirrorNode) {
    state.write(":style[");
    state.write(node.textContent);
    state.write("](");
    state.write(node.attrs.style);
    state.write(")");
  }

  parseMarkdown(): TokenConfig {
    return {
      block: this.name,
      getAttrs: token => {
        return {
          style: token.attrGet("$dest_link") || ""
        };
      }
    };
  }

  markdownPlugin(): PluginSimple {
    return md => {
      inlinePlugin({
        md,
        name: this.name
      });
    };
  }
}
