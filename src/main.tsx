/* global window File Promise */
import React, { useContext } from "react";
import { EditorState, Plugin, Selection, Transaction } from "prosemirror-state";
import { dropCursor } from "prosemirror-dropcursor";
import { gapCursor } from "prosemirror-gapcursor";
import { MarkdownParser, MarkdownSerializer } from "prosemirror-markdown";
import { Decoration, EditorView, NodeView } from "prosemirror-view";
import {
  DOMSerializer,
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
import { ThemeProvider } from "styled-components";
import { dark as darkTheme, light as lightTheme, Theme } from "./theme";
import Flex from "./components/Flex";
import SelectionToolbar from "./components/SelectionToolbar";
import BlockMenu from "./components/BlockMenu";
import Extension, { MenuItem, ToolbarItem, ToolbarMode } from "./lib/Extension";
import ExtensionManager from "./lib/ExtensionManager";
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
import Katex from "./nodes/Katex";
import Emoji from "./nodes/Emoji";

// Init
import "./init";
import "./styles/global.less";
import "@icon-park/react/styles/index.css";
import { Toaster } from "react-hot-toast";
import { UploadResponse } from "./commands/uploadFiles";
import { t } from "./i18n";
import StyledEditor from "./components/StyledEditor";
import Audio from "./nodes/Audio";
import Video from "./nodes/Video";
import Notice from "./nodes/Notice";
import Details from "./nodes/Details";
import KatexInline from "./nodes/KatexInline";
import Mermaid from "./nodes/Mermaid";
import MonacoBlock from "./nodes/MonacoBlock";
import ComponentView from "./lib/ComponentView";
import PlantUml from "./nodes/PlantUml";
import MindMap from "./nodes/MindMap";
import NodeViewContainer from "./lib/NodeViewContainer";
import Style from "./nodes/Style";

export { default as Extension } from "./lib/Extension";

export type Props = {
  value?: string;
  onChange: (editor: Editor) => void;
  readOnly?: boolean;
  dark?: boolean;
  config?: {
    id?: string;
    defaultValue?: string;
    placeholder?: string;
    extensions?: Extension[];
    autoFocus?: boolean;
    // TODO: update
    theme?: Theme;
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
    onClickLink?: (href: string, event?: MouseEvent) => void;
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

export type NodeViewCreator = (
  node: ProseMirrorNode,
  view: EditorView,
  getPos: (() => number) | boolean,
  decorations: Decoration[]
) => NodeView;

export const EditorContext = React.createContext<RichMarkdownEditor | null>(
  null
);
export const useEditorContext = () => useContext(EditorContext);

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

  element?: HTMLElement | null;
  extensions?: ExtensionManager;
  view?: EditorView;
  schema?: Schema;
  serializer?: MarkdownSerializer;
  parser?: MarkdownParser;
  plugins?: Plugin[];
  keymaps?: Plugin[];
  inputRules?: InputRule[];
  nodeViews?: {
    [name: string]: NodeViewCreator;
  };
  nodes?: { [name: string]: NodeSpec };
  marks?: { [name: string]: MarkSpec };
  commands?: Record<string, any>;
  menuItems?: MenuItem[];
  toolbarItems?: ToolbarItem[];
  toolbarModes?: ToolbarMode[];
  nodeViewContainer?: NodeViewContainer;

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
      this.view?.updateState(newState);
    }

    // pass readOnly changes through to underlying editor instance
    if (prevProps.readOnly !== this.props.readOnly) {
      this.view?.update({
        ...this.view?.props,
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

    // 通知 ComponentView 重新渲染
    this.nodeViewContainer?.update();
  }

  init() {
    this.nodeViewContainer = new NodeViewContainer();
    this.nodeViewContainer.on(views =>
      // 当 Update 事件被调用时重新渲染 ComponentView
      views.forEach(view => view.renderElement())
    );
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
    if (itemsAndModes === undefined) {
      return;
    }
    this.toolbarItems = itemsAndModes.items;
    this.toolbarModes = itemsAndModes.modes;
  }

  private createExtensions() {
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
        new ListItem(),
        new Heading(),
        new HorizontalRule(),
        new Image({
          upload: this.props.action?.upload,
          onClickLink: this.props.action?.onClickLink
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
        new Embed(),
        new Sup(),
        new Sub(),
        new Details(),
        new Notice(),
        new MonacoBlock(),
        new Katex(),
        new KatexInline(),
        new Mermaid(),
        new Emoji(),
        new PlantUml(),
        new MindMap(),
        new Audio(),
        new Video(),
        new Style(),
        //
        ...(this.props.config?.extensions || [])
      ],
      this
    );
  }

  private createPlugins() {
    return this.extensions?.plugins;
  }

  private createKeymaps() {
    return this.extensions?.keymaps({
      schema: this.schema as Schema
    });
  }

  private createInputRules() {
    return this.extensions?.inputRules({
      schema: this.schema as Schema
    });
  }

  private createNodeViews() {
    return (this.extensions?.extensions as ReactNode[])
      .filter((extension: ReactNode) => extension.component)
      .reduce((nodeViews, extension: ReactNode) => {
        const nodeView: NodeViewCreator = ComponentView.create({
          editor: this,
          extension,
          component: extension.component(),
          nodeViewContainer: this.nodeViewContainer as NodeViewContainer
        }) as any;
        return {
          ...nodeViews,
          [extension.name]: nodeView
        };
      }, {});
  }

  private createCommands() {
    return this.extensions?.commands({
      schema: this.schema as Schema,
      view: this.view as EditorView
    });
  }

  private createMenuItems() {
    const menuItems = this.extensions?.menuItems({
      schema: this.schema as Schema
    });
    if (menuItems === undefined) {
      return menuItems;
    }
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

  private createToolbarItemsAndModes() {
    const toolbarItems = this.extensions?.toolbarItems({
      schema: this.schema as Schema
    });
    if (toolbarItems === undefined) {
      return toolbarItems;
    }
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

  private createNodes() {
    return this.extensions?.nodes;
  }

  private createMarks() {
    return this.extensions?.marks;
  }

  private createSchema() {
    return new Schema({
      nodes: this.nodes as { [name: string]: NodeSpec },
      marks: this.marks as { [name: string]: MarkSpec }
    });
  }

  private createSerializer() {
    return this.extensions?.serializer();
  }

  private createParser() {
    return this.extensions?.parser({
      schema: this.schema as Schema
    });
  }

  private createState(value?: string) {
    const doc = this.createDocument(
      value || this.props.config?.defaultValue || ""
    );

    return EditorState.create({
      schema: this.schema,
      doc,
      plugins: [
        ...(this.plugins as Plugin[]),
        ...(this.keymaps as Plugin[]),
        dropCursor({ color: this.theme().primary }),
        gapCursor(),
        inputRules({
          rules: this.inputRules as InputRule[]
        }),
        keymap(baseKeymap)
      ]
    });
  }

  private createDocument(content: string) {
    return this.parser?.parse(content);
  }

  private createView() {
    if (!this.element) {
      throw new Error("createView called before ref available");
    }

    const isEditingCheckbox = (tr: Transaction) => {
      return tr.steps.some(
        // @ts-ignore
        (step: Step) =>
          step.slice.content.firstChild &&
          step.slice.content.firstChild.type.name ===
            (this.schema as Schema).nodes.checkbox_item.name
      );
    };

    return new EditorView(this.element, {
      state: this.createState(),
      editable: () => !this.props.readOnly,
      nodeViews: this.nodeViews,
      handleDOMEvents: this.props.action?.handleDOMEvents,
      dispatchTransaction: transaction => {
        const { state, transactions } = (this
          .view as EditorView).state.applyTransaction(transaction);

        (this.view as EditorView).updateState(state);

        // If any of the transactions being dispatched resulted in the doc
        // changing then call our own change handler to let the outside world
        // know
        if (
          transactions.some(tr => tr.docChanged) &&
          (!this.props.readOnly || transactions.some(isEditingCheckbox))
        ) {
          this.handleChange();
        }

        // Because Prosemirror and React are not linked we must tell React that
        // a render is needed whenever the Prosemirror state changes.
        this.forceUpdate();
      }
    });
  }

  private handleChange = () => {
    if (!this.props.onChange) return;

    this.props.onChange(this);
  };

  private handleSave = () => {
    const save = this.props.action?.save;
    if (save) {
      save({ done: false });
    }
  };

  private handleSaveAndExit = () => {
    const save = this.props.action?.save;
    if (save) {
      save({ done: true });
    }
  };

  private handleOpenBlockMenu = (search: string) => {
    this.setState({ blockMenuOpen: true, blockMenuSearch: search });
  };

  private handleCloseBlockMenu = () => {
    if (!this.state.blockMenuOpen) return;
    this.setState({ blockMenuOpen: false });
  };

  private handleSelectRow = (index: number, state: EditorState) => {
    this.view?.dispatch(selectRow(index)(state.tr));
  };

  private handleSelectColumn = (index: number, state: EditorState) => {
    this.view?.dispatch(selectColumn(index)(state.tr));
  };

  private handleSelectTable = (state: EditorState) => {
    this.view?.dispatch(selectTable(state.tr));
  };

  // 'public' methods
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
    if (!this.view || !this.serializer) {
      return "";
    }
    return this.serializer.serialize(this.view.state.doc);
  };

  markdown = () => this.value();

  html = (): string => {
    if (!this.view || !this.schema) {
      return "";
    }
    const div = document.createElement("div");
    const fragment = DOMSerializer.fromSchema(this.schema).serializeFragment(
      this.view.state.doc.content
    );
    div.appendChild(fragment);
    return div.innerHTML;
  };

  json = (): { [key: string]: any } => {
    if (!this.view) {
      return {};
    }
    return this.view.state.doc.toJSON();
  };

  focusAtStart = () => {
    if (!this.view) {
      return;
    }
    const selection = Selection.atStart(this.view.state.doc);
    const transaction = this.view.state.tr.setSelection(selection);
    this.view.dispatch(transaction);
    this.view.focus();
  };

  focusAtEnd = () => {
    if (!this.view) {
      return;
    }
    const selection = Selection.atEnd(this.view.state.doc);
    const transaction = this.view.state.tr.setSelection(selection);
    this.view.dispatch(transaction);
    this.view.focus();
  };

  getHeadings = () => {
    if (!this.view) {
      return;
    }
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
      <EditorContext.Provider value={this}>
        <ThemeProvider theme={this.theme()}>
          <Flex
            onKeyDown={this.props.action?.onKeydown}
            style={this.props.config?.style}
            className={`${this.props.dark ? "theme-dark" : "theme-light"} ${
              this.props.config?.className
            }`}
            align="flex-start"
            justify="center"
            column
          >
            <>
              <StyledEditor
                readOnly={readOnly}
                ref={ref => (this.element = ref)}
              />
              {!readOnly &&
                this.view &&
                this.commands &&
                this.menuItems &&
                this.toolbarModes &&
                this.toolbarItems && (
                  <>
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
                  </>
                )}
            </>
            <Toaster />
          </Flex>
        </ThemeProvider>
      </EditorContext.Provider>
    );
  };
}

export type Editor = RichMarkdownEditor;
export default RichMarkdownEditor;
