import { IDiff, IDiffSpec } from "../DataStructures/IDiff";
import { IFileSpec, IFile } from "../DataStructures/IFile";
import { DiffModel } from "./DiffModel";
import * as monaco from "monaco-editor";
import { IChangeList, ActionType } from "../DataStructures/IChangeList";

const loadFile = async (file: IFileSpec | undefined): Promise<IFile | undefined> => {
  if (file === undefined) {
    return undefined;
  }

  if ("content" in file) {
    return file;
  }

  return {
    ...file,
    content: await file.getContent(),
  };
};

const loadDiff = async (file: IDiffSpec): Promise<IDiff> => {
  const [left, right] = await Promise.all([loadFile(file.left), loadFile(file.right)]);
  return { left, right } as IDiff;
};

const getSaveCallback = (changeList: IChangeList, diff: IDiff, model: monaco.editor.ITextModel) => {
  const action = (changeList.fileActions || []).find(a => a.type === ActionType.Save);
  if (!action || !diff.right) {
    return undefined;
  }

  return () =>
    action.callback({
      left: diff.left,
      right: {
        ...diff.right,
        content: model.getValue(),
      },
    });
};

const loadDiffModel = async (diffSpec: IDiffSpec, changeList: IChangeList): Promise<DiffModel> => {
  const diff = await loadDiff(diffSpec);

  if (diff.left !== undefined && diff.right !== undefined) {
    const editableModel = monaco.editor.createModel(diff.right.content, undefined, monaco.Uri.file(diff.right.path));

    return {
      type: "diff",
      diff,
      filePath: diff.right.path,
      model: {
        original: monaco.editor.createModel(diff.left.content),
        modified: editableModel,
      },
      save: getSaveCallback(changeList, diff, editableModel),
    };
  } else if (diff.left) {
    return {
      type: "delete",
      diff,
      filePath: diff.left.path,
      model: monaco.editor.createModel(diff.left.content, undefined, monaco.Uri.file(diff.left.path)),
    };
  } else {
    const model = monaco.editor.createModel(diff.right.content, undefined, monaco.Uri.file(diff.right.path));
    return {
      type: "add",
      diff,
      filePath: diff.right.path,
      model,
      save: getSaveCallback(changeList, diff, model),
    };
  }
};

export class FileContentStore {
  private modelPromises = new Map<IDiffSpec, Promise<DiffModel>>();
  private loadedDiffs = new Set<IDiffSpec>();

  public async getDiffModel(diffSpec: IDiffSpec, changeList: IChangeList): Promise<DiffModel> {
    let modelPromise = this.modelPromises.get(diffSpec);
    if (modelPromise) {
      return modelPromise;
    }

    modelPromise = loadDiffModel(diffSpec, changeList).then(model => {
      this.loadedDiffs.add(diffSpec);
      return model;
    });
    this.modelPromises.set(diffSpec, modelPromise);
    return modelPromise;
  }

  public isModelLoaded(diffSpec: IDiffSpec) {
    return this.loadedDiffs.has(diffSpec);
  }

  public clear(): void {
    this.loadedDiffs.clear();
    Array.from(this.modelPromises.values()).map(mp => {
      mp.then(diffModel => {
        if (diffModel.type === "diff") {
          diffModel.model.modified.dispose();
          diffModel.model.original.dispose();
        } else {
          diffModel.model.dispose();
        }
      });
    });
    this.modelPromises.clear();
  }
}
