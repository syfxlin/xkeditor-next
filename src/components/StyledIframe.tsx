import styled from "styled-components";
import Flex from "./Flex";
import React, { ComponentType, HTMLAttributeReferrerPolicy } from "react";
import { IIconProps } from "@icon-park/react/lib/runtime";
import { Share } from "@icon-park/react";
import { useTranslation } from "react-i18next";

type Props = {
  src?: string;
  title?: string;
  icon?: ComponentType<IIconProps>;
  canonicalUrl?: string;
  sandbox?: string;
  allow?: string;
  referrerPolicy?: HTMLAttributeReferrerPolicy;
};

const StyledIframe: React.FC<Props> = ({
  sandbox,
  allow,
  referrerPolicy,
  icon,
  title,
  canonicalUrl,
  src
}) => {
  const withBar = !!(icon || canonicalUrl);
  const Icon = icon;
  const { t } = useTranslation();
  return (
    <Rounded contentEditable={false}>
      <IFrame
        sandbox={
          sandbox || "allow-same-origin allow-scripts allow-popups allow-forms"
        }
        allow={allow || "fullscreen"}
        referrerPolicy={referrerPolicy}
        frameBorder="0"
        title="embed"
        loading="lazy"
        src={src}
      />
      {withBar && (
        <Bar align="center">
          {Icon && <Icon />} <span>{title}</span>
          {canonicalUrl && (
            <Open href={canonicalUrl} target="_blank" rel="noopener noreferrer">
              <Share size={18} /> {t("打开")}
            </Open>
          )}
        </Bar>
      )}
    </Rounded>
  );
};

const IFrame = styled.iframe`
  width: 100%;
  flex: 1;
`;

export default StyledIframe;

const Rounded = styled.div`
  border: 1px solid ${props => props.theme.divider};
  overflow: hidden;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Open = styled.a`
  color: ${props => props.theme.text[1]} !important;
  font-size: 13px;
  font-weight: 500;
  align-items: center;
  display: flex;
  position: absolute;
  right: 0;
  padding: 0 8px;
`;

const Bar = styled(Flex)`
  background: ${props => props.theme.background[0]};
  color: ${props => props.theme.text[1]};
  padding: 0 8px;
  height: 27px;

  border-bottom-left-radius: 3px;
  border-bottom-right-radius: 3px;
  user-select: none;

  img {
    height: 20px;
    width: 20px;
  }

  span {
    font-size: 13px;
    font-weight: 500;
    padding-left: 4px;
  }
`;
