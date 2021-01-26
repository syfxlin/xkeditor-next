import { toggleMark } from "prosemirror-commands";
import Extension, { Command, Dispatcher } from "../lib/Extension";
import { MarkSpec, MarkType, Schema } from "prosemirror-model";
import { InputRule } from "prosemirror-inputrules";
import { PluginSimple, PluginWithOptions, PluginWithParams } from "markdown-it";
import { TokenConfig } from "prosemirror-markdown";

export type MarkArgs = { type: MarkType; schema: Schema };

export default abstract class Mark extends Extension {
  get type(): string {
    return "mark";
  }

  abstract get schema(): MarkSpec;

  get markdownToken(): string {
    return "";
  }

  toMarkdown(): Record<string, any> {
    return {};
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

  commands({ type }: MarkArgs): Record<string, Command> | Command {
    return () => toggleMark(type);
  }

  keys(options: MarkArgs): Record<string, Dispatcher> {
    return super.keys(options);
  }

  inputRules(options: MarkArgs): InputRule[] {
    return super.inputRules(options);
  }
}
