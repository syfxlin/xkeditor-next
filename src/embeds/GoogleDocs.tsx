import React from "react";
import { EmbedDescriptor } from "../nodes/Embed";
import StyledIframe from "../components/StyledIframe";

const Icon = () => (
  <img
    src="https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico"
    alt={"Google docs icon"}
  />
);

const GoogleDocs: EmbedDescriptor = {
  title: "Google Docs",
  keywords: "google office",
  icon: Icon,
  matcher: url => {
    const match = url.match(/(?:https?:\/\/)?docs\.google\.com\/?(.*)$/i);
    if (!match) {
      return null;
    }
    return {
      href: `https://docs.google.com/${match[1]}`
    };
  },
  component: ({ node }) => {
    return (
      <StyledIframe
        icon={Icon}
        title={"Google Docs"}
        src={node.attrs.href.replace("/edit", "/preview")}
        canonicalUrl={node.attrs.href}
      />
    );
  }
};

export default GoogleDocs;
