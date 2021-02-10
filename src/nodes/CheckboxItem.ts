import {
  liftListItem,
  sinkListItem,
  splitListItem
} from "prosemirror-schema-list";
import Node, { NodeArgs } from "./Node";
import { Node as ProseMirrorNode, NodeSpec } from "prosemirror-model";
import { MarkdownSerializerState } from "../lib/markdown/serializer";
import Token from "markdown-it/lib/token";
import { EmptyAttrs } from "../lib/Extension";

type CheckboxItemAttrs = {
  checked: boolean;
};

export default class CheckboxItem extends Node<EmptyAttrs, CheckboxItemAttrs> {
  get name() {
    return "checkbox_item";
  }

  get schema(): NodeSpec {
    return {
      attrs: {
        checked: {
          default: false
        }
      },
      content: "paragraph block*",
      defining: true,
      draggable: false,
      parseDOM: [
        {
          tag: `li[data-type="${this.name}"]`,
          getAttrs: node => ({
            checked: (node as HTMLElement).className.includes("checked")
          })
        }
      ],
      // @ts-ignore
      toDOM: node => {
        const input = document.createElement("input");
        input.type = "checkbox";
        input.addEventListener("change", this.handleChange);

        if (node.attrs.checked) {
          input.checked = true;
        }

        return [
          "li",
          {
            "data-type": this.name,
            class: node.attrs.checked ? "checked" : undefined
          },
          [
            "span",
            {
              contentEditable: "false"
            },
            input
          ],
          ["div", 0]
        ];
      }
    };
  }

  handleChange = (event: any) => {
    const { view } = this.editor;
    if (!view) {
      return;
    }
    const { tr } = view.state;
    const { top, left } = event.target.getBoundingClientRect();
    const result = view.posAtCoords({ top, left });

    if (result) {
      const transaction = tr.setNodeMarkup(result.inside, undefined, {
        checked: event.target.checked
      });
      view.dispatch(transaction);
    }
  };

  keys({ type }: NodeArgs) {
    return {
      Enter: splitListItem(type),
      Tab: sinkListItem(type),
      "Shift-Tab": liftListItem(type),
      "Mod-]": sinkListItem(type),
      "Mod-[": liftListItem(type)
    };
  }

  toMarkdown(state: MarkdownSerializerState, node: ProseMirrorNode) {
    state.write(node.attrs.checked ? "[x] " : "[ ] ");
    state.renderContent(node);
  }

  parseMarkdown() {
    return {
      block: this.name,
      getAttrs: (tok: Token) => ({
        checked: tok.attrGet("checked") ? true : undefined
      })
    };
  }
}
