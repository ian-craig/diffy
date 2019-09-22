import React from "react";
import { IChangeList } from "../DataStructures/IChangeList";
import { FileList } from "./FileList";
import { CommandBarButton } from "office-ui-fabric-react/lib/Button";
import { DiffModel } from "../Utils/DiffModel";
import { AppState } from "../state/Store";
import { connect } from "react-redux";
import { AnyAction, Dispatch } from "redux";
import { getChangelists, changeListsSelector } from "../state/ChangeLists";

export interface IChangeListPaneProps {
  title: string;
  onFileChange: (diffModel: DiffModel) => void;
}

interface IChangeListPaneAllProps extends IChangeListPaneProps {
  changeLists: IChangeList[];
  refresh: () => void;
}

const mapStateToProps = (state: AppState, props: IChangeListPaneProps) => {
  return {
    ...props,
    changeLists: changeListsSelector(state),
  };
};

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => {
  return {
    refresh: () => dispatch(getChangelists()),
  };
};

export const ChangeListPane = connect(
  mapStateToProps,
  mapDispatchToProps,
)((props: IChangeListPaneAllProps) => {
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
