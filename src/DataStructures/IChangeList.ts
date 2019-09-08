import { IDiffSpec, IDiff } from "./IDiff";

export enum ActionType {
  Save = "save",
  Revert = "revert",
  ContextMenu = "contextmenu",
}

export interface IFileAction {
  type: ActionType;
  callback: (rightFile: IDiff) => Promise<void>;
}

export interface IChangeList {
  id: string;
  name: string;
  files: IDiffSpec[];
  fileActions?: IFileAction[];
}
