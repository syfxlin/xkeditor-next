import mermaid from "mermaid";
import { loader } from "@monaco-editor/react";
import addMermaidSupport from "./utils/mermaid-language";
// 加载国际化
import "./i18n";
import addOceanicNextTheme from "./utils/monaco-oceanic-next";

// Mermaid 设置
mermaid.initialize({
  startOnLoad: false
});

// 添加 Mermaid 语法支持
loader.init().then(monaco => {
  addOceanicNextTheme(monaco);
  addMermaidSupport(monaco);
});
