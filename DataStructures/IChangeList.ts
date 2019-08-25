import { IFileCompare } from "./IFileCompare";

export interface IChangeList {
    name: string;
    files: IFileCompare[];
}