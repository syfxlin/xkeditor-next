import { NodeType } from "prosemirror-model";

export default function isNodeOfType(props: any): boolean {
  const { types, node } = props;

  if (!node) {
    return false;
  }

  const matches = (type: NodeType | string) => {
    return type === node.type || type === node.type.name;
  };

  if (Array.isArray(types)) {
    return types.some(matches);
  }

  return matches(types);
}
