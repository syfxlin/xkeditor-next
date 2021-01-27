import React, { useMemo } from "react";
import refractor from "refractor";
import { RefractorNode } from "refractor/core";
import "../styles/prism-okaidia.less";
import "../styles/prism-line-numbers.less";

type Props = {
  language?: string;
  code: string;
};

const parseNodes = (nodes: RefractorNode[]): React.ReactNode[] => {
  return nodes.map(node => {
    if (node.type === "text") {
      return node.value;
    } else {
      return React.createElement(
        node.tagName,
        {
          className: node.properties.className?.join(" ")
        },
        parseNodes(node.children)
      );
    }
  });
};

const PrismHighlight: React.FC<Props> = props => {
  const nodes = useMemo(
    () =>
      parseNodes(refractor.highlight(props.code, props.language || "markup")),
    [props.code, props.language]
  );
  return <code>{nodes}</code>;
};

export default PrismHighlight;
