import { IEditDiff, IAddDiff, IDeleteDiff } from "../DataStructures/IDiff";

interface DiffModelBase {
  id: string;
  filePath: string;
}

interface DiffModelLoading extends DiffModelBase {
  type: undefined;
}

interface DiffModelEdit extends DiffModelBase {
  type: "diff";
  diff: IEditDiff;
  unsavedContent?: string;
}

interface DiffModelAdd extends DiffModelBase {
  type: "add";
  diff: IAddDiff;
  unsavedContent?: string;
}

interface DiffModelDelete extends DiffModelBase {
  type: "delete";
  diff: IDeleteDiff;
}

export type DiffModel = DiffModelLoading | DiffModelEdit | DiffModelAdd | DiffModelDelete;
export type EditableDiffModel = DiffModelEdit | DiffModelAdd;
