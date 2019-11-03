import React from "react";
import { IconButton } from "office-ui-fabric-react/lib/Button";
import { DiffModel } from "../Utils/DiffModel";
import { IChangeListModel } from "../state/ChangeLists";

import "./FileListItem.css";

export interface IFileListItemProps {
  changelist: IChangeListModel;
  diffModel: DiffModel;
}

const diffType = (model: DiffModel): string => {
  let diffType = "";
  if (model.type === "delete") {
    diffType = "Delete";
  } else if (model.type === "add") {
    diffType = "Add";
  } else if (model.type === "diff") {
    if (model.diff.left.path !== model.diff.right.path) {
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
  }
  return diffType;
};

export const FileListItem = ({ diffModel, changelist }: IFileListItemProps) => {
  return (
    <div key={`${changelist.id}-${diffModel.id}`} className="file-list-item">
      <div className="file-list-item-left">{diffModel.filePath}</div>
      <div className="file-list-item-buttons">
        <IconButton iconProps={{ iconName: "Undo" }} title="Revert" ariaLabel="Revert" />
      </div>
      <div className="file-list-item-type">{diffModel ? diffType(diffModel) : null}</div>
    </div>
  );
};
