import { ToolbarComponentProps } from "./SelectionToolbar";
import React, { ChangeEvent, MouseEvent, useContext, useState } from "react";
import styled, { ThemeContext } from "styled-components";
import Flex from "./Flex";
import Input from "./Input";
import ToolbarButton from "./ToolbarButton";
import Tooltip from "./Tooltip";
import { useTranslation } from "react-i18next";
import getMarkRange from "../queries/getMarkRange";
import { Delete, Share } from "@icon-park/react";

const LinkInputComponent: React.FC<ToolbarComponentProps> = ({
  view,
  addMark,
  removeMark
}) => {
  const markType = view.state.schema.marks.link;
  const range = getMarkRange(view.state.selection.$from, markType);
  if (!range) {
    return null;
  }
  const { mark } = range;
  const theme = useContext(ThemeContext);
  const { t } = useTranslation();
  const [value, setValue] = useState(mark ? mark.attrs.href : "");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };
  const handleOpenLink = (e: MouseEvent<HTMLElement>) => {
    if (mark && mark.attrs.href) {
      e.preventDefault();
      window.open(mark.attrs.href, "_blank");
    }
  };
  const handleRemoveLink = (): void => {
    removeMark(mark, range);
  };
  const handleKeyDown = (event: React.KeyboardEvent): void => {
    switch (event.key) {
      case "Enter": {
        event.preventDefault();
        addMark(markType, { href: value }, range);
        return;
      }
      case "Escape": {
        event.preventDefault();
        handleRemoveLink();
        return;
      }
    }
  };

  return (
    <Wrapper>
      <Input
        value={value}
        placeholder={t("搜索或粘贴链接...")}
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        autoFocus={mark.attrs.href === ""}
      />
      <ToolbarButton onClick={handleOpenLink} disabled={!value}>
        <Tooltip tooltip={t("打开链接")}>
          <Share theme="outline" size="24" fill={theme.toolbarItem} />
        </Tooltip>
      </ToolbarButton>
      <ToolbarButton onClick={handleRemoveLink}>
        <Tooltip tooltip={t("删除链接")}>
          <Delete theme="outline" size="24" fill={theme.toolbarItem} />
        </Tooltip>
      </ToolbarButton>
    </Wrapper>
  );
};

const Wrapper = styled(Flex)`
  margin-left: -8px;
  margin-right: -8px;
  min-width: 336px;
`;

export default LinkInputComponent;
