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
import { TFunction } from "react-i18next";
import { imagePlaceholder } from "../nodes/Image";

const isMac = window.navigator.platform === "MacIntel";
export const mod = isMac ? "⌘" : "Ctrl";
export const alt = isMac ? "⌥" : "Alt";
export const shift = isMac ? "⇧" : "Shift";
export const ctrl = isMac ? "^" : "Ctrl";

export default function blockMenuItems(t: TFunction<string>): MenuItem[] {
  return [
    {
      name: "heading",
      title: t("标题 1"),
      keywords: "h1 heading1 title",
      icon: Heading1Icon,
      shortcut: "^ ⇧ 1",
      attrs: { level: 1 }
    },
    {
      name: "heading",
      title: t("标题 2"),
      keywords: "h2 heading2",
      icon: Heading2Icon,
      shortcut: "^ ⇧ 2",
      attrs: { level: 2 }
    },
    {
      name: "heading",
      title: t("标题 3"),
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
      title: t("Todo 列表"),
      icon: TodoListIcon,
      keywords: "checklist checkbox task",
      shortcut: "^ ⇧ 7"
    },
    {
      name: "bullet_list",
      title: t("无序列表"),
      icon: BulletedListIcon,
      shortcut: "^ ⇧ 8"
    },
    {
      name: "ordered_list",
      title: t("有序列表"),
      icon: OrderedListIcon,
      shortcut: "^ ⇧ 9"
    },
    {
      name: "separator"
    },
    {
      name: "table",
      title: t("表格"),
      icon: TableIcon,
      attrs: { rowsCount: 3, colsCount: 3 }
    },
    {
      name: "blockquote",
      title: t("引用"),
      icon: BlockQuoteIcon,
      shortcut: `${mod} ]`
    },
    {
      name: "code_block",
      title: t("代码块"),
      icon: CodeIcon,
      shortcut: "^ ⇧ \\",
      keywords: "script"
    },
    {
      name: "hr",
      title: t("分割线"),
      icon: HorizontalRuleIcon,
      shortcut: `${mod} _`,
      keywords: "horizontal rule break line"
    },
    {
      name: "image",
      title: t("图片"),
      icon: ImageIcon,
      keywords: "picture photo image",
      upload: {
        getAttrs: res => ({ src: res.data[0].url }),
        placeholder: imagePlaceholder,
        accept: "image/*"
      }
    },
    {
      name: "link",
      title: t("链接"),
      icon: LinkIcon,
      shortcut: `${mod} k`,
      keywords: "link url uri href"
    },
    {
      name: "separator"
    },
    {
      name: "notice",
      title: t("提示框（信息）"),
      icon: InfoIcon,
      keywords: "notice card information",
      attrs: { style: "info" }
    },
    {
      name: "notice",
      title: t("提示框（警告）"),
      icon: WarningIcon,
      keywords: "notice card error",
      attrs: { style: "warning" }
    },
    {
      name: "notice",
      title: t("提示框（提醒）"),
      icon: StarredIcon,
      keywords: "notice card suggestion",
      attrs: { style: "tip" }
    }
  ];
}
