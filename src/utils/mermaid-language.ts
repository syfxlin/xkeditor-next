import { Monaco } from "@monaco-editor/react";

const addMermaidSupport = (monaco: Monaco) => {
  monaco.languages.register({ id: "mermaid" });
  monaco.languages.setMonarchTokensProvider("mermaid", {
    // @ts-ignore
    typeKeywords: [
      "graph",
      "stateDiagram",
      "sequenceDiagram",
      "classDiagram",
      "pie",
      "flowchart",
      "gantt"
    ],
    keywords: ["patricipant", "as"],
    arrows: ["---", "===", "-->", "==>"],
    tokenizer: {
      root: [
        [/[{}]/, "delimiter.bracket"],
        [
          /[a-z_$][\w$]*/,
          { cases: { "@typeKeywords": "keyword", "@keywords": "keyword" } }
        ],
        [/[-=>ox]+/, { cases: { "@arrows": "transition" } }],
        [/[\[{(}]+.+?[)\]}]+/, "string"],
        [/".*"/, "string"]
      ]
    },
    whitespace: [
      [/[ \t\r\n]+/, "white"],
      [/%%.*$/, "comment"]
    ]
  });
  monaco.editor.defineTheme("mermaid", {
    colors: {},
    base: "vs-dark",
    inherit: false,
    rules: [
      { token: "keyword", foreground: "880000", fontStyle: "bold" },
      { token: "custom-error", foreground: "ff0000", fontStyle: "bold" },
      { token: "string", foreground: "AA8500" },
      { token: "transition", foreground: "008800", fontStyle: "bold" },
      { token: "delimiter.bracket", foreground: "000000", fontStyle: "bold" }
    ]
  });
};

export default addMermaidSupport;
