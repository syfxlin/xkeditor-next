import * as React from "react";
import { Node as ProseMirrorNode, NodeSpec } from "prosemirror-model";
import ReactNode from "./ReactNode";
import { MarkdownSerializerState } from "../lib/markdown/serializer";
import Token from "markdown-it/lib/token";
import { NodeArgs } from "./Node";
import { Command } from "../lib/Extension";
import { ComponentProps } from "../lib/ComponentView";

export default class Embed extends ReactNode {
  get name() {
    return "embed";
  }

  get schema(): NodeSpec {
    return {
      content: "inline*",
      group: "block",
      atom: true,
      attrs: {
        href: {},
        component: {},
        matches: {}
      },
      parseDOM: [
        {
          tag: "iframe",
          getAttrs: node => {
            const dom = node as HTMLIFrameElement;
            const { embeds } = this.editor.props;
            const href = dom.getAttribute("src") || "";

            if (embeds) {
              for (const embed of embeds) {
                const matches = embed.matcher(href);
                if (matches) {
                  return {
                    href,
                    component: embed.component,
                    matches
                  };
                }
              }
            }

            return {};
          }
        }
      ],
      toDOM: node => [
        "iframe",
        { src: node.attrs.href, contentEditable: "false" },
        0
      ]
    };
  }

  component(): React.FC<ComponentProps> {
    return ({ isEditable, isSelected, theme, node }) => {
      const Component = node.attrs.component;

      return (
        <Component
          attrs={node.attrs}
          isEditable={isEditable}
          isSelected={isSelected}
          theme={theme}
        />
      );
    };
  }

  commands({ type }: NodeArgs): Command {
    return attrs => (state, dispatch) => {
      dispatch?.(
        state.tr.replaceSelectionWith(type.create(attrs)).scrollIntoView()
      );
      return true;
    };
  }

  toMarkdown(state: MarkdownSerializerState, node: ProseMirrorNode) {
    state.ensureNewLine();
    state.write(
      "[" + state.esc(node.attrs.href) + "](" + state.esc(node.attrs.href) + ")"
    );
    state.write("\n\n");
  }

  parseMarkdown() {
    return {
      node: "embed",
      getAttrs: (token: Token) => ({
        href: token.attrGet("href"),
        matches: token.attrGet("matches"),
        component: token.attrGet("component")
      })
    };
  }
}
