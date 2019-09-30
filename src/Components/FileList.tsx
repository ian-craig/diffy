import React from "react";
import { IChangeList } from "../DataStructures/IChangeList";
import { IDiffSpec } from "../DataStructures/IDiff";
import { FileListItem } from "./FileListItem";
import { FileContentStore } from "../Utils/FileContentStore";
import PQueue from "p-queue";

import "./FileList.css";
import { connect } from "react-redux";
import { AppState } from "../state/Store";
import { changeListsSelector } from "../state/ChangeLists";
import { setSelectedDiff } from "../state/Selected";
import { Dispatch, AnyAction } from "redux";
import { diffId } from "../Utils/DiffId";

const List = require("react-list-select").default;

interface IProps {
  changeLists: IChangeList[];
  selectedDiffId: string | undefined;
  selectDiff: (id: string) => void;
}

interface IState {
  selected: number[];
  items: JSX.Element[];
  disabled: number[];
}

class FileListComponent extends React.Component<IProps, IState> {
  private itemMap = new Map<number, IDiffSpec>();
  private fileContentStore = new FileContentStore();

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
    this.fileContentStore.clear();
    const queue = new PQueue({ concurrency: 10 });

    this.itemMap.clear();
    const items: JSX.Element[] = [];
    const disabled: number[] = [];

    this.props.changeLists.forEach((cl, cIndex) => {
      disabled.push(items.length);
      items.push(<div key={`cl-${cIndex}-title`}>{cl.name}</div>);

      cl.files.forEach(ds => {
        const index = items.length;

        this.itemMap.set(index, ds);
        items.push(<FileListItem diffSpec={ds} changelist={cl} />);

        // Asyncronously load the file
        queue.add(async () => {
          const model = await this.fileContentStore.getDiffModel(ds, cl);
          items[index] = <FileListItem diffSpec={ds} diffModel={model} changelist={cl} />;
          this.setState({ items });
        });
      });
    });

    this.setState({
      items,
      disabled,
    });

    const selectedIsInItems =
      this.props.selectedDiffId !== undefined &&
      Array.from(this.itemMap.values()).find(diffSpec => diffId(diffSpec) === this.props.selectedDiffId) !== undefined;
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

    const diffSpec = this.itemMap.get(selectedIndex) as IDiffSpec;
    const changeList = this.props.changeLists.find(cl => cl.files.find(f => f === diffSpec) !== undefined);
    if (changeList === undefined) {
      throw new Error(`Failed to find file ${diffSpec} at index ${selectedIndex} in any changelists`);
    }

    this.props.selectDiff(diffId(diffSpec));
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
