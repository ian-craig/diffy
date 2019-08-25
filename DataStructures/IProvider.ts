import { IChangeList } from "./IChangeList";

/**
 * Process command line args and attempt to find a diff.
 * @returns undefined if no diff found with this plugin, otherwise an IPlugin instance
 */
export type ProviderFactory = (args: string[], cwd: string) => Promise<IProvider | undefined>;

export interface IProvider {
    /**
     * Fetch changeslists for a given command line input.
     * @param args Command line arguments (not including the program name)
     * @param cwd The directory the tool was invoked in
     */
    getChanges(): Promise<IChangeList[]>;
}