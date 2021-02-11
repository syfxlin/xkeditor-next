import React from "react";
import { EmbedDescriptor } from "../nodes/Embed";
import StyledIframe from "../components/StyledIframe";
import { Browser } from "@icon-park/react";

const IFrame: EmbedDescriptor = {
  title: "IFrame",
  keywords: "iframe embed",
  icon: Browser,
  matcher: href => ({ href }),
  component: ({ node }) => {
    return (
      <StyledIframe
        icon={Browser}
        src={node.attrs.href}
        canonicalUrl={node.attrs.href}
      />
    );
  }
};

export default IFrame;
