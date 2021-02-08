import { Node as ProseMirrorNode, NodeSpec } from "prosemirror-model";
import nodeInputRule from "../lib/nodeInputRule";
// @ts-ignore
import katexPlugin from "@iktakahiro/markdown-it-katex";
import { render } from "katex";
import ReactNode from "./ReactNode";
import React, { ChangeEvent, useCallback, useEffect, useRef } from "react";
import { ComponentProps } from "../lib/ComponentView";
import { InputRule } from "prosemirror-inputrules";
import { PluginSimple } from "markdown-it";
import { NodeArgs } from "./Node";
import { TokenConfig } from "prosemirror-markdown";
import { MarkdownSerializerState } from "../lib/markdown/serializer";
import { applyContent } from "../utils/editor";
import { EmptyAttrs } from "../lib/Extension";

export default class KatexInline extends ReactNode<EmptyAttrs, EmptyAttrs> {
  get name() {
    return "katex_inline";
  }

  get schema(): NodeSpec {
    return {
      inline: true,
      group: "inline",
      marks: "",
      content: "text*",
      draggable: true,
      atom: true,
      parseDOM: [
        {
          tag: `span[data-type="katex-inline"]`
        }
      ],
      toDOM: node => {
        return ["span", { "data-type": "katex-inline" }, node.textContent];
      }
    };
  }

  component(): React.FC<ComponentProps> {
    return ({ node, view, getPos, isSelected }) => {
      const tex = useRef<HTMLElement>(null);
      const input = useRef<HTMLInputElement>(null);
      useEffect(() => {
        if (tex.current) {
          render(node.textContent, tex.current, {
            throwOnError: false
          });
        }
      }, [node.textContent]);

      const handleChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
          applyContent({ node, view, getPos }, event.target.value);
        },
        [node, view, getPos]
      );

      useEffect(() => {
        if (isSelected) {
          input.current?.focus();
        }
      }, [isSelected]);

      return (
        <>
          <input
            value={node.textContent}
            onChange={handleChange}
            hidden={!isSelected}
            ref={input}
          />
          <span data-type={"katex-inline"} ref={tex} contentEditable={false} />
        </>
      );
    };
  }

  inputRules({ type }: NodeArgs): InputRule[] {
    return [nodeInputRule(/\$([^$]+)\$/, type, 1)];
  }

  parseMarkdown(): TokenConfig {
    return {
      block: this.name,
      noCloseToken: true
    };
  }

  toMarkdown(state: MarkdownSerializerState, node: ProseMirrorNode) {
    state.write("$");
    state.text(node.textContent);
    state.write("$");
  }

  get markdownToken(): string {
    return "math_inline";
  }

  markdownPlugin(): PluginSimple {
    return katexPlugin;
  }
}
