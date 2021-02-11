import React from "react";
import { EmbedDescriptor } from "../nodes/Embed";
import StyledIframe from "../components/StyledIframe";

const GithubGist: EmbedDescriptor = {
  title: "Github Gist",
  keywords: "github gist",
  icon: () => <img src="https://github.com/favicon.ico" alt={"Github icon"} />,
  matcher: url => {
    const match = url.match(/(?:https?:\/\/)?gist\.github\.?com\/?(.*)$/i);
    if (!match) {
      return null;
    }
    return {
      href: `https://gist.github.com/${match[1]}`
    };
  },
  component: ({ node }) => {
    return (
      <StyledIframe
        src={`
          data:text/html;charset=utf-8,
          <head><base target='_blank' /></head>
          <body>
            <script src="${node.attrs.href}.js"></script>
          </body>
        `}
      />
    );
  }
};

export default GithubGist;
