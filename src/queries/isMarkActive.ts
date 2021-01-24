import { EditorState } from "prosemirror-state";
import { MarkType } from "prosemirror-model";

const isMarkActive = (type: MarkType) => (state: EditorState): boolean => {
  const { from, $from, to, empty } = state.selection;

  return empty
    ? !!type.isInSet(state.storedMarks || $from.marks())
    : state.doc.rangeHasMark(from, to, type);
};

export default isMarkActive;
