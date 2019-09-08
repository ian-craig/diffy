import React from "react";
import { IDiff } from "../DataStructures/IDiff";
import { ICommandBarItemProps, CommandBar } from "office-ui-fabric-react/lib/CommandBar";
import { isFileDiff, FileEditor } from "./FileEditor";
import { SettingsStore, ISettings } from "../Utils/SettingsStore";
import { IChangeList, ActionType } from "../DataStructures/IChangeList";

export interface IFilePaneProps {
  width: number;
  height: number;
  file: IDiff | undefined;
  changeList: IChangeList | undefined;
  settingsStore: SettingsStore;
}

type ISettingsInState = Pick<ISettings, "renderSideBySide" | "includeWhitespace">;

interface IState extends ISettingsInState {}

const getSaveCallback = (changeList: IChangeList) => {
  const action = (changeList.fileActions || []).find(a => a.type === ActionType.Save);
  return action ? action.callback : undefined;
};

export class FilePane extends React.Component<IFilePaneProps, IState> {
  constructor(props: IFilePaneProps) {
    super(props);

    this.state = {
      ...props.settingsStore.getMultiple(["renderSideBySide", "includeWhitespace"]),
    };
  }

  private setSetting = (newSettings: Partial<ISettingsInState>) => {
    this.props.settingsStore.set(newSettings);
    this.setState(newSettings as any);
  };

  private getFarItems(): ICommandBarItemProps[] {
    const isDiff = isFileDiff(this.props.file);
    return [
      {
        key: "includeWhitespace",
        name: "Include Whitespace",
        ariaLabel: "Render Whitespace",
        iconProps: {
          iconName: "ImportMirrored",
        },
        onClick: () => this.setSetting({ includeWhitespace: !this.state.includeWhitespace }),
      },
      {
        key: "renderSideBySide",
        name: this.state.renderSideBySide ? "Inline Diff" : "Side-By-Side Diff",
        ariaLabel: "Diff Layout",
        iconProps: {
          iconName: this.state.renderSideBySide ? "DiffInline" : "DiffSideBySide",
        },
        disabled: !isDiff,
        onClick: () => this.setSetting({ renderSideBySide: !this.state.renderSideBySide }),
      },
    ];
  }

  render() {
    return (
      <>
        <CommandBar items={[]} farItems={this.getFarItems()} />
        {this.props.file && this.props.changeList && (
          <FileEditor
            file={this.props.file}
            saveCallback={getSaveCallback(this.props.changeList)}
            width={this.props.width}
            height={this.props.height - 31}
            renderSideBySide={this.state.renderSideBySide}
            includeWhitespace={this.state.includeWhitespace}
          />
        )}
      </>
    );
  }
}
