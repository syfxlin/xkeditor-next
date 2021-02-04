import React, { Component, createRef } from "react";
import capitalize from "lodash/capitalize";
import { Portal } from "react-portal";
import { EditorView } from "prosemirror-view";
import { findParentNode } from "prosemirror-utils";
import styled from "styled-components";
import BlockMenuItem from "./BlockMenuItem";
import VisuallyHidden from "./VisuallyHidden";
import getDataTransferFiles from "../lib/getDataTransferFiles";
import { WithTranslation, withTranslation } from "react-i18next";
import { ApplyCommand, Attrs, MenuItem } from "../lib/Extension";
import uploadFiles, { UploadResponse } from "../commands/uploadFiles";
import { EmbedDescriptor } from "../nodes/Embed";
import { blockMenuInput } from "./BlockMenuComponent";
import FloatingToolbar from "./FloatingToolbar";

export type BlockComponentProps = {
  item: MenuItem;
  insertBlock: (item: MenuItem) => void;

  close: () => void;
  view: EditorView;
  upload?: (files: File[]) => Promise<UploadResponse>;
  onUploadStart?: () => void;
  onUploadStop?: () => void;
} & WithTranslation;

type Props = {
  // 显示状态
  isActive: boolean;
  onClose: () => void;
  // 内容和指令
  items: MenuItem[];
  commands: Record<string, ApplyCommand>;
  embeds: EmbedDescriptor[];
  // 编辑器
  view: EditorView;
  // 搜索
  search: string;
  // 图片上传
  upload?: (files: File[]) => Promise<UploadResponse>;
  onUploadStart?: () => void;
  onUploadStop?: () => void;
} & WithTranslation;

type State = {
  insertItem?: MenuItem;
  left?: number;
  top?: number;
  bottom?: number;
  isAbove: boolean;
  selectedIndex: number;
  mode: Mode;
};

enum Mode {
  LIST,
  COMPONENT,
  UPLOAD
}

class BlockMenu extends Component<Props, State> {
  menuRef = createRef<HTMLDivElement>();
  inputRef = createRef<HTMLInputElement>();

  state: State = {
    left: -1000,
    top: 0,
    bottom: undefined,
    isAbove: false,
    selectedIndex: 0,
    insertItem: undefined,
    mode: Mode.LIST
  };

  constructor(props: Props) {
    super(props);
    this.insertBlock = this.insertBlock.bind(this);
    this.close = this.close.bind(this);
  }

  componentDidMount() {
    window.addEventListener("keydown", this.handleKeyDown);
  }

  shouldComponentUpdate(
    nextProps: Readonly<Props>,
    nextState: Readonly<State>
  ): boolean {
    return (
      nextProps.search !== this.props.search ||
      nextProps.isActive !== this.props.isActive ||
      nextState !== this.state
    );
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    if (!prevProps.isActive && this.props.isActive) {
      const position = this.calculatePosition(this.props);

      this.setState({
        insertItem: undefined,
        mode: Mode.LIST,
        selectedIndex: 0,
        ...position
      });
    } else if (prevProps.search !== this.props.search) {
      this.setState({ selectedIndex: 0 });
    }
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.handleKeyDown);
  }

  handleKeyDown = (event: KeyboardEvent) => {
    if (!this.props.isActive) return;

    if (event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();

      const item = this.filtered[this.state.selectedIndex];

      if (item) {
        this.insertItem(item);
      } else {
        this.props.onClose();
      }
    }

    if (event.key === "ArrowUp" || (event.ctrlKey && event.key === "p")) {
      event.preventDefault();
      event.stopPropagation();

      if (this.filtered.length) {
        const prevIndex = this.state.selectedIndex - 1;
        const prev = this.filtered[prevIndex];

        this.setState({
          selectedIndex: Math.max(
            0,
            prev && prev.name === "separator" ? prevIndex - 1 : prevIndex
          )
        });
      } else {
        this.close();
      }
    }

    if (
      event.key === "ArrowDown" ||
      event.key === "Tab" ||
      (event.ctrlKey && event.key === "n")
    ) {
      event.preventDefault();
      event.stopPropagation();

      if (this.filtered.length) {
        const total = this.filtered.length - 1;
        const nextIndex = this.state.selectedIndex + 1;
        const next = this.filtered[nextIndex];

        this.setState({
          selectedIndex: Math.min(
            next && next.name === "separator" ? nextIndex + 1 : nextIndex,
            total
          )
        });
      } else {
        this.close();
      }
    }

    if (event.key === "Escape") {
      this.close();
    }
  };

  insertItem = (item: MenuItem) => {
    if (item.upload) {
      return this.triggerUpload(item);
    }
    if (item.component) {
      return this.triggerComponent(item);
    }
    this.insertBlock(item);
  };

  getAttrs = (attrs?: Attrs | ((view: EditorView) => Attrs) | undefined) => {
    if (attrs === undefined) {
      return {};
    } else if (typeof attrs === "function") {
      return attrs(this.props.view);
    } else {
      return attrs;
    }
  };

  close = () => {
    this.props.onClose();
    this.props.view.focus();
  };

  triggerUpload = (item: MenuItem) => {
    this.setState({ insertItem: item, mode: Mode.UPLOAD });
    const input = this.inputRef.current;
    const upload = item.upload;
    if (input && upload) {
      if (upload.accept) {
        input.accept = upload.accept;
      }
      if (upload.capture) {
        // @ts-ignore
        input.capture = upload.capture;
      }
      if (upload.multiple) {
        input.multiple = upload.multiple;
      }
      input.click();
    }
  };

  triggerComponent = (item: MenuItem) => {
    this.setState({ insertItem: item, mode: Mode.COMPONENT });
  };

  handleUpload = (event: any) => {
    if (this.state.mode !== Mode.UPLOAD) return;
    const { insertItem } = this.state;
    if (!insertItem) return;
    if (!insertItem.upload) return;
    if (!insertItem.name) return;
    const files = getDataTransferFiles(event);
    const { view, upload, onUploadStart, onUploadStop } = this.props;
    const { state, dispatch } = view;
    const parent = findParentNode(node => !!node)(state.selection);

    if (parent) {
      dispatch(
        state.tr.insertText(
          "",
          parent.pos,
          parent.pos + parent.node.textContent.length + 1
        )
      );

      uploadFiles({
        onStart: onUploadStart,
        onStop: onUploadStop,
        view,
        pos: parent.pos,
        files,
        name: insertItem.name,
        getAttrs: res => ({
          ...this.getAttrs(insertItem.attrs),
          ...insertItem.upload?.getAttrs(res)
        }),
        upload,
        event,
        placeholder: insertItem.upload.placeholder
      });
    }

    if (this.inputRef.current) {
      this.inputRef.current.value = "";
    }

    this.props.onClose();
  };

  clearSearch() {
    const { state, dispatch } = this.props.view;
    const parent = findParentNode(node => !!node)(state.selection);

    if (parent) {
      dispatch(
        state.tr.insertText(
          "",
          parent.pos,
          parent.pos + parent.node.textContent.length + 1
        )
      );
    }
  }

  insertBlock(item: MenuItem) {
    this.clearSearch();

    let command = item.command;
    if (!command) {
      command = this.props.commands[item.name as string];
    }
    if (!command) {
      command = this.props.commands[`create${capitalize(item.name)}`];
    }
    command(item.attrs || {});

    this.props.onClose();
  }

  get caretPosition(): { top: number; left: number } {
    const selection = window.document.getSelection();
    if (!selection || !selection.anchorNode || !selection.focusNode) {
      return {
        top: 0,
        left: 0
      };
    }

    const range = window.document.createRange();
    range.setStart(selection.anchorNode, selection.anchorOffset);
    range.setEnd(selection.focusNode, selection.focusOffset);

    // This is a workaround for an edgecase where getBoundingClientRect will
    // return zero values if the selection is collapsed at the start of a newline
    // see reference here: https://stackoverflow.com/a/59780954
    const rects = range.getClientRects();
    if (rects.length === 0) {
      // probably buggy newline behavior, explicitly select the node contents
      if (range.startContainer && range.collapsed) {
        range.selectNodeContents(range.startContainer);
      }
    }

    const rect = range.getBoundingClientRect();
    return {
      top: rect.top,
      left: rect.left
    };
  }

  calculatePosition(props: Props) {
    const { view } = props;
    const { selection } = view.state;
    const startPos = view.coordsAtPos(selection.$from.pos);
    const ref = this.menuRef.current;
    const offsetHeight = ref ? ref.offsetHeight : 0;
    const paragraph = view.domAtPos(selection.$from.pos);

    if (
      !props.isActive ||
      !paragraph.node ||
      !(paragraph.node as HTMLElement).getBoundingClientRect
    ) {
      return {
        left: -1000,
        top: 0,
        bottom: undefined,
        isAbove: false
      };
    }

    const { left } = this.caretPosition;
    const {
      top,
      bottom
    } = (paragraph.node as HTMLElement).getBoundingClientRect();
    const margin = 24;

    if (startPos.top - offsetHeight > margin) {
      return {
        left: left + window.scrollX,
        top: undefined,
        bottom: window.innerHeight - top - window.scrollY,
        isAbove: false
      };
    } else {
      return {
        left: left + window.scrollX,
        top: bottom + window.scrollY,
        bottom: undefined,
        isAbove: true
      };
    }
  }

  get filtered(): MenuItem[] {
    const { embeds, search = "", upload } = this.props;
    const items = [...this.props.items];
    const embedItems: MenuItem[] = [];

    for (const embed of embeds) {
      if (embed.title && embed.icon) {
        embedItems.push({
          ...embed,
          name: "embed",
          attrs: {
            component: embed.component
          },
          component: blockMenuInput(embed.matcher, {
            placeholder: this.props.t("粘贴 {{title}} 链接...", {
              title: embed.title
            })
          })
        });
      }
    }

    if (embedItems.length) {
      items.push({
        name: "separator"
      });
      items.push(...embedItems);
    }

    const filtered = items.filter(item => {
      if (item.name === "separator") return true;

      // If no image upload callback has been passed, filter the image block out
      if (!upload && item.upload) return false;

      const n = search.toLowerCase();
      return (
        (item.title || "").toLowerCase().includes(n) ||
        (item.keywords || "").toLowerCase().includes(n)
      );
    });

    // this block literally just trims unneccessary separators from the results
    return filtered.reduce((acc: MenuItem[], item: MenuItem, index: number) => {
      // trim separators from start / end
      if (item.name === "separator" && index === 0) return acc;
      if (item.name === "separator" && index === filtered.length - 1)
        return acc;

      // trim double separators looking ahead / behind
      const prev = filtered[index - 1];
      if (prev && prev.name === "separator" && item.name === "separator")
        return acc;

      const next = filtered[index + 1];
      if (next && next.name === "separator" && item.name === "separator")
        return acc;

      // otherwise, continue
      return [...acc, item];
    }, []);
  }

  render() {
    const {
      t,
      i18n,
      tReady,
      isActive,
      upload,
      view,
      onUploadStart,
      onUploadStop
    } = this.props;
    const items = this.filtered;
    const { insertItem, mode, ...positioning } = this.state;

    return (
      <Portal>
        {mode === Mode.LIST && (
          <Wrapper
            id="block-menu-container"
            active={isActive}
            ref={this.menuRef}
            {...positioning}
          >
            <List>
              {items.map((item, index) => {
                if (item.name === "separator") {
                  return (
                    <ListItem key={index}>
                      <hr />
                    </ListItem>
                  );
                }
                const selected = index === this.state.selectedIndex && isActive;

                if (!item.title || !item.icon) {
                  return null;
                }

                return (
                  <ListItem key={index}>
                    <BlockMenuItem
                      onClick={() => this.insertItem(item)}
                      selected={selected}
                      icon={item.icon}
                      title={item.title}
                      shortcut={item.shortcut}
                    />
                  </ListItem>
                );
              })}
              {items.length === 0 && (
                <ListItem>
                  <Empty>{t("没有可插入的块")}</Empty>
                </ListItem>
              )}
            </List>
          </Wrapper>
        )}
        {mode === Mode.COMPONENT && insertItem && insertItem.component && (
          <FloatingToolbar
            ref={this.menuRef}
            active={isActive}
            view={this.props.view}
          >
            <insertItem.component
              item={insertItem}
              insertBlock={this.insertBlock}
              isActive={isActive}
              close={this.close}
              view={view}
              upload={upload}
              onUploadStart={onUploadStart}
              onUploadStop={onUploadStop}
              t={t}
              i18n={i18n}
              tReady={tReady}
            />
          </FloatingToolbar>
        )}
        {upload && (
          <VisuallyHidden>
            <input
              type="file"
              ref={this.inputRef}
              onChange={this.handleUpload}
            />
          </VisuallyHidden>
        )}
      </Portal>
    );
  }
}

const List = styled.ol`
  list-style: none;
  text-align: left;
  height: 100%;
  padding: 8px 0;
  margin: 0;
`;

const ListItem = styled.li`
  padding: 0;
  margin: 0;
`;

const Empty = styled.div`
  display: flex;
  align-items: center;
  color: ${props => props.theme.textSecondary};
  font-weight: 500;
  font-size: 14px;
  height: 36px;
  padding: 0 16px;
`;

export const Wrapper = styled.div<{
  active: boolean;
  top?: number;
  bottom?: number;
  left?: number;
  isAbove: boolean;
}>`
  color: ${props => props.theme.text};
  font-family: ${props => props.theme.fontFamily};
  position: absolute;
  z-index: ${props => {
    return props.theme.zIndex + 100;
  }};
  ${props => props.top !== undefined && `top: ${props.top}px`};
  ${props => props.bottom !== undefined && `bottom: ${props.bottom}px`};
  left: ${props => props.left}px;
  background-color: ${props => props.theme.blockToolbarBackground};
  border-radius: 4px;
  box-shadow: rgba(0, 0, 0, 0.05) 0 0 0 1px, rgba(0, 0, 0, 0.08) 0 4px 8px,
    rgba(0, 0, 0, 0.08) 0 2px 4px;
  opacity: 0;
  transform: scale(0.95);
  transition: opacity 150ms cubic-bezier(0.175, 0.885, 0.32, 1.275),
    transform 150ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transition-delay: 150ms;
  line-height: 0;
  box-sizing: border-box;
  pointer-events: none;
  white-space: nowrap;
  width: 300px;
  max-height: 224px;
  overflow: hidden;
  overflow-y: auto;

  * {
    box-sizing: border-box;
  }

  hr {
    border: 0;
    height: 0;
    border-top: 1px solid ${props => props.theme.blockToolbarDivider};
  }

  ${({ active, isAbove }) =>
    active &&
    `
    transform: translateY(${isAbove ? "6px" : "-6px"}) scale(1);
    pointer-events: all;
    opacity: 1;
  `};

  @media print {
    display: none;
  }
`;

export default withTranslation()(BlockMenu);
