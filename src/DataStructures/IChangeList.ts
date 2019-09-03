import { IFileCompare } from "./IFileCompare";

export interface IChangeList {
    id: string;
    name: string;
    files: IFileCompare[];
}