import React from "react";
import { FileListItem } from "./FileListItem";
import { GroupedList, IGroup } from "office-ui-fabric-react/lib/GroupedList";
import { IColumn, DetailsRow } from "office-ui-fabric-react/lib/DetailsList";
import { Selection, SelectionMode, SelectionZone } from "office-ui-fabric-react/lib/Selection";
import { connect } from "react-redux";
import { AppState } from "../state/Store";
import { changeListsSelector, IChangeListModel } from "../state/ChangeLists";
import { setSelectedDiff } from "../state/Selected";
import { Dispatch, AnyAction } from "redux";
import "./FileList.css";

const List = require("react-list-select").default;

interface IProps {
  changeLists: IChangeListModel[];
  selectedDiffId: string | undefined;
  selectDiff: (id: string) => void;
}

interface IState {
  selected: number[];
  items: Item[];
  disabled: number[];
  groups: IGroup[];
}

interface Item {
  key: string;
  changelist: IChangeList;
  diffSpec: IDiffSpec;
  diffModel?: DiffModel;
}

class FileListComponent extends React.Component<IProps, IState> {
  private itemMap = new Map<number, string>();
  private _selection = new Selection();

  public constructor(props: IProps) {
    super(props);

    this.state = {
      selected: [],
      items: [],
      disabled: [],
      groups: [],
    };
  }

  public componentDidMount() {
    this.updateList();
  }

  private updateList() {
    this.itemMap.clear();
    const items: Item[] = [];
    const disabled: number[] = [];
    const groups: IGroup[] = [];

    this.props.changeLists.forEach((changelist, cIndex) => {
      disabled.push(items.length);
      groups.push({
        key: changelist.id,
        name: changelist.name,
        startIndex: items.length,
        count: changelist.files.length,
      });

      cl.files.forEach(diffModel => {
        const index = items.length;

        this.itemMap.set(index, diffModel.id);
        items.push(<FileListItem diffModel={diffModel} changelist={cl} />);
      });
    });

    this.setState({
      items,
      groups,
      disabled,
    });
    this._selection.setItems(items);

    const selectedIsInItems =
      this.props.selectedDiffId !== undefined &&
      Array.from(this.itemMap.values()).find(id => id === this.props.selectedDiffId) !== undefined;
    if (!selectedIsInItems && this.itemMap.size > 0) {
      this.onChange(Array.from(this.itemMap.keys())[0]);
    }
  }

  public componentDidUpdate(oldProps: IProps) {
    if (this.props.changeLists !== oldProps.changeLists) {
      this.updateList();
    }
  }

  private readonly onChange = async (selectedIndex: number) => {
    console.log("Selcting", selectedIndex);
    this.setState({
      selected: [selectedIndex],
    });

    this.props.selectDiff(this.itemMap.get(selectedIndex) as string);
  };

  private columns: IColumn[] = [
    {
      key: "a",
      name: "a",
      minWidth: 1,
      onRender: (item: Item, index?: number, column?: IColumn) => {
        return <FileListItem {...item} />;
      },
    },
  ];

  private _onRenderCell = (
    nestingDepth: number | undefined,
    item: Item,
    itemIndex: number | undefined,
  ): JSX.Element => {
    console.log("_onRenderCell", nestingDepth, item, itemIndex);
    return (
      <DetailsRow
        columns={this.columns}
        groupNestingDepth={nestingDepth}
        item={item}
        itemIndex={itemIndex || 0}
        selection={this._selection}
        selectionMode={SelectionMode.multiple}
        compact={true}
      />
    );
  };

  public render() {
    console.log("Render", this.state.groups, this.state.items);
    return (
      <div id="file-list">
        <SelectionZone selection={this._selection} selectionMode={SelectionMode.multiple}>
          <GroupedList
            items={this.state.items}
            onRenderCell={this._onRenderCell}
            selection={this._selection}
            selectionMode={SelectionMode.multiple}
            groups={this.state.groups}
            compact={true}
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
