import React from "react";
import { IChangeList } from "../DataStructures/IChangeList";
import { FileList } from "./FileList";
import { CommandBarButton } from "office-ui-fabric-react/lib/Button";
import { DiffModel } from "../Utils/DiffModel";
import { AppState } from "../state/Store";
import { connect } from "react-redux";

export interface IChangeListPaneProps {
  title: string;
  changeLists: IChangeList[];
  onFileChange: (diffModel: DiffModel) => void;
  refresh: () => void;
}

const mapStateToProps = (state: AppState, props: IChangeListPaneProps) => {
  return props;
};

export const ChangeListPane = connect(mapStateToProps)((props: IChangeListPaneProps) => {
  const refreshButtonProps = {
    key: "refresh",
    ariaLabel: "Refresh Changes",
    iconProps: {
      iconName: "Refresh",
    },
    onClick: props.refresh,
  };
  return (
    <>
      <div className="custom-CommandBar">
        <div className="primary">
          <span className="command-bar-text" title={props.title}>
            {props.title}
          </span>
        </div>
        <div className="secondary">
          <CommandBarButton {...refreshButtonProps} />
        </div>
      </div>
      <FileList changeLists={props.changeLists} onFileChange={props.onFileChange} />
    </>
  );
});
