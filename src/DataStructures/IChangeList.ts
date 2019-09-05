import { IDiffSpec } from "./IDiff";

export interface IChangeList {
    id: string;
    name: string;
    files: IDiffSpec[];
}