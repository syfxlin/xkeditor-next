import { TrashIcon } from "outline-icons";
import { t } from "../i18n";

export default function tableMenuItems(): any[] {
  return [
    {
      name: "deleteTable",
      tooltip: t("删除表格"),
      icon: TrashIcon,
      active: () => false
    }
  ];
}
