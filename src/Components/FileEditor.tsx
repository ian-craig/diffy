import React from 'react';
import * as monaco from 'monaco-editor';

export interface IFileEditorProps {
  width: number;
  height: number;
  codeLeft: string;
  codeRight: string;
}

export class FileEditor extends React.Component<IFileEditorProps> {
  private containerRef = React.createRef<HTMLDivElement>();
  private editor?: monaco.editor.IStandaloneDiffEditor;

  componentDidMount() {
    var originalModel = monaco.editor.createModel(this.props.codeLeft, "text/plain");
    var modifiedModel = monaco.editor.createModel(this.props.codeRight, "text/plain");

    const containerElement = this.containerRef.current;
    if (containerElement === null) {
      throw new Error("Expected container to be initialized.");
    }
    this.editor = monaco.editor.createDiffEditor(containerElement, {
      renderSideBySide: false
    });
    this.editor.setModel({
      original: originalModel,
      modified: modifiedModel
    });

    this.editor.layout({ width: this.props.width, height: this.props.height });

    /*
    editor.onDidChangeModelContent(() => {
      editor.getValue()...
    });
    */
  }

  componentDidUpdate(prevProps: IFileEditorProps) {
    /*
    const model = this.editor.getModel();

    if (this.props.value != null && this.props.value !== model.getValue()) {
      this.__prevent_trigger_change_event = true;
      this.editor.pushUndoStop();
      model.pushEditOperations(
        [],
        [
          {
            range: model.getFullModelRange(),
            text: this.props.value
          }
        ]
      );
      this.editor.pushUndoStop();
      this.__prevent_trigger_change_event = false;
    }
    if (prevProps.language !== this.props.language) {
      monaco.editor.setModelLanguage(model, this.props.language);
    }
    */

    if (this.editor && (this.props.width !== prevProps.width || this.props.height !== prevProps.height)) {
      this.editor.layout({ width: this.props.width, height: this.props.height });
    }
  }

  componentWillUnmount() {
    if (this.editor) {
      const model = this.editor.getModel();
      if (model) {
        model.original.dispose();
        model.modified.dispose();
      }
      this.editor.dispose();
    }
  }

  render() {
    return (
      <div ref={this.containerRef} />
    );
  }
}
