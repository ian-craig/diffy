import React from "react";
import { FileListRow, FileListItem } from "./FileListRow";
import { GroupedList, IGroup, IGroupRenderProps } from "office-ui-fabric-react/lib/GroupedList";
import { ISelection } from "office-ui-fabric-react/lib/DetailsList";
import { Selection, SelectionMode, SelectionZone } from "office-ui-fabric-react/lib/Selection";
import { connect } from "react-redux";
import { AppState } from "../state/Store";
import { changeListsSelector, IChangeListModel } from "../state/ChangeLists";
import { setSelectedDiff } from "../state/Selected";
import { Dispatch, AnyAction } from "redux";

import "./FileList.css";

interface IProps {
  changeLists: IChangeListModel[];
  selectedDiffId: string | undefined;
  selectDiff: (id: string) => void;
}

interface IState {
  items: FileListItem[];
  groups: IGroup[];
  selection: ISelection;
}

const groupProps: IGroupRenderProps = {
  showEmptyGroups: true,
  headerProps: {
    styles: {
      groupHeaderContainer: { height: 30 },
      check: { display: "none" },
      expand: { height: 30, width: 30 },
      title: { paddingLeft: 2 },
    },
  },
};

class FileListComponent extends React.Component<IProps, IState> {
  public constructor(props: IProps) {
    super(props);

    this.state = {
      items: [],
      groups: [],
      selection: new Selection({ onSelectionChanged: this.onSelectionChanged }),
    };
  }

  public componentDidMount() {
    this.updateList();

    if (this.props.selectedDiffId !== undefined) {
      this.state.selection.selectToKey(this.props.selectedDiffId);
    }
  }

  private updateList() {
    const items: FileListItem[] = [];
    const groups: IGroup[] = [];

    this.props.changeLists.forEach(changelist => {
      groups.push({
        key: changelist.id,
        name: changelist.name,
        startIndex: items.length,
        count: changelist.files.length,
      });

      for (const diffModel of changelist.files) {
        items.push({ key: diffModel.id, diffModel, changelist });
      }
    });

    this.setState({
      items,
      groups,
    });

    this.state.selection.setItems(items, false);
  }

  public componentDidUpdate(oldProps: IProps) {
    if (this.props.changeLists !== oldProps.changeLists) {
      this.updateList();
    }
    if (this.props.selectedDiffId !== undefined) {
      const currentSelection = this.state.selection.getSelection();
      if (currentSelection.length !== 1 || currentSelection[0].key !== this.props.selectedDiffId) {
        this.state.selection.selectToKey(this.props.selectedDiffId);
      }
    } else if (this.state.items.length > 0) {
      this.props.selectDiff(this.state.items[0].key);
    }
  }

  private readonly onSelectionChanged = () => {
    const selectedItems = this.state.selection.getSelection() as FileListItem[];
    console.log("Selcting", selectedItems);
    if (selectedItems.length === 1) {
      this.props.selectDiff(selectedItems[0].key);
    } else if (selectedItems.length === 0 && this.state.items.length > 0 && this.props.selectedDiffId !== undefined) {
      this.state.selection.setKeySelected(this.props.selectedDiffId, true, false);
      this.forceUpdate();
    }
  };

  private _onRenderCell = (
    nestingDepth: number | undefined,
    item: FileListItem,
    itemIndex: number | undefined,
  ): JSX.Element => {
    return (
      <FileListRow selection={this.state.selection} itemIndex={itemIndex} item={item} nestingDepth={nestingDepth} />
    );
  };

  public render() {
    return (
      <div id="file-list">
        <SelectionZone selection={this.state.selection} selectionMode={SelectionMode.single}>
          <GroupedList
            items={this.state.items}
            onRenderCell={this._onRenderCell}
            selection={this.state.selection}
            groups={this.state.groups}
            compact={true}
            groupProps={groupProps}
          />
        </SelectionZone>
      </div>
    );
  }
}

const mapStateToProps = (state: AppState) => {
  return {
    selectedDiffId: state.selected.id,
    changeLists: changeListsSelector(state),
  };
};

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => {
  return {
    selectDiff: (id: string) => dispatch(setSelectedDiff(id)),
  };
};

export const FileList = connect(
  mapStateToProps,
  mapDispatchToProps,
)(FileListComponent);
