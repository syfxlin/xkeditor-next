import React from "react";
import { EmbedDescriptor } from "../nodes/Embed";
import StyledIframe from "../components/StyledIframe";

const CodePen: EmbedDescriptor = {
  title: "CodePen",
  keywords: "codepen",
  icon: () => <img src="https://codepen.io/favicon.ico" alt={"CodePen icon"} />,
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
    return <StyledIframe src={node.attrs.href} />;
  }
};

export default CodePen;
