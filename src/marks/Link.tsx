import React from "react";
import { toggleMark } from "prosemirror-commands";
import { Plugin } from "prosemirror-state";
import Mark, { MarkArgs, MarkSerializerConfig } from "./Mark";
import { Fragment, Mark as ProseMirrorMark, MarkSpec } from "prosemirror-model";
import { Attrs, Dispatcher, ToolbarItems } from "../lib/Extension";
import Token from "markdown-it/lib/token";
import isMarkActive from "../queries/isMarkActive";
import markInputRule from "../lib/markInputRule";
import LinkInputComponent from "../components/LinkInputComponent";
import { t } from "../i18n";
import { ctrl } from "../menus/block";
import { LinkTwo } from "@icon-park/react";

function isPlainURL(
  link: ProseMirrorMark,
  parent: Fragment,
  index: number,
  side: -1 | 1
) {
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

type LinkAttrs = {
  href: string;
  title?: string;
};

// TODO: update
export default class Link extends Mark<any, LinkAttrs> {
  get name() {
    return "link";
  }

  get schema(): MarkSpec {
    return {
      attrs: {
        href: {
          default: ""
        },
        title: {
          default: null
        }
      },
      inclusive: false,
      parseDOM: [
        {
          tag: "a[href]",
          getAttrs: node => ({
            href: (node as HTMLAnchorElement).getAttribute("href"),
            title: (node as HTMLAnchorElement).getAttribute("title")
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
      markInputRule(/\[([^\]]+)]\(([^)]+)\)$/, type, 1, match => {
        const split = match[2].split(' "');
        return {
          href: split[0],
          title:
            split.length > 1 ? split[1].substring(0, split[1].length - 1) : null
        };
      })
    ];
  }

  commands({ type }: MarkArgs) {
    return ({ href, title }: Attrs = { href: "" }) =>
      toggleMark(type, { href, title });
  }

  keys({ type }: MarkArgs): Record<string, Dispatcher> {
    return {
      "Mod-k": (state, dispatch) => {
        if (state.selection.empty) {
          // TODO: update
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

  toMarkdown(): MarkSerializerConfig {
    return {
      open: (state, mark, parent, index) => {
        return isPlainURL(mark, parent, index, 1) ? "<" : "[";
      },
      close: (state, mark, parent, index) => {
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
      mark: this.name,
      getAttrs: (tok: Token) => ({
        href: tok.attrGet("href"),
        title: tok.attrGet("title") || null
      })
    };
  }

  toolbarItems({ type }: MarkArgs): ToolbarItems {
    return {
      default: {
        2: [
          {
            name: this.name,
            title: t("链接"),
            shortcut: `${ctrl} K`,
            icon: LinkTwo,
            active: isMarkActive(type),
            attrs: { href: "" },
            priority: 1
          }
        ]
      },
      modes: [
        {
          name: "link_editor",
          priority: 3,
          active: view => isMarkActive(type)(view.state),
          component: LinkInputComponent
        }
      ]
    };
  }
}
