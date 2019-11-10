import * as Git from "nodegit";
import { IChangeList, ActionType } from "../DataStructures/IChangeList";
import { IDiffProvider, DiffProviderFactory } from "../DataStructures/IDiffProvider";
import { readFile, writeFile } from "fs";
import * as path from "path";
import { IFileSpec } from "../DataStructures/IFile";
import { IDiffSpec, IDiff } from "../DataStructures/IDiff";
const shortHash = require("short-hash");
import { promisify } from "util";

const readFileAsync = promisify(readFile);
const writeFileAsync = promisify(writeFile);

class GitProvider implements IDiffProvider {
  public readonly title: string;

  constructor(private readonly repo: Git.Repository, private readonly args: string[]) {
    this.title = `Git Status - ${repo.workdir()}`;
  }

  private async getFileInfo(diffFile: Git.DiffFile, readFromFile: boolean = false): Promise<IFileSpec | undefined> {
    if (diffFile.mode() === 0) {
      // This was a deletion (if left) or addition (if right)
      return undefined;
    }

    const getContent = readFromFile
      ? () => readFileAsync(path.join(this.repo.workdir(), diffFile.path()), "utf8")
      : () => this.repo.getBlob(diffFile.id()).then(blob => blob.content().toString());

    return {
      id: readFromFile ? shortHash(diffFile.path()) : diffFile.id().tostrS(),
      path: diffFile.path(),
      getContent,
    };
  }

  public async getChanges(): Promise<IChangeList[]> {
    const changeLists: IChangeList[] = [
      {
        id: "staged",
        name: "Staged",
        files: [],
      },
      {
        id: "unstaged",
        name: "Unstaged",
        files: [],
        fileActions: [
          {
            type: ActionType.Save,
            callback: (file: IDiff) =>
              file.right ? writeFileAsync(file.right.path, file.right.content).then(() => false) : Promise.reject(),
          },
        ],
      },
    ];
    const statusFiles = await this.repo.getStatusExt();
    for (const status of statusFiles) {
      await Promise.all(
        [status.headToIndex(), status.indexToWorkdir()].map(async (diff, index) => {
          if (diff !== null) {
            const [left, right] = await Promise.all([
              this.getFileInfo((diff.oldFile as any)()),
              this.getFileInfo((diff.newFile as any)(), index === 1),
            ]);
            if (left === undefined && right === undefined) {
              throw new Error("Both sides of diff are undefined");
            }
            changeLists[index].files.push({ left, right } as IDiffSpec);
          }
        }),
      );
    }
    return changeLists;
  }
}

export const createProvider: DiffProviderFactory = async (
  args: string[],
  cwd: string,
): Promise<IDiffProvider | undefined> => {
  let repoRootDir;
  try {
    const gitDir = ((await Git.Repository.discover(cwd, 0, null as any)) as any) as string;
    repoRootDir = path.dirname(gitDir);
  } catch {
    return undefined;
  }

  try {
    console.debug(`GitProvider found repository at ${repoRootDir}`);
    const repo = await Git.Repository.open(repoRootDir);
    return new GitProvider(repo, args);
  } catch (error) {
    console.error(error);
  }

  return undefined;
};
