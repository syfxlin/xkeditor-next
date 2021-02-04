import { InputRule } from "prosemirror-inputrules";
import { EditorState, Plugin } from "prosemirror-state";
import { isInTable } from "prosemirror-tables";
import { findParentNode } from "prosemirror-utils";
import { Decoration, DecorationSet, EditorView } from "prosemirror-view";
import Extension, { EmptyAttrs } from "../lib/Extension";
import { t } from "../i18n";

const MAX_MATCH = 500;
const OPEN_REGEX = /^\/(\w+)?$/;
const CLOSE_REGEX = /(^(?!\/(\w+)?)(.*)$|^\/((\w+)\s.*|\s)$)/;

// based on the input rules code in Prosemirror, here:
// https://github.com/ProseMirror/prosemirror-inputrules/blob/master/src/inputrules.js
function run(
  view: EditorView,
  from: number,
  to: number,
  regex: RegExp,
  handler: (
    state: EditorState,
    match: string[],
    start?: number,
    end?: number
  ) => any
): boolean {
  if (view.composing) {
    return false;
  }
  const state = view.state;
  const $from = state.doc.resolve(from);
  if ($from.parent.type.spec.code) {
    return false;
  }

  const textBefore = $from.parent.textBetween(
    Math.max(0, $from.parentOffset - MAX_MATCH),
    $from.parentOffset,
    undefined,
    "\ufffc"
  );

  const match = regex.exec(textBefore) as RegExpExecArray;
  const tr = handler(state, match, match ? from - match[0].length : from, to);
  if (!tr) return false;
  return true;
}

type BlockMenuTriggerOptions = {
  open: (search: string) => void;
  close: () => void;
};

export default class BlockMenuTrigger extends Extension<
  BlockMenuTriggerOptions,
  EmptyAttrs
> {
  get name() {
    return "blockmenu";
  }

  get plugins() {
    return [
      new Plugin({
        props: {
          handleClick: () => {
            this.options.close();
            return false;
          },
          handleKeyDown: (view, event) => {
            // Prosemirror input rules are not triggered on backspace, however
            // we need them to be evaluted for the filter trigger to work
            // correctly. This additional handler adds inputrules-like handling.
            if (event.key === "Backspace") {
              // timeout ensures that the delete has been handled by prosemirror
              // and any characters removed, before we evaluate the rule.
              setTimeout(() => {
                const { pos } = view.state.selection.$from;
                return run(view, pos, pos, OPEN_REGEX, (state, match) => {
                  if (match) {
                    this.options.open(match[1]);
                  } else {
                    this.options.close();
                  }
                  return null;
                });
              });
            }

            // If the query is active and we're navigating the block menu then
            // just ignore the key events in the editor itself until we're done
            if (
              event.key === "Enter" ||
              event.key === "ArrowUp" ||
              event.key === "ArrowDown" ||
              event.key === "Tab"
            ) {
              const { pos } = view.state.selection.$from;

              return run(view, pos, pos, OPEN_REGEX, (state, match) => {
                // just tell Prosemirror we handled it and not to do anything
                return match ? true : null;
              });
            }

            return false;
          },
          decorations: state => {
            const parent = findParentNode(
              node => node.type.name === "paragraph"
            )(state.selection);

            if (!parent) {
              return;
            }

            const decorations: Decoration[] = [];
            const isEmpty = parent && parent.node.content.size === 0;
            const isSlash = parent && parent.node.textContent === "/";
            const isTopLevel = state.selection.$from.depth === 1;

            if (isTopLevel) {
              if (isEmpty) {
                decorations.push(
                  Decoration.widget(parent.pos, () => {
                    const icon = document.createElement("button");
                    icon.type = "button";
                    icon.className = "block-menu-trigger";
                    icon.innerText = "+";
                    icon.addEventListener("click", () => {
                      this.options.open("");
                    });
                    return icon;
                  })
                );

                decorations.push(
                  Decoration.node(
                    parent.pos,
                    parent.pos + parent.node.nodeSize,
                    {
                      class: "placeholder",
                      "data-empty-text": t("输入 '/' 以插入块...")
                    }
                  )
                );
              }

              if (isSlash) {
                decorations.push(
                  Decoration.node(
                    parent.pos,
                    parent.pos + parent.node.nodeSize,
                    {
                      class: "placeholder",
                      "data-empty-text": `  ${t("继续输入进行过滤...")}`
                    }
                  )
                );
              }

              return DecorationSet.create(state.doc, decorations);
            }

            return;
          }
        }
      })
    ];
  }

  inputRules() {
    return [
      // main regex should match only:
      // /word
      new InputRule(OPEN_REGEX, (state, match) => {
        if (
          match &&
          state.selection.$from.parent.type.name === "paragraph" &&
          !isInTable(state)
        ) {
          this.options.open(match[1]);
        }
        return null;
      }),
      // invert regex should match some of these scenarios:
      // /<space>word
      // /<space>
      // /word<space>
      new InputRule(CLOSE_REGEX, (state, match) => {
        if (match) {
          this.options.open("");
        }
        return null;
      })
    ];
  }
}
