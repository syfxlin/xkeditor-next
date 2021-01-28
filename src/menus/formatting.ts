import {
  BlockQuoteIcon,
  BoldIcon,
  CodeIcon,
  Heading1Icon,
  Heading2Icon,
  HighlightIcon,
  InputIcon,
  ItalicIcon,
  LinkIcon,
  StrikethroughIcon
} from "outline-icons";
import { isInTable } from "prosemirror-tables";
import { EditorState } from "prosemirror-state";
import isInList from "../queries/isInList";
import isMarkActive from "../queries/isMarkActive";
import isNodeActive from "../queries/isNodeActive";
import { MenuItem } from "../types";
import { t } from "../i18n";

export default function formattingMenuItems(
  state: EditorState,
  isTemplate: boolean
): MenuItem[] {
  const { schema } = state;
  const isTable = isInTable(state);
  const isList = isInList(state);
  const allowBlocks = !isTable && !isList;

  return [
    {
      name: "placeholder",
      tooltip: t("占位符"),
      icon: InputIcon,
      active: isMarkActive(schema.marks.placeholder),
      visible: isTemplate
    },
    {
      name: "separator",
      visible: isTemplate
    },
    {
      name: "strong",
      tooltip: t("粗体"),
      icon: BoldIcon,
      active: isMarkActive(schema.marks.strong)
    },
    {
      name: "em",
      tooltip: t("斜体"),
      icon: ItalicIcon,
      active: isMarkActive(schema.marks.em)
    },
    {
      name: "strikethrough",
      tooltip: t("删除线"),
      icon: StrikethroughIcon,
      active: isMarkActive(schema.marks.strikethrough)
    },
    {
      name: "mark",
      tooltip: t("高亮"),
      icon: HighlightIcon,
      active: isMarkActive(schema.marks.mark),
      visible: !isTemplate
    },
    {
      name: "code_inline",
      tooltip: t("行内代码"),
      icon: CodeIcon,
      active: isMarkActive(schema.marks.code_inline)
    },
    {
      name: "separator",
      visible: allowBlocks
    },
    {
      name: "heading",
      tooltip: t("标题 1"),
      icon: Heading1Icon,
      active: isNodeActive(schema.nodes.heading, { level: 1 }),
      attrs: { level: 1 },
      visible: allowBlocks
    },
    {
      name: "heading",
      tooltip: t("标题 2"),
      icon: Heading2Icon,
      active: isNodeActive(schema.nodes.heading, { level: 2 }),
      attrs: { level: 2 },
      visible: allowBlocks
    },
    {
      name: "blockquote",
      tooltip: t("引用"),
      icon: BlockQuoteIcon,
      active: isNodeActive(schema.nodes.blockquote),
      attrs: { level: 2 },
      visible: allowBlocks
    },
    {
      name: "separator"
    },
    {
      name: "link",
      tooltip: t("链接"),
      icon: LinkIcon,
      active: isMarkActive(schema.marks.link),
      attrs: { href: "" }
    }
  ];
}
