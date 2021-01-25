import * as React from "react";
import { Ref } from "react";
import ReactDOM from "react-dom";
import { ThemeProvider } from "styled-components";
import { Decoration, EditorView, NodeView } from "prosemirror-view";
import { dark as darkTheme, light as lightTheme } from "../theme";
import Editor from "../main";
import { Node as ProseMirrorNode } from "prosemirror-model";
import Node from "../nodes/Node";
import { Attrs } from "./Extension";

export type HTMLElementRef<T extends HTMLElement = any> = Ref<T>;
export type ComponentProps = {
  editor: Editor;
  node: ProseMirrorNode;
  view: EditorView;
  theme: typeof lightTheme;
  isSelected: boolean;
  isEditable: boolean;
  getPos: () => number;
  decorations: Decoration[];
  options: any;
  updateAttrs: (attrs: Attrs) => void;
  contentRef: HTMLElementRef;
};

export default class ComponentView implements NodeView {
  component: React.FC<ComponentProps>;
  editor: Editor;
  extension: Node;
  node: ProseMirrorNode;
  view: EditorView;
  getPos: () => number;
  decorations: Decoration[];
  isSelected = false;
  dom: HTMLElement | null;
  contentDOM: HTMLElement | null;

  // See https://prosemirror.net/docs/ref/#view.NodeView
  constructor(
    component: React.FC<ComponentProps>,
    {
      editor,
      extension,
      node,
      view,
      getPos,
      decorations
    }: {
      editor: Editor;
      extension: Node;
      node: ProseMirrorNode;
      view: EditorView;
      getPos: () => number;
      decorations: Decoration[];
    }
  ) {
    this.component = component;
    this.editor = editor;
    this.extension = extension;
    this.getPos = getPos;
    this.decorations = decorations;
    this.node = node;
    this.view = view;
    this.dom = node.type.spec.inline
      ? document.createElement("span")
      : document.createElement("div");
    this.contentDOM = node.type.spec.inline
      ? document.createElement("span")
      : document.createElement("div");
    this.renderElement();
  }

  renderElement() {
    const { dark } = this.editor.props;
    const theme = this.editor.props.theme || (dark ? darkTheme : lightTheme);

    const contentRef = React.createRef<any>();

    const props = {
      editor: this.editor,
      node: this.node,
      view: this.view,
      theme,
      isSelected: this.isSelected,
      isEditable: this.view.editable,
      getPos: this.getPos,
      decorations: this.decorations,
      options: this.extension.options,
      updateAttrs: this.updateAttrs.bind(this),
      contentRef
    };

    ReactDOM.render(
      <ThemeProvider theme={theme}>
        <this.component {...props} />
      </ThemeProvider>,
      this.dom,
      () => {
        if (contentRef.current && this.contentDOM) {
          contentRef.current.append(this.contentDOM);
        } else if (this.contentDOM) {
          const textarea = document.createElement("textarea");
          textarea.hidden = true;
          textarea.append(this.contentDOM);
          this.dom?.append(textarea);
        }
      }
    );
  }

  update(node: ProseMirrorNode) {
    if (node.type !== this.node.type) {
      return false;
    }

    this.node = node;
    this.renderElement();
    return true;
  }

  updateAttrs(attrs: Attrs) {
    if (!this.view.editable) {
      return;
    }
    const { state } = this.view;
    const pos = this.getPos();
    const newAttrs = {
      ...this.node.attrs,
      ...attrs
    };
    const transaction = state.tr.setNodeMarkup(pos, undefined, newAttrs);
    this.view.dispatch(transaction);
  }

  selectNode() {
    if (this.view.editable) {
      this.isSelected = true;
      this.renderElement();
    }
  }

  deselectNode() {
    if (this.view.editable) {
      this.isSelected = false;
      this.renderElement();
    }
  }

  stopEvent() {
    return true;
  }

  destroy() {
    if (this.dom) {
      ReactDOM.unmountComponentAtNode(this.dom);
    }
    this.dom = null;
    this.contentDOM = null;
  }

  ignoreMutation() {
    return true;
  }
}
