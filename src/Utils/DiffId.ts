import { IDiffSpec, IDiff } from "../DataStructures/IDiff";

export const diffId = (diff: IDiffSpec | IDiff) =>
  `${diff.left ? diff.left.id : ""}:${diff.right ? diff.right.id : ""}`;
