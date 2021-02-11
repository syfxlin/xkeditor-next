import React from "react";
import { EmbedDescriptor } from "../nodes/Embed";
import StyledIframe from "../components/StyledIframe";

const CodeSandbox: EmbedDescriptor = {
  title: "CodeSandbox",
  keywords: "codesandbox",
  icon: () => (
    <img src="https://codesandbox.io/favicon.ico" alt={"CodeSandbox icon"} />
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
        src={node.attrs.href}
        allow="fullscreen; accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
        sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
      />
    );
  }
};

export default CodeSandbox;
