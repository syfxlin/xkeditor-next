import { InputRule } from "prosemirror-inputrules";
import { NodeType } from "prosemirror-model";
import { Attrs } from "./Extension";

export default function(
  regexp: RegExp,
  nodeType: NodeType,
  getContent:
    | ((match: string[]) => string)
    | string
    | number
    | null
    | undefined = undefined,
  getAttrs: ((match: string[]) => Attrs) | Attrs = {}
) {
  return new InputRule(regexp, (state, match, start, end) => {
    const { tr, schema } = state;

    const attrs = getAttrs instanceof Function ? getAttrs(match) : getAttrs;

    if (match && match.length > 0) {
      if (getContent === null || getContent === undefined) {
        tr.replaceWith(start - 1, end, nodeType.create(attrs));
        return tr;
      }

      let content;
      if (getContent instanceof Function) {
        content = getContent(match);
      } else if (typeof getContent === "string") {
        content = getContent;
      } else {
        content = match[getContent];
      }
      tr.replaceWith(start, end, nodeType.create(attrs, schema.text(content)));
    }

    return tr;
  });
}
