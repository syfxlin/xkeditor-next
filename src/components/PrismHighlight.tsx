import React, { useMemo } from "react";
import refractor from "refractor";
import { RefractorNode } from "refractor/core";
import "../styles/prism-light.less";
import "../styles/prism-dark.less";
import "../styles/prism-line-numbers.less";
import { useTheme } from "@emotion/react";

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

const PrismHighlight: React.FC<Props> = ({ code, language }) => {
  const theme = useTheme();
  const nodes = useMemo(
    () => parseNodes(refractor.highlight(code, language || "markup")),
    [code, language]
  );
  return (
    <div className={`prism-${theme.mode}`}>
      <pre className={`line-numbers language-${language || "markup"}`}>
        <code className={`language-${language || "markup"}`}>
          <span aria-hidden="true" className="line-numbers-rows">
            {code.split("\n").map((value, index) => (
              <span key={index} />
            ))}
          </span>
          {nodes}
        </code>
      </pre>
    </div>
  );
};

export default PrismHighlight;
