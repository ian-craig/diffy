import React from 'react';
import { IFile } from '../DataStructures/IFile';
import { IChangeList } from '../DataStructures/IChangeList';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { IFileCompare } from '../DataStructures/IFileCompare';

import "./FileListItem.css";

export interface IFileListItemProps {
    changelist: IChangeList;
    fileCompare: IFileCompare;
}

const changeType = (fileCompare: IFileCompare): string => {
    let changeType;
    if (fileCompare.right === undefined) {
        changeType = "Delete";
    } else if (fileCompare.left === undefined) {
        changeType = "Add";
    } else if (fileCompare.left.path !== fileCompare.right.path) {
        if (fileCompare.left.content === fileCompare.right.content) {
            changeType = "Rename";
        } else {
            changeType = "Rename + Edit";
        }
    } else {
        if (fileCompare.left.content === fileCompare.right.content) {
            changeType = "Unchanged";
        } else if (fileCompare.left.content.replace(/\s/g, "") === fileCompare.right.content.replace(/\s/g, "")) {
            changeType = "Whitespace";
        } else {
            changeType = "Edit";
        }
    }
    return changeType;
};

export const FileListItem = ({ fileCompare, changelist }: IFileListItemProps) => {
    const file = fileCompare.right !== undefined ? fileCompare.right : fileCompare.left as IFile;
    
    return (
        <div key={`${changelist.id}-${file.id}`} className="file-list-item">
            <div className="file-list-item-left">
                {file.path}
            </div>
            <div className="file-list-item-buttons">
                <IconButton iconProps={{ iconName: 'Undo' }} title="Revert" ariaLabel="Revert" />
            </div>
            <div className="file-list-item-type">
                {changeType(fileCompare)}
            </div>
        </div>
    );
};