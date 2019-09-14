import React from "react";
import { IChangeList } from "../DataStructures/IChangeList";
import { IDiffSpec } from "../DataStructures/IDiff";
import { FileListItem } from "./FileListItem";
import { FileContentStore } from "../Utils/FileContentStore";
import PQueue from "p-queue";
import { DiffModel } from "../Utils/DiffModel";

import "./FileList.css";

const List = require("react-list-select").default;

export interface IFileListProps {
  changeLists: IChangeList[];
  onFileChange: (diffModel: DiffModel) => void;
}

interface IState {
  selected: number[];
  items: JSX.Element[];
  disabled: number[];
}

export class FileList extends React.Component<IFileListProps, IState> {
  private itemMap = new Map<number, IDiffSpec>();
  private fileContentStore = new FileContentStore();

  public constructor(props: IFileListProps) {
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

    if (this.itemMap.size > 0) {
      this.onChange(Array.from(this.itemMap.keys())[0]);
    }
  }

  public componentDidUpdate(oldProps: IFileListProps) {
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
      throw new Error(`Failed to find file ${diffSpec} in any changelists`);
    }

    this.props.onFileChange(await this.fileContentStore.getDiffModel(diffSpec, changeList));
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
