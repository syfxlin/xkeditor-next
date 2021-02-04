import React from "react";
import { Node as ProseMirrorNode, NodeSpec } from "prosemirror-model";
import ReactNode from "./ReactNode";
import { MarkdownSerializerState } from "../lib/markdown/serializer";
import Token from "markdown-it/lib/token";
import { NodeArgs } from "./Node";
import { ApplyCommand, Attrs, Command, EmptyAttrs } from "../lib/Extension";
import { ComponentProps } from "../lib/ComponentView";
import { EditorView } from "prosemirror-view";
import { IIconProps } from "@icon-park/react/lib/runtime";

export type EmbedDescriptor = {
  title: string;
  matcher: (value: string) => Attrs | null;
  component: typeof React.Component | React.FC<ComponentProps>;
  icon?: typeof React.Component | React.FC<IIconProps>;
  shortcut?: string;
  keywords?: string;
  attrs?: Attrs | ((view: EditorView) => Attrs);
  command?: ApplyCommand;
};

type EmbedAttrs = {
  href: null | string;
  component: null | typeof React.Component | React.FC<ComponentProps>;
  matches: Record<string, string>;
};

export default class Embed extends ReactNode<EmptyAttrs, EmbedAttrs> {
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
    return props => {
      const Component = props.node.attrs.component;
      return <Component {...props} />;
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
      node: this.name,
      getAttrs: (token: Token) => ({
        href: token.attrGet("href"),
        matches: token.attrGet("matches"),
        component: token.attrGet("component")
      })
    };
  }
}
