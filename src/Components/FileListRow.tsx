import React from "react";
import path from "path";
import { IconButton } from "office-ui-fabric-react/lib/Button";
import { DiffModel } from "../Utils/DiffModel";
import { IChangeListModel } from "../state/ChangeLists";
import { ISelection, SelectionMode } from "office-ui-fabric-react/lib/Selection";
import { IRawStyle, mergeStyleSets } from "office-ui-fabric-react/lib/Styling";

import "./FileListRow.css";

export interface FileListItem {
  key: string;
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

const commonStyles: IRawStyle = {
  display: "inline-block",
  cursor: "default",
  boxSizing: "border-box",
  verticalAlign: "top",
  background: "none",
  backgroundColor: "transparent",
  border: "none",
};
const classNames = mergeStyleSets({
  item: {
    selectors: {
      "&:hover": { background: "#eee" },
    },
  },
  selectedItem: {
    background: "#eee",
  },
  // Overwrites the default style for Button
  check: [commonStyles, { padding: "7px 3px" }],
  cell: [
    commonStyles,
    {
      overflow: "hidden",
      height: 32,
      lineHeight: 32,
    },
  ],
});

interface Props {
  item: FileListItem;
  nestingDepth?: number;
  itemIndex?: number;
  selection?: ISelection;
  selectionMode?: SelectionMode;
}

export const FileListRow: React.StatelessComponent<Props> = (props: Props) => {
  const { itemIndex, selection, nestingDepth } = props;
  const { diffModel, changelist } = props.item;

  const indentWidth = 32 + ((nestingDepth || 1) - 1) * 36;
  let isSelected = false;

  let checkboxComponent = null;
  if (selection && itemIndex !== undefined) {
    isSelected = selection.isIndexSelected(itemIndex);
    /*
    if (selection.mode !== SelectionMode.none) {
      checkboxComponent = (
        <div className={classNames.check} data-is-focusable={true} data-selection-toggle={true}>
          <Check checked={isSelected} />
        </div>
      );
    }
    */
  }

  const rowClassName = `file-list-item ${classNames.item} ${isSelected ? classNames.selectedItem : ""}`;

  return (
    <div
      key={`${changelist.id}-${diffModel.id}`}
      className={rowClassName}
      data-is-focusable={true}
      data-selection-index={itemIndex}
    >
      {checkboxComponent}
      <div className="file-list-indent" style={{ width: indentWidth }}></div>
      <div className={classNames.cell + " file-list-item-left"}>{path.basename(diffModel.filePath)}</div>
      <div className={classNames.cell + " file-list-item-buttons"}>
        <IconButton iconProps={{ iconName: "Undo" }} title="Revert" ariaLabel="Revert" />
      </div>
      <div className={classNames.cell + " file-list-item-type"}>{diffModel ? diffType(diffModel) : null}</div>
    </div>
  );
};
