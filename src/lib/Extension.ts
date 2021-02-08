/* eslint-disable no-unused-vars */
import { InputRule } from "prosemirror-inputrules";
import { EditorState, Plugin, Transaction } from "prosemirror-state";
import { Editor } from "../main";
import { MarkType, NodeType, Schema } from "prosemirror-model";
import { EditorView } from "prosemirror-view";
import { ComponentType } from "react";
import { UploadResponse } from "../commands/uploadFiles";
import { BlockComponentProps } from "../components/BlockMenu";
import { ToolbarComponentProps } from "../components/SelectionToolbar";
import { editor } from "monaco-editor";
import { IIconProps } from "@icon-park/react/lib/runtime";

// eslint-disable-next-line @typescript-eslint/ban-types
export type EmptyAttrs = {};

export type MonacoAttrs<A extends Attrs = Attrs> = A & {
  monacoRef: null | editor.IStandaloneCodeEditor;
};

export type Attrs = Record<string, any>;

export type Dispatcher = (
  state: EditorState,
  dispatch?: (tr: Transaction) => void,
  view?: EditorView
) => boolean | void;

export type Command<A extends Attrs = Attrs> = (attrs: A) => Dispatcher;

export type ApplyCommand<A extends Attrs = Attrs> = (
  attrs: A
) => boolean | void;

export type MenuItems = { [group: number]: MenuItem[] };

export type MenuItem = {
  name: string;
  command?: ApplyCommand;
  priority?: number;
  title?: string;
  icon?: ComponentType<IIconProps>;
  shortcut?: string;
  keywords?: string;
  attrs?: Attrs | ((view: EditorView) => Attrs);
  component?: ComponentType<BlockComponentProps>;
  upload?: {
    getAttrs: (res: UploadResponse) => Attrs;
    placeholder?: (root: HTMLElement, meta: any) => void;
    accept?: string;
    capture?: string;
    multiple?: boolean;
  };
};

export type ToolbarItems = {
  default?: { [group: number]: ToolbarItem[] };
  modes?: ToolbarMode[];
};

export type ToolbarMode = {
  name: string;
  priority: number;
  active: (view: EditorView) => false | null | undefined | any;
  items?: ToolbarItem[] | ((values: any, view: EditorView) => ToolbarItem[]);
  component?: ComponentType<ToolbarComponentProps> | null;
};

export type ToolbarItem = {
  name: string;
  priority?: number;
  command?: ApplyCommand;
  title?: string;
  icon?: ComponentType<IIconProps>;
  shortcut?: string;
  attrs?: Attrs | ((view: EditorView) => Attrs);
  visible?: boolean;
  active?: (state: EditorState) => boolean;
};

export type ExtensionArgs = {
  schema: Schema;
  type?: MarkType | NodeType;
};

export default abstract class Extension<
  O extends Attrs = Attrs,
  A extends Attrs = Attrs
> {
  options: O;
  // @ts-ignore
  editor: Editor;

  constructor(options: Partial<O> = {}) {
    this.options = {
      ...this.defaultOptions,
      ...options
    } as O;
  }

  bindEditor(editor: Editor): void {
    this.editor = editor;
  }

  get type(): string {
    return "extension";
  }

  abstract get name(): string;

  get plugins(): Plugin[] {
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  keys(options: ExtensionArgs): Record<string, Dispatcher> {
    return {};
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  inputRules(options: ExtensionArgs): InputRule[] {
    return [];
  }

  commands(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options: ExtensionArgs
  ): Record<string, Command<Partial<A>>> | Command<Partial<A>> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return attrs => () => false;
  }

  get defaultOptions(): Partial<O> {
    return {};
  }
}
