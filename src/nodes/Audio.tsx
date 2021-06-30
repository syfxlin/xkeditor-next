import Node, { NodeArgs } from "./Node";
import { Command, EmptyAttrs, MenuItems } from "../lib/Extension";
import { NodeSpec } from "prosemirror-model";
import { InputRule } from "prosemirror-inputrules";
import nodeInputRule from "../lib/nodeInputRule";
import { TokenConfig } from "prosemirror-markdown";
import { PluginSimple } from "markdown-it";
import { inlinePlugin } from "../lib/markdown/container";
import { t } from "../i18n";
import { AudioFile } from "@icon-park/react";
import { blockMenuInput } from "../components/BlockMenuComponent";

type AudioAttrs = {
  src: string | null;
  title: null | string;
};

const AUDIO_INPUT_REGEX = /:audio\[(?<alt>.*?)]\((?<filename>.*?)(?=[")])"?(?<title>[^"]+)?"?\)/;

export default class Audio extends Node<EmptyAttrs, AudioAttrs> {
  get name() {
    return "audio";
  }

  get schema(): NodeSpec {
    return {
      inline: true,
      attrs: {
        src: {},
        title: {
          default: null
        }
      },
      content: "text*",
      marks: "",
      group: "inline",
      selectable: true,
      draggable: true,
      parseDOM: [
        {
          tag: "audio",
          getAttrs: node => {
            const dom = node as HTMLElement;
            return {
              src: dom.getAttribute("src"),
              title: dom.getAttribute("title")
            };
          }
        }
      ],
      toDOM: node => {
        const title = node.attrs.title || node.textContent;
        return ["audio", { title, src: node.attrs.src, controls: "true" }];
      }
    };
  }

  inputRules({ type }: NodeArgs): InputRule[] {
    return [
      nodeInputRule(AUDIO_INPUT_REGEX, type, 1, match => ({
        src: match[2],
        title: match[3]
      }))
    ];
  }

  commands({ type }: NodeArgs): Command<Partial<AudioAttrs>> {
    return attrs => (state, dispatch) => {
      dispatch?.(
        state.tr.replaceSelectionWith(type.create(attrs)).scrollIntoView()
      );
      return true;
    };
  }

  parseMarkdown(): TokenConfig {
    return {
      block: this.name,
      getAttrs: token => ({
        src: token.attrGet("$dest_link"),
        title: token.attrGet("$dest_string")
      })
    };
  }

  markdownPlugin(): PluginSimple {
    return md => {
      inlinePlugin({
        md,
        name: this.name
      });
    };
  }

  menuItems(): MenuItems {
    return {
      3: [
        {
          name: this.name,
          title: t("音频"),
          icon: AudioFile,
          keywords: "audio media",
          component: blockMenuInput(value => ({ src: value }), {
            placeholder: t("粘贴音频链接...")
          })
        }
      ]
    };
  }
}
