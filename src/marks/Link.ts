import { toggleMark } from "prosemirror-commands";
import { Plugin } from "prosemirror-state";
import { InputRule } from "prosemirror-inputrules";
import Mark, { MarkArgs } from "./Mark";
import { MarkSpec, Node } from "prosemirror-model";
import { Attrs, Dispatcher } from "../lib/Extension";
import StateInline from "markdown-it/lib/rules_inline/state_inline";
import Token from "markdown-it/lib/token";

const LINK_INPUT_REGEX = /\[(.+)]\((\S+)\)/;

function isPlainURL(link: Node, parent: Node, index: number, side: -1 | 1) {
  if (link.attrs.title || !/^\w+:/.test(link.attrs.href)) {
    return false;
  }

  const content = parent.child(index + (side < 0 ? -1 : 0));
  if (
    !content.isText ||
    content.text !== link.attrs.href ||
    // @ts-ignore
    content.marks[content.marks.length - 1] !== link
  ) {
    return false;
  }

  if (index === (side < 0 ? 1 : parent.childCount - 1)) {
    return true;
  }

  const next = parent.child(index + (side < 0 ? -2 : 1));
  // @ts-ignore
  return !link.isInSet(next.marks);
}

export default class Link extends Mark {
  get name() {
    return "link";
  }

  get schema(): MarkSpec {
    return {
      attrs: {
        href: {
          default: ""
        }
      },
      inclusive: false,
      parseDOM: [
        {
          tag: "a[href]",
          getAttrs: node => ({
            href: (node as HTMLAnchorElement).getAttribute("href")
          })
        }
      ],
      toDOM: node => [
        "a",
        {
          ...node.attrs,
          rel: "noopener noreferrer nofollow"
        },
        0
      ]
    };
  }

  inputRules({ type }: MarkArgs) {
    return [
      new InputRule(LINK_INPUT_REGEX, (state, match, start, end) => {
        const [okay, alt, href] = match;
        const { tr } = state;

        if (okay) {
          tr.replaceWith(start, end, this.editor.schema.text(alt)).addMark(
            start,
            start + alt.length,
            type.create({ href })
          );
        }

        return tr;
      })
    ];
  }

  commands({ type }: MarkArgs) {
    return ({ href }: Attrs = { href: "" }) => toggleMark(type, { href });
  }

  keys({ type }: MarkArgs): Record<string, Dispatcher> {
    return {
      "Mod-k": (state, dispatch) => {
        if (state.selection.empty) {
          this.options.onKeyboardShortcut();
          return true;
        }

        return toggleMark(type, { href: "" })(state, dispatch);
      }
    };
  }

  get plugins() {
    return [
      new Plugin({
        props: {
          handleDOMEvents: {
            mouseover: (view, event: MouseEvent) => {
              if (
                event.target instanceof HTMLAnchorElement &&
                !event.target.className.includes("ProseMirror-widget")
              ) {
                if (this.options.onHoverLink) {
                  return this.options.onHoverLink(event);
                }
              }
              return false;
            },
            click: (view, event: MouseEvent) => {
              // allow opening links in editing mode with the meta/cmd key
              if (
                view.props.editable &&
                view.props.editable(view.state) &&
                !event.metaKey
              ) {
                return false;
              }

              if (event.target instanceof HTMLAnchorElement) {
                const href =
                  event.target.href ||
                  (event.target.parentNode instanceof HTMLAnchorElement
                    ? event.target.parentNode.href
                    : "");

                const isHashtag = href.startsWith("#");
                if (isHashtag && this.options.onClickHashtag) {
                  event.stopPropagation();
                  event.preventDefault();
                  this.options.onClickHashtag(href, event);
                  return true;
                }

                if (this.options.onClickLink) {
                  event.stopPropagation();
                  event.preventDefault();
                  this.options.onClickLink(href, event);
                  return true;
                }
              }

              return false;
            }
          }
        }
      })
    ];
  }

  toMarkdown() {
    return {
      open(_state: StateInline, mark: Node, parent: Node, index: number) {
        return isPlainURL(mark, parent, index, 1) ? "<" : "[";
      },
      close(state: any, mark: Node, parent: Node, index: number) {
        return isPlainURL(mark, parent, index, -1)
          ? ">"
          : "](" +
              state.esc(mark.attrs.href) +
              (mark.attrs.title ? " " + state.quote(mark.attrs.title) : "") +
              ")";
      }
    };
  }

  parseMarkdown() {
    return {
      mark: "link",
      getAttrs: (tok: Token) => ({
        href: tok.attrGet("href"),
        title: tok.attrGet("title") || null
      })
    };
  }
}
