import React from 'react';
import { IChangeList } from '../DataStructures/IChangeList';

export interface IFileListProps {
    changeLists: IChangeList[];
}

export class FileList extends React.Component<IFileListProps> {
    public render() {
        const children: JSX.Element[] = [];
        this.props.changeLists.forEach((cl, cIndex) => {
            children.push(<div key={`cl-${cIndex}-title`}>{cl.name}</div>);

            cl.files.forEach((f, fIndex) => {
                children.push(<div key={`cl-${cIndex}-${fIndex}`}>{f.right.path}</div>);
            });

        });

        return (
            <div style={{overflow: "hidden" }}>
                {children}
            </div>
        );
    }
}