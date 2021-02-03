import { MarkdownSerializerState } from "../lib/markdown/serializer";
import {
  Node as ProseMirrorNode,
  NodeSpec,
  NodeType,
  Schema
} from "prosemirror-model";
import Extension, {
  Attrs,
  Command,
  Dispatcher,
  MenuItems,
  ToolbarResult
} from "../lib/Extension";
import { InputRule } from "prosemirror-inputrules";
import { PluginSimple, PluginWithOptions, PluginWithParams } from "markdown-it";
import toggleBlockType from "../commands/toggleBlockType";
import { TokenConfig } from "prosemirror-markdown";
import { MarkArgs } from "../marks/Mark";

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

  toMarkdown(state: MarkdownSerializerState, node: ProseMirrorNode): void {
    console.error("toMarkdown not implemented", state, node);
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
  }: NodeArgs): Record<string, Command<A>> | Command<A> {
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
  toolbarItems(options: MarkArgs): ToolbarResult {
    return {};
  }
}
