import React from "react";
import debounce from "lodash/debounce";
import Editor from "./main";
import { ComponentProps } from "./lib/ComponentView";
import ReactDOM from "react-dom";

const element = document.getElementById("root");
const savedText = localStorage.getItem("saved");
const exampleText = `
# Welcome

This is example content. It is persisted between reloads in localStorage.
`;
const defaultValue = savedText || exampleText;

const docSearchResults = [
  {
    title: "Hiring",
    subtitle: "Created by Jane",
    url: "/doc/hiring"
  },
  {
    title: "Product Roadmap",
    subtitle: "Created by Tom",
    url: "/doc/product-roadmap"
  },
  {
    title: "Finances",
    subtitle: "Created by Coley",
    url: "/doc/finances"
  },
  {
    title: "Security",
    subtitle: "Created by Coley",
    url: "/doc/security"
  },
  {
    title: "Super secret stuff",
    subtitle: "Created by Coley",
    url: "/doc/secret-stuff"
  },
  {
    title: "Supero notes",
    subtitle: "Created by Vanessa",
    url: "/doc/supero-notes"
  },
  {
    title: "Meeting notes",
    subtitle: "Created by Rob",
    url: "/doc/meeting-notes"
  }
];

const YoutubeEmbed: React.FC<ComponentProps> = ({ isSelected, node }) => (
  <iframe
    className={isSelected ? "ProseMirror-selectednode" : ""}
    src={`https://www.youtube.com/embed/${node.attrs.matches[1]}?modestbranding=1`}
  />
);

class Example extends React.Component {
  state = {
    readOnly: false,
    template: false,
    dark: localStorage.getItem("dark") === "enabled",
    value: undefined
  };

  handleToggleReadOnly = () => {
    this.setState({ readOnly: !this.state.readOnly });
  };

  handleToggleTemplate = () => {
    this.setState({ template: !this.state.template });
  };

  handleToggleDark = () => {
    const dark = !this.state.dark;
    this.setState({ dark });
    localStorage.setItem("dark", dark ? "enabled" : "disabled");
  };

  handleUpdateValue = () => {
    const existing = localStorage.getItem("saved") || "";
    const value = `${existing}\n\nedit!`;
    localStorage.setItem("saved", value);

    this.setState({ value });
  };

  handleChange = debounce(value => {
    const text = value();
    console.log(text);
    localStorage.setItem("saved", text);
  }, 250);

  render() {
    const { body } = document;
    if (body) {
      body.style.backgroundColor = this.state.dark ? "#181A1B" : "#FFF";
    }

    return (
      <div style={{ width: "80vw", margin: "auto" }}>
        <div>
          <br />
          <button type="button" onClick={this.handleToggleReadOnly}>
            {this.state.readOnly ? "Switch to Editable" : "Switch to Read-only"}
          </button>{" "}
          <button type="button" onClick={this.handleToggleDark}>
            {this.state.dark ? "Switch to Light" : "Switch to Dark"}
          </button>{" "}
          <button type="button" onClick={this.handleToggleTemplate}>
            {this.state.template ? "Switch to Document" : "Switch to Template"}
          </button>{" "}
          <button type="button" onClick={this.handleUpdateValue}>
            Update value
          </button>
        </div>
        <br />
        <br />
        <Editor
          value={this.state.value}
          onChange={this.handleChange}
          readOnly={this.state.readOnly}
          dark={this.state.dark}
          config={{
            id: "example",
            defaultValue,
            autoFocus: true,
            scrollTo: window.location.hash,
            embeds: [
              {
                title: "YouTube",
                keywords: "youtube video tube google",
                icon: () => (
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/7/75/YouTube_social_white_squircle_%282017%29.svg"
                    width={24}
                    height={24}
                  />
                ),
                matcher: url => {
                  const match = url.match(
                    /(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([a-zA-Z0-9_-]{11})$/i
                  );
                  if (match) {
                    return {
                      href: url,
                      matches: match
                    };
                  }
                  return null;
                },
                component: YoutubeEmbed
              }
            ]
          }}
          action={{
            handleDOMEvents: {
              focus: () => {
                console.log("FOCUS");
                return false;
              },
              blur: () => {
                console.log("BLUR");
                return false;
              },
              paste: () => {
                console.log("PASTE");
                return false;
              },
              touchstart: () => {
                console.log("TOUCH START");
                return false;
              }
            },
            save: options => console.log("Save triggered", options),
            cancel: () => console.log("Cancel triggered"),
            onClickLink: (href, event) => {
              console.log("Clicked link: ", href, event);
              window.open(href, "_blank");
            },
            onHoverLink: event => {
              console.log(
                "Hovered link: ",
                (event.target as HTMLAnchorElement).href
              );
              return false;
            },
            onClickHashtag: (tag, event) =>
              console.log("Clicked hashtag: ", tag, event),
            upload: fs => {
              console.log("File upload triggered: ", fs);

              // Delay to simulate time taken to upload
              return new Promise(resolve => {
                setTimeout(
                  () =>
                    resolve({
                      error: false,
                      message: "OK",
                      code: 200,
                      data: [
                        {
                          extname: "png",
                          filename: "123",
                          key: "123",
                          md5: "123",
                          size: 123,
                          url: "https://picsum.photos/600/600"
                        }
                      ]
                    }),
                  1500
                );
              });
            }
          }}
        />
      </div>
    );
  }
}

if (element) {
  ReactDOM.render(<Example />, element);
}
