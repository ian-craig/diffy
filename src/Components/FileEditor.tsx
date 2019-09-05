import React from 'react';
import * as monaco from 'monaco-editor';
import { IDiff, IEditDiff } from '../DataStructures/IDiff';

export const isFileDiff = (fileCompare: IDiff | undefined): fileCompare is IEditDiff => {
  return fileCompare !== undefined && fileCompare.left !== undefined && fileCompare.right !== undefined;
};

export interface IFileEditorProps {
  width: number;
  height: number;
  file: IDiff | undefined;
  renderSideBySide: boolean;
}

export class FileEditor extends React.Component<IFileEditorProps> {
  private containerRef = React.createRef<HTMLDivElement>();
  private editor!: monaco.editor.IStandaloneDiffEditor | monaco.editor.IStandaloneCodeEditor;
  private diffNavigator?:  monaco.editor.IDiffNavigator;

  private createModels() {
    this.disposeEditor();

    if (this.props.file === undefined) {
      return;
    }

    const containerElement = this.containerRef.current;
    if (containerElement === null) {
      throw new Error("Expected container to be initialized.");
    }

    if (isFileDiff(this.props.file)) {
      this.editor = monaco.editor.createDiffEditor(containerElement, {
        renderSideBySide: this.props.renderSideBySide
      });
  
      this.diffNavigator = monaco.editor.createDiffNavigator(this.editor, {
        followsCaret: true, // resets the navigator state when the user selects something in the editor
        ignoreCharChanges: true // jump from line to line
      });

    } else {
      this.editor = monaco.editor.create(containerElement);
    }
   
    this.updateModel();

    this.editor.layout({ width: this.props.width, height: this.props.height });

    /*
    editor.onDidChangeModelContent(() => {
      editor.getValue()...
    });
    */
  }

  private disposeEditor() {
    if (this.editor) {
      this.disposeModels();
      this.editor.dispose();
      if (this.diffNavigator) {
        this.diffNavigator.dispose();
        this.diffNavigator = undefined;
      }
    }
  }

  private disposeModels() {
    if (this.editor) {
      const model = this.editor.getModel();
      if (model && 'original' in model) {
        if (model.original) {
        model.original.dispose();
        }
        if (model.modified) {
          model.modified.dispose();
        }
      } else if (model) {
        model.dispose();
      }
    }
  }

  componentDidMount() {
    this.createModels()
  }

  private updateModel() {
    this.disposeModels();
    if (this.props.file === undefined) {
      return;
    }

    if (this.props.file.left !== undefined && this.props.file.right !== undefined) {
      (this.editor as monaco.editor.IStandaloneDiffEditor).setModel({
        original: monaco.editor.createModel(this.props.file.left.content, "text/plain"),
        modified: monaco.editor.createModel(this.props.file.right.content, "text/plain")
      });
    } else {
      const file = this.props.file.left || this.props.file.right;
      (this.editor as monaco.editor.IStandaloneCodeEditor).setModel(
        monaco.editor.createModel(file.content, "text/plain")
      );
    }

    if (this.diffNavigator) {
      // Jump to the first change if not already at it
      const changes = (this.editor as monaco.editor.IStandaloneDiffEditor).getLineChanges();
      if (changes && changes.length > 0 && changes[0].modifiedStartLineNumber > 0) {
        this.diffNavigator.next();
      }
    }
  }

  componentDidUpdate(prevProps: IFileEditorProps) {
    if (this.props.renderSideBySide !== prevProps.renderSideBySide || this.props.file !== prevProps.file) {
      this.createModels();
      return;
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
    this.disposeEditor();
  }

  render() {
    return <div ref={this.containerRef} />;
  }
}
