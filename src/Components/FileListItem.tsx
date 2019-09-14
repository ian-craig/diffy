import React from "react";
import { IChangeList } from "../DataStructures/IChangeList";
import { IconButton } from "office-ui-fabric-react/lib/Button";
import { IDiffSpec } from "../DataStructures/IDiff";
import { DiffModel } from "../Utils/DiffModel";

import "./FileListItem.css";

export interface IFileListItemProps {
  changelist: IChangeList;
  diffSpec: IDiffSpec;
  diffModel?: DiffModel;
}

const diffType = (model: DiffModel): string => {
  let diffType;
  if (model.type === "delete") {
    diffType = "Delete";
  } else if (model.type === "add") {
    diffType = "Add";
  } else if (model.diff.left.path !== model.diff.right.path) {
    if (model.diff.left.content === model.diff.right.content) {
      diffType = "Rename";
    } else {
      diffType = "Rename+Edit";
    }
  } else {
    if (model.diff.left.content === model.diff.right.content) {
      diffType = "Unchanged";
    } else if (model.diff.left.content.replace(/\s/g, "") === model.diff.right.content.replace(/\s/g, "")) {
      diffType = "Whitespace";
    } else {
      diffType = "Edit";
    }
  }
  return diffType;
};

export const FileListItem = ({ diffSpec, changelist, diffModel }: IFileListItemProps) => {
  const fileSpec = diffSpec.right !== undefined ? diffSpec.right : diffSpec.left;

  return (
    <div key={`${changelist.id}-${fileSpec.id}`} className="file-list-item">
      <div className="file-list-item-left">{fileSpec.path}</div>
      <div className="file-list-item-buttons">
        <IconButton iconProps={{ iconName: "Undo" }} title="Revert" ariaLabel="Revert" />
      </div>
      <div className="file-list-item-type">{diffModel ? diffType(diffModel) : null}</div>
    </div>
  );
};
