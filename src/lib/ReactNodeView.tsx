import React, { ComponentType, RefCallback, useContext } from "react";
import { Decoration, EditorView, NodeView } from "prosemirror-view";
import { Editor, NodeViewCreator } from "../main";
import { Node as ProseMirrorNode } from "prosemirror-model";
import { default as EditorNode } from "../nodes/Node";
import { Attrs } from "./Extension";
import { Theme } from "../theme";
import { PortalContainer } from "./portals";
import isNodeOfType from "../queries/isNodeOfType";

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
  forwardRef: RefCallback<HTMLElement>;
};

export const ReactNodeViewContext = React.createContext<ComponentProps>(
  {} as ComponentProps
);

export const useReactNodeView = () => useContext(ReactNodeViewContext);

export type CreateNodeViewProps = {
  /**
   * A container and event dispatcher which keeps track of all dom elements that
   * hold node views
   */
  portalContainer: PortalContainer;

  /**
   * The react component that will be added to the DOM.
   */
  component: ComponentType<ComponentProps>;

  editor: Editor;
  extension: EditorNode;
};

export default class ReactNodeView implements NodeView {
  static create(props: CreateNodeViewProps): NodeViewCreator {
    return (node, view, getPos, decorations) =>
      new ReactNodeView({
        node,
        view,
        getPos: getPos as () => number,
        decorations,
        ...props
      });
  }

  /**
   * The `ProsemirrorNode` that this nodeView is responsible for rendering.
   */
  node: ProseMirrorNode;
  /**
   * The decorations in the most recent update.
   */
  decorations: Decoration[] = [];
  /**
   * The editor this nodeView belongs to.
   */
  view: EditorView;
  /**
   * A container and event dispatcher which keeps track of all dom elements that
   * hold node views
   */
  readonly portalContainer: PortalContainer;
  /**
   * The extension responsible for creating this NodeView.
   */
  readonly component: ComponentType<ComponentProps>;
  /**
   * Method for retrieving the position of the current nodeView
   */
  readonly getPos: () => number;
  selected = false;
  contentDOM?: Node | undefined;
  dom: HTMLElement;
  editor: Editor;
  extension: EditorNode;
  contentDOMWrapper?: HTMLElement | undefined;

  /**
   * Create the node view for a react component and render it into the dom.
   */
  private constructor({
    editor,
    extension,
    node,
    view,
    getPos,
    decorations,
    portalContainer,
    component
  }: {
    editor: Editor;
    extension: EditorNode;
    node: ProseMirrorNode;
    view: EditorView;
    getPos: () => number;
    decorations: Decoration[];
    portalContainer: PortalContainer;
    component: ComponentType<ComponentProps>;
  }) {
    this.editor = editor;
    this.extension = extension;
    this.decorations = decorations;
    this.node = node;
    this.view = view;
    this.portalContainer = portalContainer;
    this.component = component;
    this.getPos = getPos;
    this.dom = this.createDom();

    const contentDOM = this.createContentDom();

    this.contentDOM = contentDOM ?? undefined;

    if (this.contentDOM) {
      const wrapper = document.createElement("div");
      wrapper.classList.add(`${this.node.type.name}-node-view-content-wrapper`);
      wrapper.style.display = "none";
      wrapper.appendChild(this.contentDOM);
      this.dom.appendChild(wrapper);
    }

    this.component.displayName = `${this.node.type.name}NodeView`;

    this.renderComponent();
  }

  /**
   * Render the react component into the dom.
   */
  private renderComponent() {
    this.portalContainer.render({
      Component: this.Component,
      container: this.dom
    });
  }

  /**
   * Create the dom element which will hold the react component.
   */
  private createDom(): HTMLElement {
    const element: HTMLElement = this.node.type.spec.inline
      ? document.createElement("span")
      : document.createElement("div");

    // Prosemirror breaks down when it encounters multiple nested empty
    // elements. This class prevents this from happening.
    element.classList.add(`${this.node.type.name}-node-view-wrapper`);

    return element;
  }

  /**
   * The element that will contain the content for this element.
   */
  private createContentDom(): Node | null | undefined {
    if (this.node.isLeaf) {
      return;
    }

    return this.node.type.spec.inline
      ? document.createElement("span")
      : document.createElement("div");
  }

  /**
   * Adds a ref to the component that has been provided and can be used to set
   * it as the content container. However it is advisable to either not use
   * ReactNodeViews for nodes with content or to take control of rendering the
   * content within the component..
   */
  readonly forwardRef: RefCallback<HTMLElement> = node => {
    if (node && this.contentDOM && !node.contains(this.contentDOM)) {
      node.appendChild(this.contentDOM);
    }
  };

  /**
   * Render the provided component.
   *
   * This method is passed into the HTML element.
   */
  private readonly Component: ComponentType = () => {
    const ReactComponent = this.component;
    return (
      <ReactComponent
        editor={this.editor}
        node={this.node}
        view={this.view}
        theme={this.editor.theme()}
        isSelected={this.selected}
        isEditable={this.view.editable}
        getPos={this.getPos}
        decorations={this.decorations}
        options={this.extension.options}
        updateAttrs={this.updateAttributes}
        forwardRef={this.forwardRef}
      />
    );
  };

  /**
   * Passed to the Component to enable updating the attributes from within the component.
   */
  private readonly updateAttributes = (attrs: Attrs) => {
    if (!this.view.editable) {
      return;
    }

    const tr = this.view.state.tr.setNodeMarkup(this.getPos(), undefined, {
      ...this.node.attrs,
      ...attrs
    });

    this.view.dispatch(tr);
  };

  /**
   * This is called whenever the node is called.
   */
  update(node: ProseMirrorNode, decorations: Decoration[]): boolean {
    if (!isNodeOfType({ types: this.node.type, node })) {
      return false;
    }

    if (this.node === node && this.decorations === decorations) {
      return true;
    }

    this.node = node;
    this.decorations = decorations;

    this.renderComponent();

    return true;
  }

  /**
   * Marks the node as being selected.
   */
  selectNode(): void {
    this.selected = true;

    if (this.dom) {
      this.dom.classList.add("ProseMirror-selectednode");
    }

    this.renderComponent();
  }

  /**
   * Remove the selected node markings from this component.
   */
  deselectNode(): void {
    this.selected = false;

    if (this.dom) {
      this.dom.classList.remove("ProseMirror-selectednode");
    }

    this.renderComponent();
  }

  /**
   * This is called whenever the node is being destroyed.
   */
  destroy(): void {
    this.portalContainer.remove(this.dom);
  }

  /**
   * The handler which decides when mutations should be ignored.
   */
  ignoreMutation(
    mutation:
      | MutationRecord
      | {
          type: "selection";
          target: Element;
        }
  ): boolean {
    return mutation.type !== "selection";
  }
}
