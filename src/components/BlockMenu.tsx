import * as React from "react";
import { Component, createRef } from "react";
import capitalize from "lodash/capitalize";
import { Portal } from "react-portal";
import { EditorView } from "prosemirror-view";
import { findParentNode } from "prosemirror-utils";
import styled from "styled-components";
import { EmbedDescriptor, MenuItem } from "../types";
import BlockMenuItem from "./BlockMenuItem";
import Input from "./Input";
import VisuallyHidden from "./VisuallyHidden";
import getDataTransferFiles from "../lib/getDataTransferFiles";
import { WithTranslation, withTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { ApplyCommand } from "../lib/Extension";
import uploadFiles, { UploadResponse } from "../commands/uploadFiles";

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
  // 链接
  onLinkToolbarOpen: () => void;
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
  INPUT,
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
    if (item.input) {
      return this.triggerInput(item);
    }
    this.insertBlock(item);
  };

  close = () => {
    this.props.onClose();
    this.props.view.focus();
  };

  handleInputKeydown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!this.props.isActive) return;
    if (this.state.mode !== Mode.INPUT) return;
    const insertItem = this.state.insertItem;
    if (!insertItem) return;
    if (!insertItem.input) return;

    if (event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();

      const value = event.currentTarget.value;
      const matches = insertItem.input.matcher(value);

      if (!matches) {
        toast.error(this.props.t("抱歉，该链接不适用于此嵌入类型") as string);
        return;
      }

      this.insertBlock({
        name: insertItem.name,
        attrs: {
          ...insertItem.attrs,
          ...matches
        }
      });
    }

    if (event.key === "Escape") {
      this.props.onClose();
      this.props.view.focus();
    }
  };

  handleInputPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    if (!this.props.isActive) return;
    if (this.state.mode !== Mode.INPUT) return;
    const insertItem = this.state.insertItem;
    if (!insertItem) return;
    if (!insertItem.input) return;

    const value = event.clipboardData.getData("text/plain");
    const matches = insertItem.input.matcher(value);

    if (matches) {
      event.preventDefault();
      event.stopPropagation();

      this.insertBlock({
        name: insertItem.name,
        attrs: {
          ...insertItem.attrs,
          ...matches
        }
      });
    }
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

  triggerInput = (item: MenuItem) => {
    this.setState({ insertItem: item, mode: Mode.INPUT });
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
          ...insertItem.attrs,
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
    let { items } = this.props;
    const embedItems: MenuItem[] = [];

    for (const embed of embeds) {
      if (embed.title && embed.icon) {
        embedItems.push({
          ...embed,
          name: "embed",
          attrs: {
            component: embed.component
          }
        });
      }
    }

    if (embedItems.length) {
      items.push({
        name: "separator"
      });
      items = items.concat(embedItems);
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
    const { t, isActive, upload } = this.props;
    const items = this.filtered;
    const { insertItem, mode, ...positioning } = this.state;

    return (
      <Portal>
        <Wrapper
          id="block-menu-container"
          active={isActive}
          ref={this.menuRef}
          {...positioning}
        >
          {mode === Mode.INPUT && insertItem && (
            <InputWrapper>
              <InputValue
                {...insertItem.input}
                onKeyDown={this.handleInputKeydown}
                onPaste={this.handleInputPaste}
                autoFocus
              />
            </InputWrapper>
          )}
          {mode === Mode.LIST && (
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
        </Wrapper>
      </Portal>
    );
  }
}

const InputWrapper = styled.div`
  margin: 8px;
`;

const InputValue = styled(Input)`
  height: 36px;
  width: 100%;
  color: ${props => props.theme.blockToolbarText};
`;

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
