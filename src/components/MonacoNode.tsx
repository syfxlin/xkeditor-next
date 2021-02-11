import { applyContent, selectionDir } from "../utils/editor";
import React, { useCallback, useEffect, useRef } from "react";
import { ComponentProps } from "../lib/ComponentView";
import MonacoEditor, { OnChange } from "@monaco-editor/react";
import { editor } from "monaco-editor/esm/vs/editor/editor.api";
import { useTranslation } from "react-i18next";
import { ResizableBox } from "react-resizable";

export type MonacoNodeAttrs = {
  mode: "edit" | "preview" | "both";
};

type Props = ComponentProps & {
  editToolbar?: React.ReactNode;
  viewToolbar?: React.ReactNode;
  width?: string | number;
  height?: string | number;
  language?: string;
};

const MonacoNode: React.FC<Props> = props => {
  const {
    node,
    view,
    getPos,
    updateAttrs,
    width,
    height,
    language = "javascript",
    isEditable
  } = props;
  const propsRef = useRef({
    node,
    view,
    getPos
  });
  useEffect(() => {
    propsRef.current = {
      node,
      view,
      getPos
    };
  }, [node, view, getPos, view.state]);
  const handleChange: OnChange = useCallback(
    value => {
      applyContent({ node, getPos, view }, value);
    },
    [node, getPos, view]
  );
  const handleEdit = useCallback(() => {
    updateAttrs({
      mode: "edit"
    });
  }, [updateAttrs]);
  const handlePreview = useCallback(() => {
    updateAttrs({
      mode: "preview"
    });
  }, [updateAttrs]);
  const handleBoth = useCallback(() => {
    updateAttrs({
      mode: "both"
    });
  }, [updateAttrs]);
  const handleMount = useCallback((editor: editor.IStandaloneCodeEditor) => {
    updateAttrs({
      monacoRef: editor
    });
    editor.focus();
    editor.onKeyDown(e => {
      const { node, view, getPos } = propsRef.current;
      // 删除
      if (e.code === "Delete" || e.code === "Backspace") {
        if (node.textContent === "") {
          view.dispatch(
            view.state.tr.deleteRange(getPos(), getPos() + node.nodeSize)
          );
          view.focus();
          return;
        }
      }
      // 移动光标
      const { lineNumber = 1, column = 1 } = editor.getPosition() || {};
      const model = editor.getModel();
      const maxLines = model?.getLineCount() || 1;
      let dir: -1 | 1 | null = null;
      if (e.code === "ArrowLeft") {
        if (lineNumber !== 1 || column !== 1) {
          return;
        }
        dir = -1;
      } else if (e.code === "ArrowRight") {
        if (
          lineNumber !== maxLines ||
          column - 1 !== model?.getLineLength(maxLines)
        ) {
          return;
        }
        dir = 1;
      } else if (e.code === "ArrowUp") {
        if (lineNumber !== 1) {
          return;
        }
        dir = -1;
      } else if (e.code === "ArrowDown") {
        if (lineNumber !== maxLines) {
          return;
        }
        dir = 1;
      }
      if (dir !== null) {
        selectionDir(view, getPos(), node.nodeSize, dir);
        return;
      }
    });
  }, []);

  const { t } = useTranslation();

  return (
    <ResizableBox
      width={Infinity}
      height={300}
      minConstraints={[Infinity, 100]}
      maxConstraints={[Infinity, Infinity]}
      axis="y"
      resizeHandles={["s"]}
      className={"code-block"}
      // @ts-ignore
      contentEditable={false}
      style={{ width, height }}
    >
      <section
        className={`code-editor ${
          !isEditable || node.attrs.mode === "preview" ? "hidden" : ""
        }`}
      >
        <MonacoEditor
          value={node.textContent}
          theme={"vs-dark"}
          language={language}
          onChange={handleChange}
          onMount={handleMount}
        />
        <div className={"toolbar"}>
          <button onClick={handlePreview}>{t("预览")}</button>
          <button onClick={handleBoth}>{t("预览 & 编辑")}</button>
          {props.editToolbar}
        </div>
      </section>
      <section
        className={`code-preview ${
          isEditable && node.attrs.mode === "edit" ? "hidden" : ""
        }`}
      >
        {props.children}
        <div className={"toolbar"}>
          {isEditable && (
            <>
              <button onClick={handleEdit}>{t("编辑")}</button>
              <button onClick={handleBoth}>{t("预览 & 编辑")}</button>
            </>
          )}
          {props.viewToolbar}
        </div>
      </section>
    </ResizableBox>
  );
};

export default MonacoNode;
