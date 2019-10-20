import React from "react";
import { FileListItem } from "./FileListItem";

import "./FileList.css";
import { connect } from "react-redux";
import { AppState } from "../state/Store";
import { changeListsSelector, IChangeListModel } from "../state/ChangeLists";
import { setSelectedDiff } from "../state/Selected";
import { Dispatch, AnyAction } from "redux";

const List = require("react-list-select").default;

interface IProps {
  changeLists: IChangeListModel[];
  selectedDiffId: string | undefined;
  selectDiff: (id: string) => void;
}

interface IState {
  selected: number[];
  items: JSX.Element[];
  disabled: number[];
}

class FileListComponent extends React.Component<IProps, IState> {
  private itemMap = new Map<number, string>();

  public constructor(props: IProps) {
    super(props);

    this.state = {
      selected: [],
      items: [],
      disabled: [],
    };
  }

  public componentDidMount() {
    this.updateList();
  }

  private updateList() {
    this.itemMap.clear();
    const items: JSX.Element[] = [];
    const disabled: number[] = [];

    this.props.changeLists.forEach((cl, cIndex) => {
      disabled.push(items.length);
      items.push(<div key={`cl-${cIndex}-title`}>{cl.name}</div>);

      cl.files.forEach(diffModel => {
        const index = items.length;

        this.itemMap.set(index, diffModel.id);
        items.push(<FileListItem diffModel={diffModel} changelist={cl} />);
      });
    });

    this.setState({
      items,
      disabled,
    });

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

  public render() {
    return (
      <div id="file-list">
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
