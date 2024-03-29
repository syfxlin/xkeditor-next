import { Schema } from "prosemirror-model";
import { keymap } from "prosemirror-keymap";
import { MarkdownParser } from "prosemirror-markdown";
import { Editor } from "../main";
import Extension, {
  Attrs,
  Command,
  ToolbarItem,
  ToolbarMode
} from "./Extension";
import makeRules from "./markdown/rules";
import Node from "../nodes/Node";
import Mark from "../marks/Mark";
import { PluginSimple, PluginWithOptions, PluginWithParams } from "markdown-it";
import { Plugin } from "prosemirror-state";
import { EditorView } from "prosemirror-view";

type Ext = Extension | Mark | Node;

export default class ExtensionManager {
  extensions: Ext[];
  embeds;

  constructor(extensions: Ext[] = [], editor?: Editor) {
    if (editor) {
      extensions.forEach(extension => {
        extension.bindEditor(editor);
      });
    }

    this.extensions = extensions;
    this.embeds = editor ? editor.embeds : undefined;
  }

  get nodes() {
    return (this.extensions.filter(
      extension => extension.type === "node"
    ) as Node[]).reduce(
      (nodes, node: Node) => ({
        ...nodes,
        [node.name]: node.schema
      }),
      {}
    );
  }

  get marks() {
    return (this.extensions.filter(
      extension => extension.type === "mark"
    ) as Mark[]).reduce(
      (marks, { name, schema }: Mark) => ({
        ...marks,
        [name]: schema
      }),
      {}
    );
  }

  get plugins() {
    return this.extensions
      .filter(extension => extension.plugins)
      .reduce(
        (allPlugins: Plugin[], { plugins }) => [...allPlugins, ...plugins],
        []
      );
  }

  keymaps({ schema }: { schema: Schema }) {
    const extensionKeymaps = this.extensions
      .filter(extension => ["extension"].includes(extension.type))
      .filter(extension => extension.keys)
      // @ts-ignore
      .map(extension => extension.keys({ schema }));

    const nodeMarkKeymaps = this.extensions
      .filter(extension => ["node", "mark"].includes(extension.type))
      .filter(extension => extension.keys)
      .map(extension =>
        extension.keys({
          // @ts-ignore
          type: schema[`${extension.type}s`][extension.name],
          schema
        })
      );

    return [
      ...extensionKeymaps,
      ...nodeMarkKeymaps
    ].map((keys: Record<string, any>) => keymap(keys));
  }

  inputRules({ schema }: { schema: Schema }) {
    const extensionInputRules = this.extensions
      .filter(extension => ["extension"].includes(extension.type))
      .filter(extension => extension.inputRules)
      // @ts-ignore
      .map(extension => extension.inputRules({ schema }));

    const nodeMarkInputRules = this.extensions
      .filter(extension => ["node", "mark"].includes(extension.type))
      .filter(extension => extension.inputRules)
      .map(extension =>
        extension.inputRules({
          // @ts-ignore
          type: schema[`${extension.type}s`][extension.name],
          schema
        })
      );

    return [...extensionInputRules, ...nodeMarkInputRules].reduce(
      (allInputRules, inputRules) => [...allInputRules, ...inputRules],
      []
    );
  }

  commands({ schema, view }: { schema: Schema; view: EditorView }) {
    return this.extensions
      .filter(extension => extension.commands)
      .reduce((allCommands, extension) => {
        const { name, type } = extension;
        const commands = {};
        // @ts-ignore
        const value = extension.commands({
          schema,
          ...(["node", "mark"].includes(type)
            ? {
                // @ts-ignore
                type: schema[`${type}s`][name]
              }
            : {})
        });

        const apply = (callback: Command, attrs: Attrs) => {
          if (!view.editable) {
            return false;
          }
          view.focus();
          return callback(attrs)(view.state, view.dispatch, view);
        };

        const handle = (_name: string, _value: Command[] | Command) => {
          if (Array.isArray(_value)) {
            // @ts-ignore
            commands[_name] = (attrs: Attrs) =>
              _value.forEach(callback => apply(callback, attrs));
          } else if (typeof _value === "function") {
            // @ts-ignore
            commands[_name] = (attrs: Attrs) => apply(_value, attrs);
          }
        };

        if (typeof value === "object") {
          Object.entries(value).forEach(([commandName, commandValue]) => {
            handle(commandName, commandValue);
          });
        } else {
          handle(name, value);
        }

        return {
          ...allCommands,
          ...commands
        };
      }, {});
  }

  menuItems({ schema }: { schema: Schema }) {
    return (this.extensions.filter(extension =>
      ["mark", "node"].includes(extension.type)
    ) as (Node | Mark)[])
      .filter(extension => extension.menuItems)
      .map(extension =>
        extension.menuItems({
          // @ts-ignore
          type: schema[`${extension.type}s`][extension.name],
          schema
        })
      )
      .reduce((allItems, items) => {
        for (const group in items) {
          if (allItems[group] !== undefined) {
            allItems[group] = [...allItems[group], ...items[group]];
          } else {
            allItems[group] = [...items[group]];
          }
        }
        return allItems;
      }, {});
  }

  toolbarItems({ schema }: { schema: Schema }) {
    const results = (this.extensions.filter(extension =>
      ["mark", "node"].includes(extension.type)
    ) as (Mark | Node)[])
      .filter(extension => extension.toolbarItems)
      .map(extension =>
        extension.toolbarItems({
          // @ts-ignore
          type: schema[`${extension.type}s`][extension.name],
          schema
        })
      );
    return {
      default: results
        .map(items => items.default)
        .reduce<{ [group: number]: ToolbarItem[] }>((allItems, items) => {
          if (items) {
            for (const group in items) {
              if (allItems[group] !== undefined) {
                allItems[group] = [...allItems[group], ...items[group]];
              } else {
                allItems[group] = [...items[group]];
              }
            }
          }
          return allItems;
        }, {}),
      modes: results
        .map(items => items.modes)
        .reduce<ToolbarMode[]>(
          (allModes, modes) => [...(allModes || []), ...(modes || [])],
          []
        )
        .sort((a, b) => a.priority - b.priority)
    };
  }

  parser({ schema }: { schema: Schema }) {
    const nodeAndMarks = this.extensions.filter(
      extension => extension.type === "mark" || extension.type === "node"
    ) as (Node | Mark)[];

    const tokens = nodeAndMarks.reduce((nodes, extension: Node | Mark) => {
      const md = extension.parseMarkdown();
      if (!md) return nodes;

      return {
        ...nodes,
        [extension.markdownToken]: md
      };
    }, {});

    const plugins = nodeAndMarks
      .map((extension: Node | Mark) => extension.markdownPlugin())
      .filter(plugin => plugin !== undefined) as (
      | PluginSimple
      | PluginWithParams
      | PluginWithOptions
    )[];

    return new MarkdownParser(
      schema,
      // @ts-ignore
      makeRules({ embeds: this.embeds, plugins }),
      tokens
    );
  }
}
