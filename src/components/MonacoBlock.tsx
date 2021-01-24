import * as React from "react";
import { RefObject } from "react";
import { editor } from "monaco-editor";

type Props = {
  width?: string | number;
  height?: string | number;
  value: string;
  defaultValue?: string;
  language?: string;
  theme?: string;
  options?: editor.IStandaloneEditorConstructionOptions;
  onMount?: (editor: editor.IStandaloneCodeEditor) => void;
  onChange?: (value: string, event: editor.IModelContentChangedEvent) => void;
  className?: string;
};

export default class MonacoBlock extends React.Component<Props> {
  editorRef: RefObject<HTMLDivElement>;
  editor?: editor.IStandaloneCodeEditor;
  currentValue?: string;

  constructor(props: Props) {
    super(props);
    this.editorRef = React.createRef();
  }

  componentDidMount() {
    const value =
      this.props.value !== null ? this.props.value : this.props.defaultValue;
    const { language, theme, options } = this.props;
    if (this.editorRef.current) {
      this.editor = editor.create(this.editorRef.current, {
        value,
        language: language || "javascript",
        theme: theme || "vs",
        ...options
      });
      this.editor.onDidChangeModelContent(e => {
        const value = this.editor?.getValue();
        this.currentValue = value;
        this.props.onChange?.(value || "", e);
      });
      this.props.onMount?.(this.editor);
    }
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    if (this.props.value !== this.currentValue) {
      this.currentValue = this.props.value;
      if (this.editor) {
        this.editor.setValue(this.currentValue);
      }
    }
    if (this.editor && prevProps.language !== this.props.language) {
      editor.setModelLanguage(
        this.editor.getModel() as editor.ITextModel,
        this.props.language || "javascript"
      );
    }
    if (prevProps.theme !== this.props.theme) {
      editor.setTheme(this.props.theme || "vs");
    }
    if (
      this.editor &&
      (this.props.width !== prevProps.width ||
        this.props.height !== prevProps.height)
    ) {
      this.editor.layout();
    }
  }

  render() {
    const { width, height, className } = this.props;
    return (
      <div
        className={className}
        ref={this.editorRef}
        style={{ width, height }}
      />
    );
  }
}
