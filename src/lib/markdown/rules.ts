import MarkdownIt, {
  PluginSimple,
  PluginWithOptions,
  PluginWithParams
} from "markdown-it";
import markPlugin from "./mark";
import embedsPlugin from "./embeds";

export default function rules({
  embeds,
  plugins
}: {
  embeds: any[];
  plugins: (PluginSimple | PluginWithParams | PluginWithOptions)[];
}): MarkdownIt {
  const it = MarkdownIt("default", {
    breaks: false,
    html: false
  });
  it.use(embedsPlugin(embeds));
  it.use(markPlugin({ delim: "!!", mark: "placeholder" }));
  for (const plugin of plugins) {
    it.use(plugin);
  }
  return it;
}
