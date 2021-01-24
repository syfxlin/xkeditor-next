import { findParentNode, findSelectedNodeOfType } from "prosemirror-utils";
import { NodeType } from "prosemirror-model";
import { Attrs } from "../lib/Extension";
import { EditorState } from "prosemirror-state";

const isNodeActive = (type: NodeType, attrs: Attrs = {}) => (
  state: EditorState
) => {
  const node =
    findSelectedNodeOfType(type)(state.selection) ||
    findParentNode(node => node.type === type)(state.selection);

  if (!Object.keys(attrs).length || !node) {
    return !!node;
  }

  return node.node.hasMarkup(type, { ...node.node.attrs, ...attrs });
};

export default isNodeActive;
