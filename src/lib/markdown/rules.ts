import MarkdownIt, {
  PluginSimple,
  PluginWithOptions,
  PluginWithParams
} from "markdown-it";
import embedsPlugin from "./embeds";
// @ts-ignore
import markdownItDirective from "markdown-it-directive";

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
  it.disable("code");
  it.use(markdownItDirective);
  it.use(embedsPlugin(embeds));
  // it.use(markPlugin({ delim: "!!", mark: "placeholder" }));
  for (const plugin of plugins) {
    it.use(plugin);
  }
  return it;
}
