/* eslint-disable no-unused-vars */
import { InputRule } from "prosemirror-inputrules";
import { EditorState, Plugin, Transaction } from "prosemirror-state";
import Editor from "../main";
import { MarkType, NodeType, Schema } from "prosemirror-model";
import { EditorView } from "prosemirror-view";

export type Attrs = Record<string, any>;

export type Dispatcher = (
  state: EditorState,
  dispatch?: (tr: Transaction) => void,
  view?: EditorView
) => boolean | void;

export type Command = (attrs: Attrs) => Dispatcher;

export type ExtensionArgs = {
  schema: Schema;
  type?: MarkType | NodeType;
};

export default class Extension {
  options: Record<string, any>;
  // @ts-ignore
  editor: Editor;

  constructor(options: Record<string, any> = {}) {
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

  get name(): string {
    return "";
  }

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
  commands(options: ExtensionArgs): Record<string, Command> | Command {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return attrs => () => false;
  }

  get defaultOptions(): any {
    return {};
  }
}
