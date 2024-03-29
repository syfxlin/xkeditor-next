import { NodeSpec } from "prosemirror-model";
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
import { applyContent, selectionDir } from "../utils/editor";
import { Command, EmptyAttrs, MenuItems } from "../lib/Extension";
import FloatingToolbar from "../components/FloatingToolbar";
import Input from "../components/Input";
import { useTranslation } from "react-i18next";
import Tooltip from "../components/Tooltip";
import { Help, Inline } from "@icon-park/react";
import ToolbarButton from "../components/ToolbarButton";
import { t } from "../i18n";
import { NodeSelection } from "prosemirror-state";

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
    return ({ select, editor, theme, node, view, getPos, isSelected }) => {
      const tex = useRef<HTMLElement>(null);
      const input = useRef<HTMLInputElement>(null);
      const { t } = useTranslation();
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
      const handleKeyDown = useCallback(
        (event: React.KeyboardEvent): void => {
          switch (event.key) {
            case "Escape":
            case "Enter": {
              event.preventDefault();
              const dir = event.ctrlKey || event.shiftKey ? -1 : 1;
              selectionDir(view, getPos(), node.nodeSize, dir);
              return;
            }
          }
        },
        [view, getPos, node]
      );
      const handleOpenLink = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        editor.props.onClickLink?.("https://katex.org/", e.nativeEvent);
      };

      return (
        <>
          <span
            data-type={"katex-inline"}
            ref={tex}
            contentEditable={false}
            onClick={() => select()}
          />
          <FloatingToolbar view={view} active={isSelected}>
            <Input
              value={node.textContent}
              placeholder={t("输入科学公式...")}
              onKeyDown={handleKeyDown}
              onChange={handleChange}
              autoFocus={true}
              ref={input}
            />
            <ToolbarButton onClick={handleOpenLink}>
              <Tooltip tooltip={t("帮助")}>
                <Help
                  theme="outline"
                  size="100%"
                  fill={theme.reverse.text[2]}
                />
              </Tooltip>
            </ToolbarButton>
          </FloatingToolbar>
        </>
      );
    };
  }

  commands({
    type,
    schema
  }: NodeArgs): Record<string, Command<Partial<EmptyAttrs>>> {
    return {
      katexExample: attrs => (state, dispatch) => {
        const node = type.create(attrs, schema.text("E=mc^2"));
        const tr = state.tr;
        tr.replaceSelectionWith(node);
        const resolvedPos = tr.doc.resolve(
          tr.selection.anchor - (tr.selection.$anchor.nodeBefore?.nodeSize || 0)
        );
        tr.setSelection(new NodeSelection(resolvedPos));
        dispatch?.(tr.scrollIntoView());
        return true;
      }
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

  get markdownToken(): string {
    return "math_inline";
  }

  markdownPlugin(): PluginSimple {
    return katexPlugin;
  }

  menuItems(): MenuItems {
    return {
      3: [
        {
          name: "katexExample",
          title: t("公式"),
          icon: Inline,
          keywords: "katex formula math"
        }
      ]
    };
  }
}
