import React from "react";
import { IChangeList } from "../DataStructures/IChangeList";
import { IconButton } from "office-ui-fabric-react/lib/Button";
import { IDiffSpec, IDiff } from "../DataStructures/IDiff";

import "./FileListItem.css";

export interface IFileListItemProps {
  changelist: IChangeList;
  diffSpec: IDiffSpec;
  diff?: IDiff;
}

const diffType = (fileCompare: IDiff): string => {
  let diffType;
  if (fileCompare.right === undefined) {
    diffType = "Delete";
  } else if (fileCompare.left === undefined) {
    diffType = "Add";
  } else if (fileCompare.left.path !== fileCompare.right.path) {
    if (fileCompare.left.content === fileCompare.right.content) {
      diffType = "Rename";
    } else {
      diffType = "Rename+Edit";
    }
  } else {
    if (fileCompare.left.content === fileCompare.right.content) {
      diffType = "Unchanged";
    } else if (fileCompare.left.content.replace(/\s/g, "") === fileCompare.right.content.replace(/\s/g, "")) {
      diffType = "Whitespace";
    } else {
      diffType = "Edit";
    }
  }
  return diffType;
};

export const FileListItem = ({ diffSpec, changelist, diff }: IFileListItemProps) => {
  const fileSpec = diffSpec.right !== undefined ? diffSpec.right : diffSpec.left;

  return (
    <div key={`${changelist.id}-${fileSpec.id}`} className="file-list-item">
      <div className="file-list-item-left">{fileSpec.path}</div>
      <div className="file-list-item-buttons">
        <IconButton iconProps={{ iconName: "Undo" }} title="Revert" ariaLabel="Revert" />
      </div>
      <div className="file-list-item-type">{diff ? diffType(diff) : null}</div>
    </div>
  );
};
