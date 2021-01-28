import { TrashIcon } from "outline-icons";
import { MenuItem } from "../types";
import { t } from "../i18n";

export default function tableMenuItems(): MenuItem[] {
  return [
    {
      name: "deleteTable",
      tooltip: t("删除表格"),
      icon: TrashIcon,
      active: () => false
    }
  ];
}
