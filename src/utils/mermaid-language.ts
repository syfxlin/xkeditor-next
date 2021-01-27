import { Monaco } from "@monaco-editor/react";

const addMermaidSupport = (monaco: Monaco) => {
  const graphType = [
    "graph",
    "flowchart",
    "subgraph",
    "sequenceDiagram",
    "classDiagram",
    "stateDiagram",
    "erDiagram",
    "journey",
    "pie",
    "gantt"
  ];
  const keywords = [
    "end",
    "as",
    "click",
    "call",
    "href",
    "class",
    "classDef",
    "note",
    "of",
    "loop",
    "alt",
    "else",
    "opt",
    "par",
    "and",
    "rect",
    "state",
    "title",
    "section"
  ];
  const functions = [
    "click",
    "call",
    "href",
    "default",
    "participant",
    "activate",
    "deactivate",
    "right",
    "left",
    "over",
    "dateFormat",
    "axisFormat",
    "excludes"
  ];
  monaco.languages.register({ id: "mermaid" });
  monaco.languages.setMonarchTokensProvider("mermaid", {
    // @ts-ignore
    graphType,
    keywords,
    functions,
    tokenizer: {
      root: [
        [/[{}]/, "delimiter.bracket"],
        // 箭头
        [/[.ox<*}]{0,2}[-=.|]+[.ox>{]{0,2}[+-]?/, "punctuation"],
        // 关键字
        [
          /[a-z_$][\w$]+/,
          {
            cases: {
              "@graphType": "keyword",
              "@keywords": "keyword",
              "@functions": "keyword.other.template"
            }
          }
        ],
        // 操作符
        [/"[01*n](..[1*n])?"/, "entity.name.tag"],
        [/\[\*]/, "entity.name.tag"],
        // 方向
        [/TB|TD|BT|RL|LR/, "keyword"],
        // 字符串
        [/[\[{(}>|]+.+?[|)\]}]+/, "string"],
        [/~.+?~/, "entity.name.class"],
        [/<<.+?>>/, "entity.name.class"],
        [/".*"/, "string"],
        // 操作符
        [/[&;:+#~*$-]/, "punctuation"],
        // 空白和注释
        [/[ \t\r\n]+/, "white"],
        [/%%.*$/, "comment"]
      ]
    }
  });
  monaco.languages.registerCompletionItemProvider("mermaid", {
    provideCompletionItems(): any {
      const suggestions = [
        ...graphType.map(type => ({
          label: type,
          kind: monaco.languages.CompletionItemKind.Class,
          insertText: type
        })),
        ...keywords.map(keyword => ({
          label: keyword,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: keyword
        })),
        ...functions.map(fun => ({
          label: fun,
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: fun
        }))
      ];

      return { suggestions };
    }
  });
};

export default addMermaidSupport;
