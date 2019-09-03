import React from 'react';
import { IChangeList } from '../DataStructures/IChangeList';
import { IFileCompare } from '../DataStructures/IFileCompare';
import './FileList.css';
import { IFile } from '../DataStructures/IFile';
import { FileListItem } from './FileListItem';

const List = require('react-list-select').default;

export interface IFileListProps {
    changeLists: IChangeList[];
    onFileChange: (file: IFileCompare) => void;
}

interface IState {
    selected: number[];
    items: JSX.Element[];
    disabled: number[];
}

export class FileList extends React.Component<IFileListProps, IState> {
    private itemMap = new Map<number, IFileCompare>();

    public constructor(props: IFileListProps) {
        super(props);

        this.updateList();

        this.state = {
            selected: [],
            items: [],
            disabled: [],
        };
    }

    private updateList() {
        this.itemMap.clear();
        const items: JSX.Element[] = [];
        const disabled: number[] = [];

        this.props.changeLists.forEach((cl, cIndex) => {
            disabled.push(items.length);
            items.push(<div key={`cl-${cIndex}-title`}>{cl.name}</div>);

            cl.files.forEach((f, fIndex) => {
                this.itemMap.set(items.length, f);
                items.push(<FileListItem fileCompare={f} changelist={cl} />);
            });
        });

        this.setState({
            items,
            disabled,
        });
    }

    public componentDidUpdate(oldProps: IFileListProps) {
        if (this.props.changeLists !== oldProps.changeLists) {
            this.updateList();
        }
    }

    private readonly onChange = (selectedIndex: number) => {
        const newFile = this.itemMap.get(selectedIndex);
        this.props.onFileChange(newFile as IFileCompare);
        this.setState({
            selected: [selectedIndex]
        })
    }

    public render() {
        return (
            <div style={{overflow: "hidden" }}>
                <List
                    items={this.state.items}
                    selected={this.state.selected}
                    disabled={this.state.disabled}
                    multiple={false}
                    onChange={this.onChange}
                />
            </div>
        );
    }
}