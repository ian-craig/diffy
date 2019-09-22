import { IChangeList } from "../DataStructures/IChangeList";
import { Action } from "redux";
import { GET_FILE_SUCCEEDED, GET_FILE, GET_CHANGES_SUCCEEDED } from "./ActionTypes";
import { diffId } from "../Utils/DiffId";
import { IDiffSpec } from "../DataStructures/IDiff";
import { GetChangesSucceededAction } from "./ChangeLists";

export const getDiff = () => ({ type: GET_FILE });

interface GetDiffSucceededAction extends Action {
  type: typeof GET_FILE_SUCCEEDED;
  payload: IChangeList[];
}

type DiffAction = GetDiffSucceededAction | GetChangesSucceededAction;

type DiffStore = {
  id: string;
  spec: IDiffSpec;
  model?: any;
};

export type DiffsState = { [id: string]: DiffStore };

export const diffsReducer = (state: DiffsState = {}, action: DiffAction) => {
  switch (action.type) {
    case GET_CHANGES_SUCCEEDED:
      const newFiles: DiffsState = {};
      for (const cl of action.payload) {
        for (const spec of cl.files) {
          const id = diffId(spec);
          newFiles[id] = { id, spec };
        }
      }
      return {
        ...state,
        ...newFiles,
      };
    case GET_FILE_SUCCEEDED:
      return state;

    default:
      return state;
  }
};
