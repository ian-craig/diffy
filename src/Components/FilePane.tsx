import React from "react";
import { ICommandBarItemProps, CommandBar } from "office-ui-fabric-react/lib/CommandBar";
import { FileEditor } from "./FileEditor";
import { SettingsStore, ISettings } from "../Utils/SettingsStore";
import { DiffModel } from "../Utils/DiffModel";

export interface IFilePaneProps {
  width: number;
  height: number;
  diffModel: DiffModel | undefined;
  settingsStore: SettingsStore;
}

type ISettingsInState = Pick<ISettings, "renderSideBySide" | "includeWhitespace">;

interface IState extends ISettingsInState {}

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

  private getNearItems(): ICommandBarItemProps[] {
    const filePath = this.props.diffModel ? this.props.diffModel.filePath : "";
    const items: ICommandBarItemProps[] = [
      {
        key: "includeWhitespace",
        name: "Include Whitespace",
        ariaLabel: "Render Whitespace",
        iconProps: {
          iconName: "ImportMirrored",
        },
        onRender: () => (
          <span className="command-bar-text" title={filePath}>
            {filePath}
          </span>
        ),
      },
    ];
    /*
    if (this.props.diffModel && this.props.diffModel.save) {
      const isFileChanged = false;
      const saveCallback = this.props.diffModel.save;
      items.push({
        key: "save",
        name: isFileChanged ? "Save Changes" : "Saved",
        ariaLabel: "Save File",
        disabled: !isFileChanged,
        iconProps: {
          iconName: "Save",
        },
        className: isFileChanged ? "unsaved-warning" : "",
        onClick: () => { saveCallback() },
      });
    }
    */
    return items;
  }

  private getFarItems(): ICommandBarItemProps[] {
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
        disabled: !this.props.diffModel || this.props.diffModel.type !== "diff",
        onClick: () => this.setSetting({ renderSideBySide: !this.state.renderSideBySide }),
      },
    ];
  }

  render() {
    return (
      <>
        <CommandBar items={this.getNearItems()} farItems={this.getFarItems()} />
        {this.props.diffModel && (
          <FileEditor
            diffModel={this.props.diffModel}
            saveCallback={this.props.diffModel.save}
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
