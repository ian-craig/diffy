import React from "react";
import { ICommandBarItemProps, CommandBar } from "office-ui-fabric-react/lib/CommandBar";
import { DiffModel } from "../Utils/DiffModel";
import { AppState } from "../state/Store";
import { selectedSelector } from "../state/Selected";
import { settingsSelector, SettingsState, setSettings } from "../state/Settings";
import { connect } from "react-redux";
import { Dispatch, AnyAction } from "redux";
import { FileEditor } from "./FileEditor";

export interface IFilePaneProps {
  width: number;
  height: number;
}

interface IProps extends IFilePaneProps {
  diffModel: DiffModel | undefined;
  renderSideBySide: boolean;
  includeWhitespace: boolean;
  setSettings(newSettings: Partial<SettingsState>): void;
}

const getNearItems = (diffModel: DiffModel | undefined): ICommandBarItemProps[] => {
  const filePath = diffModel ? diffModel.filePath : "";
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
  if (diffModel && diffModel.save) {
    const isFileChanged = false;
    const saveCallback = diffModel.save;
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
};

const getFarItems = (props: IProps): ICommandBarItemProps[] => {
  return [
    {
      key: "includeWhitespace",
      name: "Include Whitespace",
      ariaLabel: "Render Whitespace",
      iconProps: {
        iconName: "ImportMirrored",
      },
      onClick: () => props.setSettings({ includeWhitespace: !props.includeWhitespace }),
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
  const diffModel = selectedSelector(state);
  return {
    ...props,
    diffModel,
    ...settingsSelector(state, "renderSideBySide", "includeWhitespace"),
  };
};

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => {
  return {
    setSettings: (newSettings: Partial<SettingsState>) => dispatch(setSettings(newSettings)),
  };
};

export const FilePane = connect(
  mapStateToProps,
  mapDispatchToProps,
)((props: IProps) => {
  return (
    <>
      <CommandBar items={getNearItems(props.diffModel)} farItems={getFarItems(props)} />
      {props.diffModel && (
        <FileEditor
          diffModel={props.diffModel}
          saveCallback={undefined /*props.diffModel.save*/}
          width={props.width}
          height={props.height - 31}
          renderSideBySide={props.renderSideBySide}
          includeWhitespace={props.includeWhitespace}
        />
      )}
    </>
  );
});
