import assert from "assert";
import * as React from "react";
import { Portal } from "react-portal";
import { some } from "lodash";
import { EditorView } from "prosemirror-view";
import FloatingToolbar from "./FloatingToolbar";
import LinkEditor, { SearchResult } from "./LinkEditor";
import Menu from "./Menu";
import isMarkActive from "../queries/isMarkActive";
import getMarkRange from "../queries/getMarkRange";
import isNodeActive from "../queries/isNodeActive";
import getColumnIndex from "../queries/getColumnIndex";
import getRowIndex from "../queries/getRowIndex";
import createAndInsertLink from "../commands/createAndInsertLink";
import { NodeSelection } from "prosemirror-state";
import { ToolbarItem, ToolbarMode } from "../lib/Extension";
import { WithTranslation, withTranslation } from "react-i18next";

type Props = {
  tooltip: typeof React.Component | React.FC<any>;
  isTemplate: boolean;
  commands: Record<string, any>;
  onSearchLink?: (term: string) => Promise<SearchResult[]>;
  onClickLink: (href: string, event: React.MouseEvent) => void;
  onCreateLink?: (title: string) => Promise<string>;
  view: EditorView;
  items: (ToolbarMode & {
    name: string;
    items: ToolbarItem[];
  })[];
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
  handleOnCreateLink = async (title: string) => {
    const { onCreateLink, view } = this.props;

    if (!onCreateLink) {
      return;
    }

    const { dispatch, state } = view;
    const { from, to } = state.selection;
    assert(from !== to);

    const href = `creating#${title}…`;
    const markType = state.schema.marks.link;

    // Insert a placeholder link
    dispatch(
      view.state.tr
        .removeMark(from, to, markType)
        .addMark(from, to, markType.create({ href }))
    );

    createAndInsertLink(view, title, href, {
      onCreateLink
    });
  };

  handleOnSelectLink = ({
    href,
    from,
    to
  }: {
    href: string;
    from: number;
    to: number;
  }): void => {
    const { view } = this.props;
    const { state, dispatch } = view;

    const markType = state.schema.marks.link;

    dispatch(
      state.tr
        .removeMark(from, to, markType)
        .addMark(from, to, markType.create({ href }))
    );
  };

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

    const colIndex = getColumnIndex(state.selection);
    const rowIndex = getRowIndex(state.selection);
    const isTableSelection = colIndex !== undefined && rowIndex !== undefined;
    const link = isMarkActive(state.schema.marks.link)(state);
    const range = getMarkRange(selection.$from, state.schema.marks.link);
    const isImageSelection =
      selection.node && selection.node.type.name === "image";

    let items: ToolbarItem[] = [];
    let defaultItems: ToolbarItem[] = [];
    let selected = false;
    for (const mode of this.props.items) {
      if (mode.name === "default") {
        defaultItems = mode.items;
        continue;
      }
      if (mode.active(view)) {
        items = mode.items;
        selected = true;
        break;
      }
    }
    if (!selected) {
      items = defaultItems;
    }

    if (!items.length) {
      return null;
    }

    return (
      <Portal>
        <FloatingToolbar view={view} active={isActive(this.props)}>
          {link && range ? (
            <LinkEditor
              mark={range.mark}
              from={range.from}
              to={range.to}
              onCreateLink={onCreateLink ? this.handleOnCreateLink : undefined}
              onSelectLink={this.handleOnSelectLink}
              {...rest}
            />
          ) : (
            <Menu {...rest} items={items} />
          )}
        </FloatingToolbar>
      </Portal>
    );
  }
}

export default withTranslation()(SelectionToolbar);
