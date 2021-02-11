import React from "react";
import { EmbedDescriptor } from "../nodes/Embed";
import styled from "styled-components";

const CodePen: EmbedDescriptor = {
  title: "CodePen",
  keywords: "codepen",
  icon: () => (
    <img
      src="https://codepen.io/favicon.ico"
      alt={"CodePen icon"}
      width={24}
      height={24}
    />
  ),
  matcher: url => {
    const match = url.match(/(?:https?:\/\/)?codepen\.?io\/?(.*)$/i);
    if (!match) {
      return null;
    }
    return {
      href: `https://codepen.io/${match[1].replace("/pen/", "/embed/")}`
    };
  },
  component: ({ node }) => {
    return (
      <StyledIframe
        scrolling="no"
        src={node.attrs.href}
        frameBorder="no"
        loading="lazy"
        allowTransparency={true}
        allowFullScreen={true}
      />
    );
  }
};

const StyledIframe = styled.iframe`
  width: 100%;
  height: 100%;
`;

export default CodePen;
