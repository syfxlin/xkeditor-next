import { setBlockType } from "prosemirror-commands";
import isNodeActive from "../queries/isNodeActive";
import { Dispatcher } from "../lib/Extension";
import { NodeType } from "prosemirror-model";

export default function toggleBlockType(
  type: NodeType,
  toggleType: NodeType,
  attrs = {}
): Dispatcher {
  return (state, dispatch) => {
    const isActive = isNodeActive(type, attrs)(state);

    if (isActive) {
      return setBlockType(toggleType)(state, dispatch);
    }

    return setBlockType(type, attrs)(state, dispatch);
  };
}
