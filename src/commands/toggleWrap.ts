import { lift, wrapIn } from "prosemirror-commands";
import isNodeActive from "../queries/isNodeActive";
import { Dispatcher } from "../lib/Extension";
import { NodeType } from "prosemirror-model";

export default function toggleWrap(
  type: NodeType,
  attrs?: Record<string, any>
): Dispatcher {
  return (state, dispatch) => {
    const isActive = isNodeActive(type)(state);

    if (isActive) {
      return lift(state, dispatch);
    }

    return wrapIn(type, attrs)(state, dispatch);
  };
}
