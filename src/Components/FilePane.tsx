import React from 'react';
import { IFileCompare } from '../DataStructures/IFileCompare';
import { ICommandBarItemProps, CommandBar } from 'office-ui-fabric-react/lib/CommandBar';
import { isFileDiff, FileEditor } from './FileEditor';

export interface IFilePaneProps {
  width: number;
  height: number;
  file: IFileCompare | undefined;
}

interface IState {
  renderSideBySide: boolean;
}

export class FilePane extends React.Component<IFilePaneProps, IState> {

  constructor(props: IFilePaneProps) {
    super(props);

    this.state = {
      renderSideBySide: false, //TODO Persist settings in some store?
    }
  }

  private getFarItems(): ICommandBarItemProps[] {
    const isDiff = isFileDiff(this.props.file);
    return [
      {
        key: 'renderSideBySide',
        name: this.state.renderSideBySide ? 'Inline Diff' : 'Side-By-Side Diff',
        ariaLabel: 'Diff Layout',
        iconProps: {
          iconName: this.state.renderSideBySide ? 'DiffInline' : 'DiffSideBySide',
        },
        disabled: !isDiff,
        onClick: () => {
          this.setState({ renderSideBySide: !this.state.renderSideBySide });
          //TODO this doesn't update the component. Need
        }
      },
    ];
  };

  render() {
    console.log("Render FilePane", this.state.renderSideBySide);

    
    return (
      <>
        <CommandBar items={[]} farItems={this.getFarItems()} />
        <FileEditor file={this.props.file} width={this.props.width} height={this.props.height - 31} renderSideBySide={this.state.renderSideBySide} />
      </>
    );
  }
}
