import React, { ComponentType, useCallback } from "react";
import { Portal } from "react-portal";
import { some } from "lodash";
import { EditorView } from "prosemirror-view";
import FloatingToolbar from "./FloatingToolbar";
import Menu from "./Menu";
import isNodeActive from "../queries/isNodeActive";
import { NodeSelection } from "prosemirror-state";
import {
  ApplyCommand,
  Attrs,
  ToolbarItem,
  ToolbarMode
} from "../lib/Extension";
import { withTranslation, WithTranslation } from "react-i18next";
import { Fragment, Mark, MarkType, Node, NodeType } from "prosemirror-model";
import capitalize from "lodash/capitalize";
import { removeParentNodeOfType, removeSelectedNode } from "prosemirror-utils";

export type ToolbarComponentProps = {
  values: any;
  view: EditorView;
  addMark: (
    type: MarkType,
    attrs?: Attrs,
    range?: { from: number; to: number }
  ) => void;
  removeMark: (
    mark: Mark | MarkType,
    range?: { from: number; to: number }
  ) => void;
  addNodeByCommand: (command: string | ApplyCommand, attrs?: Attrs) => void;
  addNode: (
    nodeType: NodeType,
    attrs?: Attrs,
    content?: Fragment | Node | Node[],
    marks?: Mark[],
    pos?: number
  ) => void;
  removeSelectionNode: (nodeType: NodeType) => void;
} & WithTranslation;

type Props = {
  commands: Record<string, ApplyCommand>;
  view: EditorView;
  items: ToolbarItem[];
  modes: ToolbarMode[];
} & WithTranslation;

function isActive(props: Props) {
  const { view } = props;
  const selection = view.state.selection as NodeSelection;

  if (!selection) return false;
  if (selection.empty) return false;
  if (selection.node && selection.node.type.name === "image") {
    return true;
  }
  if (selection.node) return false;

  const slice = selection.content();
  const fragment = slice.content;
  // @ts-ignore
  const nodes = fragment.content;

  return some(nodes, n => n.content.size);
}

const SelectionToolbar: React.FC<Props> = props => {
  const { view } = props;
  const { state } = view;
  const isCodeSelection = isNodeActive(state.schema.nodes.code_block)(state);
  // toolbar is disabled in code blocks, no bold / italic etc
  if (isCodeSelection) {
    return null;
  }
  let items: ToolbarItem[] = props.items;
  let Component: ComponentType<ToolbarComponentProps> | null = null;
  let values: any = undefined;
  for (const mode of props.modes) {
    values = mode.active(view);
    if (values !== false && values !== undefined && values !== null) {
      if (mode.items) {
        items =
          typeof mode.items === "function"
            ? mode.items(values, view)
            : mode.items;
      } else if (mode.component) {
        Component = mode.component;
      }
      break;
    }
  }

  if (items.length === 0 && Component === null) {
    return null;
  }

  const addMark = useCallback(
    (
      markType: MarkType,
      attrs?: Attrs,
      range?: { from: number; to: number }
    ) => {
      const { state, dispatch } = view;
      const { selection, tr } = state;
      if (!range) {
        range = { from: selection.from, to: selection.to };
      }
      dispatch(
        tr
          .removeMark(range.from, range.to, markType)
          .addMark(range.from, range.to, markType.create(attrs))
      );
    },
    [view]
  );
  const removeMark = useCallback(
    (mark: Mark | MarkType, range?: { from: number; to: number }) => {
      const { state, dispatch } = view;
      const { selection, tr } = state;
      if (!range) {
        range = { from: selection.from, to: selection.to };
      }
      if (mark) {
        dispatch(tr.removeMark(range.from, range.to, mark));
      }
      view.focus();
    },
    [view]
  );
  const addNodeByCommand = useCallback(
    (command: string | ApplyCommand, attrs?: Attrs) => {
      if (typeof command === "string") {
        command = props.commands[command];
        if (!command) {
          command = props.commands[`create${capitalize(command)}`];
        }
      }
      command(attrs || {});
    },
    []
  );
  const addNode = useCallback(
    (
      nodeType: NodeType,
      attrs?: Attrs,
      content?: Fragment | Node | Node[],
      marks?: Mark[],
      pos?: number
    ) => {
      const { state, dispatch } = view;
      const { selection, tr } = state;
      dispatch(
        tr.insert(
          pos === undefined ? selection.from : pos,
          nodeType.create(attrs, content, marks)
        )
      );
    },
    [view]
  );
  const removeSelectionNode = useCallback(
    (nodeType: NodeType) => {
      const { state, dispatch } = view;
      const { tr } = state;
      dispatch(removeSelectedNode(removeParentNodeOfType(nodeType)(tr)));
    },
    [view]
  );

  return (
    <Portal>
      <FloatingToolbar view={view} active={isActive(props)}>
        {Component ? (
          <Component
            {...props}
            values={values}
            addMark={addMark}
            removeMark={removeMark}
            addNodeByCommand={addNodeByCommand}
            addNode={addNode}
            removeSelectionNode={removeSelectionNode}
          />
        ) : (
          <Menu {...props} items={items} />
        )}
      </FloatingToolbar>
    </Portal>
  );
};

export default withTranslation()(SelectionToolbar);
