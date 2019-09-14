import * as monaco from "monaco-editor";
import { IEditDiff, IAddDiff, IDeleteDiff } from "../DataStructures/IDiff";

interface DiffModelBase {
  filePath: string;
  save?: () => Promise<void>;
}

interface DiffModelEdit extends DiffModelBase {
  type: "diff";
  model: monaco.editor.IDiffEditorModel;
  diff: IEditDiff;
}

interface DiffModelAdd extends DiffModelBase {
  type: "add";
  model: monaco.editor.ITextModel;
  diff: IAddDiff;
}

interface DiffModelDelete extends DiffModelBase {
  type: "delete";
  model: monaco.editor.ITextModel;
  diff: IDeleteDiff;
}

export type DiffModel = DiffModelEdit | DiffModelAdd | DiffModelDelete;
