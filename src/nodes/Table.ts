import Node, { NodeArgs } from "./Node";
import { Decoration, DecorationSet } from "prosemirror-view";
import {
  addColumnAfter,
  addColumnBefore,
  deleteColumn,
  deleteRow,
  deleteTable,
  fixTables,
  goToNextCell,
  isInTable,
  setCellAttr,
  tableEditing,
  toggleHeaderCell,
  toggleHeaderColumn,
  toggleHeaderRow
} from "prosemirror-tables";
import {
  addRowAt,
  createTable,
  getCellsInColumn,
  moveRow
} from "prosemirror-utils";
import { Plugin, TextSelection } from "prosemirror-state";
import { Command, Dispatcher } from "../lib/Extension";
import { Node as ProseMirrorNode, NodeSpec } from "prosemirror-model";
import { PluginSimple } from "markdown-it";
import tablesPlugin from "../lib/markdown/tables";
import { MarkdownSerializerState } from "../lib/markdown/serializer";

export default class Table extends Node {
  get name() {
    return "table";
  }

  get schema(): NodeSpec {
    return {
      content: "tr+",
      tableRole: "table",
      isolating: true,
      group: "block",
      parseDOM: [{ tag: "table" }],
      toDOM() {
        return [
          "div",
          { class: "scrollable-wrapper" },
          [
            "div",
            { class: "scrollable" },
            ["table", { class: "rme-table" }, ["tbody", 0]]
          ]
        ];
      }
    };
  }

  commands({ schema }: NodeArgs): Record<string, Command> | Command {
    return {
      createTable: ({ rowsCount, colsCount }) => (state, dispatch) => {
        const offset = state.tr.selection.anchor + 1;
        const nodes = createTable(schema, rowsCount, colsCount);
        const tr = state.tr.replaceSelectionWith(nodes).scrollIntoView();
        const resolvedPos = tr.doc.resolve(offset);

        tr.setSelection(TextSelection.near(resolvedPos));
        dispatch?.(tr);
      },
      setColumnAttr: ({ index, alignment }) => (state, dispatch) => {
        const cells = getCellsInColumn(index)(state.selection) || [];
        let transaction = state.tr;
        cells.forEach(({ pos }) => {
          // @ts-ignore
          transaction = transaction.setNodeMarkup(pos, null, {
            alignment
          });
        });
        dispatch?.(transaction);
      },
      addColumnBefore: () => addColumnBefore,
      addColumnAfter: () => addColumnAfter,
      deleteColumn: () => deleteColumn,
      addRowAfter: ({ index }) => (state, dispatch) => {
        if (index === 0) {
          // A little hack to avoid cloning the heading row by cloning the row
          // beneath and then moving it to the right index.
          const tr = addRowAt(index + 2, true)(state.tr);
          dispatch?.(moveRow(index + 2, index + 1)(tr));
        } else {
          dispatch?.(addRowAt(index + 1, true)(state.tr));
        }
      },
      deleteRow: () => deleteRow,
      deleteTable: () => deleteTable,
      toggleHeaderColumn: () => toggleHeaderColumn,
      toggleHeaderRow: () => toggleHeaderRow,
      toggleHeaderCell: () => toggleHeaderCell,
      // @ts-ignore
      setCellAttr: () => setCellAttr,
      // @ts-ignore
      fixTables: () => fixTables
    };
  }

  keys(): Record<string, Dispatcher> {
    return {
      Tab: goToNextCell(1),
      "Shift-Tab": goToNextCell(-1),
      Enter: (state, dispatch) => {
        if (!isInTable(state)) return false;

        // TODO: Adding row at the end for now, can we find the current cell
        // row index and add the row below that?
        const cells = getCellsInColumn(0)(state.selection) || [];

        dispatch?.(addRowAt(cells.length, true)(state.tr));
        return true;
      }
    };
  }

  toMarkdown(state: MarkdownSerializerState, node: ProseMirrorNode) {
    state.renderTable(node);
    state.closeBlock(node);
  }

  parseMarkdown() {
    return { block: this.name };
  }

  markdownPlugin(): PluginSimple {
    return tablesPlugin;
  }

  get plugins() {
    return [
      tableEditing(),
      new Plugin({
        props: {
          decorations: state => {
            const { doc } = state;
            const decorations: Decoration[] = [];
            let index = 0;

            doc.descendants((node, pos) => {
              if (node.type.name !== this.name) return;

              const elements = document.getElementsByClassName("rme-table");
              const table = elements[index];
              if (!table) return;

              const element = table.parentElement;
              const shadowRight = !!(
                element && element.scrollWidth > element.clientWidth
              );

              if (shadowRight) {
                decorations.push(
                  Decoration.widget(pos + 1, () => {
                    const shadow = document.createElement("div");
                    shadow.className = "scrollable-shadow right";
                    return shadow;
                  })
                );
              }
              index++;
            });

            return DecorationSet.create(doc, decorations);
          }
        }
      })
    ];
  }
}
