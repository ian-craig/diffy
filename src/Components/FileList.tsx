import React from 'react';
import { IChangeList } from '../DataStructures/IChangeList';
import { IFileCompare } from '../DataStructures/IFileCompare';
import './FileList.css';

const List = require('react-list-select').default;

export interface IFileListProps {
    changeLists: IChangeList[];
    onFileChange: (file: IFileCompare) => void;
}

interface IState {
    selected: number[];
}

export class FileList extends React.Component<IFileListProps, IState> {
    private items: JSX.Element[] = [];
    private disabled: number[] = [];
    private itemMap = new Map<number, IFileCompare>();

    public constructor(props: IFileListProps) {
        super(props);

        this.props.changeLists.forEach((cl, cIndex) => {
            this.disabled.push(this.items.length);
            this.items.push(<div key={`cl-${cIndex}-title`}>{cl.name}</div>);

            cl.files.forEach((f, fIndex) => {
                this.itemMap.set(this.items.length, f);
                this.items.push(<div key={`cl-${cIndex}-${fIndex}`}>{f.right.path}</div>);
            });
        });

        this.state = {
            selected: [],
        };
    }

    private readonly onChange = (selectedIndex: number) => {
        console.log(selectedIndex);
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
                    items={this.items}
                    selected={this.state.selected}
                    disabled={this.disabled}
                    multiple={false}
                    onChange={this.onChange}
                />
            </div>
        );
    }
}