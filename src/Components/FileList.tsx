import React from "react";
import { IChangeList } from "../DataStructures/IChangeList";
import { IDiffSpec, IDiff } from "../DataStructures/IDiff";
import { FileListItem } from "./FileListItem";
import { FileContentStore } from "../Utils/FileContentStore";
import { GroupedList, IGroup } from "office-ui-fabric-react/lib/GroupedList";
import { IColumn, DetailsRow } from "office-ui-fabric-react/lib/DetailsList";
import { Selection, SelectionMode, SelectionZone } from "office-ui-fabric-react/lib/Selection";
import PQueue from "p-queue";

import "./FileList.css";

export interface IFileListProps {
  changeLists: IChangeList[];
  onFileChange: (file: IDiff, changeList: IChangeList) => void;
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
  diff?: IDiff;
}

const getId = (diffSpec: IDiffSpec) => (diffSpec.left ? diffSpec.left.id : diffSpec.right.id);

export class FileList extends React.Component<IFileListProps, IState> {
  private itemMap = new Map<number, IDiffSpec>();
  private fileContentStore = new FileContentStore();
  private _selection = new Selection();

  public constructor(props: IFileListProps) {
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
    const queue = new PQueue({ concurrency: 10 });

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

      changelist.files.forEach(diffSpec => {
        const index = items.length;

        this.itemMap.set(index, diffSpec);
        items.push({ key: getId(diffSpec), diffSpec, changelist });

        // Asyncronously load the file
        queue.add(async () => {
          const diff = await this.fileContentStore.loadDiff(diffSpec);
          items[index] = { key: getId(diffSpec), diffSpec, changelist, diff };
          this.setState({ items });
        });
      });
    });

    this.setState({
      items,
      groups,
      disabled,
    });
    this._selection.setItems(items);

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
    const file = await this.fileContentStore.loadDiff(diffSpec);
    const changeList = this.props.changeLists.find(cl => cl.files.find(f => f === diffSpec) !== undefined);
    if (changeList === undefined) {
      throw new Error(`Failed to find file ${diffSpec} in any changelists`);
    }
    this.props.onFileChange(file, changeList);
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
