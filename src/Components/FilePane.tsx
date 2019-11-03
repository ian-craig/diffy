import React from "react";
import { ICommandBarItemProps, CommandBar } from "office-ui-fabric-react/lib/CommandBar";
import { DiffModel, EditableDiffModel } from "../Utils/DiffModel";
import { AppState } from "../state/Store";
import { selectedDiffSelector, selectedChangelistSelector } from "../state/Selected";
import { settingsSelector, SettingsState, setSettings } from "../state/Settings";
import { connect } from "react-redux";
import { Dispatch, AnyAction } from "redux";
import { FileEditor } from "./FileEditor";
import { ActionType, IFileAction } from "../DataStructures/IChangeList";
import { PROVIDER_ACTION } from "../state/ActionTypes";
import { editDiffContent } from "../state/Diffs";

export interface IFilePaneProps {
  width: number;
  height: number;
}

interface IProps extends IFilePaneProps {
  diffModel: DiffModel | undefined;
  saveAction: IFileAction | undefined;
  renderSideBySide: boolean;
  showWhitespace: boolean;
  setSettings(newSettings: Partial<SettingsState>): void;
  saveFile(diffModel: EditableDiffModel, saveAction: IFileAction): void;
  editDiff(id: string, content: string): void;
}

const getNearItems = (diffModel: DiffModel | undefined, saveCallback?: () => void): ICommandBarItemProps[] => {
  const filePath = diffModel ? diffModel.filePath : "";
  const items: ICommandBarItemProps[] = [
    {
      key: "filePath",
      onRender: () => (
        <span className="command-bar-text" title={filePath}>
          {filePath}
        </span>
      ),
    },
  ];
  if (saveCallback !== undefined) {
    const isFileChanged = (diffModel as EditableDiffModel).unsavedContent !== undefined;
    items.push({
      key: "save",
      name: isFileChanged ? "Save Changes" : "Saved",
      ariaLabel: "Save File",
      disabled: !isFileChanged,
      iconProps: {
        iconName: "Save",
      },
      className: isFileChanged ? "unsaved-warning" : "",
      onClick: () => {
        saveCallback();
      },
    });
  }
  return items;
};

const getFarItems = (props: IProps): ICommandBarItemProps[] => {
  return [
    {
      key: "showWhitespace",
      name: props.showWhitespace ? "Hide Whitespace" : "Show Whitespace",
      ariaLabel: "Render Whitespace",
      iconProps: {
        iconName: "ImportMirrored",
      },
      onClick: () => props.setSettings({ showWhitespace: !props.showWhitespace }),
    },
    {
      key: "renderSideBySide",
      name: props.renderSideBySide ? "Inline Diff" : "Side-By-Side Diff",
      ariaLabel: "Diff Layout",
      iconProps: {
        iconName: props.renderSideBySide ? "DiffInline" : "DiffSideBySide",
      },
      disabled: !props.diffModel || props.diffModel.type !== "diff",
      onClick: () => props.setSettings({ renderSideBySide: !props.renderSideBySide }),
    },
  ];
};

const mapStateToProps = (state: AppState, props: IFilePaneProps) => {
  const diffModel = selectedDiffSelector(state);
  const changeList = selectedChangelistSelector(state);
  const saveAction =
    changeList !== undefined ? changeList.fileActions.find(a => a.type === ActionType.Save) : undefined;
  return {
    ...props,
    diffModel,
    saveAction,
    ...settingsSelector(state, "renderSideBySide", "showWhitespace"),
  };
};

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => {
  return {
    setSettings: (newSettings: Partial<SettingsState>) => dispatch(setSettings(newSettings)),
    saveFile: (diffModel: EditableDiffModel, saveAction: IFileAction) => {
      if (diffModel.unsavedContent !== undefined) {
        dispatch({
          type: PROVIDER_ACTION,
          fileAction: saveAction,
          diff: {
            left: diffModel.diff.left,
            right: {
              ...diffModel.diff.right,
              content: diffModel.unsavedContent,
            },
          },
        });
      }
    },
    editDiff: (id: string, content: string) => dispatch(editDiffContent(id, content)),
  };
};

export const FilePane = connect(
  mapStateToProps,
  mapDispatchToProps,
)((props: IProps) => {
  const saveCallback =
    props.saveAction !== undefined
      ? () => props.saveFile(props.diffModel as EditableDiffModel, props.saveAction as IFileAction)
      : undefined;
  return (
    <>
      <CommandBar items={getNearItems(props.diffModel, saveCallback)} farItems={getFarItems(props)} />
      {props.diffModel && (
        <FileEditor
          diffModel={props.diffModel}
          saveCallback={saveCallback}
          width={props.width}
          height={props.height - 31}
          renderSideBySide={props.renderSideBySide}
          showWhitespace={props.showWhitespace}
          editDiff={props.editDiff}
        />
      )}
    </>
  );
});
