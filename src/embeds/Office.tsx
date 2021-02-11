import React from "react";
import { EmbedDescriptor } from "../nodes/Embed";
import StyledIframe from "../components/StyledIframe";

const Office: EmbedDescriptor = {
  title: "Office",
  keywords: "office microsoft",
  icon: () => (
    <img
      src="https://c1-word-view-15.cdn.office.net/wv/resources/1033/FavIcon_Word.ico"
      alt={"Office icon"}
    />
  ),
  matcher: url => {
    const match = url.match(
      /(?:https?:\/\/)?onedrive\.live\.com\/embed\/?(.*)$/i
    );
    if (!match) {
      return null;
    }
    return {
      href: `https://onedrive.live.com/embed/${match[1]}`
    };
  },
  component: ({ node }) => {
    return <StyledIframe src={node.attrs.href} />;
  }
};

export default Office;
