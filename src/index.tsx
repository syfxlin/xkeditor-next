import React from "react";
import debounce from "lodash/debounce";
import { Editor } from "./main";
import { ComponentProps } from "./lib/ComponentView";
import ReactDOM from "react-dom";
import StyledIframe from "./components/StyledIframe";

const element = document.getElementById("root");
const savedText = localStorage.getItem("saved");
const defaultValue = (savedText ? JSON.parse(savedText) : undefined) || {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 1 },
      content: [{ type: "text", text: "Welcome" }]
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text:
            "This is example content. It is persisted between reloads in localStorage."
        }
      ]
    }
  ]
};

const YoutubeEmbed: React.FC<ComponentProps> = ({ node }) => (
  <StyledIframe
    src={`https://www.youtube.com/embed/${node.attrs.matches[1]}?modestbranding=1`}
  />
);

class Example extends React.Component {
  state = {
    readOnly: false,
    dark: localStorage.getItem("dark") === "enabled",
    value: defaultValue
  };

  handleToggleReadOnly = () => {
    this.setState({ readOnly: !this.state.readOnly });
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

  handleChange = debounce((editor: Editor) => {
    const json = editor.json();
    console.log(json);
    localStorage.setItem("saved", JSON.stringify(json));
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
          <button type="button" onClick={this.handleUpdateValue}>
            Update value
          </button>
        </div>
        <br />
        <br />
        <Editor
          value={this.state.value}
          onChange={this.handleChange}
          editable={!this.state.readOnly}
          dark={this.state.dark}
          autofocus={true}
          scrollTo={window.location.hash}
          embeds={[
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
              matcher: (url: string) => {
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
          ]}
          handleDOMEvents={{
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
          }}
          handleSave={done => console.log("Save triggered", done)}
          handleCancel={() => console.log("Cancel triggered")}
          onClickLink={(href, event) => {
            console.log("Clicked link: ", href, event);
            window.open(href, "_blank");
          }}
          onHoverLink={event => {
            console.log(
              "Hovered link: ",
              (event.target as HTMLAnchorElement).href
            );
            return false;
          }}
          onClickTag={(tag, event) =>
            console.log("Clicked hashtag: ", tag, event)
          }
          handleUpload={fs => {
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
          }}
        />
      </div>
    );
  }
}

if (element) {
  ReactDOM.render(<Example />, element);
}
