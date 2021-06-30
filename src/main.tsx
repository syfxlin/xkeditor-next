import React, { useContext } from "react";
import NodeViewContainer from "./lib/NodeViewContainer";
import ExtensionManager from "./lib/ExtensionManager";
import Doc from "./nodes/Doc";
import Text from "./nodes/Text";
import HardBreak from "./nodes/HardBreak";
import Paragraph from "./nodes/Paragraph";
import Blockquote from "./nodes/Blockquote";
import CheckboxList from "./nodes/CheckboxList";
import CheckboxItem from "./nodes/CheckboxItem";
import BulletList from "./nodes/BulletList";
import ListItem from "./nodes/ListItem";
import Heading from "./nodes/Heading";
import HorizontalRule from "./nodes/HorizontalRule";
import { DOMSerializer, MarkSpec, NodeSpec, Schema } from "prosemirror-model";
import { EditorView } from "prosemirror-view";
import { EditorState, Plugin, Selection } from "prosemirror-state";
import { InputRule, inputRules } from "prosemirror-inputrules";
import { dropCursor } from "prosemirror-dropcursor";
import { dark as darkTheme, light as lightTheme } from "./theme";
import { gapCursor } from "prosemirror-gapcursor";
import { keymap } from "prosemirror-keymap";
import { baseKeymap } from "prosemirror-commands";
import ReactNode from "./nodes/ReactNode";
import ComponentView, { NodeViewCreator } from "./lib/ComponentView";
import Extension, { MenuItem, ToolbarItem, ToolbarMode } from "./lib/Extension";
import { ThemeProvider } from "styled-components";
import Flex from "./components/Flex";
import StyledEditor from "./components/StyledEditor";
import SelectionToolbar from "./components/SelectionToolbar";
import BlockMenu from "./components/BlockMenu";
import { Toaster } from "react-hot-toast";
import Embed, { EmbedDescriptor } from "./nodes/Embed";
import CodePen from "./embeds/CodePen";
import CodeSandbox from "./embeds/CodeSandbox";
import DrawIO from "./embeds/DrawIO";
import GithubGist from "./embeds/GithubGist";
import Trello from "./embeds/Trello";
import Airtable from "./embeds/Airtable";
import Office from "./embeds/Office";
import GoogleDocs from "./embeds/GoogleDocs";
import GoogleDrive from "./embeds/GoogleDrive";
import IFrame from "./embeds/IFrame";
import { UploadResponse } from "./commands/uploadFiles";
import Image from "./nodes/Image";
import Table from "./nodes/Table";
import TableRow from "./nodes/TableRow";
import TableCell from "./nodes/TableCell";
import TableHeadCell from "./nodes/TableHeadCell";
import { selectColumn, selectRow, selectTable } from "prosemirror-utils";
import Bold from "./marks/Bold";
import Code from "./marks/Code";
import Highlight from "./marks/Highlight";
import Italic from "./marks/Italic";
import Underline from "./marks/Underline";
import { default as MarkPlaceholder } from "./marks/Placeholder";
import Link from "./marks/Link";
import Strikethrough from "./marks/Strikethrough";
import OrderedList from "./nodes/OrderedList";
import History from "./plugins/History";
import SmartText from "./plugins/SmartText";
import TrailingNode from "./plugins/TrailingNode";
import MarkdownPaste from "./plugins/MarkdownPaste";
import Keys from "./plugins/Keys";
import BlockMenuTrigger from "./plugins/BlockMenuTrigger";
import Placeholder from "./plugins/Placeholder";
import Sup from "./marks/Sup";
import Details from "./nodes/Details";
import Notice from "./nodes/Notice";
import MonacoBlock from "./nodes/MonacoBlock";
import Katex from "./nodes/Katex";
import KatexInline from "./nodes/KatexInline";
import Mermaid from "./nodes/Mermaid";
import Emoji from "./nodes/Emoji";
import PlantUml from "./nodes/PlantUml";
import MindMap from "./nodes/MindMap";
import Audio from "./nodes/Audio";
import Video from "./nodes/Video";
import Style from "./nodes/Style";
import { MarkdownParser } from "prosemirror-markdown";

const defaultValue = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 1 },
      content: [{ type: "text", text: "Welcome" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "This is example content. It is persisted between reloads in localStorage.",
        },
      ],
    },
  ],
};

type Props = {
  // config
  value: Record<string, any> | string;
  dark: boolean;
  editable: boolean;
  theme?: {
    light: any;
    dark: any;
  };
  className?: string;
  scrollTo?: string;
  autofocus?: boolean;
  placeholder?: string;
  embeds?: EmbedDescriptor[];
  extensions?: Extension[];
  // event
  onChange: (editor: Editor) => void;
  onClickLink?: (href: string, event?: MouseEvent) => void;
  onClickTag?: (href: string, event: MouseEvent) => void;
  onHoverLink?: (event: MouseEvent) => boolean;
  // action
  handleDOMEvents?: Record<string, (view: EditorView, event: Event) => boolean>;
  handleUpload?: (files: File[]) => Promise<UploadResponse>;
  handleSave?: ({ done }: { done: boolean }) => void;
  handleCancel?: () => void;
};

type State = {
  blockMenu: {
    active: boolean;
    search: string;
  };
};

export class Editor extends React.PureComponent<Props, State> {
  private element?: HTMLElement | null;
  private readonly nodeViewContainer: NodeViewContainer;
  private readonly extensions: ExtensionManager;
  private readonly nodes: Record<string, NodeSpec>;
  private readonly marks: Record<string, MarkSpec>;
  private readonly plugins: Plugin[];
  private readonly keymaps: Plugin[];
  private readonly inputRules: InputRule[];
  private readonly nodeViews: Record<string, NodeViewCreator>;
  private readonly menuItems: MenuItem[];
  private readonly toolbarItems: ToolbarItem[];
  private readonly toolbarModes: ToolbarMode[];
  public readonly schema: Schema;
  public view?: EditorView;
  public commands?: Record<string, any>;
  public readonly embeds: EmbedDescriptor[];
  public readonly parser: MarkdownParser;

  state = {
    blockMenu: {
      active: false,
      search: "",
    },
  };

  constructor(props: Props, context: any) {
    super(props, context);
    this.nodeViewContainer = this.createViewContainer();
    this.embeds = this.createEmbeds();
    this.extensions = this.createExtensions();
    this.schema = this.createSchema();
    this.parser = this.createParser();
    this.nodes = this.createNodes();
    this.marks = this.createMarks();
    this.plugins = this.createPlugins();
    this.keymaps = this.createKeymaps();
    this.inputRules = this.createInputRules();
    this.nodeViews = this.createNodeViews();
    this.commands = this.createCommands();
    this.menuItems = this.createMenuItems();
    const itemsAndModes = this.createToolbarItemsAndModes();
    this.toolbarItems = itemsAndModes.items;
    this.toolbarModes = itemsAndModes.modes;
  }

  private createViewContainer() {
    const container = new NodeViewContainer();
    container.on((views) => views.forEach((view) => view.renderElement()));
    return container;
  }

  private createEmbeds() {
    return [
      CodePen,
      CodeSandbox,
      DrawIO,
      GithubGist,
      Trello,
      Airtable,
      Office,
      GoogleDocs,
      GoogleDrive,
      ...(this.props.embeds || []),
      IFrame,
    ];
  }

  private createExtensions() {
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
          upload: this.props.handleUpload,
          onClickLink: this.props.onClickLink,
        }),
        new Table(),
        new TableRow(),
        new TableHeadCell({
          onSelectColumn: this.handleSelectColumn,
        }),
        new TableCell({
          onSelectTable: this.handleSelectTable,
          onSelectRow: this.handleSelectRow,
        }),
        new Bold(),
        new Code(),
        new Highlight(),
        new Italic(),
        new MarkPlaceholder(),
        new Underline(),
        new Link({
          onClickLink: this.props.onClickLink,
          onClickHashtag: this.props.onClickTag,
          onHoverLink: this.props.onHoverLink,
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
          cancel: this.props.handleCancel,
        }),
        new BlockMenuTrigger({
          open: this.openMenu,
          close: this.closeMenu,
        }),
        new Placeholder({
          placeholder: this.props.placeholder,
        }),
        //
        new Embed(),
        new Sup(),
        // TODO: 语法冲突
        // new Sub(),
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
        ...(this.props.extensions || []),
      ],
      this
    );
  }

  private createNodes() {
    return this.extensions.nodes;
  }

  private createMarks() {
    return this.extensions.marks;
  }

  private createPlugins() {
    return this.extensions.plugins;
  }

  private createKeymaps() {
    return this.extensions.keymaps({
      schema: this.schema,
    });
  }

  private createNodeViews() {
    return (this.extensions.extensions as ReactNode[])
      .filter((e: ReactNode) => e.component)
      .reduce((nodeViews, extension: ReactNode) => {
        const nodeView: NodeViewCreator = ComponentView.create({
          // TODO: fix
          // @ts-ignore
          editor: this,
          extension,
          component: extension.component(),
          nodeViewContainer: this.nodeViewContainer,
        });
        return {
          ...nodeViews,
          [extension.name]: nodeView,
        };
      }, {});
  }

  private createInputRules() {
    return this.extensions.inputRules({
      schema: this.schema,
    });
  }

  private createCommands() {
    return this.extensions.commands({
      schema: this.schema,
      view: this.view as EditorView,
    });
  }

  private createSchema() {
    return new Schema({
      nodes: this.extensions.nodes,
      marks: this.extensions.marks,
    });
  }

  private createParser() {
    return this.extensions.parser({
      schema: this.schema as Schema,
    });
  }

  private createView() {
    if (!this.element) {
      throw new Error("createView 方法不可在 ref 前运行");
    }
    return new EditorView(this.element, {
      state: this.createState(),
      editable: () => this.props.editable,
      nodeViews: this.nodeViews,
      handleDOMEvents: {
        ...this.props.handleDOMEvents,
      },
      dispatchTransaction: (tr) => {
        const { state, transactions } = (
          this.view as EditorView
        ).state.applyTransaction(tr);
        (this.view as EditorView).updateState(state);
        if (transactions.some((t) => t.docChanged)) {
          this.handleChange();
        }
        this.forceUpdate();
      },
    });
  }

  private createDocument() {
    let value = this.props.value;
    if (!value) {
      return this.schema.nodeFromJSON(defaultValue);
    }
    try {
      if (typeof value === "string") {
        value = JSON.parse(value);
      }
      return this.schema.nodeFromJSON(value as Record<string, any>);
    } catch (e) {
      console.warn("Invalid content.", "Passed value:", value, "Error:", e);
      return this.schema.nodeFromJSON(defaultValue);
    }
  }

  private createState() {
    return EditorState.create({
      doc: this.createDocument(),
      schema: this.schema,
      plugins: [
        ...this.plugins,
        ...this.keymaps,
        dropCursor({ color: this.theme().primary }),
        gapCursor(),
        inputRules({
          rules: this.inputRules,
        }),
        keymap(baseKeymap),
      ],
    });
  }

  private createMenuItems() {
    const menuItems = this.extensions.menuItems({
      schema: this.schema,
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

  private createToolbarItemsAndModes() {
    const toolbarItems = this.extensions.toolbarItems({
      schema: this.schema as Schema,
    });
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
      modes: toolbarItems.modes,
    };
  }

  private handleChange = () => {
    this.props.onChange(this);
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

  private handleSave = () => {
    const save = this.props.handleSave;
    if (save) {
      save({ done: false });
    }
  };

  private handleSaveAndExit = () => {
    const save = this.props.handleSave;
    if (save) {
      save({ done: true });
    }
  };

  // public method

  public theme = () => {
    const theme = this.props.theme || {
      light: lightTheme,
      dark: darkTheme,
    };
    return this.props.dark ? theme.dark : theme.light;
  };

  public json = () => {
    return this.view?.state.doc.toJSON();
  };

  public html = () => {
    if (!this.view) {
      return undefined;
    }
    const div = document.createElement("div");
    const fragment = DOMSerializer.fromSchema(this.schema).serializeFragment(
      this.view.state.doc.content
    );
    div.appendChild(fragment);
    return div.innerHTML;
  };

  public openMenu = (search: string) => {
    this.setState({
      ...this.state,
      blockMenu: {
        active: true,
        search,
      },
    });
  };

  public closeMenu = () => {
    this.setState({
      ...this.state,
      blockMenu: {
        active: false,
        search: "",
      },
    });
  };

  public scrollToAnchor = (hash: string) => {
    try {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } catch (err) {
      console.warn(`Attempted to scroll to invalid hash: ${hash}`, err);
    }
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

  // react method

  componentDidMount() {
    this.view = this.createView();
    this.commands = this.createCommands();
    // scrollTo
    if (this.props.scrollTo) {
      this.scrollToAnchor(this.props.scrollTo);
    }
    if (!this.props.editable) {
      return;
    }
    // editable
    if (this.props.autofocus) {
      this.focusAtEnd();
    }
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    // update value
    if (this.props.value && prevProps.value !== this.props.value) {
      this.view?.updateState(this.createState());
    }
    // update editable
    if (prevProps.editable !== this.props.editable) {
      this.view?.update({
        ...this.view?.props,
        editable: () => this.props.editable,
      });
    }
    // scrollTo
    if (this.props.scrollTo) {
      this.scrollToAnchor(this.props.scrollTo);
    }
    // editable
    if (!prevProps.editable && this.props.editable && this.props.autofocus) {
      this.focusAtEnd();
    }
    // notify component view re-render
    this.nodeViewContainer.update();
  }

  render() {
    return (
      <EditorContext.Provider value={this}>
        <ThemeProvider theme={this.theme()}>
          <Flex
            className={`${this.props.dark ? "theme-dark" : "theme-light"} ${
              this.props.className
            }`}
            align="flex-start"
            justify="center"
            column
          >
            <>
              <StyledEditor
                readOnly={!this.props.editable}
                ref={(ref) => (this.element = ref)}
              />
              {this.props.editable && this.view && this.commands && (
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
                    isActive={this.state.blockMenu.active}
                    search={this.state.blockMenu.search}
                    onClose={this.closeMenu}
                    upload={this.props.handleUpload}
                    embeds={this.embeds}
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
  }
}

export const EditorContext = React.createContext<Editor | undefined>(undefined);
export const useEditorContext = () => useContext(EditorContext);
