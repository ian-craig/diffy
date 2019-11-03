import React from "react";
import * as monaco from "monaco-editor";
import { DiffModel, EditableDiffModel } from "../Utils/DiffModel";

export interface IFileEditorProps {
  width: number;
  height: number;
  diffModel: DiffModel;
  saveCallback?: () => void;
  renderSideBySide: boolean;
  showWhitespace: boolean;
  editDiff?: (id: string, content: string) => void;
}

const updateTextModelIfDifferent = (model: monaco.editor.ITextModel, newContent: string) => {
  if (newContent !== model.getValue()) {
    model.setValue(newContent);
  }
};

export class FileEditor extends React.Component<IFileEditorProps> {
  private containerRef = React.createRef<HTMLDivElement>();
  private editor: monaco.editor.IStandaloneDiffEditor | monaco.editor.IStandaloneCodeEditor | undefined;
  private diffNavigator?: monaco.editor.IDiffNavigator;

  private baseEditorOptions(): monaco.editor.IEditorOptions {
    return {
      fontSize: 12,
      readOnly: this.props.saveCallback === undefined,
      scrollBeyondLastLine: false,
      renderWhitespace: this.props.showWhitespace ? "all" : "none",
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
        ignoreTrimWhitespace: !this.props.showWhitespace,
      });

      const rightContent = this.props.diffModel.unsavedContent ? this.props.diffModel.unsavedContent : right.content;
      editableModel = monaco.editor.createModel(rightContent, undefined, monaco.Uri.file(right.path));
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
      let fileContent;
      let filePath;
      if (this.props.diffModel.type === "add") {
        fileContent = this.props.diffModel.unsavedContent || this.props.diffModel.diff.right.content;
        filePath = this.props.diffModel.diff.right.path;
      } else {
        fileContent = this.props.diffModel.diff.left.content;
        filePath = this.props.diffModel.diff.left.path;
      }
      this.editor = monaco.editor.create(containerElement, options);

      const model = monaco.editor.createModel(fileContent, undefined, monaco.Uri.file(filePath));
      if (this.props.saveCallback !== undefined) {
        editableModel = model;
      }
      (this.editor as monaco.editor.IStandaloneCodeEditor).setModel(model);
    }

    const editDiffCallback = this.props.editDiff;
    if (editableModel !== undefined && editDiffCallback) {
      editableModel.onDidChangeContent(() => {
        editDiffCallback(this.props.diffModel.id, editableModel!.getValue());
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
      this.props.showWhitespace !== prevProps.showWhitespace ||
      this.props.diffModel.id !== prevProps.diffModel.id ||
      this.props.diffModel.type !== prevProps.diffModel.type ||
      !!this.props.saveCallback !== !!prevProps.saveCallback
    ) {
      this.createModels();
      return;
    }

    const model = this.editor && this.editor.getModel();
    if (model && (this.props.diffModel as EditableDiffModel).diff !== (prevProps.diffModel as EditableDiffModel).diff) {
      if (this.props.diffModel.type == "diff") {
        const diffModel = model as monaco.editor.IDiffEditorModel;
        updateTextModelIfDifferent(diffModel.original, this.props.diffModel.diff.left.content);
        updateTextModelIfDifferent(
          diffModel.modified,
          this.props.diffModel.unsavedContent || this.props.diffModel.diff.right.content,
        );
      } else if (this.props.diffModel.type == "add") {
        const diffModel = model as monaco.editor.ITextModel;
        updateTextModelIfDifferent(
          diffModel,
          this.props.diffModel.unsavedContent || this.props.diffModel.diff.right.content,
        );
      } else if (this.props.diffModel.type == "delete") {
        const diffModel = model as monaco.editor.ITextModel;
        diffModel.setValue(this.props.diffModel.diff.left.content);
      }
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
