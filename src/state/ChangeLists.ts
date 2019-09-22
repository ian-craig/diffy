import { IChangeList, IFileAction } from "../DataStructures/IChangeList";
import { Action } from "redux";
import { GET_CHANGES_SUCCEEDED, GET_CHANGES } from "./ActionTypes";
import { diffId } from "../Utils/DiffId";
import { AppState } from "./Store";

export const getChangelists = () => ({ type: GET_CHANGES });

export const changeListsSelector = (state: AppState): IChangeList[] => {
  return state.changelists.map(cls => {
    return {
      id: cls.id,
      name: cls.name,
      files: cls.fileIds.map(id => state.diffs[id].spec),
      fileActions: cls.fileActions,
    };
  });
};

export interface GetChangesSucceededAction extends Action {
  type: typeof GET_CHANGES_SUCCEEDED;
  payload: IChangeList[];
}

type ChangeListAction = GetChangesSucceededAction;

type ChangeListState = {
  id: string;
  name: string;
  fileIds: string[];
  fileActions: IFileAction[];
};

export type ChangeListsState = ChangeListState[];

export const changelistsReducer = (state: ChangeListsState = [], action: ChangeListAction) => {
  switch (action.type) {
    case GET_CHANGES_SUCCEEDED:
      return action.payload.map(cl => ({
        id: cl.id,
        name: cl.name,
        fileIds: cl.files.map(diffId),
        fileActions: cl.fileActions || [],
      }));
    default:
      return state;
  }
};
