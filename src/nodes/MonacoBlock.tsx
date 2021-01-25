import { Node as ProsemirrorNode, NodeSpec } from "prosemirror-model";
import ReactNode from "./ReactNode";
import { ComponentProps } from "../lib/ComponentView";
import React, { ChangeEvent, useCallback, useState } from "react";
import { NodeArgs } from "./Node";
import { textblockTypeInputRule } from "prosemirror-inputrules";
import { MarkdownSerializerState } from "../lib/markdown/serializer";
import MonacoEditor, { OnChange } from "@monaco-editor/react";
import Token from "markdown-it/lib/token";
import PrismHighlight from "../components/PrismHighlight";
import { languages } from "../utils/languages";
import copy from "copy-to-clipboard";
import { ToastType } from "../types";

export function computeChange(oldVal: string, newVal: string) {
  if (oldVal == newVal) {
    return null;
  }
  let start = 0,
    oldEnd = oldVal.length,
    newEnd = newVal.length;
  while (
    start < oldEnd &&
    oldVal.charCodeAt(start) == newVal.charCodeAt(start)
  ) {
    ++start;
  }
  while (
    oldEnd > start &&
    newEnd > start &&
    oldVal.charCodeAt(oldEnd - 1) == newVal.charCodeAt(newEnd - 1)
  ) {
    oldEnd--;
    newEnd--;
  }
  return { from: start, to: oldEnd, text: newVal.slice(start, newEnd) };
}

export default class MonacoBlock extends ReactNode {
  get name() {
    return "monaco";
  }

  get schema(): NodeSpec {
    return {
      attrs: {
        language: {
          default: null
        }
      },
      content: "text*",
      marks: "",
      group: "block",
      code: true,
      defining: true,
      draggable: false,
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
    };
  }

  component(): React.FC<ComponentProps> {
    return ({ node, view, getPos }) => {
      const [isEdit, setEdit] = useState(view.editable);
      const handleChange: OnChange = useCallback(
        value => {
          const change = computeChange(node.textContent, value || "");
          if (change) {
            const start = getPos() + 1;
            const tr = view.state.tr.replaceWith(
              start + change.from,
              start + change.to,
              change.text ? view.state.schema.text(change.text) : null
            );
            view.dispatch(tr);
          }
        },
        [node, getPos, view]
      );
      const handleLanguageChange = useCallback(
        (event: ChangeEvent<HTMLSelectElement>) => {
          const { tr } = view.state;
          const element = event.target;
          const { top, left } = element.getBoundingClientRect();
          const result = view.posAtCoords({ top, left });

          if (result) {
            const transaction = tr.setNodeMarkup(result.inside, undefined, {
              language: element.value
            });
            view.dispatch(transaction);
          }
        },
        [view]
      );
      const handleCopyToClipboard = useCallback(() => {
        copy(node.textContent);
        if (this.options.onShowToast) {
          this.options.onShowToast(
            this.options.dictionary.codeCopied,
            ToastType.Info
          );
        }
      }, [node]);
      return (
        <div className={"code-block"}>
          {isEdit ? (
            <section>
              <MonacoEditor
                value={node.textContent}
                height={300}
                theme={"vs-dark"}
                language={node.attrs.language}
                onChange={handleChange}
              />
              <div className={"toolbar"}>
                <button onClick={() => setEdit(false)}>View</button>
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
            <section contentEditable={false}>
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
                <button onClick={() => setEdit(true)}>Edit</button>
                <button onClick={handleCopyToClipboard}>Copy</button>
              </div>
            </section>
          )}
        </div>
      );
    };
  }

  inputRules({ type }: NodeArgs) {
    return [textblockTypeInputRule(/^:::monaco$/, type)];
  }

  toMarkdown(state: MarkdownSerializerState, node: ProsemirrorNode) {
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
      block: "monaco",
      getAttrs: (tok: Token) => ({ language: tok.info })
    };
  }
}
