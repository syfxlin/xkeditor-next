import React from "react";
import { EmbedDescriptor } from "../nodes/Embed";
import styled from "styled-components";

const DrawIO: EmbedDescriptor = {
  title: "Draw.io",
  keywords: "draw.io diagrams",
  icon: () => (
    <img
      src="https://app.diagrams.net/favicon.ico"
      alt={"Draw.io icon"}
      width={24}
      height={24}
    />
  ),
  matcher: url => {
    const match = url.match(
      /(?:https?:\/\/)?(?:app|viewer)\.diagrams\.?net\/?(.*)$/i
    );
    if (!match) {
      return null;
    }
    return {
      href: `https://viewer.diagrams.net/${match[1].substring(
        match[1].lastIndexOf("#")
      )}`
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
  height: 400px;
`;

export default DrawIO;
