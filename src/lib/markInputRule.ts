import { InputRule } from "prosemirror-inputrules";
import { Mark, MarkType } from "prosemirror-model";
import { EditorState } from "prosemirror-state";

function getMarksBetween(start: number, end: number, state: EditorState) {
  let marks: { start: number; end: number; mark: Mark }[] = [];

  state.doc.nodesBetween(start, end, (node, pos) => {
    marks = [
      ...marks,
      ...node.marks.map(mark => ({
        start: pos,
        end: pos + node.nodeSize,
        mark
      }))
    ];
  });

  return marks;
}

export default function(
  regexp: RegExp,
  markType: MarkType,
  getContent: ((match: string[]) => string) | string | number = 1,
  getAttrs:
    | ((match: string[]) => { [attr: string]: any })
    | { [attr: string]: any } = {}
) {
  return new InputRule(regexp, (state, match, start, end) => {
    const { tr } = state;
    const markStart = start;
    let markEnd = end;

    const attrs = getAttrs instanceof Function ? getAttrs(match) : getAttrs;

    if (match && match.length > 1) {
      let content;
      if (getContent instanceof Function) {
        content = getContent(match);
      } else if (typeof getContent === "string") {
        content = getContent;
      } else {
        content = match[getContent];
      }
      const textStart = markStart + match[0].indexOf(content);
      const textEnd = textStart + content.length;

      const excludedMarks = getMarksBetween(start, end, state)
        .filter(item => item.mark.type.excludes(markType))
        .filter(item => item.end > textStart);

      if (excludedMarks.length) {
        return null;
      }

      if (textEnd < markEnd) {
        tr.delete(textEnd, markEnd);
        markEnd = textEnd;
      }
      if (textStart > markStart) {
        tr.delete(markStart, textStart);
        markEnd -= textStart - markStart;
      }
    }

    tr.addMark(markStart, markEnd, markType.create(attrs));
    tr.removeStoredMark(markType);
    return tr;
  });
}
