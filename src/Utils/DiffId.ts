import { IDiffSpec } from "../DataStructures/IDiff";

export const diffId = (diff: IDiffSpec) => `${diff.left ? diff.left.id : ""}:${diff.right ? diff.right.id : ""}`;
