import { Node as ProseMirrorNode, NodeSpec } from "prosemirror-model";
import ReactNode from "./ReactNode";
import { ComponentProps } from "../lib/ComponentView";
import React, { ChangeEvent, useCallback, useEffect, useRef } from "react";
import { NodeArgs } from "./Node";
import { textblockTypeInputRule } from "prosemirror-inputrules";
import { MarkdownSerializerState } from "../lib/markdown/serializer";
import MonacoEditor, { OnChange } from "@monaco-editor/react";
import Token from "markdown-it/lib/token";
import PrismHighlight from "../components/PrismHighlight";
import { languages } from "../utils/languages";
import copy from "copy-to-clipboard";
import { editor } from "monaco-editor/esm/vs/editor/editor.api";
import { Selection } from "prosemirror-state";
import { applyContent, mergeSpec, nodeKeys } from "../utils/editor";
import { setBlockType } from "prosemirror-commands";
import { toast } from "react-hot-toast";
import { t } from "../i18n";
import { CodeIcon } from "outline-icons";
import { ctrl, shift } from "../menus/block";
import { MenuItems } from "../lib/Extension";

export default class MonacoBlock extends ReactNode {
  get name() {
    return "code_block";
  }

  get schema(): NodeSpec {
    return mergeSpec({
      attrs: {
        language: {
          default: "javascript"
        },
        isEdit: {
          default: false
        }
      },
      parseDOM: [
        {
          tag: "pre",
          preserveWhitespace: "full",
          contentElement: node => {
            const dom = node as HTMLPreElement;
            if (
              dom.children.length === 1 &&
              dom.children[0].tagName.toLowerCase() === "code"
            ) {
              return dom.children[0];
            }
            return dom;
          },
          getAttrs: node => {
            const dom = node as HTMLElement;
            let language = dom.getAttribute("data-language");
            if (language === null) {
              language = dom.getAttribute("language");
            }
            if (language === null) {
              const match = dom.className.match(/lang(uage|)[-_]([^ ]+)/);
              if (match && match.length > 2) {
                language = match[2];
              }
            }
            return {
              language
            };
          }
        }
      ],
      toDOM: node => [
        "pre",
        { "data-language": node.attrs.language },
        ["code", 0]
      ]
    });
  }

  component(): React.FC<ComponentProps> {
    return ({ node, view, getPos, updateAttrs }) => {
      const propsRef = useRef({
        node,
        view,
        getPos
      });
      useEffect(() => {
        propsRef.current = {
          node,
          view,
          getPos
        };
      }, [node, view, getPos, view.state]);
      const handleChange: OnChange = useCallback(
        value => {
          applyContent({ node, getPos, view }, value);
        },
        [node, getPos, view]
      );
      const handleLanguageChange = useCallback(
        (event: ChangeEvent<HTMLSelectElement>) => {
          updateAttrs({
            language: event.target.value
          });
        },
        [updateAttrs]
      );
      const handleEdit = useCallback(() => {
        updateAttrs({
          isEdit: !node.attrs.isEdit
        });
      }, [updateAttrs, node]);
      const handleCopyToClipboard = useCallback(() => {
        copy(node.textContent);
        toast.success(t("已复制到剪贴板") as string);
      }, [node]);

      const handleMount = useCallback(
        (editor: editor.IStandaloneCodeEditor) => {
          updateAttrs({
            monacoRef: editor
          });
          editor.focus();
          editor.onKeyDown(e => {
            const { node, view, getPos } = propsRef.current;
            // 删除
            if (e.code === "Delete" || e.code === "Backspace") {
              if (node.textContent === "") {
                view.dispatch(
                  view.state.tr.deleteRange(getPos(), getPos() + node.nodeSize)
                );
                view.focus();
                return;
              }
            }
            // 移动光标
            const { lineNumber = 1, column = 1 } = editor.getPosition() || {};
            const model = editor.getModel();
            const maxLines = model?.getLineCount() || 1;
            let dir: -1 | 1 | null = null;
            if (e.code === "ArrowLeft") {
              if (lineNumber !== 1 || column !== 1) {
                return;
              }
              dir = -1;
            } else if (e.code === "ArrowRight") {
              if (
                lineNumber !== maxLines ||
                column - 1 !== model?.getLineLength(maxLines)
              ) {
                return;
              }
              dir = 1;
            } else if (e.code === "ArrowUp") {
              if (lineNumber !== 1) {
                return;
              }
              dir = -1;
            } else if (e.code === "ArrowDown") {
              if (lineNumber !== maxLines) {
                return;
              }
              dir = 1;
            }
            if (dir !== null) {
              const targetPos = getPos() + (dir < 0 ? 0 : node?.nodeSize);
              const selection = Selection.near(
                view.state.doc.resolve(targetPos),
                dir
              );
              view.dispatch(
                view.state.tr.setSelection(selection).scrollIntoView()
              );
              view.focus();
              return;
            }
          });
        },
        []
      );

      return (
        <div
          className={"code-block"}
          contentEditable={false}
          // TODO: Fix height
          style={{ height: 300 }}
        >
          {node.attrs.isEdit ? (
            <section>
              <MonacoEditor
                value={node.textContent}
                theme={"vs-dark"}
                language={node.attrs.language}
                onChange={handleChange}
                onMount={handleMount}
              />
              <div className={"toolbar"}>
                <button onClick={handleEdit}>View</button>
                <select
                  value={node.attrs.language}
                  onChange={handleLanguageChange}
                >
                  {Object.entries(languages).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value.label}
                    </option>
                  ))}
                </select>
              </div>
            </section>
          ) : (
            <section>
              <pre className={"line-numbers"}>
                <span aria-hidden="true" className="line-numbers-rows">
                  {node.textContent.split("\n").map((value, index) => (
                    <span key={index} />
                  ))}
                </span>
                <PrismHighlight
                  language={node.attrs.language}
                  code={node.textContent}
                />
              </pre>
              <div className={"toolbar"}>
                <button onClick={handleEdit}>Edit</button>
                <button onClick={handleCopyToClipboard}>Copy</button>
              </div>
            </section>
          )}
        </div>
      );
    };
  }

  inputRules({ type }: NodeArgs) {
    return [textblockTypeInputRule(/^```$/, type, { isEdit: true })];
  }

  commands({ type }: NodeArgs) {
    return () => setBlockType(type, { isEdit: true });
  }

  keys({ type }: NodeArgs) {
    return {
      "Ctrl-Shift-\\": setBlockType(type, { isEdit: true }),
      ...nodeKeys(node => node.type.name === this.name && node.attrs.isEdit)
    };
  }

  toMarkdown(state: MarkdownSerializerState, node: ProseMirrorNode) {
    state.write("```" + (node.attrs.language || "") + "\n");

    state.text(node.textContent, false);
    state.ensureNewLine();

    state.write("```");
    state.closeBlock(node);
  }

  get markdownToken() {
    return "fence";
  }

  parseMarkdown() {
    return {
      block: this.name,
      getAttrs: (tok: Token) => ({ language: tok.info })
    };
  }

  menuItems(): MenuItems {
    return {
      3: [
        {
          name: this.name,
          title: t("代码块"),
          icon: CodeIcon,
          shortcut: `${ctrl} ${shift}\\`,
          keywords: "code monaco script"
        }
      ]
    };
  }
}
