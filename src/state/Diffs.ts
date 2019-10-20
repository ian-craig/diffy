import { GET_FILE, GET_CHANGES_SUCCEEDED, GET_DIFF_SUCCEEDED } from "./ActionTypes";
import { diffId } from "../Utils/DiffId";
import { GetChangesSucceededAction } from "./ChangeLists";
import { DiffModel } from "../Utils/DiffModel";
import { GetDiffModelSucceededAction } from "./GetChangesSaga";

export const getDiff = () => ({ type: GET_FILE });

type DiffAction = GetDiffModelSucceededAction | GetChangesSucceededAction;

export type DiffsState = { [id: string]: DiffModel };

export const diffsReducer = (state: DiffsState = {}, action: DiffAction) => {
  switch (action.type) {
    case GET_CHANGES_SUCCEEDED:
      const newFiles: DiffsState = {};
      for (const cl of action.payload) {
        for (const spec of cl.files) {
          const id = diffId(spec);
          newFiles[id] = { id, type: undefined, filePath: spec.right ? spec.right.path : spec.left.path };
        }
      }
      return newFiles;
    case GET_DIFF_SUCCEEDED:
      return {
        ...state,
        [action.model.id]: action.model,
      };

    default:
      return state;
  }
};
