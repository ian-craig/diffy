import React from 'react';
import { IChangeList } from '../DataStructures/IChangeList';
import { IFileCompare } from '../DataStructures/IFileCompare';
import { FileList } from './FileList';
import { CommandBar } from 'office-ui-fabric-react/lib/CommandBar';

export interface IChangeListPaneProps {
    changeLists: IChangeList[];
    onFileChange: (file: IFileCompare) => void;
    refresh: () => void;
}

export class ChangeListPane extends React.Component<IChangeListPaneProps> {

    private getFarItems() {
        return [
          {
            key: 'refresh',
            ariaLabel: 'Refresh Changes',
            iconProps: {
              iconName: 'Refresh',
            },
            onClick: this.props.refresh,
          },
        ];
      };

    public render() {
        return (
            <>
                <CommandBar
                    items={[]}
                    farItems={this.getFarItems()}
                />
                <FileList changeLists={this.props.changeLists} onFileChange={this.props.onFileChange} />
            </>
        );
    }
}