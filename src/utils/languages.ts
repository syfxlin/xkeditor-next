export const languages = {
  abap: { label: "ABAP" },
  apex: { label: "Apex" },
  bat: { label: "Batch", prism: "batch" },
  clojure: { label: "Clojure" },
  coffee: { label: "CoffeeScript" },
  cpp: { label: "C++" },
  csharp: { label: "C#" },
  css: { label: "CSS" },
  dart: { label: "Dart" },
  dockerfile: { label: "Dockerfile" },
  fsharp: { label: "F#" },
  go: { label: "Go" },
  graphql: { label: "GraphQL" },
  handlebars: { label: "Handlebars" },
  hcl: { label: "HCL" },
  html: { label: "HTML" },
  ini: { label: "Ini" },
  java: { label: "Java" },
  javascript: { label: "JavaScript" },
  json: { label: "JSON" },
  julia: { label: "Julia" },
  kotlin: { label: "Kotlin" },
  less: { label: "Less" },
  lua: { label: "Lua" },
  markdown: { label: "Markdown" },
  mysql: { label: "MySQL", prism: "sql" },
  "objective-c": { label: "Objective-C", prism: "objectivec" },
  pascal: { label: "Pascal" },
  pascaligo: { label: "Pascaligo" },
  perl: { label: "Perl" },
  pgsql: { label: "PostgreSQL", prism: "sql" },
  php: { label: "PHP" },
  powerquery: { label: "PowerQuery" },
  powershell: { label: "PowerShell" },
  pug: { label: "Pug" },
  python: { label: "Python" },
  r: { label: "R" },
  restructuredtext: { label: "reStructuredText", prism: "rest" },
  ruby: { label: "Ruby" },
  rust: { label: "Rust" },
  scala: { label: "Scala" },
  scheme: { label: "Scheme" },
  scss: { label: "Scss" },
  shell: { label: "Shell" },
  solidity: { label: "Solidity" },
  sql: { label: "SQL" },
  swift: { label: "Swift" },
  tcl: { label: "Tcl" },
  twig: { label: "Twig" },
  typescript: { label: "TypeScript" },
  vb: { label: "Visual Basic" },
  xml: { label: "XML" },
  yaml: { label: "Yaml" }
};

export function convertToPrism(lang: string) {
  // @ts-ignore
  if (languages[lang]) {
    // @ts-ignore
    if (languages[lang].prism) {
      // @ts-ignore
      return languages[lang].prism;
    }
    return lang;
  }
  return "markup";
}
