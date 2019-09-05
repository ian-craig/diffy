export interface IFileSpec {
    id: string;
    path: string;
    getContent: () => Promise<string>;
}

export interface IFile {
    id: string;
    path: string;
    content: string;
}