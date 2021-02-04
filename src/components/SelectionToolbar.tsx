import * as React from "react";
import { MouseEvent } from "react";
import { Portal } from "react-portal";
import { some } from "lodash";
import { EditorView } from "prosemirror-view";
import FloatingToolbar from "./FloatingToolbar";
import { SearchResult } from "./LinkEditor";
import Menu from "./Menu";
import getMarkRange from "../queries/getMarkRange";
import isNodeActive from "../queries/isNodeActive";
import { NodeSelection } from "prosemirror-state";
import { ToolbarItem, ToolbarMode } from "../lib/Extension";
import { WithTranslation, withTranslation } from "react-i18next";
import { Mark } from "prosemirror-model";

export type ToolbarComponentProps = {
  values: any;
  range:
    | {
        mark: Mark;
        from: number;
        to: number;
      }
    | false;
  view: EditorView;

  // TODO: update
  onClickLink: (href: string, event: MouseEvent) => void;
} & WithTranslation;

type Props = {
  tooltip: typeof React.Component | React.FC<any>;
  isTemplate: boolean;
  commands: Record<string, any>;
  onSearchLink?: (term: string) => Promise<SearchResult[]>;
  onClickLink: (href: string, event: React.MouseEvent) => void;
  onCreateLink?: (title: string) => Promise<string>;
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

class SelectionToolbar extends React.Component<Props> {
  render() {
    const { onCreateLink, isTemplate, ...rest } = this.props;
    const { view } = rest;
    const { state } = view;
    const { selection }: { selection: any } = state;
    const isCodeSelection = isNodeActive(state.schema.nodes.code_block)(state);

    // toolbar is disabled in code blocks, no bold / italic etc
    if (isCodeSelection) {
      return null;
    }

    const range = getMarkRange(selection.$from, state.schema.marks.link);

    let items: ToolbarItem[] = this.props.items;
    let Component:
      | React.FC<ToolbarComponentProps>
      | typeof React.Component
      | null = null;
    let values: any = undefined;
    for (const mode of this.props.modes) {
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

    return (
      <Portal>
        <FloatingToolbar view={view} active={isActive(this.props)}>
          {Component ? (
            <Component {...rest} range={range} values={values} />
          ) : (
            <Menu {...rest} items={items} />
          )}
        </FloatingToolbar>
      </Portal>
    );
  }
}

export default withTranslation()(SelectionToolbar);
