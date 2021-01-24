import { Decoration, DecorationSet } from "prosemirror-view";
import { Plugin } from "prosemirror-state";
import { getCellsInRow, isColumnSelected } from "prosemirror-utils";
import Node from "./Node";
import { Node as ProsemirrorNode, NodeSpec } from "prosemirror-model";
import { MarkdownSerializerState } from "../lib/markdown/serializer";
import Token from "markdown-it/lib/token";

export default class TableHeadCell extends Node {
  get name() {
    return "th";
  }

  get schema(): NodeSpec {
    return {
      content: "paragraph+",
      tableRole: "header_cell",
      isolating: true,
      parseDOM: [{ tag: "th" }],
      toDOM(node) {
        return [
          "th",
          node.attrs.alignment
            ? { style: `text-align: ${node.attrs.alignment}` }
            : { style: "" },
          0
        ];
      },
      attrs: {
        colspan: { default: 1 },
        rowspan: { default: 1 },
        alignment: { default: null }
      }
    };
  }

  toMarkdown(state: MarkdownSerializerState, node: ProsemirrorNode) {
    state.renderContent(node);
  }

  parseMarkdown() {
    return {
      block: "th",
      getAttrs: (tok: Token) => ({ alignment: tok.info })
    };
  }

  get plugins() {
    return [
      new Plugin({
        props: {
          decorations: state => {
            const { doc, selection } = state;
            const decorations: Decoration[] = [];
            const cells = getCellsInRow(0)(selection);

            if (cells) {
              cells.forEach(({ pos }, index) => {
                decorations.push(
                  Decoration.widget(pos + 1, () => {
                    const colSelected = isColumnSelected(index)(selection);
                    let className = "grip-column";
                    if (colSelected) {
                      className += " selected";
                    }
                    if (index === 0) {
                      className += " first";
                    } else if (index === cells.length - 1) {
                      className += " last";
                    }
                    const grip = document.createElement("a");
                    grip.className = className;
                    grip.addEventListener("mousedown", event => {
                      event.preventDefault();
                      this.options.onSelectColumn(index, state);
                    });
                    return grip;
                  })
                );
              });
            }

            return DecorationSet.create(doc, decorations);
          }
        }
      })
    ];
  }
}
