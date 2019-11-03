import { IDiffSpec, IDiff } from "./IDiff";

export enum ActionType {
  Save = "save",
  Revert = "revert",
  ContextMenu = "contextmenu",
}

export interface IFileAction {
  type: ActionType;
  /**
   * Perform the action
   * @returns A promise which resolves a boolean when completed indicating whether to reload all changelists. Rejects on failure.
   */
  callback: (rightFile: IDiff) => Promise<boolean>;
}

export interface IChangeList {
  id: string;
  name: string;
  files: IDiffSpec[];
  fileActions?: IFileAction[];
}
