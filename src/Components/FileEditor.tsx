import React from 'react';
import * as monaco from 'monaco-editor';
import { IFileCompare } from '../DataStructures/IFileCompare';
import { CommandBar } from 'office-ui-fabric-react/lib/CommandBar';

export interface IFileEditorProps {
  width: number;
  height: number;
  file: IFileCompare | undefined;
}

interface IState {
  renderSideBySide: boolean;
}

export class FileEditor extends React.Component<IFileEditorProps, IState> {
  private containerRef = React.createRef<HTMLDivElement>();
  private editor!: monaco.editor.IStandaloneDiffEditor;
  private navigator!:  monaco.editor.IDiffNavigator;

  constructor(props: IFileEditorProps) {
    super(props);

    this.state = {
      renderSideBySide: false, //TODO Persist settings in some store?
    }
  }

  componentDidMount() {
    const containerElement = this.containerRef.current;
    if (containerElement === null) {
      throw new Error("Expected container to be initialized.");
    }
    this.editor = monaco.editor.createDiffEditor(containerElement, {
      renderSideBySide: this.state.renderSideBySide
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
      leftContent = this.props.file.left === undefined ? "" : this.props.file.left.content;
      rightContent = this.props.file.right === undefined ? "" : this.props.file.right.content;
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
      if (model && model.original) {
        model.original.dispose();
        model.modified.dispose();
      }
      this.editor.dispose();
      this.navigator.dispose();
    }
  }

  private getFarItems() {
    return [
      {
        key: 'renderSideBySide',
        name: this.state.renderSideBySide ? 'Inline Diff' : 'Side-By-Side Diff',
        ariaLabel: 'Diff Layout',
        iconProps: {
          iconName: this.state.renderSideBySide ? 'DiffInline' : 'DiffSideBySide',
        },
        onClick: () => {
          this.setState({ renderSideBySide: !this.state.renderSideBySide });
          //TODO this doesn't update the component. Need
        }
      },
    ];
  };

  render() {
    return (
      <>
        <CommandBar
            items={[]}
            farItems={this.getFarItems()}
          />
        <div ref={this.containerRef} />
      </>
    );
  }
}
