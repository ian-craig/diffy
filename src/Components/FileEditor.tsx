import React from 'react';
import * as monaco from 'monaco-editor';
import { IFileCompare } from '../DataStructures/IFileCompare';

export interface IFileEditorProps {
  width: number;
  height: number;
  file: IFileCompare | undefined;
}

export class FileEditor extends React.Component<IFileEditorProps> {
  private containerRef = React.createRef<HTMLDivElement>();
  private editor!: monaco.editor.IStandaloneDiffEditor;
  private navigator!:  monaco.editor.IDiffNavigator;

  componentDidMount() {
    const containerElement = this.containerRef.current;
    if (containerElement === null) {
      throw new Error("Expected container to be initialized.");
    }
    this.editor = monaco.editor.createDiffEditor(containerElement, {
      renderSideBySide: false
    });

    this.navigator = monaco.editor.createDiffNavigator(this.editor, {
      followsCaret: true, // resets the navigator state when the user selects something in the editor
      ignoreCharChanges: true // jump from line to line
    });

    this.editor.layout({ width: this.props.width, height: this.props.height });

    /*
    editor.onDidChangeModelContent(() => {
      editor.getValue()...
    });
    */
  }

  private updateModel() {
    let leftContent = "";
    let rightContent = "";
    if (this.props.file !== undefined) {
      leftContent = this.props.file.left.content;
      rightContent = this.props.file.right.content;
    }

    const currentModel = this.editor.getModel();
    if (currentModel && currentModel.original) {
      currentModel.original.dispose();
      currentModel.modified.dispose();
    }

    this.editor.setModel({
      original: monaco.editor.createModel(leftContent, "text/plain"),
      modified: monaco.editor.createModel(rightContent, "text/plain")
    });

    this.navigator.next();
  }

  componentDidUpdate(prevProps: IFileEditorProps) {
    if (this.props.file !== undefined && this.props.file !== prevProps.file) {
      this.updateModel();
    }

    /*
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
      this.navigator.dispose();
    }
  }

  render() {
    return (
      <div ref={this.containerRef} />
    );
  }
}
