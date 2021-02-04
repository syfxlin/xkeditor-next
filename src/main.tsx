/* global window File Promise */
import React from "react";
import { EditorState, Plugin, Selection, Transaction } from "prosemirror-state";
import { dropCursor } from "prosemirror-dropcursor";
import { gapCursor } from "prosemirror-gapcursor";
import { MarkdownParser, MarkdownSerializer } from "prosemirror-markdown";
import { Decoration, EditorView, NodeView } from "prosemirror-view";
import {
  MarkSpec,
  Node as ProseMirrorNode,
  NodeSpec,
  Schema,
  Slice
} from "prosemirror-model";
import { InputRule, inputRules } from "prosemirror-inputrules";
import { keymap } from "prosemirror-keymap";
import { baseKeymap } from "prosemirror-commands";
import { selectColumn, selectRow, selectTable } from "prosemirror-utils";
import styled, { ThemeProvider } from "styled-components";
import { dark as darkTheme, light as lightTheme } from "./theme";
import Flex from "./components/Flex";
import SelectionToolbar from "./components/SelectionToolbar";
import BlockMenu from "./components/BlockMenu";
import Extension, { MenuItem, ToolbarItem, ToolbarMode } from "./lib/Extension";
import ExtensionManager from "./lib/ExtensionManager";
import ComponentView from "./lib/ComponentView";
import headingToSlug from "./lib/headingToSlug";

// nodes
import ReactNode from "./nodes/ReactNode";
import Doc from "./nodes/Doc";
import Text from "./nodes/Text";
import Blockquote from "./nodes/Blockquote";
import BulletList from "./nodes/BulletList";
import CheckboxList from "./nodes/CheckboxList";
import CheckboxItem from "./nodes/CheckboxItem";
import Embed, { EmbedDescriptor } from "./nodes/Embed";
import HardBreak from "./nodes/HardBreak";
import Heading from "./nodes/Heading";
import HorizontalRule from "./nodes/HorizontalRule";
import Image from "./nodes/Image";
import ListItem from "./nodes/ListItem";
import Notice from "./nodes/Notice";
import OrderedList from "./nodes/OrderedList";
import Paragraph from "./nodes/Paragraph";
import Table from "./nodes/Table";
import TableCell from "./nodes/TableCell";
import TableHeadCell from "./nodes/TableHeadCell";
import TableRow from "./nodes/TableRow";

// marks
import Bold from "./marks/Bold";
import Code from "./marks/Code";
import Highlight from "./marks/Highlight";
import Italic from "./marks/Italic";
import Link from "./marks/Link";
import Strikethrough from "./marks/Strikethrough";
import TemplatePlaceholder from "./marks/Placeholder";
import Underline from "./marks/Underline";

// plugins
import BlockMenuTrigger from "./plugins/BlockMenuTrigger";
import History from "./plugins/History";
import Keys from "./plugins/Keys";
import Placeholder from "./plugins/Placeholder";
import SmartText from "./plugins/SmartText";
import TrailingNode from "./plugins/TrailingNode";
import MarkdownPaste from "./plugins/MarkdownPaste";
import Sup from "./marks/Sup";
import Sub from "./marks/Sub";
import Details from "./nodes/Details";
import MonacoBlock from "./nodes/MonacoBlock";
import Katex from "./nodes/Katex";
import KatexInline from "./nodes/KatexInline";
import Mermaid from "./nodes/Mermaid";

// Init
import "./init";
import "./styles/global.less";
import "@icon-park/react/styles/index.css";
import "tippy.js/dist/tippy.css";
import "tippy.js/animations/shift-away.css";
import { Toaster } from "react-hot-toast";
import { UploadResponse } from "./commands/uploadFiles";
import { t } from "./i18n";
import Emoji from "./nodes/Emoji";

export { default as Extension } from "./lib/Extension";

export const theme = lightTheme;

export type Props = {
  value?: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  dark?: boolean;
  config?: {
    id?: string;
    defaultValue?: string;
    placeholder?: string;
    extensions?: Extension[];
    autoFocus?: boolean;
    // TODO: update
    theme?: any;
    scrollTo?: string;
    embeds?: EmbedDescriptor[];
    className?: string;
    style?: Record<string, string>;
  };
  action?: {
    handleDOMEvents?: {
      [name: string]: (view: EditorView, event: Event) => boolean;
    };
    upload?: (files: File[]) => Promise<UploadResponse>;
    save?: ({ done }: { done: boolean }) => void;
    cancel?: () => void;
    onKeydown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
    onClickLink?: (href: string, event: MouseEvent) => void;
    onClickHashtag?: (href: string, event: MouseEvent) => void;
    onHoverLink?: (event: MouseEvent) => boolean;
  };
};

type State = {
  blockMenuOpen: boolean;
  blockMenuSearch: string;
};

type Step = {
  slice: Slice;
};

type NodeViewCreator = (
  node: ProseMirrorNode,
  view: EditorView,
  getPos: (() => number) | boolean,
  decorations: Decoration[]
) => NodeView;

class RichMarkdownEditor extends React.PureComponent<Props, State> {
  static defaultProps = {
    defaultValue: "",
    placeholder: t("写点有趣的内容..."),
    onClickLink: (href: string) => {
      window.open(href, "_blank");
    },
    embeds: [],
    extensions: []
  };

  state = {
    blockMenuOpen: false,
    blockMenuSearch: ""
  };

  // @ts-ignore
  extensions: ExtensionManager;
  element?: HTMLElement | null;
  // @ts-ignore
  view: EditorView;
  // @ts-ignore
  schema: Schema;
  // @ts-ignore
  serializer: MarkdownSerializer;
  // @ts-ignore
  parser: MarkdownParser;
  // @ts-ignore
  plugins: Plugin[];
  // @ts-ignore
  keymaps: Plugin[];
  // @ts-ignore
  inputRules: InputRule[];
  // @ts-ignore
  nodeViews: {
    [name: string]: NodeViewCreator;
  };
  // @ts-ignore
  nodes: { [name: string]: NodeSpec };
  // @ts-ignore
  marks: { [name: string]: MarkSpec };
  // @ts-ignore
  commands: Record<string, any>;
  // @ts-ignore
  menuItems: MenuItem[];
  // @ts-ignore
  toolbarItems: ToolbarItem[];
  // @ts-ignore
  toolbarModes: ToolbarMode[];

  componentDidMount() {
    this.init();

    const scrollTo = this.props.config?.scrollTo;
    if (scrollTo) {
      this.scrollToAnchor(scrollTo);
    }

    if (this.props.readOnly) return;

    if (this.props.config?.autoFocus) {
      this.focusAtEnd();
    }
  }

  componentDidUpdate(prevProps: Props) {
    // Allow changes to the 'value' prop to update the editor from outside
    if (this.props.value && prevProps.value !== this.props.value) {
      const newState = this.createState(this.props.value);
      this.view.updateState(newState);
    }

    // pass readOnly changes through to underlying editor instance
    if (prevProps.readOnly !== this.props.readOnly) {
      this.view.update({
        ...this.view.props,
        editable: () => !this.props.readOnly
      });
    }

    const scrollTo = this.props.config?.scrollTo;
    if (scrollTo && scrollTo !== prevProps.config?.scrollTo) {
      this.scrollToAnchor(scrollTo);
    }

    // Focus at the end of the document if switching from readOnly and autoFocus
    // is set to true
    if (
      prevProps.readOnly &&
      !this.props.readOnly &&
      this.props.config?.autoFocus
    ) {
      this.focusAtEnd();
    }
  }

  init() {
    this.extensions = this.createExtensions();
    this.nodes = this.createNodes();
    this.marks = this.createMarks();
    this.schema = this.createSchema();
    this.plugins = this.createPlugins();
    this.keymaps = this.createKeymaps();
    this.serializer = this.createSerializer();
    this.parser = this.createParser();
    this.inputRules = this.createInputRules();
    this.nodeViews = this.createNodeViews();
    this.view = this.createView();
    this.commands = this.createCommands();
    this.menuItems = this.createMenuItems();
    const itemsAndModes = this.createToolbarItemsAndModes();
    this.toolbarItems = itemsAndModes.items;
    this.toolbarModes = itemsAndModes.modes;
  }

  createExtensions() {
    // adding nodes here? Update schema.ts for serialization on the server
    return new ExtensionManager(
      [
        new Doc(),
        new Text(),
        new HardBreak(),
        new Paragraph(),
        new Blockquote(),
        new CheckboxList(),
        new CheckboxItem(),
        new BulletList(),
        new Embed(),
        new ListItem(),
        new Notice(),
        new Heading(),
        new HorizontalRule(),
        new Image({
          upload: this.props.action?.upload
        }),
        new Table(),
        new TableCell({
          onSelectTable: this.handleSelectTable,
          onSelectRow: this.handleSelectRow
        }),
        new TableHeadCell({
          onSelectColumn: this.handleSelectColumn
        }),
        new TableRow(),
        new Bold(),
        new Code(),
        new Highlight(),
        new Italic(),
        new TemplatePlaceholder(),
        new Underline(),
        new Link({
          // TODO: update
          // onKeyboardShortcut: this.handleOpenLinkMenu,
          onClickLink: this.props.action?.onClickLink,
          onClickHashtag: this.props.action?.onClickHashtag,
          onHoverLink: this.props.action?.onHoverLink
        }),
        new Strikethrough(),
        new OrderedList(),
        new History(),
        new SmartText(),
        new TrailingNode(),
        new MarkdownPaste(),
        new Keys({
          save: this.handleSave,
          saveAndExit: this.handleSaveAndExit,
          cancel: this.props.action?.cancel
        }),
        new BlockMenuTrigger({
          open: this.handleOpenBlockMenu,
          close: this.handleCloseBlockMenu
        }),
        new Placeholder({
          placeholder: this.props.config?.placeholder
        }),
        //
        new Sup(),
        new Sub(),
        new Details(),
        new MonacoBlock(),
        new Katex(),
        new KatexInline(),
        new Mermaid(),
        new Emoji(),
        //
        ...(this.props.config?.extensions || [])
      ],
      this
    );
  }

  createPlugins() {
    return this.extensions.plugins;
  }

  createKeymaps() {
    return this.extensions.keymaps({
      schema: this.schema
    });
  }

  createInputRules() {
    return this.extensions.inputRules({
      schema: this.schema
    });
  }

  createNodeViews() {
    return (this.extensions.extensions as ReactNode[])
      .filter((extension: ReactNode) => extension.component)
      .reduce((nodeViews, extension: ReactNode) => {
        const nodeView: NodeViewCreator = (node, view, getPos, decorations) => {
          return new ComponentView(extension.component(), {
            editor: this,
            extension,
            node,
            view,
            getPos: getPos as () => number,
            decorations
          });
        };

        return {
          ...nodeViews,
          [extension.name]: nodeView
        };
      }, {});
  }

  createCommands() {
    return this.extensions.commands({
      schema: this.schema,
      view: this.view
    });
  }

  createMenuItems() {
    const menuItems = this.extensions.menuItems({
      schema: this.schema
    });
    const result: MenuItem[] = [];
    for (const key in menuItems) {
      result.push(
        ...menuItems[key].sort((a, b) => (a.priority || 0) - (b.priority || 0))
      );
      result.push({ name: "separator" });
    }
    result.pop();
    return result;
  }

  createToolbarItemsAndModes() {
    const toolbarItems = this.extensions.toolbarItems({ schema: this.schema });
    const items: ToolbarItem[] = [];
    for (const key in toolbarItems.default) {
      items.push(
        ...toolbarItems.default[key].sort(
          (a, b) => (a.priority || 0) - (b.priority || 0)
        )
      );
      items.push({ name: "separator" });
    }
    items.pop();
    return {
      items,
      modes: toolbarItems.modes
    };
  }

  createNodes() {
    return this.extensions.nodes;
  }

  createMarks() {
    return this.extensions.marks;
  }

  createSchema() {
    return new Schema({
      nodes: this.nodes,
      marks: this.marks
    });
  }

  createSerializer() {
    return this.extensions.serializer();
  }

  createParser() {
    return this.extensions.parser({
      schema: this.schema
    });
  }

  createState(value?: string) {
    const doc = this.createDocument(
      value || this.props.config?.defaultValue || ""
    );

    return EditorState.create({
      schema: this.schema,
      doc,
      plugins: [
        ...this.plugins,
        ...this.keymaps,
        dropCursor({ color: this.theme().cursor }),
        gapCursor(),
        inputRules({
          rules: this.inputRules
        }),
        keymap(baseKeymap)
      ]
    });
  }

  createDocument(content: string) {
    return this.parser.parse(content);
  }

  createView() {
    if (!this.element) {
      throw new Error("createView called before ref available");
    }

    const isEditingCheckbox = (tr: Transaction) => {
      return tr.steps.some(
        // @ts-ignore
        (step: Step) =>
          step.slice.content.firstChild &&
          step.slice.content.firstChild.type.name ===
            this.schema.nodes.checkbox_item.name
      );
    };

    const view = new EditorView(this.element, {
      state: this.createState(),
      editable: () => !this.props.readOnly,
      nodeViews: this.nodeViews,
      handleDOMEvents: this.props.action?.handleDOMEvents,
      dispatchTransaction: transaction => {
        const { state } = this.view.state.applyTransaction(transaction);

        this.view.updateState(state);

        // Because Prosemirror and React are not linked we must tell React that
        // a render is needed whenever the Prosemirror state changes.
        this.forceUpdate();
      }
    });

    return view;
  }

  scrollToAnchor(hash: string) {
    if (!hash) return;

    try {
      const element = document.querySelector(hash);
      if (element) element.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      // querySelector will throw an error if the hash begins with a number
      // or contains a period. This is protected against now by safeSlugify
      // however previous links may be in the wild.
      console.warn(`Attempted to scroll to invalid hash: ${hash}`, err);
    }
  }

  value = (): string => {
    return this.serializer.serialize(this.view.state.doc);
  };

  handleChange = () => {
    if (!this.props.onChange) return;

    this.props.onChange(this.value());
  };

  handleSave = () => {
    const save = this.props.action?.save;
    if (save) {
      save({ done: false });
    }
  };

  handleSaveAndExit = () => {
    const save = this.props.action?.save;
    if (save) {
      save({ done: true });
    }
  };

  handleOpenBlockMenu = (search: string) => {
    this.setState({ blockMenuOpen: true, blockMenuSearch: search });
  };

  handleCloseBlockMenu = () => {
    if (!this.state.blockMenuOpen) return;
    this.setState({ blockMenuOpen: false });
  };

  handleSelectRow = (index: number, state: EditorState) => {
    this.view.dispatch(selectRow(index)(state.tr));
  };

  handleSelectColumn = (index: number, state: EditorState) => {
    this.view.dispatch(selectColumn(index)(state.tr));
  };

  handleSelectTable = (state: EditorState) => {
    this.view.dispatch(selectTable(state.tr));
  };

  // 'public' methods
  focusAtStart = () => {
    const selection = Selection.atStart(this.view.state.doc);
    const transaction = this.view.state.tr.setSelection(selection);
    this.view.dispatch(transaction);
    this.view.focus();
  };

  focusAtEnd = () => {
    const selection = Selection.atEnd(this.view.state.doc);
    const transaction = this.view.state.tr.setSelection(selection);
    this.view.dispatch(transaction);
    this.view.focus();
  };

  getHeadings = () => {
    const headings: { title: string; level: number; id: string }[] = [];
    const previouslySeen: Record<string, any> = {};

    this.view.state.doc.forEach(node => {
      if (node.type.name === "heading") {
        // calculate the optimal slug
        const slug = headingToSlug(node);
        let id = slug;

        // check if we've already used it, and if so how many times?
        // Make the new id based on that number ensuring that we have
        // unique ID's even when headings are identical
        if (previouslySeen[slug] > 0) {
          id = headingToSlug(node, previouslySeen[slug]);
        }

        // record that we've seen this slug for the next loop
        previouslySeen[slug] =
          previouslySeen[slug] !== undefined ? previouslySeen[slug] + 1 : 1;

        headings.push({
          title: node.textContent,
          level: node.attrs.level,
          id
        });
      }
    });
    return headings;
  };

  theme = () => {
    return (
      this.props.config?.theme || (this.props.dark ? darkTheme : lightTheme)
    );
  };

  render = () => {
    const { readOnly } = this.props;
    return (
      <Flex
        onKeyDown={this.props.action?.onKeydown}
        style={this.props.config?.style}
        className={this.props.config?.className}
        align="flex-start"
        justify="center"
        column
      >
        <ThemeProvider theme={this.theme()}>
          <React.Fragment>
            <StyledEditor
              readOnly={readOnly}
              ref={ref => (this.element = ref)}
            />
            {!readOnly && this.view && (
              <React.Fragment>
                <SelectionToolbar
                  view={this.view}
                  commands={this.commands}
                  items={this.toolbarItems}
                  modes={this.toolbarModes}
                />
                <BlockMenu
                  view={this.view}
                  commands={this.commands}
                  isActive={this.state.blockMenuOpen}
                  search={this.state.blockMenuSearch}
                  onClose={this.handleCloseBlockMenu}
                  upload={this.props.action?.upload}
                  embeds={this.props.config?.embeds}
                  items={this.menuItems}
                />
              </React.Fragment>
            )}
          </React.Fragment>
          <Toaster />
        </ThemeProvider>
      </Flex>
    );
  };
}

export default RichMarkdownEditor;
export type Editor = RichMarkdownEditor;

const StyledEditor = styled("div")<{
  readOnly?: boolean;
}>`
  color: ${props => props.theme.text};
  background: ${props => props.theme.background};
  font-family: ${props => props.theme.fontFamily};
  font-weight: ${props => props.theme.fontWeight};
  font-size: 1em;
  line-height: 1.7em;
  width: 100%;

  .ProseMirror {
    position: relative;
    outline: none;
    word-wrap: break-word;
    white-space: pre-wrap;
    -webkit-font-variant-ligatures: none;
    font-variant-ligatures: none;
    font-feature-settings: "liga" 0; /* the above doesn't seem to work in Edge */
  }

  pre {
    white-space: pre-wrap;
  }

  li {
    position: relative;
  }

  .image {
    text-align: center;
    max-width: 100%;
    clear: both;

    img {
      pointer-events: ${props => (props.readOnly ? "initial" : "none")};
      display: inline-block;
      max-width: 100%;
      max-height: 75vh;
    }
  }

  .image.placeholder {
    position: relative;
    background: ${props => props.theme.background};

    img {
      opacity: 0.5;
    }
  }

  .image-right-50 {
    float: right;
    width: 50%;
    margin-left: 2em;
    margin-bottom: 1em;
    clear: initial;
  }

  .image-left-50 {
    float: left;
    width: 50%;
    margin-right: 2em;
    margin-bottom: 1em;
    clear: initial;
  }

  .ProseMirror-hideselection *::selection {
    background: transparent;
  }

  .ProseMirror-hideselection *::-moz-selection {
    background: transparent;
  }

  .ProseMirror-hideselection {
    caret-color: transparent;
  }

  .ProseMirror-selectednode {
    outline: 2px solid
      ${props => (props.readOnly ? "transparent" : props.theme.selected)};
  }

  /* Make sure li selections wrap around markers */

  li.ProseMirror-selectednode {
    outline: none;
  }

  li.ProseMirror-selectednode:after {
    content: "";
    position: absolute;
    left: -32px;
    right: -2px;
    top: -2px;
    bottom: -2px;
    border: 2px solid ${props => props.theme.selected};
    pointer-events: none;
  }

  .ProseMirror[contenteditable="false"] {
    .caption {
      pointer-events: none;
    }

    .caption:empty {
      visibility: hidden;
    }
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 1em 0 0.5em;
    font-weight: 500;
    cursor: default;

    &:not(.placeholder):before {
      display: ${props => (props.readOnly ? "none" : "inline-block")};
      font-family: ${props => props.theme.fontFamilyMono};
      color: ${props => props.theme.textSecondary};
      font-size: 13px;
      line-height: 0;
      margin-left: -24px;
      width: 24px;
    }

    &:hover {
      .heading-anchor {
        opacity: 1;
      }
    }
  }

  .heading-content {
    &:before {
      content: "​";
      display: inline;
    }
  }

  .heading-name {
    color: ${props => props.theme.text};

    &:hover {
      text-decoration: none;
    }
  }

  a:first-child {
    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      margin-top: 0;
    }
  }

  h1:not(.placeholder):before {
    content: "H1";
  }

  h2:not(.placeholder):before {
    content: "H2";
  }

  h3:not(.placeholder):before {
    content: "H3";
  }

  h4:not(.placeholder):before {
    content: "H4";
  }

  h5:not(.placeholder):before {
    content: "H5";
  }

  h6:not(.placeholder):before {
    content: "H6";
  }

  .with-emoji {
    margin-left: -1em;
  }

  .heading-anchor {
    opacity: 0;
    display: ${props => (props.readOnly ? "inline-block" : "none")};
    color: ${props => props.theme.textSecondary};
    cursor: pointer;
    background: none;
    border: 0;
    outline: none;
    padding: 2px 12px 2px 4px;
    margin: 0;
    transition: opacity 100ms ease-in-out;
    font-family: ${props => props.theme.fontFamilyMono};
    font-size: 22px;
    line-height: 0;
    margin-left: -24px;
    width: 24px;

    &:focus,
    &:hover {
      color: ${props => props.theme.text};
    }
  }

  .placeholder {
    &:before {
      display: block;
      content: ${props => (props.readOnly ? "" : "attr(data-empty-text)")};
      pointer-events: none;
      height: 0;
      color: ${props => props.theme.placeholder};
    }
  }

  @media print {
    .placeholder {
      display: none;
    }
  }

  .notice-block {
    display: flex;
    align-items: center;
    background: ${props => props.theme.noticeInfoBackground};
    color: ${props => props.theme.noticeInfoText};
    border-radius: 4px;
    padding: 8px 16px;
    margin: 8px 0;

    a {
      color: ${props => props.theme.noticeInfoText};
    }

    a:not(.heading-name) {
      text-decoration: underline;
    }
  }

  .notice-block .icon {
    width: 24px;
    height: 24px;
    align-self: flex-start;
    margin-right: 4px;
    position: relative;
    top: 1px;
  }

  .notice-block.tip {
    background: ${props => props.theme.noticeTipBackground};
    color: ${props => props.theme.noticeTipText};

    a {
      color: ${props => props.theme.noticeTipText};
    }
  }

  .notice-block.warning {
    background: ${props => props.theme.noticeWarningBackground};
    color: ${props => props.theme.noticeWarningText};

    a {
      color: ${props => props.theme.noticeWarningText};
    }
  }

  blockquote {
    margin: 0;
    padding-left: 1em;
    font-style: italic;
    overflow: hidden;
    position: relative;

    &:before {
      content: "";
      display: inline-block;
      width: 3px;
      border-radius: 1px;
      position: absolute;
      margin-left: -16px;
      top: 0;
      bottom: 0;
      background: ${props => props.theme.quote};
    }
  }

  b,
  strong {
    font-weight: 600;
  }

  .template-placeholder {
    color: ${props => props.theme.placeholder};
    border-bottom: 1px dotted ${props => props.theme.placeholder};
    border-radius: 2px;
    cursor: text;

    &:hover {
      border-bottom: 1px dotted
        ${props =>
          props.readOnly ? props.theme.placeholder : props.theme.textSecondary};
    }
  }

  p {
    margin: 0;
  }

  a {
    color: ${props => props.theme.link};
  }

  a:hover {
    text-decoration: ${props => (props.readOnly ? "underline" : "none")};
  }

  ul,
  ol {
    margin: 0 0.1em;
    padding: 0 0 0 1.2em;

    ul,
    ol {
      margin: 0;
    }
  }

  ol ol {
    list-style: lower-alpha;
  }

  ol ol ol {
    list-style: lower-roman;
  }

  ul.checkbox_list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  ul.checkbox_list li {
    display: flex;
  }

  ul.checkbox_list li.checked > div > p {
    color: ${props => props.theme.textSecondary};
    text-decoration: line-through;
  }

  ul.checkbox_list li input {
    pointer-events: ${props => props.readOnly && "none"};
    opacity: ${props => props.readOnly && 0.75};
    margin: 0 0.5em 0 0;
    width: 14px;
    height: 14px;
  }

  li p:first-child {
    margin: 0;
    word-break: break-word;
  }

  hr {
    height: 0;
    border: 0;
    border-top: 1px solid ${props => props.theme.horizontalRule};
  }

  code {
    border-radius: 4px;
    border: 1px solid ${props => props.theme.codeBorder};
    padding: 3px 4px;
    font-family: ${props => props.theme.fontFamilyMono};
    font-size: 85%;
  }

  mark {
    border-radius: 1px;
    color: ${props => props.theme.black};
    background: ${props => props.theme.textHighlight};
  }

  .code-block,
  .notice-block {
    position: relative;

    > section {
      height: 100%;
      width: 100%;
      position: absolute;
      top: 0;
      overflow-y: auto;

      &.hidden {
        visibility: hidden;
      }
    }

    .toolbar {
      position: absolute;
      z-index: 1;
      top: 4px;
      right: 4px;

      select,
      button {
        background: ${props => props.theme.blockToolbarBackground};
        color: ${props => props.theme.blockToolbarItem};
        border-width: 1px;
        font-size: 13px;
        display: none;
        border-radius: 4px;
        padding: 2px;
        margin: 0px 2px;
      }

      button {
        padding: 2px 4px;
      }

      select:focus,
      select:active {
        display: inline;
      }
    }

    &:hover .toolbar {
      select {
        display: inline;
      }

      button {
        display: inline;
      }
    }
  }

  pre {
    display: block;
    overflow-x: auto;
    padding: 0.75em 1em;
    line-height: 1.4em;
    position: relative;
    background: ${props => props.theme.codeBackground};
    border-radius: 4px;
    border: 1px solid ${props => props.theme.codeBorder};

    -webkit-font-smoothing: initial;
    font-family: ${props => props.theme.fontFamilyMono};
    font-size: 13px;
    direction: ltr;
    text-align: left;
    white-space: pre;
    word-spacing: normal;
    word-break: normal;
    -moz-tab-size: 4;
    -o-tab-size: 4;
    tab-size: 4;
    -webkit-hyphens: none;
    -moz-hyphens: none;
    -ms-hyphens: none;
    hyphens: none;
    color: ${props => props.theme.code};
    margin: 0;

    code {
      font-size: 13px;
      background: none;
      padding: 0;
      border: 0;
    }
  }

  .token.comment,
  .token.prolog,
  .token.doctype,
  .token.cdata {
    color: ${props => props.theme.codeComment};
  }

  .token.punctuation {
    color: ${props => props.theme.codePunctuation};
  }

  .token.namespace {
    opacity: 0.7;
  }

  .token.operator,
  .token.boolean,
  .token.number {
    color: ${props => props.theme.codeNumber};
  }

  .token.property {
    color: ${props => props.theme.codeProperty};
  }

  .token.tag {
    color: ${props => props.theme.codeTag};
  }

  .token.string {
    color: ${props => props.theme.codeString};
  }

  .token.selector {
    color: ${props => props.theme.codeSelector};
  }

  .token.attr-name {
    color: ${props => props.theme.codeAttr};
  }

  .token.entity,
  .token.url,
  .language-css .token.string,
  .style .token.string {
    color: ${props => props.theme.codeEntity};
  }

  .token.attr-value,
  .token.keyword,
  .token.control,
  .token.directive,
  .token.unit {
    color: ${props => props.theme.codeKeyword};
  }

  .token.function {
    color: ${props => props.theme.codeFunction};
  }

  .token.statement,
  .token.regex,
  .token.atrule {
    color: ${props => props.theme.codeStatement};
  }

  .token.placeholder,
  .token.variable {
    color: ${props => props.theme.codePlaceholder};
  }

  .token.deleted {
    text-decoration: line-through;
  }

  .token.inserted {
    border-bottom: 1px dotted ${props => props.theme.codeInserted};
    text-decoration: none;
  }

  .token.italic {
    font-style: italic;
  }

  .token.important,
  .token.bold {
    font-weight: bold;
  }

  .token.important {
    color: ${props => props.theme.codeImportant};
  }

  .token.entity {
    cursor: help;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    border-radius: 4px;
    margin-top: 1em;
    box-sizing: border-box;

    * {
      box-sizing: border-box;
    }

    tr {
      position: relative;
      border-bottom: 1px solid ${props => props.theme.tableDivider};
    }

    th {
      background: ${props => props.theme.tableHeaderBackground};
    }

    td,
    th {
      position: relative;
      vertical-align: top;
      border: 1px solid ${props => props.theme.tableDivider};
      position: relative;
      padding: 4px 8px;
      text-align: left;
      min-width: 100px;
    }

    .selectedCell {
      background: ${props =>
        props.readOnly ? "inherit" : props.theme.tableSelectedBackground};

      /* fixes Firefox background color painting over border:
       * https://bugzilla.mozilla.org/show_bug.cgi?id=688556 */
      background-clip: padding-box;
    }

    .grip-column {
      /* usage of ::after for all of the table grips works around a bug in
       * prosemirror-tables that causes Safari to hang when selecting a cell
       * in an empty table:
       * https://github.com/ProseMirror/prosemirror/issues/947 */

      &::after {
        content: "";
        cursor: pointer;
        position: absolute;
        top: -16px;
        left: 0;
        width: 100%;
        height: 12px;
        background: ${props => props.theme.tableDivider};
        border-bottom: 3px solid ${props => props.theme.background};
        display: ${props => (props.readOnly ? "none" : "block")};
      }

      &:hover::after {
        background: ${props => props.theme.text};
      }

      &.first::after {
        border-top-left-radius: 3px;
      }

      &.last::after {
        border-top-right-radius: 3px;
      }

      &.selected::after {
        background: ${props => props.theme.tableSelected};
      }
    }

    .grip-row {
      &::after {
        content: "";
        cursor: pointer;
        position: absolute;
        left: -16px;
        top: 0;
        height: 100%;
        width: 12px;
        background: ${props => props.theme.tableDivider};
        border-right: 3px solid ${props => props.theme.background};
        display: ${props => (props.readOnly ? "none" : "block")};
      }

      &:hover::after {
        background: ${props => props.theme.text};
      }

      &.first::after {
        border-top-left-radius: 3px;
      }

      &.last::after {
        border-bottom-left-radius: 3px;
      }

      &.selected::after {
        background: ${props => props.theme.tableSelected};
      }
    }

    .grip-table {
      &::after {
        content: "";
        cursor: pointer;
        background: ${props => props.theme.tableDivider};
        width: 13px;
        height: 13px;
        border-radius: 13px;
        border: 2px solid ${props => props.theme.background};
        position: absolute;
        top: -18px;
        left: -18px;
        display: ${props => (props.readOnly ? "none" : "block")};
      }

      &:hover::after {
        background: ${props => props.theme.text};
      }

      &.selected::after {
        background: ${props => props.theme.tableSelected};
      }
    }
  }

  .scrollable-wrapper {
    position: relative;
    margin: 0.5em 0px;
    scrollbar-width: thin;
    scrollbar-color: transparent transparent;

    &:hover {
      scrollbar-color: ${props => props.theme.scrollbarThumb}
        ${props => props.theme.scrollbarBackground};
    }

    & ::-webkit-scrollbar {
      height: 14px;
      background-color: transparent;
    }

    &:hover ::-webkit-scrollbar {
      background-color: ${props => props.theme.scrollbarBackground};
    }

    & ::-webkit-scrollbar-thumb {
      background-color: transparent;
      border: 3px solid transparent;
      border-radius: 7px;
    }

    &:hover ::-webkit-scrollbar-thumb {
      background-color: ${props => props.theme.scrollbarThumb};
      border-color: ${props => props.theme.scrollbarBackground};
    }
  }

  .scrollable {
    overflow-y: hidden;
    overflow-x: auto;
    padding-left: 1em;
    margin-left: -1em;
    border-left: 1px solid transparent;
    border-right: 1px solid transparent;
    transition: border 250ms ease-in-out 0s;
  }

  .scrollable-shadow {
    position: absolute;
    top: 0;
    bottom: 0;
    left: -1em;
    width: 16px;
    transition: box-shadow 250ms ease-in-out;
    border: 0px solid transparent;
    border-left-width: 1em;
    pointer-events: none;

    &.left {
      box-shadow: 16px 0 16px -16px inset rgba(0, 0, 0, 0.25);
      border-left: 1em solid ${props => props.theme.background};
    }

    &.right {
      right: 0;
      left: auto;
      box-shadow: -16px 0 16px -16px inset rgba(0, 0, 0, 0.25);
    }
  }

  .block-menu-trigger {
    display: ${props => (props.readOnly ? "none" : "inline")};
    height: 1em;
    color: ${props => props.theme.textSecondary};
    background: none;
    border-radius: 100%;
    font-size: 30px;
    position: absolute;
    transform: scale(0.9);
    transition: color 150ms cubic-bezier(0.175, 0.885, 0.32, 1.275),
      transform 150ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
    outline: none;
    border: 0;
    line-height: 26px;
    margin-top: -2px;
    margin-left: -28px;

    &:hover,
    &:focus {
      cursor: pointer;
      transform: scale(1);
      color: ${props => props.theme.text};
    }
  }

  @media print {
    .block-menu-trigger {
      display: none;
    }
  }

  .ProseMirror-gapcursor {
    display: none;
    pointer-events: none;
    position: absolute;
  }

  .ProseMirror-gapcursor:after {
    content: "";
    display: block;
    position: absolute;
    top: -2px;
    width: 20px;
    border-top: 1px solid ${props => props.theme.cursor};
    animation: ProseMirror-cursor-blink 1.1s steps(2, start) infinite;
  }

  @keyframes ProseMirror-cursor-blink {
    to {
      visibility: hidden;
    }
  }

  .ProseMirror-focused .ProseMirror-gapcursor {
    display: block;
  }

  @media print {
    em,
    blockquote {
      font-family: "SF Pro Text", ${props => props.theme.fontFamily};
    }
  }
`;
