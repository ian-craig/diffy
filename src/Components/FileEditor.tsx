import React from "react";
import * as monaco from "monaco-editor";
import { DiffModel } from "../Utils/DiffModel";

export interface IFileEditorProps {
  width: number;
  height: number;
  diffModel: DiffModel;
  saveCallback?: () => Promise<void>;
  renderSideBySide: boolean;
  includeWhitespace: boolean;
}

export class FileEditor extends React.Component<IFileEditorProps> {
  private containerRef = React.createRef<HTMLDivElement>();
  private editor: monaco.editor.IStandaloneDiffEditor | monaco.editor.IStandaloneCodeEditor | undefined;
  private diffNavigator?: monaco.editor.IDiffNavigator;

  private baseEditorOptions(): monaco.editor.IEditorOptions {
    return {
      fontSize: 12,
      readOnly: this.props.saveCallback === undefined,
      scrollBeyondLastLine: false,
      renderWhitespace: this.props.includeWhitespace ? "all" : "none",
      //theme: 'vs-dark', //TODO Make this a settings
    };
  }

  private createModels() {
    this.disposeEditor();
    const containerElement = this.containerRef.current;
    if (containerElement === null) {
      throw new Error("Expected container to be initialized.");
    }

    if (this.props.diffModel.type === undefined) {
      return;
    }

    const options = this.baseEditorOptions();

    let editableModel: monaco.editor.ITextModel | undefined = undefined;
    if (this.props.diffModel.type === "diff") {
      const { left, right } = this.props.diffModel.diff;

      this.editor = monaco.editor.createDiffEditor(containerElement, {
        ...options,
        renderSideBySide: this.props.renderSideBySide,
        ignoreTrimWhitespace: !this.props.includeWhitespace,
      });

      editableModel = monaco.editor.createModel(right.content, undefined, monaco.Uri.file(right.path));
      this.editor.setModel({
        original: monaco.editor.createModel(left.content),
        modified: editableModel,
      });

      this.diffNavigator = monaco.editor.createDiffNavigator(this.editor, {
        followsCaret: true, // resets the navigator state when the user selects something in the editor
        ignoreCharChanges: true, // jump from line to line
      });

      // Jump to the first change if not already at it
      const changes = (this.editor as monaco.editor.IStandaloneDiffEditor).getLineChanges();
      if (changes && changes.length > 0 && changes[0].modifiedStartLineNumber > 0) {
        this.diffNavigator.next(); //TODO Preserve scroll state if it exists
      }
    } else {
      const file = this.props.diffModel.diff.left || this.props.diffModel.diff.right;
      this.editor = monaco.editor.create(containerElement, options);

      const model = monaco.editor.createModel(file.content, undefined, monaco.Uri.file(file.path));
      if (this.props.saveCallback !== undefined) {
        editableModel = model;
      }
      (this.editor as monaco.editor.IStandaloneCodeEditor).setModel(model);
    }

    if (editableModel !== undefined) {
      editableModel.onDidChangeContent(() => {
        editableModel!.getValue();
      });

      this.editor.addAction({
        id: "save",
        label: "Save File",
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S],
        run: this.saveFile,
      });
    }

    this.editor.layout({ width: this.props.width, height: this.props.height });
  }

  private readonly saveFile = (editor: monaco.editor.ICodeEditor) => {
    if (this.props.saveCallback === undefined) {
      return;
    }
    /*
    const file = this.props.file;
    const newRightFile = {
      ...(file.right as IFile),
      content: editor.getValue(),
    };
    this.props
      .saveCallback({
        left: file.left,
        right: newRightFile,
      })
      .then(() => {
        file.right = newRightFile;
      });
      */
    this.props.saveCallback();
  };

  private disposeEditor() {
    if (this.editor) {
      const model = this.editor.getModel();
      if (model && "original" in model) {
        if (model.original) {
          model.original.dispose();
        }
        if (model.modified) {
          model.modified.dispose();
        }
      } else if (model) {
        model.dispose();
      }

      this.editor.dispose();
      this.editor = undefined;
    }
    if (this.diffNavigator) {
      this.diffNavigator.dispose();
      this.diffNavigator = undefined;
    }
  }

  componentDidMount() {
    this.createModels();
  }

  componentDidUpdate(prevProps: IFileEditorProps) {
    if (
      this.props.renderSideBySide !== prevProps.renderSideBySide ||
      this.props.includeWhitespace !== prevProps.includeWhitespace ||
      this.props.diffModel !== prevProps.diffModel ||
      this.props.saveCallback !== prevProps.saveCallback
    ) {
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
