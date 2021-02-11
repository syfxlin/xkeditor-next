import React from "react";
import { EmbedDescriptor } from "../nodes/Embed";
import StyledIframe from "../components/StyledIframe";

const Icon = () => (
  <img src="https://trello.com/favicon.ico" alt={"Trello icon"} />
);

const Trello: EmbedDescriptor = {
  title: "Trello",
  keywords: "trello board",
  icon: Icon,
  matcher: url => {
    const match = url.match(/(?:https?:\/\/)?trello\.?com\/?(.*)$/i);
    if (!match) {
      return null;
    }
    return {
      href: `https://trello.com/${match[1].replace(".html", "")}`
    };
  },
  component: ({ node }) => {
    return (
      <StyledIframe
        icon={Icon}
        title={"Trello"}
        src={node.attrs.href + ".html"}
        canonicalUrl={node.attrs.href}
      />
    );
  }
};

export default Trello;
