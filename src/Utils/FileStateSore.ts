import { IChangeList } from "../DataStructures/IChangeList";
import { IDiff } from "../DataStructures/IDiff";

export class FileStateStore {
  private content: string | undefined;

  public constructor(private readonly changeList: IChangeList, private readonly diff: IDiff) {
    this.content = diff.right ? diff.right.content : undefined;
  }

  public setContent(newContent: string) {
    this.content = newContent;
  }

  //public onContentC
}
