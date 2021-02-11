import React from "react";
import { EmbedDescriptor } from "../nodes/Embed";
import StyledIframe from "../components/StyledIframe";

const Icon = () => (
  <img
    src="https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png"
    alt={"Google drive icon"}
  />
);

const GoogleDrive: EmbedDescriptor = {
  title: "Google Drive",
  keywords: "google drive",
  icon: Icon,
  matcher: url => {
    const match = url.match(
      /(?:https?:\/\/)?drive\.google\.com\/file\/d\/(.*)\/(preview|view).?usp=sharing$/i
    );
    if (!match) {
      return null;
    }
    return {
      href: `https://drive.google.com/file/d/${match[1]}/view?usp=sharing`
    };
  },
  component: ({ node }) => {
    return (
      <StyledIframe
        icon={Icon}
        title={"Google Drive"}
        src={node.attrs.href.replace("/view", "/preview")}
        canonicalUrl={node.attrs.href}
      />
    );
  }
};

export default GoogleDrive;
