import React from "react";
import { EmbedDescriptor } from "../nodes/Embed";
import styled from "styled-components";

const Trello: EmbedDescriptor = {
  title: "Trello",
  keywords: "trello board",
  icon: () => (
    <img
      src="https://trello.com/favicon.ico"
      alt={"Trello icon"}
      width={24}
      height={24}
    />
  ),
  matcher: url => {
    const match = url.match(/(?:https?:\/\/)?trello\.?com\/?(.*)$/i);
    if (!match) {
      return null;
    }
    return {
      href: `https://trello.com/${
        match[1].endsWith(".html") ? match[1] : match[1] + ".html"
      }`
    };
  },
  component: ({ node }) => {
    return (
      <StyledIframe
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
  height: 400px;
`;

export default Trello;
