import { IChangeList } from "../DataStructures/IChangeList";
import { IDiffProvider } from "../DataStructures/IDiffProvider";

export class StubProvider implements IDiffProvider {
    public async getChanges(): Promise<IChangeList[]> {
        return require(`./stubChange.json`);
    };
}