import React from "react";
import { EmbedDescriptor } from "../nodes/Embed";
import StyledIframe from "../components/StyledIframe";

const Airtable: EmbedDescriptor = {
  title: "Airtable",
  keywords: "airtable",
  icon: () => (
    <img src="https://airtable.com/favicon.ico" alt={"Airtable icon"} />
  ),
  matcher: url => {
    const match = url.match(
      /(?:https?:\/\/)?airtable.com\/(?:embed\/)?(shr.*)$/i
    );
    if (!match) {
      return null;
    }
    return {
      href: `https://airtable.com/embed/${match[1]}`
    };
  },
  component: ({ node }) => {
    return <StyledIframe src={node.attrs.href} />;
  }
};

export default Airtable;
