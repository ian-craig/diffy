import * as Git from 'nodegit';
import { IChangeList } from '../DataStructures/IChangeList';
import { IDiffProvider, DiffProviderFactory } from '../DataStructures/IDiffProvider';
import { readFile } from 'fs';
import * as path from 'path';
import { IFile } from '../DataStructures/IFile';
const shortHash = require('short-hash');

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

class GitPlugin implements IDiffProvider {
    constructor(private readonly repo: Git.Repository, private readonly args: string[]) {
    }

    private async getFileInfo(diffFile: Git.DiffFile, readFromFile: boolean = false): Promise<IFile | undefined> {
        if (diffFile.size() === 0) {
            // This was a deletion (if left) or addition (if right)
            return undefined;
        }

        const contentPromise = readFromFile ?
            readFileAsync(path.join(this.repo.workdir(), diffFile.path())) :
            this.repo.getBlob(diffFile.id()).then(blob => blob.content().toString());

        return {
            id: readFromFile ? shortHash(diffFile.path()) : diffFile.id().tostrS(),
            path: diffFile.path(),
            content: await contentPromise,
        };
    };

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

export const createProvider: DiffProviderFactory = async (args: string[], cwd: string): Promise<IDiffProvider | undefined> => {
    let repoRootDir;
    try {
        const gitDir = (await Git.Repository.discover(cwd, 0, null as any)) as any as string;
        repoRootDir = path.dirname(gitDir);
    } catch {
        return undefined;
    }

    try {
        console.log(`GitProvider found repository at ${repoRootDir}`);
        const repo = await Git.Repository.open(repoRootDir);
        return new GitPlugin(repo, args);
    } catch (error) {
        console.error(error);
    }

    return undefined;
};
