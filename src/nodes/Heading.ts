import { Plugin } from "prosemirror-state";
import copy from "copy-to-clipboard";
import { Decoration, DecorationSet } from "prosemirror-view";
import { Node as ProseMirrorNode, NodeSpec } from "prosemirror-model";
import { textblockTypeInputRule } from "prosemirror-inputrules";
import { setBlockType } from "prosemirror-commands";
import { MarkdownSerializerState } from "../lib/markdown/serializer";
import backspaceToParagraph from "../commands/backspaceToParagraph";
import toggleBlockType from "../commands/toggleBlockType";
import headingToSlug from "../lib/headingToSlug";
import Node, { NodeArgs } from "./Node";
import { Command, Dispatcher, MenuItems } from "../lib/Extension";
import { toast } from "react-hot-toast";
import { t } from "../i18n";
import { Heading1Icon } from "outline-icons";
import { ctrl, shift } from "../menus/block";

export default class Heading extends Node {
  className = "heading-name";

  get name() {
    return "heading";
  }

  get defaultOptions() {
    return {
      levels: [1, 2, 3, 4]
    };
  }

  get schema(): NodeSpec {
    return {
      attrs: {
        level: {
          default: 1
        }
      },
      content: "inline*",
      group: "block",
      defining: true,
      draggable: false,
      parseDOM: this.options.levels.map((level: number) => ({
        tag: `h${level}`,
        attrs: { level },
        contentElement: "span"
      })),
      toDOM: node => {
        const button = document.createElement("button");
        button.innerText = "#";
        button.type = "button";
        button.className = "heading-anchor";
        button.addEventListener("click", this.handleCopyLink());

        return [
          `h${node.attrs.level + (this.options.offset || 0)}`,
          button,
          ["span", { class: "heading-content" }, 0]
        ];
      }
    };
  }

  toMarkdown(state: MarkdownSerializerState, node: ProseMirrorNode) {
    state.write(state.repeat("#", node.attrs.level) + " ");
    state.renderInline(node);
    state.closeBlock(node);
  }

  parseMarkdown() {
    return {
      block: "heading",
      getAttrs: (token: Record<string, any>) => ({
        level: +token.tag.slice(1)
      })
    };
  }

  commands({ type, schema }: NodeArgs): Command {
    return attrs => {
      return toggleBlockType(type, schema.nodes.paragraph, attrs);
    };
  }

  handleCopyLink = () => {
    return (event: MouseEvent) => {
      // this is unfortunate but appears to be the best way to grab the anchor
      // as it's added directly to the dom by a decoration.
      // @ts-ignore
      const anchor = event.currentTarget.parentNode.previousSibling;
      if (!anchor.className.includes(this.className)) {
        throw new Error("Did not find anchor as previous sibling of heading");
      }
      const hash = `#${anchor.id}`;

      // the existing url might contain a hash already, lets make sure to remove
      // that rather than appending another one.
      const urlWithoutHash = window.location.href.split("#")[0];
      copy(urlWithoutHash + hash);

      toast.success(t("链接已复制到剪贴板") as string);
    };
  };

  keys({ type }: NodeArgs): Record<string, Dispatcher> {
    const options = this.options.levels.reduce(
      (items: Record<string, Dispatcher>, level: number) => ({
        ...items,
        ...{
          [`Ctrl-Shift-${level}`]: setBlockType(type, { level })
        }
      }),
      {}
    );

    return {
      ...options,
      Backspace: backspaceToParagraph(type)
    };
  }

  get plugins() {
    const getAnchors = (doc: ProseMirrorNode) => {
      const decorations: Decoration[] = [];
      const previouslySeen: { [key: string]: any } = {};

      doc.descendants((node, pos) => {
        if (node.type.name !== this.name) return;

        // calculate the optimal id
        const slug = headingToSlug(node);
        let id = slug;

        // check if we've already used it, and if so how many times?
        // Make the new id based on that number ensuring that we have
        // unique ID's even when headings are identical
        if (previouslySeen[slug] > 0) {
          id = headingToSlug(node, previouslySeen[slug]);
        }

        // record that we've seen this slug for the next loop
        previouslySeen[slug] =
          previouslySeen[slug] !== undefined ? previouslySeen[slug] + 1 : 1;

        decorations.push(
          Decoration.widget(
            pos,
            () => {
              const anchor = document.createElement("a");
              anchor.id = id;
              anchor.className = this.className;
              return anchor;
            },
            {
              side: -1,
              key: id
            }
          )
        );
      });

      return DecorationSet.create(doc, decorations);
    };

    const plugin: Plugin = new Plugin({
      state: {
        init: (config, state) => {
          return getAnchors(state.doc);
        },
        apply: (tr, oldState) => {
          return tr.docChanged ? getAnchors(tr.doc) : oldState;
        }
      },
      props: {
        decorations: state => plugin.getState(state)
      }
    });

    return [plugin];
  }

  inputRules({ type }: NodeArgs) {
    return this.options.levels.map((level: number) =>
      textblockTypeInputRule(new RegExp(`^(#{1,${level}})\\s$`), type, () => ({
        level
      }))
    );
  }

  menuItems(): MenuItems {
    const items: MenuItems = {};
    this.options.levels.forEach((level: number) => {
      items[`h${level}`] = {
        name: this.name,
        title: t(`标题 ${level}`),
        icon: Heading1Icon,
        keywords: `heading${level} title${level}`,
        shortcut: `${ctrl} ${shift} ${level}`,
        attrs: { level }
      };
    });
    return items;
  }
}
