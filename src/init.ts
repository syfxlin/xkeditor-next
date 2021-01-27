import mermaid from "mermaid";
import { loader } from "@monaco-editor/react";
import addMermaidSupport from "./utils/mermaid-language";
// 加载国际化
import "./i18n";

// Mermaid 设置
mermaid.initialize({
  startOnLoad: false
});

// 添加 Mermaid 语法支持
loader.init().then(monaco => {
  addMermaidSupport(monaco);
});
