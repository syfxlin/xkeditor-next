import { Dispatcher } from "../lib/Extension";
import { Selection } from "prosemirror-state";
import { editor } from "monaco-editor/esm/vs/editor/editor.api";
import { Node, NodeSpec } from "prosemirror-model";
import { EditorView } from "prosemirror-view";

export function selectionDir(
  view: EditorView,
  pos: number,
  size: number,
  dir: -1 | 1
) {
  const targetPos = pos + (dir < 0 ? 0 : size);
  const selection = Selection.near(view.state.doc.resolve(targetPos), dir);
  view.dispatch(view.state.tr.setSelection(selection).scrollIntoView());
  view.focus();
}

export function computeChange(oldVal: string, newVal: string) {
  if (oldVal == newVal) {
    return null;
  }
  let start = 0,
    oldEnd = oldVal.length,
    newEnd = newVal.length;
  while (
    start < oldEnd &&
    oldVal.charCodeAt(start) == newVal.charCodeAt(start)
  ) {
    ++start;
  }
  while (
    oldEnd > start &&
    newEnd > start &&
    oldVal.charCodeAt(oldEnd - 1) == newVal.charCodeAt(newEnd - 1)
  ) {
    oldEnd--;
    newEnd--;
  }
  return { from: start, to: oldEnd, text: newVal.slice(start, newEnd) };
}

export function applyContent(
  {
    node,
    view,
    getPos
  }: { node: Node; view: EditorView; getPos: () => number },
  value: string | undefined
) {
  const change = computeChange(node.textContent, value || "");
  if (change) {
    const start = getPos() + 1;
    const tr = view.state.tr.replaceWith(
      start + change.from,
      start + change.to,
      change.text ? view.state.schema.text(change.text) : null
    );
    view.dispatch(tr);
  }
}

export function isMonaco(pos: Selection) {
  return pos.$head && pos.$head.parent.type.spec.monaco;
}

export function monacoRef(pos: Selection) {
  return pos.$head.parent.attrs.monacoRef;
}

export function cursorToStart(
  monaco: editor.IStandaloneCodeEditor | undefined | null
) {
  if (monaco === undefined || monaco === null) {
    return;
  }
  monaco.focus();
  monaco.setPosition({
    lineNumber: 1,
    column: 1
  });
}

export function cursorToEnd(
  monaco: editor.IStandaloneCodeEditor | undefined | null
) {
  if (monaco === undefined || monaco === null) {
    return;
  }
  monaco.focus();
  const model = monaco.getModel();
  const row = model?.getLineCount() || 1;
  const col = model?.getLineLength(row) || 0;
  monaco.setPosition({
    lineNumber: row,
    column: col + 1
  });
}

export function dirFocus(target: editor.IStandaloneCodeEditor, dir: 1 | -1) {
  if (dir === 1) {
    cursorToStart(target);
  } else {
    cursorToEnd(target);
  }
}

function handlePmKeydown(
  dir: "left" | "right" | "down" | "up" | "backspace" | "delete",
  ifIn?: (node: Node, dir: 1 | -1) => boolean,
  beforeIn?: (
    monaco: editor.IStandaloneCodeEditor,
    node: Node,
    dir: 1 | -1
  ) => void
): Dispatcher {
  return (state, dispatch, view) => {
    let eot = dir;
    if (eot === "backspace") {
      eot = "left";
    } else if (eot === "delete") {
      eot = "right";
    }
    if (state.selection.empty && view && view.endOfTextblock(eot)) {
      const side = eot === "left" || eot === "up" ? -1 : 1;
      const $head = state.selection.$head;
      const nextPos = Selection.near(
        state.doc.resolve(side > 0 ? $head.after() : $head.before()),
        side
      );
      if (isMonaco(nextPos) && (!ifIn || ifIn(nextPos.$head.parent, side))) {
        const monaco = monacoRef(nextPos);
        if (beforeIn) {
          beforeIn(monaco, nextPos.$head.parent, side);
        }
        dirFocus(monaco, side);
        return true;
      }
    }
    return false;
  };
}

export function nodeKeys(
  ifIn?: (node: Node, dir: 1 | -1) => boolean,
  beforeIn?: (
    monaco: editor.IStandaloneCodeEditor,
    node: Node,
    dir: 1 | -1
  ) => void
): { [p: string]: Dispatcher } {
  return {
    ArrowLeft: handlePmKeydown("left", ifIn, beforeIn),
    ArrowRight: handlePmKeydown("right", ifIn, beforeIn),
    ArrowUp: handlePmKeydown("up", ifIn, beforeIn),
    ArrowDown: handlePmKeydown("down", ifIn, beforeIn),

    Backspace: handlePmKeydown("backspace", ifIn, beforeIn),
    Delete: handlePmKeydown("delete", ifIn, beforeIn)
  };
}

export function mergeSpec(spec: NodeSpec): NodeSpec {
  spec.attrs = {
    ...spec.attrs,
    monacoRef: {
      default: undefined
    }
  };
  return {
    content: "text*",
    group: "block",
    marks: "",
    code: true,
    defining: true,
    isolating: true,
    monaco: true,
    ...spec
  };
}
