import React from "react";
import { IDiff } from "../DataStructures/IDiff";
import { ICommandBarItemProps, CommandBar } from "office-ui-fabric-react/lib/CommandBar";
import { isFileDiff, FileEditor } from "./FileEditor";
import { SettingsStore, ISettings } from "../Utils/SettingsStore";

export interface IFilePaneProps {
  width: number;
  height: number;
  file: IDiff | undefined;
  settingsStore: SettingsStore;
}

type ISettingsInState = Pick<ISettings, "renderSideBySide">;

interface IState extends ISettingsInState {}

export class FilePane extends React.Component<IFilePaneProps, IState> {
  constructor(props: IFilePaneProps) {
    super(props);

    this.state = {
      renderSideBySide: props.settingsStore.get("renderSideBySide"),
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
    console.log("Render FilePane", this.state.renderSideBySide);

    return (
      <>
        <CommandBar items={[]} farItems={this.getFarItems()} />
        <FileEditor
          file={this.props.file}
          width={this.props.width}
          height={this.props.height - 31}
          renderSideBySide={this.state.renderSideBySide}
        />
      </>
    );
  }
}
