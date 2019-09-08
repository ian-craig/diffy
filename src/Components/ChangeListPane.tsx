import React from "react";
import { IChangeList } from "../DataStructures/IChangeList";
import { IDiff } from "../DataStructures/IDiff";
import { FileList } from "./FileList";
import { CommandBarButton } from "office-ui-fabric-react/lib/Button";

export interface IChangeListPaneProps {
  title: string;
  changeLists: IChangeList[];
  onFileChange: (file: IDiff) => void;
  refresh: () => void;
}

export class ChangeListPane extends React.Component<IChangeListPaneProps> {
  public render() {
    const refreshButtonProps = {
      key: "refresh",
      ariaLabel: "Refresh Changes",
      iconProps: {
        iconName: "Refresh",
      },
      onClick: this.props.refresh,
    };
    return (
      <>
        <div className="custom-CommandBar">
          <div className="primary">
            <span className="text" title={this.props.title}>
              {this.props.title}
            </span>
          </div>
          <div className="secondary">
            <CommandBarButton {...refreshButtonProps} />
          </div>
        </div>
        <FileList changeLists={this.props.changeLists} onFileChange={this.props.onFileChange} />
      </>
    );
  }
}
