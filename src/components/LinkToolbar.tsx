import assert from "assert";
import React, { Component, createRef, FC } from "react";
import { EditorView } from "prosemirror-view";
import LinkEditor, { SearchResult } from "./LinkEditor";
import FloatingToolbar from "./FloatingToolbar";
import createAndInsertLink from "../commands/createAndInsertLink";

type Props = {
  isActive: boolean;
  view: EditorView;
  tooltip: typeof Component | FC<any>;
  onCreateLink?: (title: string) => Promise<string>;
  onSearchLink?: (term: string) => Promise<SearchResult[]>;
  onClickLink: (href: string, event: React.MouseEvent) => void;
  onClose: () => void;
};

function isActive(props: Props) {
  const { view } = props;
  const { selection } = view.state;

  const paragraph = view.domAtPos(selection.$from.pos);
  return props.isActive && !!paragraph.node;
}

export default class LinkToolbar extends Component<Props> {
  menuRef = createRef<HTMLDivElement>();

  state = {
    left: -1000,
    top: undefined
  };

  componentDidMount() {
    window.addEventListener("mousedown", this.handleClickOutside);
  }

  componentWillUnmount() {
    window.removeEventListener("mousedown", this.handleClickOutside);
  }

  handleClickOutside = (ev: MouseEvent) => {
    if (
      ev.target &&
      this.menuRef.current &&
      this.menuRef.current.contains(ev.target as Element)
    ) {
      return;
    }

    this.props.onClose();
  };

  handleOnCreateLink = async (title: string) => {
    const { onCreateLink, view, onClose } = this.props;

    onClose();
    this.props.view.focus();

    if (!onCreateLink) {
      return;
    }

    const { dispatch, state } = view;
    const { from, to } = state.selection;
    assert(from === to);

    const href = `creating#${title}…`;

    // Insert a placeholder link
    dispatch(
      view.state.tr
        .insertText(title, from, to)
        .addMark(
          from,
          to + title.length,
          state.schema.marks.link.create({ href })
        )
    );

    await createAndInsertLink(view, title, href, {
      onCreateLink
    });
  };

  handleOnSelectLink = ({
    href,
    title
  }: {
    href: string;
    title?: string;
    from: number;
    to: number;
  }) => {
    const { view, onClose } = this.props;

    onClose();
    this.props.view.focus();

    const { dispatch, state } = view;
    const { from, to } = state.selection;
    assert(from === to);

    dispatch(
      view.state.tr
        .insertText(title as string, from, to)
        .addMark(
          from,
          to + (title as string).length,
          state.schema.marks.link.create({ href })
        )
    );
  };

  render() {
    const { onCreateLink, onClose, ...rest } = this.props;
    const selection = this.props.view.state.selection;

    return (
      <FloatingToolbar
        ref={this.menuRef}
        active={isActive(this.props)}
        {...rest}
      >
        {isActive(this.props) && (
          <LinkEditor
            from={selection.from}
            to={selection.to}
            onCreateLink={onCreateLink ? this.handleOnCreateLink : undefined}
            onSelectLink={this.handleOnSelectLink}
            onRemoveLink={onClose}
            {...rest}
          />
        )}
      </FloatingToolbar>
    );
  }
}
