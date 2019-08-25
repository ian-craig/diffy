import * as Git from 'nodegit';
import { IChangeList } from '../DataStructures/IChangeList';
import { IProvider, ProviderFactory } from '../DataStructures/IProvider';
import { readFile } from 'fs';

const readFileAsync = async (filePath: string, encoding: string = 'utf8'): Promise<string> => {
    return new Promise((resolve, reject) => {
        readFile(filePath, { encoding }, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data.toString());
            }
        })
    })
}

class GitPlugin implements IProvider {
    constructor(private readonly repo: Git.Repository, private readonly args: string[]) {
    }

    private async getFileInfo(diffFile: Git.DiffFile, readFromFile: boolean = false) {
        if (diffFile.size() === 0) {
            // This was a deletion (if left) or addition (if right)
            return undefined;
        }
        const contentPromise = readFromFile ?
            readFileAsync(diffFile.path()) :
            this.repo.getBlob(diffFile.id()).then(blob => blob.content().toString());

        return {
            path: diffFile.path(),
            content: await contentPromise,
        };
    };

    public async getChanges(): Promise<IChangeList[]> {
        const changeLists: IChangeList[] = [
            {
                name: "Staged",
                files: [],
            },
            {
                name: "Unstaged",
                files: [],
            },
        ];
        const statusFiles = await this.repo.getStatusExt();
        for (const status of statusFiles) {
            await Promise.all([status.headToIndex(), status.indexToWorkdir()].map(async (diff, index) => {
                if (diff !== null) {
                    const [left, right] = await Promise.all([
                        this.getFileInfo((diff.oldFile as any)()),
                        this.getFileInfo((diff.newFile as any)(), index === 1),
                    ])
                    changeLists[index].files.push({ left, right });
                }
            }));
        }
        return changeLists;
    };
}

const factory: ProviderFactory = async (args: string[], cwd: string): Promise<IProvider | undefined> => {
    console.log("Factory", cwd);
    try {
        const repo = await Git.Repository.open(cwd);
        console.log(repo);
        return new GitPlugin(repo, args);
    } catch (error) {
        console.log(error);
    }

    return undefined;
}

export default factory;