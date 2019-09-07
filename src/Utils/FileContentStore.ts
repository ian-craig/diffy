import { IDiff, IDiffSpec } from "../DataStructures/IDiff";
import { IFileSpec, IFile } from "../DataStructures/IFile";

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

export class FileContentStore {
  private filePromises = new Map<IDiffSpec, Promise<IDiff>>();
  private loadedFiles = new Set<IDiffSpec>();

  public loadDiff(fc: IDiffSpec): Promise<IDiff> {
    let filePromise = this.filePromises.get(fc);
    if (filePromise) {
      return filePromise;
    }

    filePromise = loadDiff(fc).then(result => {
      this.loadedFiles.add(fc);
      return result;
    });
    this.filePromises.set(fc, filePromise);
    return filePromise;
  }

  public isFileLoaded(fc: IDiffSpec) {
    return this.loadedFiles.has(fc);
  }
}
