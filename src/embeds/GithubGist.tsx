import React from "react";
import { EmbedDescriptor } from "../nodes/Embed";
import styled from "styled-components";

const GithubGist: EmbedDescriptor = {
  title: "Github Gist",
  keywords: "github gist",
  icon: () => (
    <img
      src="https://github.com/favicon.ico"
      alt={"Github icon"}
      width={24}
      height={24}
    />
  ),
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

export default GithubGist;
