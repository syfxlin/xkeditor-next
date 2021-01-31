/* eslint-disable no-unused-vars */
import { InputRule } from "prosemirror-inputrules";
import { EditorState, Plugin, Transaction } from "prosemirror-state";
import { Editor } from "../main";
import { MarkType, NodeType, Schema } from "prosemirror-model";
import { EditorView } from "prosemirror-view";

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
