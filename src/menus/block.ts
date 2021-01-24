import {
  BlockQuoteIcon,
  BulletedListIcon,
  CodeIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  HorizontalRuleIcon,
  ImageIcon,
  InfoIcon,
  LinkIcon,
  OrderedListIcon,
  StarredIcon,
  TableIcon,
  TodoListIcon,
  WarningIcon
} from "outline-icons";
import { MenuItem } from "../types";
import baseDictionary from "../dictionary";

const SSR = typeof window === "undefined";
const isMac = !SSR && window.navigator.platform === "MacIntel";
const mod = isMac ? "⌘" : "ctrl";

export default function blockMenuItems(
  dictionary: typeof baseDictionary
): MenuItem[] {
  return [
    {
      name: "heading",
      title: dictionary.h1,
      keywords: "h1 heading1 title",
      icon: Heading1Icon,
      shortcut: "^ ⇧ 1",
      attrs: { level: 1 }
    },
    {
      name: "heading",
      title: dictionary.h2,
      keywords: "h2 heading2",
      icon: Heading2Icon,
      shortcut: "^ ⇧ 2",
      attrs: { level: 2 }
    },
    {
      name: "heading",
      title: dictionary.h3,
      keywords: "h3 heading3",
      icon: Heading3Icon,
      shortcut: "^ ⇧ 3",
      attrs: { level: 3 }
    },
    {
      name: "separator"
    },
    {
      name: "checkbox_list",
      title: dictionary.checkboxList,
      icon: TodoListIcon,
      keywords: "checklist checkbox task",
      shortcut: "^ ⇧ 7"
    },
    {
      name: "bullet_list",
      title: dictionary.bulletList,
      icon: BulletedListIcon,
      shortcut: "^ ⇧ 8"
    },
    {
      name: "ordered_list",
      title: dictionary.orderedList,
      icon: OrderedListIcon,
      shortcut: "^ ⇧ 9"
    },
    {
      name: "separator"
    },
    {
      name: "table",
      title: dictionary.table,
      icon: TableIcon,
      attrs: { rowsCount: 3, colsCount: 3 }
    },
    {
      name: "blockquote",
      title: dictionary.quote,
      icon: BlockQuoteIcon,
      shortcut: `${mod} ]`
    },
    {
      name: "code_block",
      title: dictionary.codeBlock,
      icon: CodeIcon,
      shortcut: "^ ⇧ \\",
      keywords: "script"
    },
    {
      name: "hr",
      title: dictionary.hr,
      icon: HorizontalRuleIcon,
      shortcut: `${mod} _`,
      keywords: "horizontal rule break line"
    },
    {
      name: "image",
      title: dictionary.image,
      icon: ImageIcon,
      keywords: "picture photo"
    },
    {
      name: "link",
      title: dictionary.link,
      icon: LinkIcon,
      shortcut: `${mod} k`,
      keywords: "link url uri href"
    },
    {
      name: "separator"
    },
    {
      name: "container_notice",
      title: dictionary.infoNotice,
      icon: InfoIcon,
      keywords: "container_notice card information",
      attrs: { style: "info" }
    },
    {
      name: "container_notice",
      title: dictionary.warningNotice,
      icon: WarningIcon,
      keywords: "container_notice card error",
      attrs: { style: "warning" }
    },
    {
      name: "container_notice",
      title: dictionary.tipNotice,
      icon: StarredIcon,
      keywords: "container_notice card suggestion",
      attrs: { style: "tip" }
    }
  ];
}
