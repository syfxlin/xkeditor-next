import { NodeSpec, NodeType, Schema } from "prosemirror-model";
import Extension, {
  Attrs,
  Command,
  Dispatcher,
  MenuItems,
  ToolbarItems
} from "../lib/Extension";
import { InputRule } from "prosemirror-inputrules";
import { PluginSimple, PluginWithOptions, PluginWithParams } from "markdown-it";
import toggleBlockType from "../commands/toggleBlockType";
import { TokenConfig } from "prosemirror-markdown";

export type NodeArgs = { type: NodeType; schema: Schema };

export default abstract class Node<
  O extends Attrs = Attrs,
  A extends Attrs = Attrs
> extends Extension<O, A> {
  get type(): string {
    return "node";
  }

  abstract get schema(): NodeSpec;

  get markdownToken(): string {
    return this.name;
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

  commands({
    type,
    schema
  }: NodeArgs): Record<string, Command<Partial<A>>> | Command<Partial<A>> {
    return attrs => toggleBlockType(type, schema.nodes.paragraph, attrs);
  }

  keys(options: NodeArgs): Record<string, Dispatcher> {
    return super.keys(options);
  }

  inputRules(options: NodeArgs): InputRule[] {
    return super.inputRules(options);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  menuItems(options: NodeArgs): MenuItems {
    return {};
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toolbarItems(options: NodeArgs): ToolbarItems {
    return {};
  }
}
