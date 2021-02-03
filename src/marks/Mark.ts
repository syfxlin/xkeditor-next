import { toggleMark } from "prosemirror-commands";
import Extension, {
  Attrs,
  Command,
  Dispatcher,
  MenuItems,
  ToolbarResult
} from "../lib/Extension";
import {
  Fragment,
  Mark as ProseMirrorMark,
  MarkSpec,
  MarkType,
  Schema
} from "prosemirror-model";
import { InputRule } from "prosemirror-inputrules";
import { PluginSimple, PluginWithOptions, PluginWithParams } from "markdown-it";
import { MarkdownSerializerState, TokenConfig } from "prosemirror-markdown";
import { NodeArgs } from "../nodes/Node";

export type MarkArgs = { type: MarkType; schema: Schema };

export type MarkSerializerMethod<S extends Schema = any> = (
  state: MarkdownSerializerState<S>,
  mark: ProseMirrorMark<S>,
  parent: Fragment<S>,
  index: number
) => string;

export interface MarkSerializerConfig<S extends Schema = any> {
  open: string | MarkSerializerMethod<S>;
  close: string | MarkSerializerMethod<S>;
  mixable?: boolean;
  expelEnclosingWhitespace?: boolean;
  escape?: boolean;
}

export default abstract class Mark<
  O extends Attrs = Attrs,
  A extends Attrs = Attrs
> extends Extension<O, A> {
  get type(): string {
    return "mark";
  }

  abstract get schema(): MarkSpec;

  get markdownToken(): string {
    return this.name;
  }

  toMarkdown(): MarkSerializerConfig {
    return {} as MarkSerializerConfig;
  }

  parseMarkdown(): TokenConfig | undefined {
    return undefined;
  }

  markdownPlugin():
    | PluginSimple
    | PluginWithParams
    | PluginWithOptions
    | undefined {
    return undefined;
  }

  commands({ type }: MarkArgs): Record<string, Command<A>> | Command<A> {
    return attrs => toggleMark(type, attrs);
  }

  keys(options: MarkArgs): Record<string, Dispatcher> {
    return super.keys(options);
  }

  inputRules(options: MarkArgs): InputRule[] {
    return super.inputRules(options);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  menuItems(options: NodeArgs): MenuItems {
    return {};
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toolbarItems(options: MarkArgs): ToolbarResult {
    return {};
  }
}
