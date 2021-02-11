import React from "react";
import { EmbedDescriptor } from "../nodes/Embed";
import styled from "styled-components";

const CodeSandbox: EmbedDescriptor = {
  title: "CodeSandbox",
  keywords: "codesandbox",
  icon: () => (
    <img
      src="https://codesandbox.io/favicon.ico"
      alt={"CodeSandbox icon"}
      width={24}
      height={24}
    />
  ),
  matcher: url => {
    const match = url.match(/(?:https?:\/\/)?codesandbox\.?io\/?(.*)$/i);
    if (!match) {
      return null;
    }
    return {
      href: `https://codesandbox.io/${match[1].replace("/s/", "/embed/")}`
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
        allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
        sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
      />
    );
  }
};

const StyledIframe = styled.iframe`
  width: 100%;
  height: 100%;
`;

export default CodeSandbox;
