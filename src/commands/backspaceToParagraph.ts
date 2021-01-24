import { Dispatcher } from "../lib/Extension";
import { NodeType } from "prosemirror-model";

export default function backspaceToParagraph(type: NodeType): Dispatcher {
  return (state, dispatch) => {
    const { $from, from, to, empty } = state.selection;

    // if the selection has anything in it then use standard delete behavior
    if (!empty) return false;

    // check we're in a matching node
    if ($from.parent.type !== type) return false;

    // check if we're at the beginning of the heading
    const $pos = state.doc.resolve(from - 1);
    if ($pos.parent === $from.parent) return false;

    // okay, replace it with a paragraph
    dispatch?.(
      state.tr
        .setBlockType(from, to, type.schema.nodes.paragraph)
        .scrollIntoView()
    );
    return true;
  };
}
