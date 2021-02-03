/* eslint-disable no-unused-vars */
import { InputRule } from "prosemirror-inputrules";
import { EditorState, Plugin, Transaction } from "prosemirror-state";
import { Editor } from "../main";
import { MarkType, NodeType, Schema } from "prosemirror-model";
import { EditorView } from "prosemirror-view";
import * as React from "react";
import { UploadResponse } from "../commands/uploadFiles";
import { BlockComponentProps } from "../components/BlockMenu";
import { ToolbarComponentProps } from "../components/SelectionToolbar";

// eslint-disable-next-line @typescript-eslint/ban-types
export type EmptyAttrs = {};

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
  icon?: typeof React.Component | React.FC<any>;
  shortcut?: string;
  keywords?: string;
  attrs?: Attrs | ((view: EditorView) => Attrs);
  component?: React.FC<BlockComponentProps> | typeof React.Component;
  upload?: {
    getAttrs: (res: UploadResponse) => Attrs;
    placeholder?: (root: HTMLElement, meta: any) => void;
    accept?: string;
    capture?: string;
    multiple?: boolean;
  };
};

export type ToolbarItem = {
  name: string;
  command?: ApplyCommand;
  title?: string;
  icon?: typeof React.Component | React.FC<any>;
  shortcut?: string;
  attrs?: Attrs | ((view: EditorView) => Attrs);
  visible?: boolean;
  active?: (state: EditorState) => boolean;
  component?: React.FC<ToolbarComponentProps> | typeof React.Component;
};

export type ToolbarMode = {
  priority: number;
  active: (view: EditorView) => boolean;
};

export type ToolbarResult = {
  items?: { [id: string]: ToolbarItem };
  modes?: { [mode: string]: ToolbarMode };
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

  constructor(options: O = {} as O) {
    this.options = {
      ...this.defaultOptions,
      ...options
    };
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  commands(options: ExtensionArgs): Record<string, Command<A>> | Command<A> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return attrs => () => false;
  }

  get defaultOptions(): O {
    return {} as O;
  }
}
