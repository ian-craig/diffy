import { IChangeList } from "../DataStructures/IChangeList";
import { IProvider } from "../DataStructures/IProvider";

export class StubProvider implements IProvider {
    public async getChanges(): Promise<IChangeList[]> {
        return require(`./stubChange.json`);
    };
}