import React from "react";
import { EmbedDescriptor } from "../nodes/Embed";
import StyledIframe from "../components/StyledIframe";

const Icon = () => (
  <img src="https://app.diagrams.net/favicon.ico" alt={"Draw.io icon"} />
);

const DrawIO: EmbedDescriptor = {
  title: "Draw.io",
  keywords: "draw.io diagrams",
  icon: Icon,
  matcher: url => {
    const match = url.match(
      /(?:https?:\/\/)?(?:app|viewer)\.diagrams\.?net\/?(.*)$/i
    );
    if (!match) {
      return null;
    }
    return {
      href: `https://app.diagrams.net/${match[1].substring(
        match[1].lastIndexOf("#")
      )}`
    };
  },
  component: ({ node }) => {
    return (
      <StyledIframe
        icon={Icon}
        title={"Draw.io"}
        src={node.attrs.href.replace("app.", "viewer.")}
        canonicalUrl={node.attrs.href}
      />
    );
  }
};

export default DrawIO;
