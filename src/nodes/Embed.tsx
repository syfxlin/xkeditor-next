import React, { ComponentType } from "react";
import { Node as ProseMirrorNode, NodeSpec } from "prosemirror-model";
import ReactNode from "./ReactNode";
import { MarkdownSerializerState } from "../lib/markdown/serializer";
import Token from "markdown-it/lib/token";
import { NodeArgs } from "./Node";
import { ApplyCommand, Attrs, Command, EmptyAttrs } from "../lib/Extension";
import { ComponentProps } from "../lib/ComponentView";
import { EditorView } from "prosemirror-view";
import { IIconProps } from "@icon-park/react/lib/runtime";
import { ResizableBox } from "react-resizable";

export type EmbedDescriptor = {
  title: string;
  matcher: (value: string) => Attrs | null;
  component: ComponentType<ComponentProps>;
  icon?: ComponentType<IIconProps>;
  shortcut?: string;
  keywords?: string;
  attrs?: Attrs | ((view: EditorView) => Attrs);
  command?: ApplyCommand;
};

type EmbedAttrs = {
  href: null | string;
  component: null | ComponentType<ComponentProps>;
  matches: Record<string, string>;
  allow?: string | null;
  referrerpolicy?: string | null;
  sandbox?: string | null;
};

const convertAttrs = (title: string) => {
  if (title === "") {
    return {};
  }
  const strings = title.split(",");
  const attrs: { [key: string]: string } = {};
  for (const string of strings) {
    const kv = string.split("=");
    attrs[kv[0].trim()] = kv[1].trim();
  }
  return attrs;
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
        matches: {
          default: null
        },
        allow: {
          default: null
        },
        referrerpolicy: {
          default: null
        },
        sandbox: {
          default: null
        }
      },
      parseDOM: [
        {
          tag: "iframe",
          getAttrs: node => {
            const dom = node as HTMLIFrameElement;
            const embeds = this.editor.embeds;
            const href = dom.getAttribute("src") || "";

            if (embeds) {
              for (const embed of embeds) {
                const matches = embed.matcher(href);
                if (matches) {
                  return {
                    ...matches,
                    href,
                    component: embed.component,
                    allow: dom.getAttribute("allow"),
                    referrerpolicy: dom.getAttribute("referrerpolicy"),
                    sandbox: dom.getAttribute("sandbox")
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
        {
          src: node.attrs.href,
          allow: node.attrs.allow,
          referrerpolicy: node.attrs.referrerpolicy,
          sandbox: node.attrs.sandbox,
          contentEditable: "false"
        },
        0
      ]
    };
  }

  component(): React.FC<ComponentProps> {
    return props => {
      const Component = props.node.attrs.component;
      return (
        <ResizableBox
          width={Infinity}
          height={300}
          minConstraints={[Infinity, 100]}
          maxConstraints={[Infinity, Infinity]}
          axis="y"
          resizeHandles={["s"]}
          className={"embed"}
        >
          <Component {...props} />
        </ResizableBox>
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
    let options = "";
    if (node.attrs.allow) {
      options += `allow=${node.attrs.allow},`;
    }
    if (node.attrs.referrerpolicy) {
      options += `referrerpolicy=${node.attrs.referrerpolicy},`;
    }
    if (node.attrs.sandbox) {
      options += `sandbox=${node.attrs.sandbox},`;
    }
    options = options.replace(/,$/, "");
    state.write(
      `[${state.esc(node.attrs.href)}](${state.esc(
        node.attrs.href
      )} "${options}")`
    );
    state.write("\n\n");
  }

  parseMarkdown() {
    return {
      node: this.name,
      getAttrs: (token: Token) => ({
        href: token.attrGet("href"),
        matches: token.attrGet("matches"),
        component: token.attrGet("component"),
        ...convertAttrs(token.attrGet("title") || "")
      })
    };
  }
}
