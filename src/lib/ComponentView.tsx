import React, { ComponentType, RefObject } from "react";
import ReactDOM from "react-dom";
import { ThemeProvider } from "styled-components";
import { Decoration, EditorView, NodeView } from "prosemirror-view";
import { Editor, EditorContext } from "../main";
import { Node as ProseMirrorNode } from "prosemirror-model";
import Node, { default as EditorNode } from "../nodes/Node";
import { Attrs } from "./Extension";
import { Theme } from "../theme";
import NodeViewContainer from "./NodeViewContainer";
import { NodeSelection } from "prosemirror-state";

export type ForwardRef<T extends HTMLElement = any> = RefObject<T>;
export type ComponentProps = {
  editor: Editor;
  node: ProseMirrorNode;
  view: EditorView;
  theme: Theme;
  isSelected: boolean;
  isEditable: boolean;
  getPos: () => number;
  decorations: Decoration[];
  options: any;
  updateAttrs: (attrs: Attrs) => void;
  select: () => void;
  forwardRef: ForwardRef;
};

export type CreateNodeViewProps = {
  nodeViewContainer: NodeViewContainer;
  component: ComponentType<ComponentProps>;
  editor: Editor;
  extension: EditorNode;
};

export type NodeViewCreator = (
  node: ProseMirrorNode,
  view: EditorView,
  getPos: (() => number) | boolean,
  decorations: Decoration[]
) => NodeView;

export default class ComponentView implements NodeView {
  static create(props: CreateNodeViewProps): NodeViewCreator {
    return (
      node: ProseMirrorNode,
      view: EditorView,
      getPos: (() => number) | boolean,
      decorations: Decoration[]
    ) =>
      new ComponentView({
        node,
        view,
        getPos: getPos as () => number,
        decorations,
        ...props
      });
  }

  component: React.FC<ComponentProps> | typeof React.Component;
  editor: Editor;
  extension: Node;
  node: ProseMirrorNode;
  view: EditorView;
  getPos: () => number;
  decorations: Decoration[];
  isSelected = false;
  dom: HTMLElement | null;
  contentDOM?: HTMLElement | null;
  nodeViewContainer: NodeViewContainer;

  // See https://prosemirror.net/docs/ref/#view.NodeView
  constructor({
    nodeViewContainer,
    component,
    editor,
    extension,
    node,
    view,
    getPos,
    decorations
  }: {
    nodeViewContainer: NodeViewContainer;
    component: React.FC<ComponentProps> | typeof React.Component;
    editor: Editor;
    extension: Node;
    node: ProseMirrorNode;
    view: EditorView;
    getPos: () => number;
    decorations: Decoration[];
  }) {
    this.nodeViewContainer = nodeViewContainer;
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
    this.dom.className = `${this.node.type.name}-node-view`;
    if (!this.node.isLeaf) {
      this.contentDOM = node.type.spec.inline
        ? document.createElement("span")
        : document.createElement("div");
      this.contentDOM.className = `${this.node.type.name}-content`;
    }
    this.renderElement();
  }

  renderElement() {
    const forwardRef = React.createRef<any>();
    const props: ComponentProps = {
      editor: this.editor,
      node: this.node,
      view: this.view,
      theme: this.editor.theme(),
      isSelected: this.isSelected,
      isEditable: this.view.editable,
      getPos: this.getPos,
      decorations: this.decorations,
      options: this.extension.options,
      updateAttrs: this.updateAttrs.bind(this),
      select: this.handleSelect.bind(this),
      forwardRef
    };
    ReactDOM.render(
      <EditorContext.Provider value={this.editor}>
        <ThemeProvider theme={props.theme}>
          <this.component {...props} />
        </ThemeProvider>
      </EditorContext.Provider>,
      this.dom,
      () => {
        if (this.contentDOM) {
          if (forwardRef.current) {
            forwardRef.current.append(this.contentDOM);
          } else if (this.dom?.lastElementChild?.className !== "content-ref") {
            const textarea = document.createElement("textarea");
            textarea.hidden = true;
            textarea.className = "content-ref";
            textarea.append(this.contentDOM);
            this.dom?.append(textarea);
          }
        }
      }
    );
    this.nodeViewContainer.register({
      view: this,
      container: this.dom as HTMLElement
    });
  }

  update(node: ProseMirrorNode, decorations: Decoration[]) {
    if (node.type !== this.node.type) {
      return false;
    }

    this.node = node;
    this.decorations = decorations;
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

  handleSelect() {
    const $pos = this.view.state.doc.resolve(this.getPos());
    const transaction = this.view.state.tr.setSelection(
      new NodeSelection($pos)
    );
    this.view.dispatch(transaction);
  }

  selectNode() {
    if (this.view.editable) {
      this.isSelected = true;
      this.dom?.classList.add("ProseMirror-selectednode");
      this.renderElement();
    }
  }

  deselectNode() {
    if (this.view.editable) {
      this.isSelected = false;
      this.dom?.classList.remove("ProseMirror-selectednode");
      this.renderElement();
    }
  }

  stopEvent() {
    return true;
  }

  destroy() {
    if (this.dom) {
      this.nodeViewContainer.remove(this.dom);
      ReactDOM.unmountComponentAtNode(this.dom);
    }
    this.dom = null;
    this.contentDOM = null;
  }

  ignoreMutation() {
    return true;
  }
}
