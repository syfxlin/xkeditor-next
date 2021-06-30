import { Decoration, DecorationSet } from "prosemirror-view";
import { Plugin } from "prosemirror-state";
import {
  getCellsInColumn,
  isRowSelected,
  isTableSelected
} from "prosemirror-utils";
import Node from "./Node";
import { NodeSpec } from "prosemirror-model";
import Token from "markdown-it/lib/token";
import { EmptyAttrs } from "../lib/Extension";

// TODO: update
export default class TableCell extends Node<any, EmptyAttrs> {
  get name() {
    return "td";
  }

  get schema(): NodeSpec {
    return {
      content: "paragraph+",
      tableRole: "cell",
      isolating: true,
      parseDOM: [{ tag: "td" }],
      toDOM(node) {
        return [
          "td",
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

  parseMarkdown() {
    return {
      block: this.name,
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
            const cells = getCellsInColumn(0)(selection);

            if (cells) {
              cells.forEach(({ pos }, index) => {
                if (index === 0) {
                  decorations.push(
                    Decoration.widget(pos + 1, () => {
                      let className = "grip-table";
                      const selected = isTableSelected(selection);
                      if (selected) {
                        className += " selected";
                      }
                      const grip = document.createElement("a");
                      grip.className = className;
                      grip.addEventListener("mousedown", event => {
                        event.preventDefault();
                        this.options.onSelectTable(state);
                      });
                      return grip;
                    })
                  );
                }
                decorations.push(
                  Decoration.widget(pos + 1, () => {
                    const rowSelected = isRowSelected(index)(selection);

                    let className = "grip-row";
                    if (rowSelected) {
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
                      this.options.onSelectRow(index, state);
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
