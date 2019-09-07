import { IFileSpec, IFile } from "./IFile";

export type IDiffSpec = IAddDiffSpec | IDeleteDiffSpec | IEditDiffSpec;

export interface IDeleteDiffSpec {
  left: IFileSpec;
  right: undefined;
}

export interface IAddDiffSpec {
  left: undefined;
  right: IFileSpec;
}

export interface IEditDiffSpec {
  left: IFileSpec;
  right: IFileSpec;
}

export type IDiff = IAddDiff | IDeleteDiff | IEditDiff;

export interface IDeleteDiff {
  left: IFile;
  right: undefined;
}

export interface IAddDiff {
  left: undefined;
  right: IFile;
}

export interface IEditDiff {
  left: IFile;
  right: IFile;
}
