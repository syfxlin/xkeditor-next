import { Node as ProseMirrorNode, NodeSpec } from "prosemirror-model";
import React, {
  ChangeEvent,
  MouseEvent,
  useCallback,
  useMemo,
  useState
} from "react";
import { EmptyAttrs, ToolbarItems } from "../lib/Extension";
import { TokenConfig } from "prosemirror-markdown";
import { PluginSimple } from "markdown-it";
import { NodeArgs } from "./Node";
import { MarkdownSerializerState } from "../lib/markdown/serializer";
import { InputRule } from "prosemirror-inputrules";
import nodeInputRule from "../lib/nodeInputRule";
import ReactNode from "./ReactNode";
import { ComponentProps } from "../lib/ComponentView";
import Input from "../components/Input";
import FloatingToolbar from "../components/FloatingToolbar";
import isNodeActive from "../queries/isNodeActive";
import { selectionDir } from "../utils/editor";
import Tooltip from "../components/Tooltip";
import { DoneAll, Switch } from "@icon-park/react";
import ToolbarButton from "../components/ToolbarButton";
import { useTranslation } from "react-i18next";
import ColorPicker from "../components/ColorPicker";
import { ColorResult } from "react-color";

type StyleAttrs = {
  style: CSSStyleDeclaration;
};

const STYLE_INPUT_REGEX = /{\s*([^|}]+)\s*\|\s*([^}]+)}/;

const convertToString = (style: CSSStyleDeclaration) => {
  return style.cssText;
};

const convertToCss = (style: string) => {
  const converter = document.createElement("span");
  converter.setAttribute("style", style);
  return converter.style;
};

export default class Style extends ReactNode<EmptyAttrs, StyleAttrs> {
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
      attrs: {
        style: {
          default: {}
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
      toDOM: node => ["span", { style: convertToString(node.attrs.style) }, 0]
    };
  }

  component(): React.ComponentType<ComponentProps> {
    return ({ theme, node, view, forwardRef, updateAttrs, getPos }) => {
      const { t } = useTranslation();
      const [full, setFull] = useState(false);
      const [style, setStyle] = useState<string>(
        convertToString(node.attrs.style)
      );
      const styleObj = useMemo(() => convertToCss(style), [style]);
      const handleSubmit = useCallback(
        (event: MouseEvent<HTMLElement>) => {
          updateAttrs({
            style: styleObj
          });
          event.preventDefault();
          selectionDir(view, getPos(), node.nodeSize, 1);
        },
        [view, getPos, node, style]
      );
      const handleKeyDown = useCallback(
        (event: React.KeyboardEvent): void => {
          switch (event.key) {
            case "Enter":
            case "Escape": {
              if (event.key === "Enter") {
                updateAttrs({
                  style: styleObj
                });
              }
              event.preventDefault();
              const dir = event.ctrlKey || event.shiftKey ? -1 : 1;
              selectionDir(view, getPos(), node.nodeSize, dir);
              return;
            }
          }
        },
        [view, getPos, node, style]
      );
      const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setStyle(e.target.value);
      };
      const handleFull = () => {
        setFull(!full);
      };
      const handleChangeColor = useCallback(
        (color: ColorResult, key: any) => {
          const converter = document.createElement("span");
          converter.setAttribute("style", style);
          converter.style[
            key
          ] = `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`;
          setStyle(converter.style.cssText);
        },
        [style]
      );
      return (
        <>
          <span css={style} ref={forwardRef} />
          <FloatingToolbar
            view={view}
            active={isNodeActive(node.type)(view.state)}
          >
            {full ? (
              <>
                <Input
                  value={style}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  autoFocus={node.textContent === ""}
                />
              </>
            ) : (
              <>
                <Tooltip tooltip={t("文字颜色")}>
                  <ColorPicker
                    color={styleObj.color}
                    onChange={color => handleChangeColor(color, "color")}
                  />
                </Tooltip>
                <Tooltip tooltip={t("背景颜色")}>
                  <ColorPicker
                    color={styleObj.background}
                    onChange={color => handleChangeColor(color, "background")}
                  />
                </Tooltip>
                <ToolbarButton onClick={handleSubmit}>
                  <Tooltip tooltip={t("完成")}>
                    <DoneAll
                      theme="outline"
                      size="100%"
                      fill={theme.reverse.text[2]}
                    />
                  </Tooltip>
                </ToolbarButton>
              </>
            )}
            <ToolbarButton onClick={handleFull}>
              <Tooltip tooltip={t("切换")}>
                <Switch
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

  inputRules({ type }: NodeArgs): InputRule[] {
    return [
      nodeInputRule(STYLE_INPUT_REGEX, type, 1, match => ({
        style: convertToCss(match[2])
      }))
    ];
  }

  toMarkdown(state: MarkdownSerializerState, node: ProseMirrorNode) {
    state.write("{");
    state.write(node.textContent);
    state.write("|");
    state.write(convertToString(node.attrs.style));
    state.write("}");
  }

  parseMarkdown(): TokenConfig {
    return {
      block: this.name,
      noCloseToken: true,
      getAttrs: token => {
        return {
          style: convertToCss(token.info)
        };
      }
    };
  }

  markdownPlugin(): PluginSimple {
    return md => {
      md.inline.ruler.after("emphasis", "span", (state, silent) => {
        const start = state.pos;
        if (state.src.charCodeAt(start) !== 0x7b /* { */) {
          return false;
        }
        if (silent) {
          return false;
        }
        const content = state.src.slice(start);
        const match = /{\s*([^|}]+)\s*\|\s*([^}]+)}/.exec(content);
        if (!match) {
          return false;
        }
        const token = state.push(this.name, "span", 0);
        const matchStart = start + match.index;
        const matchEnd = start + match.index + match[0].length;
        token.map = [matchStart, matchEnd];
        token.info = match[2];
        token.content = match[1];
        token.markup = "style";
        state.pos = matchEnd;
        return true;
      });
    };
  }

  toolbarItems({ type }: NodeArgs): ToolbarItems {
    return {
      modes: [
        {
          name: "style",
          priority: 4,
          active: view => isNodeActive(type)(view.state),
          component: false
        }
      ]
    };
  }
}
